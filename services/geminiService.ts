
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Adventure, AdventureSuggestionResult, GearList, Recipe, RecipeSuggestionResult } from "../types";

// Follow guidelines: use process.env.API_KEY directly
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const adventureSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        waypoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        briefingSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        distanceKm: { type: Type.NUMBER },
        durationHours: { type: Type.NUMBER },
        difficulty: { type: Type.STRING, enum: ['Lehká', 'Střední', 'Expert'] },
        tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
    },
    required: ["title", "description", "waypoints", "briefingSteps", "difficulty", "tags"]
};

// Recipe schema for AI extraction
const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
        instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
        prepTime: { type: Type.NUMBER },
        cookTime: { type: Type.NUMBER },
        servings: { type: Type.NUMBER },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["title", "description", "ingredients", "instructions"]
};

export async function extractAdventureFromText(text: string): Promise<Partial<Adventure>> {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Jsi motorkářský expert. Extrahuj z tohoto textu trasu/výlet do JSONu:\n\n${text}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: adventureSchema,
        },
    });
    // Follow guidelines: use response.text property
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr || '{}');
}

export async function suggestRideFromContext(context: string, existingAdventures: Adventure[]): Promise<AdventureSuggestionResult> {
    const ai = getAI();
    const prompt = `Uživatel píše: "${context}". Navrhni motorkářský výlet.
    Existující výlety: ${JSON.stringify(existingAdventures.map(a => ({id: a.id, title: a.title})))}
    Vrať buď ID existujícího (matchedAdventureIds) nebo navrhni nový (newAdventureSuggestion).`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    matchedAdventureIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                    newAdventureSuggestion: adventureSchema
                },
                required: ["matchedAdventureIds"]
            }
        },
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr || '{}');
}

export async function generateAdventureImage(title: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: `Epic motorcycle touring photography of: ${title}. Scenic road, sunset, adventure style, high quality.` }]
        },
        config: { imageConfig: { aspectRatio: "16:9" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : "";
}

export async function generateGearList(adventures: Adventure[]): Promise<GearList> {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Vytvoř nákupní/balící seznam pro tyto motovýlety (nářadí, výbava, oblečení):\n\n${JSON.stringify(adventures)}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING },
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    quantity: { type: Type.STRING }
                                },
                                required: ["name", "quantity"]
                            }
                        }
                    },
                    required: ["category", "items"]
                }
            }
        },
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr || '[]');
}

export async function generateSpeech(text: string): Promise<ArrayBuffer> {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Briefing pro jezdce: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return new ArrayBuffer(0);
    
    // Follow guidelines for decoding base64
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Added missing recipe-related functions
export async function extractRecipeFromText(text: string): Promise<Partial<Recipe>> {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Jsi kuchařský expert. Extrahuj z tohoto textu recept do JSONu:\n\n${text}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: recipeSchema,
        },
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr || '{}');
}

export async function suggestRecipeFromIngredients(ingredients: string, existingRecipes: Recipe[]): Promise<RecipeSuggestionResult> {
    const ai = getAI();
    const prompt = `Uživatel má tyto suroviny: "${ingredients}". Navrhni recept.
    Existující recepty: ${JSON.stringify(existingRecipes.map(r => ({id: r.id, title: r.title})))}
    Vrať buď ID existujícího (matchedRecipeIds) nebo navrhni nový (newRecipeSuggestion).`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    matchedRecipeIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                    newRecipeSuggestion: recipeSchema
                },
                required: ["matchedRecipeIds"]
            }
        },
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr || '{}');
}

export async function generateRecipeImage(title: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: `High quality food photography of: ${title}. Gourmet plating, appetizing, natural lighting.` }]
        },
        config: { imageConfig: { aspectRatio: "4:3" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : "";
}

export async function generateShoppingList(recipes: Recipe[]): Promise<GearList> {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Vytvoř nákupní seznam pro tyto recepty (rozděl do kategorií):\n\n${JSON.stringify(recipes)}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING },
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    quantity: { type: Type.STRING }
                                },
                                required: ["name", "quantity"]
                            }
                        }
                    },
                    required: ["category", "items"]
                }
            }
        },
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr || '[]');
}

export async function addTimersToInstructions(instructions: string[]): Promise<any[]> {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `K těmto krokům receptu přidej odhadované časy v minutách pro časovač (pokud dávají smysl). Vrať pole objektů {text: string, timerInMinutes: number | null}:\n\n${JSON.stringify(instructions)}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        timerInMinutes: { type: Type.NUMBER }
                    },
                    required: ["text", "timerInMinutes"]
                }
            }
        }
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr || '[]');
}
