import React, { useState } from 'react';
import { ChefHatIcon } from './icons';

interface RatingProps {
    rating: number;
    onRatingChange?: (newRating: number) => void;
    size?: 'sm' | 'lg';
}

const Rating: React.FC<RatingProps> = ({ rating, onRatingChange, size = 'lg' }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseOver = (index: number) => {
        if (!onRatingChange) return;
        setHoverRating(index);
    };

    const handleMouseLeave = () => {
        if (!onRatingChange) return;
        setHoverRating(0);
    };

    const handleClick = (index: number) => {
        if (!onRatingChange) return;
        // Allows un-rating by clicking the same star
        const newRating = index === rating ? 0 : index;
        onRatingChange(newRating);
    };
    
    // Special "Golden Hat" view for 5-star recipes
    if (rating === 5 && size === 'lg') {
        return (
            <div className="flex items-center gap-3 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-md">
                <ChefHatIcon className="w-10 h-10 text-amber-400" />
                <div>
                    <h4 className="font-bold text-amber-900">Mistrovský kousek!</h4>
                    <p className="text-sm text-amber-700">Tento recept má nejvyšší hodnocení.</p>
                </div>
            </div>
        )
    }

    if (rating === 5 && size === 'sm') {
        return (
             <div className="flex items-center gap-1 text-amber-500" title="Nejvyšší hodnocení">
                <ChefHatIcon className="w-5 h-5"/>
                <span className="font-bold text-sm">TOP</span>
            </div>
        )
    }

    const hatSize = size === 'sm' ? 'w-4 h-4' : 'w-7 h-7';
    const isInteractive = !!onRatingChange;

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((index) => {
                const isFilled = (hoverRating || rating) >= index;
                return (
                    <ChefHatIcon
                        key={index}
                        className={`
                            ${hatSize}
                            ${isFilled ? 'text-amber-400' : 'text-stone-300'}
                            ${isInteractive ? 'cursor-pointer transition-transform hover:scale-125' : ''}
                        `}
                        onMouseOver={() => handleMouseOver(index)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(index)}
                        aria-label={`Ohodnotit ${index} z 5`}
                    />
                );
            })}
        </div>
    );
};

export default Rating;