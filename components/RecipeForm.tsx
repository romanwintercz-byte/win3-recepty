import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Recipe, SourceType } from '../types';
import { PlusIcon, SparklesIcon, TrashIcon, PhotoIcon } from './icons';
import { extractRecipeFromText } from '../services/geminiService';

interface RecipeFormProps {
    recipeToEdit?: Recipe | null;
    onSave: (recipe: Recipe) => void;
    onClose: () => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ recipeToEdit, onSave, onClose }) => {
    const [recipe, setRecipe] = useState<Omit<Recipe, 'id'>>({
        title: '',
        description: '',
        imageUrl: '',
        sourceType: SourceType.MANUAL,
        ingredients: [''],
        instructions: [''],
        prepTime: 0,
        cookTime: 0,
        servings: 0,
        tags: [],
        rating: 0,
    });
    const [tagInput, setTagInput] = useState('');
    const [importText, setImportText] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (recipeToEdit) {
            setRecipe(recipeToEdit);
        }
    }, [recipeToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRecipe(prev => ({ ...prev, [name]: value }));
    };

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRecipe(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    };

    const handleListChange = (listName: 'ingredients' | 'instructions', index: number, value: string) => {
        const newList = [...recipe[listName]];
        newList[index] = value;
        setRecipe(prev => ({ ...prev, [listName]: newList }));
    };

    const addListItem = (listName: 'ingredients' | 'instructions') => {
        setRecipe(prev => ({ ...prev, [listName]: [...prev[listName], ''] }));
    };

    const removeListItem = (listName: 'ingredients' | 'instructions', index: number) => {
        if (recipe[listName].length > 1) {
            const newList = recipe[listName].filter((_, i) => i !== index);
            setRecipe(prev => ({ ...prev, [listName]: newList }));
        }
    };
    
    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !recipe.tags.includes(newTag)) {
                setRecipe(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setRecipe(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    };
    
    const handleFileSelected = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setRecipe(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelected(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };


    const handleImport = useCallback(async () => {
        if (!importText) return;
        setIsImporting(true);
        setError(null);
        try {
            const extractedData = await extractRecipeFromText(importText);
            setRecipe(prev => ({
                ...prev,
                ...extractedData,
                sourceType: SourceType.AI_IMPORTED,
                imageUrl: prev.imageUrl, // Keep existing or empty image
                rating: 0, // Set default rating for imported recipes
            }));
        } catch (err) {
            setError('Nepodařilo se zpracovat recept z textu. Zkontrolujte prosím formát nebo to zkuste znovu.');
            console.error(err);
        } finally {
            setIsImporting(false);
        }
    }, [importText]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalRecipe: Recipe = {
            id: recipeToEdit?.id || new Date().toISOString(),
            ...recipe,
            ingredients: recipe.ingredients.filter(i => i.trim() !== ''),
            instructions: recipe.instructions.filter(i => i.trim() !== ''),
        };
        onSave(finalRecipe);
    };
    
    const renderListInputs = (listName: 'ingredients' | 'instructions') => {
        const singularName = listName === 'ingredients' ? 'ingredienci' : 'krok postupu';
        const capitalizedListName = listName.charAt(0).toUpperCase() + listName.slice(1);
        
        return (
            <div>
                <label className="block text-sm font-medium text-stone-700 capitalize mb-2">{capitalizedListName === 'Ingredients' ? 'Ingredience' : 'Postup'}</label>
                {recipe[listName].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => handleListChange(listName, index, e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <button type="button" onClick={() => removeListItem(listName, index)} className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50" disabled={recipe[listName].length <= 1}>
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                ))}
                <button type="button" onClick={() => addListItem(listName)} className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800 mt-1">
                    <PlusIcon className="w-4 h-4" /> Přidat {singularName}
                </button>
            </div>
        );
    }
    
    return (
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <h2 className="text-2xl font-bold text-stone-800">{recipeToEdit ? 'Upravit Recept' : 'Přidat Nový Recept'}</h2>
            
             <div className="p-4 border-l-4 border-emerald-400 bg-emerald-50 rounded-md">
                <h3 className="font-semibold text-emerald-800 flex items-center gap-2"><SparklesIcon className="w-5 h-5" /> AI Importér Receptů</h3>
                <p className="text-sm text-emerald-700 mb-2">Vložte text receptu z webové stránky níže a nechte AI, aby za vás vyplnila formulář.</p>
                <textarea
                    placeholder="Vložte sem celý text receptu..."
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    className="w-full h-24 p-2 border border-stone-300 rounded-md"
                />
                <button
                    type="button"
                    onClick={handleImport}
                    disabled={isImporting || !importText}
                    className="mt-2 px-4 py-2 bg-emerald-500 text-white font-semibold rounded-md hover:bg-emerald-600 disabled:bg-stone-300 transition-colors"
                >
                    {isImporting ? 'Importuji...' : 'Importovat pomocí AI'}
                </button>
                 {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-stone-700">Název</label>
                        <input type="text" name="title" value={recipe.title} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-stone-700">Popis</label>
                        <textarea name="description" value={recipe.description} onChange={handleChange} rows={5} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"></textarea>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700">Fotografie</label>
                    <div className="mt-1">
                        {recipe.imageUrl ? (
                            <div className="relative group">
                                <img src={recipe.imageUrl} alt="Náhled receptu" className="w-full h-auto max-h-60 object-contain rounded-md border border-stone-300 bg-stone-100" />
                                <button type="button" onClick={() => setRecipe(prev => ({...prev, imageUrl: ''}))} className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                className="flex justify-center items-center h-full px-6 pt-5 pb-6 border-2 border-stone-300 border-dashed rounded-md cursor-pointer hover:border-emerald-500 bg-stone-50"
                            >
                                <div className="space-y-1 text-center">
                                    <PhotoIcon className="mx-auto h-12 w-12 text-stone-400" />
                                    <div className="flex text-sm text-stone-600">
                                        <p className="pl-1">Přetáhněte fotku sem, nebo <strong>klikněte pro nahrání</strong></p>
                                    </div>
                                    <p className="text-xs text-stone-500">PNG, JPG, GIF</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileSelected(e.target.files ? e.target.files[0] : null)}
                        className="hidden"
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
                <div>
                    <label htmlFor="prepTime" className="block text-sm font-medium text-stone-700">Čas přípravy (min)</label>
                    <input type="number" name="prepTime" value={recipe.prepTime} onChange={handleNumericChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                    <label htmlFor="cookTime" className="block text-sm font-medium text-stone-700">Čas vaření (min)</label>
                    <input type="number" name="cookTime" value={recipe.cookTime} onChange={handleNumericChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                    <label htmlFor="servings" className="block text-sm font-medium text-stone-700">Porce</label>
                    <input type="number" name="servings" value={recipe.servings} onChange={handleNumericChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {renderListInputs('ingredients')}
                {renderListInputs('instructions')}
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700">Štítky</label>
                 <div className="mt-1 flex flex-wrap items-center gap-2 p-2 border border-stone-300 rounded-md">
                     {recipe.tags.map(tag => (
                         <span key={tag} className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-sm px-2 py-1 rounded-full">
                             {tag}
                             <button type="button" onClick={() => removeTag(tag)} className="text-emerald-600 hover:text-emerald-800 font-bold text-xs">&times;</button>
                         </span>
                     ))}
                     <input
                         type="text"
                         value={tagInput}
                         onChange={(e) => setTagInput(e.target.value)}
                         onKeyDown={handleTagKeyDown}
                         placeholder="Přidat štítek..."
                         className="flex-grow p-1 outline-none bg-transparent"
                     />
                 </div>
                 <p className="text-xs text-stone-500 mt-1">Stiskněte Enter nebo čárku pro přidání štítku.</p>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-stone-200 text-stone-800 font-semibold rounded-md hover:bg-stone-300 transition-colors">Zrušit</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-white font-semibold rounded-md hover:bg-emerald-600 transition-colors shadow">Uložit Recept</button>
            </div>
        </form>
    );
};

export default RecipeForm;