
import React, { useState, useEffect, useRef } from 'react';
import { Recipe } from '../types';
import { addTimersToInstructions } from '../services/geminiService';
import { 
    XMarkIcon, 
    ArrowLeftCircleIcon, 
    ArrowRightCircleIcon, 
    SparklesIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ClockIcon,
    PlayCircleIcon,
    ArrowPathIcon
} from './icons';

export interface ProcessedInstruction {
    text: string;
    timerInMinutes: number | null;
}

const Timer: React.FC<{ minutes: number }> = ({ minutes }) => {
    const [timeLeft, setTimeLeft] = useState(minutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Preload audio
        audioRef.current = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjM2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq////////////////////////////////8AAAAATGF2YzU2LjQxAAAAAAAAAAAAAAAAEMcAAACAAAcNEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUREAAAARgAAASg4MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA/zFEQkEAAAAGgAAABEgAAAAozMzg1//MUUSAwAAAaQAAAAAAAADSAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MUUSBQAAAsAAAAASAP//8AAAAAD/8//hQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/zFEUgYAAANsAAACoGZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmá");
    }, []);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = window.setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current!);
                        setIsRunning(false);
                        audioRef.current?.play();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current!);
        }
        return () => clearInterval(intervalRef.current!);
    }, [isRunning]);

    const toggleTimer = () => setIsRunning(!isRunning);
    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(minutes * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="mt-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-lg flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-emerald-700">
                <ClockIcon className="w-6 h-6" />
                <span className="text-xl font-semibold">Časovač</span>
            </div>
            <p className="text-6xl font-bold font-mono text-stone-800 tabular-nums">{formatTime(timeLeft)}</p>
            <div className="flex gap-4">
                <button
                    onClick={toggleTimer}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-600 transition-colors shadow-md text-lg"
                >
                    <PlayCircleIcon className="w-6 h-6" />
                    {isRunning ? 'Pauza' : 'Start'}
                </button>
                <button
                    onClick={resetTimer}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-200 text-stone-700 font-bold rounded-full hover:bg-stone-300 transition-colors shadow-md text-lg"
                >
                    <ArrowPathIcon className="w-6 h-6" />
                    Reset
                </button>
            </div>
        </div>
    );
};


const CookingModeModal: React.FC<{ recipe: Recipe, onClose: () => void }> = ({ recipe, onClose }) => {
    const [processedInstructions, setProcessedInstructions] = useState<ProcessedInstruction[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [ingredientsVisible, setIngredientsVisible] = useState(false);

    useEffect(() => {
        const processInstructions = async () => {
            try {
                const result = await addTimersToInstructions(recipe.instructions);
                setProcessedInstructions(result);
            } catch (err) {
                console.error(err);
                setError("Chyba při přípravě interaktivního režimu. Použije se základní zobrazení bez časovačů.");
                setProcessedInstructions(recipe.instructions.map(text => ({ text, timerInMinutes: null })));
            } finally {
                setIsLoading(false);
            }
        };
        processInstructions();
    }, [recipe.instructions]);

    const handleNext = () => {
        if (processedInstructions && currentStep < processedInstructions.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    const currentInstruction = processedInstructions?.[currentStep];

    return (
        <div className="fixed inset-0 bg-stone-900 bg-opacity-95 flex flex-col items-center justify-center z-50 p-4 text-white">
            <div className="w-full max-w-4xl h-full flex flex-col">
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-stone-700">
                    <h2 className="text-2xl md:text-3xl font-bold truncate">{recipe.title}</h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
                        <XMarkIcon className="w-10 h-10" />
                    </button>
                </header>
                
                <main className="flex-grow flex flex-col justify-center items-center text-center p-4 overflow-y-auto">
                    {isLoading && (
                        <div>
                            <SparklesIcon className="w-16 h-16 text-emerald-400 animate-pulse mx-auto mb-4" />
                            <p className="text-xl font-semibold">AI připravuje chytré časovače...</p>
                        </div>
                    )}
                    {error && <p className="text-red-400">{error}</p>}
                    {!isLoading && currentInstruction && (
                        <div className="w-full">
                            <p className="text-lg font-semibold text-stone-400 mb-4">
                                Krok {currentStep + 1} / {processedInstructions?.length}
                            </p>
                            <p className="text-2xl md:text-4xl leading-relaxed font-medium">
                                {currentInstruction.text}
                            </p>
                            {currentInstruction.timerInMinutes && (
                                <Timer minutes={currentInstruction.timerInMinutes} />
                            )}
                        </div>
                    )}
                </main>
                
                <footer className="flex-shrink-0 p-4 space-y-4">
                    <div className="bg-stone-800 rounded-lg">
                        <button
                            onClick={() => setIngredientsVisible(!ingredientsVisible)}
                            className="w-full flex justify-between items-center p-3 text-lg font-semibold"
                        >
                            <span>Ingredience</span>
                            {ingredientsVisible ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />}
                        </button>
                        {ingredientsVisible && (
                            <div className="p-4 border-t border-stone-700 max-h-48 overflow-y-auto">
                                <ul className="list-disc list-inside space-y-2 text-stone-300 text-left">
                                    {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-center">
                        <button onClick={handlePrev} disabled={currentStep === 0} className="disabled:opacity-40 disabled:cursor-not-allowed">
                            <ArrowLeftCircleIcon className="w-16 h-16 text-stone-400 hover:text-white transition-colors" />
                        </button>
                        <button onClick={handleNext} disabled={!processedInstructions || currentStep === processedInstructions.length - 1} className="disabled:opacity-40 disabled:cursor-not-allowed">
                            <ArrowRightCircleIcon className="w-16 h-16 text-emerald-400 hover:text-emerald-300 transition-colors" />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default CookingModeModal;
