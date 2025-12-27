
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Recipe, RecipeSuggestionResult, ShoppingList } from "../types";

/**
 * Bezpečné získání API klíče z prostředí.
 * V prohlížeči může být process undefined, pokud není správně injektován bundlerem.
 */
const getApiKey = () => {
  try {
    return (typeof process !== 'undefined' && process.env?.API_KEY) || "";
  } catch {
    return "";
  }
};

const getAI = () => new GoogleGenAI({ apiKey: getApiKey() });

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        prepTime: { type: Type.NUMBER },
        cookTime: { type: Type.NUMBER },
        servings: { type: Type.NUMBER },
        tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
    },
    required: ["title", "description", "ingredients", "instructions", "tags"]
};

export async function extractRecipeFromText(text: string): Promise<Partial<Recipe>> {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyzuj následující text a extrahuj z něj recept do formátu JSON:\n\n${text}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
            },
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Gemini Extraction Error:", error);
        throw error;
    }
}

export async function suggestRecipeFromIngredients(ingredientsText: string, allRecipes: Recipe[]): Promise<RecipeSuggestionResult> {
    try {
        const ai = getAI();
        const simplifiedRecipes = allRecipes.map(({ id, title, ingredients }) => ({ id, title, ingredients }));
        const prompt = `Uživatel má tyto suroviny: "${ingredientsText}".
        Z těchto existujících receptů: ${JSON.stringify(simplifiedRecipes)}
        1. Vrať pole ID (matchedRecipeIds) těch, které se dají uvařit.
        2. Pokud nic nesedí, navrhni nový recept (newRecipeSuggestion) v češtině.`;

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
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Gemini Suggestion Error:", error);
        throw error;
    }
}

export async function generateRecipeImage(recipeTitle: string): Promise<string> {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: `A professional, appetizing food photography of: ${recipeTitle}. Close-up, soft natural lighting, gourmet presentation.` }]
            },
            config: {
                imageConfig: { aspectRatio: "4:3" }
            }
        });

        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (part?.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
        throw new Error("Nepodařilo se vygenerovat obrázek.");
    } catch (error) {
        console.error("Gemini Image Gen Error:", error);
        throw error;
    }
}

export async function generateSpeech(text: string): Promise<ArrayBuffer> {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Přečti jasně a srozumitelně: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return decodeBase64ToArrayBuffer(base64Audio);
        }
        throw new Error("Nepodařilo se vygenerovat řeč.");
    } catch (error) {
        console.error("Gemini TTS Error:", error);
        throw error;
    }
}

function decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export async function generateShoppingList(recipes: Recipe[]): Promise<ShoppingList> {
    try {
        const ai = getAI();
        const allIngredients = recipes.flatMap(r => r.ingredients);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Vytvoř nákupní seznam v češtině z těchto ingrediencí, sluč duplicity a rozděl do logických kategorií:\n\n${JSON.stringify(allIngredients)}`,
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
        return JSON.parse(response.text || '[]');
    } catch (error) {
        console.error("Gemini Shopping List Error:", error);
        throw error;
    }
}

export async function addTimersToInstructions(instructions: string[]): Promise<{text: string, timerInMinutes: number | null}[]> {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `U každé instrukce najdi, jestli obsahuje čas vaření v minutách:\n\n${JSON.stringify(instructions)}`,
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
                        required: ["text"]
                    }
                }
            },
        });
        return JSON.parse(response.text || '[]');
    } catch (error) {
        console.error("Gemini Timer Extraction Error:", error);
        throw error;
    }
}
