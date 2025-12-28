
import React, { useState, useEffect, useRef } from 'react';
import { Adventure } from '../types';
import { generateSpeech } from '../services/geminiService';
import { XMarkIcon, SparklesIcon, ArrowLeftIcon, ArrowRightIcon, ClockIcon } from './icons';

const RideModeModal: React.FC<{ adventure: Adventure, onClose: () => void }> = ({ adventure, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleRead = async () => {
    if (isReading) {
        sourceRef.current?.stop();
        setIsReading(false);
        return;
    }
    setLoading(true);
    try {
        const data = await generateSpeech(adventure.briefingSteps[currentIdx]);
        if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const buffer = await decodeAudioData(data, audioContextRef.current);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsReading(false);
        sourceRef.current = source;
        source.start();
        setIsReading(true);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  async function decodeAudioData(data: ArrayBuffer, ctx: AudioContext): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  }

  useEffect(() => {
    return () => {
        sourceRef.current?.stop();
        audioContextRef.current?.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-stone-950 text-white">
      <div className="px-8 py-6 flex justify-between items-center border-b border-white/5 bg-black/40">
        <div>
          <h2 className="text-xl font-black italic uppercase text-orange-500">{adventure.title}</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Bod {currentIdx + 1} z {adventure.briefingSteps.length}</p>
        </div>
        <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:bg-red-600 transition-all"><XMarkIcon className="w-6 h-6" /></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-10 sm:p-24 text-center">
        <div className="max-w-4xl space-y-12">
            <p className="text-3xl sm:text-6xl font-black italic uppercase leading-tight animate-in fade-in slide-in-from-bottom-12 duration-700">
                {adventure.briefingSteps[currentIdx]}
            </p>

            <button 
                disabled={loading}
                onClick={handleRead}
                className={`group px-12 py-6 rounded-full border-2 transition-all flex items-center gap-4 mx-auto ${isReading ? 'bg-orange-600 border-orange-600 text-white' : 'border-white/20 hover:border-orange-500 text-white'}`}
            >
                <SparklesIcon className={`w-8 h-8 ${isReading ? 'animate-pulse' : 'group-hover:rotate-45 transition-transform'}`} />
                <span className="text-xl font-black italic uppercase">{loading ? 'NAČÍTÁM...' : isReading ? 'POSLOUCHÁŠ...' : 'Hlasový briefing'}</span>
            </button>
        </div>
      </div>

      <div className="px-10 py-12 bg-black/60 border-t border-white/5 flex items-center justify-between">
        <button 
          disabled={currentIdx === 0}
          onClick={() => { setCurrentIdx(p => p - 1); sourceRef.current?.stop(); setIsReading(false); }}
          className="p-6 bg-white/5 hover:bg-white/10 rounded-3xl transition-all disabled:opacity-10"
        >
          <ArrowLeftIcon className="w-10 h-10" />
        </button>
        
        <div className="flex gap-3">
          {adventure.briefingSteps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === currentIdx ? 'w-16 bg-orange-600' : 'w-2 bg-stone-800'}`} />
          ))}
        </div>

        <button 
          disabled={currentIdx === adventure.briefingSteps.length - 1}
          onClick={() => { setCurrentIdx(p => p + 1); sourceRef.current?.stop(); setIsReading(false); }}
          className="p-6 bg-orange-600 hover:bg-orange-500 rounded-3xl shadow-2xl shadow-orange-900/40 transition-all active:scale-95 disabled:opacity-10"
        >
          <ArrowRightIcon className="w-10 h-10" />
        </button>
      </div>
    </div>
  );
};

export default RideModeModal;
