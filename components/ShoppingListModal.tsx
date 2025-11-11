import React, { useState, useEffect } from 'react';
import { ShoppingList, ShoppingListItem } from '../types';
import { ClipboardDocumentListIcon, SparklesIcon, PlusIcon } from './icons';

interface ShoppingListModalProps {
    isLoading: boolean;
    shoppingList: ShoppingList | null;
    error: string | null;
}

const ShoppingListModal: React.FC<ShoppingListModalProps> = ({ isLoading, shoppingList, error }) => {
    const [localShoppingList, setLocalShoppingList] = useState<ShoppingList | null>(shoppingList);
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState('');

    useEffect(() => {
        setLocalShoppingList(shoppingList);
        setCheckedItems(new Set()); // Reset checked items when list changes
    }, [shoppingList]);

    const handleCheckboxChange = (itemName: string) => {
        setCheckedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemName)) {
                newSet.delete(itemName);
            } else {
                newSet.add(itemName);
            }
            return newSet;
        });
    };
    
    const handleCopyToClipboard = () => {
        if (!localShoppingList) return;
        const textToCopy = localShoppingList.map(category => {
            const itemsText = category.items.map(item => `- ${item.name}${item.quantity ? ` (${item.quantity})` : ''}`).join('\n');
            return `${category.category.toUpperCase()}\n${itemsText}`;
        }).join('\n\n');

        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Nákupní seznam byl zkopírován do schránky!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Nepodařilo se zkopírovat seznam.');
        });
    };
    
    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        const newItem: ShoppingListItem = {
            name: newItemName.trim(),
            quantity: newItemQuantity.trim(),
        };

        setLocalShoppingList(prevList => {
            const newList = JSON.parse(JSON.stringify(prevList || []));
            let otherCategory = newList.find((cat: { category: string; }) => cat.category === 'Ostatní');
            
            if (otherCategory) {
                otherCategory.items.push(newItem);
            } else {
                newList.push({ category: 'Ostatní', items: [newItem] });
            }
            return newList;
        });

        setNewItemName('');
        setNewItemQuantity('');
    };


    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center p-10">
                    <SparklesIcon className="w-12 h-12 text-emerald-500 animate-pulse mx-auto mb-4" />
                    <p className="text-lg font-semibold text-stone-700">AI generuje váš nákupní seznam...</p>
                    <p className="text-stone-500">Slučuje ingredience a třídí je do kategorií.</p>
                </div>
            );
        }

        if (error) {
            return <p className="text-red-500 text-center p-8">{error}</p>;
        }

        if (localShoppingList) {
             if(localShoppingList.length === 0) {
                return <p className="text-stone-600 text-center p-8">Váš nákupní seznam je prázdný. Přidejte položku níže.</p>;
            }
            return (
                <div className="space-y-4">
                     {localShoppingList.map(category => (
                        <div key={category.category}>
                            <h3 className="font-bold text-lg text-emerald-700 border-b-2 border-emerald-200 pb-1 mb-2">{category.category}</h3>
                            <ul className="space-y-1">
                                {category.items.map(item => (
                                    <li key={`${category.category}-${item.name}`} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`item-${category.category}-${item.name}`}
                                            checked={checkedItems.has(item.name)}
                                            onChange={() => handleCheckboxChange(item.name)}
                                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <label
                                            htmlFor={`item-${category.category}-${item.name}`}
                                            className={`ml-3 block text-sm font-medium text-stone-700 ${checkedItems.has(item.name) ? 'line-through text-stone-400' : ''}`}
                                        >
                                            {item.name} {item.quantity && <span className="text-stone-500">({item.quantity})</span>}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            );
        }
        
        return null;
    };

    return (
        <div className="p-6 md:p-8 flex flex-col h-full max-h-[85vh]">
            <div className="flex-shrink-0 flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 rounded-full">
                        <ClipboardDocumentListIcon className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-stone-800">Nákupní Seznam</h2>
                        <p className="text-stone-600">Vygenerováno z vašeho týdenního plánu.</p>
                    </div>
                </div>
                 {localShoppingList && localShoppingList.length > 0 && (
                    <button
                        onClick={handleCopyToClipboard}
                        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors shadow-sm whitespace-nowrap"
                    >
                        Kopírovat
                    </button>
                 )}
            </div>
            <div className="flex-grow overflow-y-auto pr-4 mb-4">
                 {renderContent()}
            </div>
            <div className="flex-shrink-0 pt-4 border-t border-stone-200">
                <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="newItemName" className="text-sm font-medium text-stone-600">Nová položka</label>
                        <input
                            type="text"
                            id="newItemName"
                            value={newItemName}
                            onChange={e => setNewItemName(e.target.value)}
                            placeholder="Např. Víno k večeři"
                            className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <div>
                         <label htmlFor="newItemQuantity" className="text-sm font-medium text-stone-600">Množství</label>
                        <input
                            type="text"
                            id="newItemQuantity"
                            value={newItemQuantity}
                            onChange={e => setNewItemQuantity(e.target.value)}
                            placeholder="1 láhev"
                             className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <button type="submit" className="md:col-start-3 w-full md:w-auto justify-self-end flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white font-semibold rounded-md hover:bg-emerald-600 transition-colors shadow disabled:bg-stone-300" disabled={!newItemName.trim()}>
                        <PlusIcon className="w-5 h-5" /> Přidat
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ShoppingListModal;