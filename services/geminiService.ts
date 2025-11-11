import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, RecipeSuggestionResult, ShoppingList } from "../types";
import { ProcessedInstruction } from "../components/CookingModeModal";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Název receptu." },
        description: { type: Type.STRING, description: "Stručný a lákavý popis jídla." },
        ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Seznam všech ingrediencí s množstvím."
        },
        instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Postup vaření krok za krokem."
        },
        prepTime: { type: Type.NUMBER, description: "Doba přípravy v minutách." },
        cookTime: { type: Type.NUMBER, description: "Doba vaření v minutách." },
        servings: { type: Type.NUMBER, description: "Počet porcí, které recept vytvoří." },
        tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Seznam relevantních klíčových slov nebo štítků (např. 'veganské', 'dezert', 'rychlovka')."
        },
    },
    required: ["title", "description", "ingredients", "instructions", "tags"]
};

const suggestionSchema = {
    type: Type.OBJECT,
    properties: {
        matchedRecipeIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Pole ID existujících receptů, které se hodí k daným surovinám."
        },
        newRecipeSuggestion: {
            type: Type.OBJECT,
            nullable: true,
            description: "Nově vygenerovaný návrh receptu, pokud se žádný existující nehodí. Jinak null.",
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                prepTime: { type: Type.NUMBER },
                cookTime: { type: Type.NUMBER },
                servings: { type: Type.NUMBER },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        }
    },
    required: ["matchedRecipeIds", "newRecipeSuggestion"]
};

const shoppingListSchema = {
    type: Type.ARRAY,
    description: "Kompletní nákupní seznam rozdělený do kategorií.",
    items: {
        type: Type.OBJECT,
        properties: {
            category: {
                type: Type.STRING,
                description: "Název kategorie (např. 'Zelenina a ovoce', 'Maso a uzeniny', 'Pečivo', 'Trvanlivé potraviny')."
            },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "Název položky (např. 'Cibule')." },
                        quantity: { type: Type.STRING, description: "Celkové množství a jednotka (např. '3 ks', '500 g', '1 balení')." }
                    },
                    required: ["name", "quantity"]
                }
            }
        },
        required: ["category", "items"]
    }
};

const instructionsWithTimersSchema = {
    type: Type.ARRAY,
    description: "Seznam instrukcí s volitelnými časovači.",
    items: {
        type: Type.OBJECT,
        properties: {
            text: {
                type: Type.STRING,
                description: "Původní text instrukce."
            },
            timerInMinutes: {
                type: Type.NUMBER,
                nullable: true,
                description: "Doba vaření v minutách, pokud je v textu zmíněna (např. pro 'vařte 10-12 minut' vrať 12). Pokud není čas zmíněn, vrať null."
            }
        },
        required: ["text", "timerInMinutes"]
    }
};

export async function extractRecipeFromText(text: string): Promise<Partial<Recipe>> {
    const prompt = `
        Jste expert na analýzu receptů. Analyzujte následující text receptu a extrahujte klíčové údaje.
        Výstup poskytněte jako jeden platný JSON objekt, který odpovídá poskytnutému schématu. Neuvádějte žádné formátování markdownu ani komentáře.

        Text Receptu:
        ---
        ${text}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
            },
        });

        const jsonString = response.text;
        const parsedJson = JSON.parse(jsonString);
        return parsedJson as Partial<Recipe>;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Nepodařilo se extrahovat data receptu z Gemini.");
    }
}


export async function suggestRecipeFromIngredients(ingredientsText: string, allRecipes: Recipe[]): Promise<RecipeSuggestionResult> {
    const simplifiedRecipes = allRecipes.map(({ id, title, ingredients, tags }) => ({ id, title, ingredients, tags }));

    const prompt = `
        Jsi kuchařský asistent. Uživatel ti zadá seznam surovin, které má doma. Tvým úkolem je:
        1.  Analyzovat zadané suroviny: "${ingredientsText}".
        2.  Projít seznam existujících receptů, který ti poskytuji ve formátu JSON: ${JSON.stringify(simplifiedRecipes)}.
        3.  Identifikovat recepty, které se dají z daných surovin uvařit. Recept je vhodný, pokud obsahuje většinu klíčových surovin. Nevadí, pokud chybí jedna nebo dvě méně podstatné suroviny (např. koření).
        4.  Pokud najdeš 1 až 3 vhodné recepty, vrať jejich 'id' v poli 'matchedRecipeIds'. Pole 'newRecipeSuggestion' v tom případě nastav na 'null'.
        5.  Pokud nenajdeš ŽÁDNÝ vhodný existující recept, VYGENERUJ JEDEN NOVÝ, jednoduchý recept, který využívá co nejvíce poskytnutých surovin. Tento nový recept vrať jako objekt v poli 'newRecipeSuggestion'. Pole 'matchedRecipeIds' v tom případě ponech prázdné.
        6.  Vždy vrať výstup jako jeden platný JSON objekt, který přesně odpovídá poskytnutému schématu. Neuváděj žádné formátování markdownu.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionSchema,
            },
        });
        
        const jsonString = response.text;
        const parsedJson = JSON.parse(jsonString);
        return parsedJson as RecipeSuggestionResult;

    } catch (error) {
        console.error("Error calling Gemini API for suggestions:", error);
        throw new Error("Nepodařilo se získat návrhy receptů od Gemini.");
    }
}

export async function generateShoppingList(recipes: Recipe[]): Promise<ShoppingList> {
    const allIngredients = recipes.flatMap(r => r.ingredients);
    
    const prompt = `
        Jsi asistent pro nákupy. Tvým úkolem je vytvořit přehledný nákupní seznam z ingrediencí několika receptů.
        1. Analyzuj následující seznam ingrediencí: ${JSON.stringify(allIngredients)}.
        2. Sečti stejné položky. Například '1 cibule' a '2 cibule' sečti na '3 cibule'. '100g mouky' a '150g mouky' sečti na '250g mouky'. Buď inteligentní při sčítání jednotek.
        3. Rozděl všechny sečtené položky do logických kategorií pro snadný nákup v supermarketu (např. 'Zelenina a ovoce', 'Maso a uzeniny', 'Mléčné výrobky a vejce', 'Pečivo', 'Trvanlivé potraviny', 'Koření a dochucovadla', 'Ostatní').
        4. Vrať výsledek jako jeden platný JSON objekt pole, který přesně odpovídá zadanému schématu. Neuváděj žádné formátování markdownu.
    `;

     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: shoppingListSchema,
            },
        });
        
        const jsonString = response.text;
        const parsedJson = JSON.parse(jsonString);
        return parsedJson as ShoppingList;

    } catch (error) {
        console.error("Error calling Gemini API for shopping list:", error);
        throw new Error("Nepodařilo se vygenerovat nákupní seznam od Gemini.");
    }
}

export async function addTimersToInstructions(instructions: string[]): Promise<ProcessedInstruction[]> {
    const prompt = `
        Jsi asistent vaření. Projdi následující pole s instrukcemi k vaření. U každé instrukce identifikuj, zda obsahuje časový údaj pro vaření, pečení, dušení atd. (např. 'vařte 10 minut', 'pečte 20-25 minut').
        Vrať pole objektů, kde každý objekt obsahuje:
        - 'text': Původní text instrukce beze změny.
        - 'timerInMinutes': Číselná hodnota v minutách. Pokud je uveden rozsah (např. 20-25 minut), použij vyšší hodnotu (25). Pokud instrukce neobsahuje žádný konkrétní časový údaj, nastav hodnotu na 'null'.
        
        Výstup musí být jeden platný JSON objekt pole, který přesně odpovídá zadanému schématu. Neuváděj žádné formátování markdownu.

        Instrukce k analýze:
        ${JSON.stringify(instructions)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: instructionsWithTimersSchema,
            },
        });
        
        const jsonString = response.text;
        const parsedJson = JSON.parse(jsonString);
        return parsedJson as ProcessedInstruction[];

    } catch (error) {
        console.error("Error calling Gemini API for timer extraction:", error);
        throw new Error("Nepodařilo se analyzovat instrukce od Gemini.");
    }
}
