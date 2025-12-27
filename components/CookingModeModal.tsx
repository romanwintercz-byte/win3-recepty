
import React, { useState, useEffect, useRef } from 'react';
import { Recipe } from '../types';
import { addTimersToInstructions, generateSpeech } from '../services/geminiService';
import { XMarkIcon, SparklesIcon, ArrowLeftIcon, ArrowRightIcon, ClockIcon } from './icons';

interface Step {
  text: string;
  timerInMinutes: number | null;
}

const CookingModeModal: React.FC<{ recipe: Recipe, onClose: () => void }> = ({ recipe, onClose }) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timerLeft, setTimerLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const loadSteps = async () => {
      try {
        const res = await addTimersToInstructions(recipe.instructions);
        setSteps(res);
      } catch (e) {
        setSteps(recipe.instructions.map(text => ({ text, timerInMinutes: null })));
      } finally {
        setLoading(false);
      }
    };
    loadSteps();
    return () => {
        if (currentSourceRef.current) currentSourceRef.current.stop();
        if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [recipe]);

  useEffect(() => {
    const currentStep = steps[currentIdx];
    if (currentStep?.timerInMinutes) {
      setTimerLeft(currentStep.timerInMinutes * 60);
    } else {
      setTimerLeft(null);
    }
    setIsTimerRunning(false);
    stopReading();
  }, [currentIdx, steps]);

  useEffect(() => {
    if (isTimerRunning && timerLeft && timerLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimerLeft(p => (p !== null && p > 0 ? p - 1 : 0));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning, timerLeft]);

  const handleReadAloud = async () => {
    if (isReading) {
        stopReading();
        return;
    }

    const text = steps[currentIdx].text;
    setIsReading(true);
    try {
        const audioData = await generateSpeech(text);
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsReading(false);
        currentSourceRef.current = source;
        source.start();
    } catch (e) {
        console.error("Speech generation failed", e);
        setIsReading(false);
    }
  };

  const stopReading = () => {
    if (currentSourceRef.current) {
        currentSourceRef.current.stop();
        currentSourceRef.current = null;
    }
    setIsReading(false);
  };

  async function decodeAudioData(data: ArrayBuffer, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-10 bg-emerald-900 text-white">
        <SparklesIcon className="w-16 h-16 animate-pulse mb-6 text-emerald-400" />
        <h2 className="text-2xl font-bold">Připravuji režim vaření...</h2>
        <p className="opacity-60">AI analyzuje postup pro chytré časovače a předčítání.</p>
      </div>
    );
  }

  const currentStep = steps[currentIdx];

  return (
    <div className="h-[85vh] flex flex-col bg-emerald-950 text-white overflow-hidden">
      <div className="px-8 py-6 flex justify-between items-center bg-black/20 border-b border-white/10">
        <div>
          <h2 className="text-lg font-bold truncate max-w-[200px] sm:max-w-none">{recipe.title}</h2>
          <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest">Krok {currentIdx + 1} z {steps.length}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><XMarkIcon className="w-6 h-6" /></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20 text-center relative">
        <div 
          className="absolute inset-0 bg-emerald-900/30 blur-3xl rounded-full" 
          style={{ width: '50%', height: '50%', left: '25%', top: '25%' }} 
        />
        
        <div className="relative z-10 max-w-2xl">
          <p className="text-2xl sm:text-4xl font-medium leading-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {currentStep.text}
          </p>

          <button 
            onClick={handleReadAloud}
            className={`mb-12 px-6 py-2 rounded-full border border-white/20 text-sm font-bold flex items-center gap-2 mx-auto transition-all ${isReading ? 'bg-white text-emerald-950' : 'hover:bg-white/10'}`}
          >
            <SparklesIcon className={`w-4 h-4 ${isReading ? 'animate-bounce' : ''}`} />
            {isReading ? 'Předčítám...' : 'Přečíst nahlas'}
          </button>

          {timerLeft !== null && (
            <div className="flex flex-col items-center bg-black/30 backdrop-blur-md rounded-[40px] p-8 sm:p-12 border border-white/5 shadow-2xl">
              <div className="flex items-center gap-2 mb-4 text-emerald-400 font-bold uppercase tracking-widest text-xs">
                <ClockIcon className="w-4 h-4" />
                <span>Časovač</span>
              </div>
              <div className="text-7xl sm:text-9xl font-black font-mono mb-8 tracking-tighter">
                {formatTime(timerLeft)}
              </div>
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-12 py-4 rounded-full font-bold text-lg transition-all active:scale-95 ${isTimerRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              >
                {isTimerRunning ? 'PAUZA' : 'START'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-10 bg-black/40 border-t border-white/10 flex items-center justify-between">
        <button 
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx(p => p - 1)}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all disabled:opacity-20"
        >
          <ArrowLeftIcon className="w-8 h-8" />
        </button>
        
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIdx ? 'w-8 bg-emerald-500' : i < currentIdx ? 'w-2 bg-emerald-900' : 'w-2 bg-white/20'}`} 
            />
          ))}
        </div>

        <button 
          disabled={currentIdx === steps.length - 1}
          onClick={() => setCurrentIdx(p => p + 1)}
          className="p-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-20"
        >
          <ArrowRightIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default CookingModeModal;
