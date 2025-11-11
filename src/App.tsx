

import React, { useState, useCallback, useMemo } from 'react';
// FIX: Corrected import path for types to point to the root-level `types.ts` file and consolidated the type imports.
import { Recipe, RecipeSuggestionResult, WeeklyPlan, DayOfWeek, MealType, ShoppingList, SourceType } from '../types';
import Header from '../components/Header';
import RecipeList from '../components/RecipeList';
import RecipeDetail from '../components/RecipeDetail';
import RecipeForm from '../components/RecipeForm';
import Modal from '../components/Modal';
import MagicFridgeModal from '../components/MagicFridgeModal';
import WeeklyPlanner from '../components/WeeklyPlanner';
import ShoppingListModal from '../components/ShoppingListModal';
import CookingModeModal from '../components/CookingModeModal';
import { suggestRecipeFromIngredients, generateShoppingList } from '../services/geminiService';

const INITIAL_RECIPES: Recipe[] = [
    {
        id: '1',
        title: 'Špagety Carbonara',
        description: 'Klasické italské těstoviny s krémovou omáčkou na bázi vajec, pancettou a parmazánem.',
        imageUrl: 'https://picsum.photos/seed/carbonara/600/400',
        sourceType: SourceType.MANUAL,
        ingredients: ['200g špaget', '100g pancetty', '2 velká vejce', '50g sýra pecorino', '50g parmazánu', '2 stroužky česneku', 'Černý pepř'],
        instructions: ['Uvařte špagety podle návodu na obalu (obvykle 8-10 minut).', 'Mezitím na pánvi osmahněte pancettu a česnek dokud nezesklovatí.', 'V misce prošlehejte vejce se sýrem a čerstvě mletým pepřem.', 'Scezené, ještě horké špagety vhoďte na pánev k pancettě a promíchejte.', 'Okamžitě odstavte z ohně a vmíchejte vaječnou směs. Rychle míchejte, aby se vytvořila krémová omáčka a vejce se nesrazila.'],
        prepTime: 10,
        cookTime: 15,
        servings: 2,
        tags: ['těstoviny', 'italská', 'klasika'],
        rating: 4,
    },
    {
        id: '2',
        title: 'Kuřecí Tikka Masala',
        description: 'Kousky pečeného marinovaného kuřete v kořeněné kari omáčce. Kari je obvykle krémové a oranžové barvy.',
        imageUrl: 'https://picsum.photos/seed/tikka/600/400',
        sourceType: SourceType.MANUAL,
        ingredients: ['500g kuřecích prsou', '1 hrnek jogurtu', '1 lžíce citronové šťávy', '2 lžičky římského kmínu', '2 lžičky papriky', '1 hrnek rajčatového pyré', '1 hrnek smetany ke šlehání'],
        instructions: ['Kuřecí prsa nakrájejte na kostky a naložte do směsi jogurtu, citronové šťávy a koření. Nechte marinovat alespoň 1 hodinu.', 'Připravte masala omáčku na pánvi.', 'Smíchejte kuře s omáčkou.', 'Povařte asi 25 minut a podávejte.'],
        prepTime: 20,
        cookTime: 30,
        servings: 4,
        tags: ['kari', 'indická', 'kuřecí'],
        rating: 4,
    },
    {
        id: '3',
        title: 'Svíčková na smetaně',
        description: 'Hovězí pečeně na smetaně s kořenovou zeleninou, podávaná s houskovým knedlíkem a brusinkami.',
        imageUrl: 'https://picsum.photos/seed/svickova/600/400',
        sourceType: SourceType.MANUAL,
        ingredients: ['800g hovězí zadní', '2 mrkve', '1 petržel', '1/4 celeru', '1 cibule', '100g slaniny', '250ml smetany ke šlehání', 'Nové koření, celý pepř, bobkový list', 'Ocet, cukr, sůl'],
        instructions: ['Maso prošpikujte slaninou.', 'Orestujte zeleninu a cibuli.', 'Přidejte maso a opečte ho ze všech stran.', 'Podlijte vodou, přidejte koření a duste doměkka zhruba 90 minut.', 'Maso vyjměte, omáčku rozmixujte, zjemněte smetanou a dochuťte.'],
        prepTime: 30,
        cookTime: 120,
        servings: 4,
        tags: ['česká kuchyně', 'sváteční', 'hovězí', 'omáčka'],
        rating: 5,
    },
    {
        id: '4',
        title: 'Vepřo knedlo zelo',
        description: 'Národní klasika - pečená vepřová krkovice s dušeným zelím a houskovým nebo bramborovým knedlíkem.',
        imageUrl: 'https://picsum.photos/seed/veproknedlo/600/400',
        sourceType: SourceType.MANUAL,
        ingredients: ['1kg vepřové krkovice', '1 cibule', 'Sůl, kmín', '500g kysaného zelí', 'Cukr', 'Houskový knedlík'],
        instructions: ['Maso osolte, okmínujte a dejte péct s cibulí na 180°C.', 'Během pečení podlévejte vodou. Pečte celkem asi 90 minut.', 'Zelí propláchněte a duste s cukrem a cibulí doměkka.', 'Podávejte s knedlíkem.'],
        prepTime: 20,
        cookTime: 90,
        servings: 4,
        tags: ['česká kuchyně', 'klasika', 'vepřové'],
        rating: 5,
    },
    {
        id: '5',
        title: 'Hovězí guláš',
        description: 'Hustý a vydatný guláš z hovězí kližky s cibulí a paprikou, ideální s chlebem nebo knedlíkem.',
        imageUrl: 'https://picsum.photos/seed/gulas/600/400',
        sourceType: SourceType.MANUAL,
        ingredients: ['800g hovězí kližky', '4 velké cibule', '3 lžíce sádla', '3 lžíce sladké papriky', '1 lžička pálivé papriky', 'Majoránka, kmín, sůl, pepř', '2 stroužky česneku'],
        instructions: ['Na sádle osmahněte cibuli do tmava.', 'Přidejte papriku a krátce orestujte.', 'Vložte na kostky nakrájené maso a opečte.', 'Osolte, přidejte koření a podlijte vodou.', 'Duste doměkka alespoň 2 hodiny, na konci dochuťte majoránkou a česnekem.'],
        prepTime: 25,
        cookTime: 150,
        servings: 4,
        tags: ['česká kuchyně', 'hovězí', 'hospodská klasika'],
        rating: 3,
    },
    {
        id: '6',
        title: 'Smažený sýr s hranolky a tatarkou',
        description: 'Oblíbené jídlo nejen dětí. Obalovaný sýr eidam smažený dozlatova, podávaný s hranolky a tatarskou omáčkou.',
        imageUrl: 'https://picsum.photos/seed/smazenysyr/600/400',
        sourceType: SourceType.MANUAL,
        ingredients: ['4 plátky eidamu (1.5cm silné)', '2 vejce', 'Hladká mouka', 'Strouhanka', 'Olej na smažení', 'Hranolky', 'Tatarská omáčka'],
        instructions: ['Sýr obalte v trojobalu (mouka, vejce, strouhanka). Pro jistotu můžete obalit dvakrát.', 'Smažte v rozpáleném oleji z obou stran dozlatova, každou stranu asi 2-3 minuty.', 'Podávejte ihned s hranolky a tatarskou omáčkou.'],
        prepTime: 15,
        cookTime: 10,
        servings: 4,
        tags: ['rychlovka', 'bezmasé', 'česká kuchyně', 'sýr'],
        rating: 2,
    },
    {
        id: '7',
        title: 'Tvarohové ovocné knedlíky',
        description: 'Sladké hlavní jídlo nebo dezert. Měkké tvarohové knedlíky plněné sezónním ovocem, posypané tvarohem a cukrem, přelité máslem.',
        imageUrl: 'https://picsum.photos/seed/knedliky/600/400',
        sourceType: SourceType.MANUAL,
        ingredients: ['250g měkkého tvarohu', '1 vejce', '150g hrubé mouky', 'Špetka soli', 'Jahody nebo jiné ovoce', 'Strouhaný tvaroh na posypání', 'Moučkový cukr', 'Rozpuštěné máslo'],
        instructions: ['Z tvarohu, vejce, mouky a soli vypracujte těsto.', 'Těsto rozdělte, do každého kousku zabalte ovoce a vytvarujte knedlík.', 'Vařte ve vroucí osolené vodě asi 5-7 minut, dokud nevyplavou na povrch.', 'Podávejte sypané tvarohem, cukrem a přelité máslem.'],
        prepTime: 20,
        cookTime: 10,
        servings: 2,
        tags: ['sladké jídlo', 'dezert', 'česká kuchyně', 'tvaroh'],
        rating: 4,
    },
    {
        id: '8',
        title: 'Bramboráky',
        description: 'Křupavé placky z nastrouhaných brambor s česnekem a majoránkou, smažené na sádle.',
        imageUrl: 'https://picsum.photos/seed/bramboraky/600/400',
        sourceType: SourceType.MANUAL,
        ingredients: ['1kg brambor', '2 vejce', '3 stroužky česneku', '1 lžička majoránky', 'Sůl, pepř', 'Hladká mouka dle potřeby', 'Sádlo na smažení'],
        instructions: ['Brambory oloupejte a nastrouhejte najemno.', 'Vymačkejte přebytečnou vodu.', 'Přidejte vejce, prolisovaný česnek, majoránku, sůl, pepř a zahustěte moukou.', 'Tvořte placky a smažte na sádle dozlatova, přibližně 4 minuty z každé strany.'],
        prepTime: 20,
        cookTime: 20,
        servings: 4,
        tags: ['příloha', 'hlavní chod', 'česká kuchyně', 'brambory'],
        rating: 3,
    },
    {
        id: '9',
        title: 'Koprová omáčka s hovězím masem',
        description: 'Klasická česká smetanová omáčka s čerstvým koprem, podávaná s vařeným hovězím masem a knedlíkem nebo bramborem.',
        imageUrl: 'https://picsum.photos/seed/koprovka/600/400',
        sourceType: SourceType.MANUAL,
        ingredients: ['500g hovězího předního', 'Svazek čerstvého kopru', '250ml smetany ke šlehání', '30g másla', '30g hladké mouky', 'Hovězí vývar', 'Cukr, ocet, sůl'],
        instructions: ['Hovězí maso uvařte doměkka ve slané vodě.', 'Z másla a mouky připravte světlou jíšku.', 'Zalijte studeným vývarem a dobře rozmíchejte.', 'Povařte 20 minut, přidejte smetanu, nasekaný kopr a dochuťte solí, cukrem a octem.', 'Podávejte s masem a knedlíkem.'],
        prepTime: 15,
        cookTime: 90,
        servings: 4,
        tags: ['omáčka', 'česká kuchyně', 'hovězí', 'kopr'],
        rating: 2,
    },
    {
        id: '10',
        title: 'Vepřový řízek s bramborovým salátem',
        description: 'Sváteční klasika. Křupavý vepřový řízek obalený v trojobalu s tradičním bramborovým salátem s majonézou.',
        imageUrl: 'https://picsum.photos/seed/rizek/600/400',
        sourceType: SourceType.MANUAL,
        ingredients: ['4 plátky vepřové kotlety', 'Sůl', 'Hladká mouka', '2 vejce', 'Strouhanka', 'Sádlo nebo olej na smažení', '1kg brambor na salát', 'Mrkev, petržel, celer', 'Kyselá okurka', 'Cibule', 'Majonéza', 'Hořčice'],
        instructions: ['Plátky masa naklepejte, osolte a obalte v trojobalu.', 'Smažte dozlatova.', 'Brambory a kořenovou zeleninu uvařte ve slupce.', 'Po vychladnutí oloupejte, nakrájejte na kostičky, přidejte nakrájenou okurku, cibuli a smíchejte s majonézou, hořčicí a dochuťte.'],
        prepTime: 45,
        cookTime: 30,
        servings: 4,
        tags: ['sváteční', 'česká kuchyně', 'vepřové', 'klasika'],
        rating: 5,
    },
    {
        id: '11',
        title: 'Kulajda',
        description: 'Hustá jihočeská polévka s houbami, brambory, koprem a smetanou, dochucená octem a zakončená ztraceným vejcem.',
        imageUrl: '',
        sourceType: SourceType.MANUAL,
        ingredients: ['Hrst sušených hub', '4 velké brambory', '1.5l vody nebo vývaru', '250ml smetany ke šlehání', '2 lžíce hladké mouky', 'Svazek kopru', 'Kmín, bobkový list, celý pepř', 'Ocet, sůl', '4 vejce'],
        instructions: ['Houby namočte. Brambory nakrájejte na kostky a dejte vařit s kořením a houbami.', 'Ve smetaně rozmíchejte mouku a vlijte do polévky.', 'Povařte 15 minut, přidejte nasekaný kopr a dochuťte solí a octem.', 'Nakonec do polévky vyklepněte vejce a nechte je pošírovat asi 3 minuty.'],
        prepTime: 15,
        cookTime: 25,
        servings: 4,
        tags: ['polévka', 'česká kuchyně', 'houby', 'bezmasé'],
        rating: 4,
    },
    {
        id: '12',
        title: 'Kynuté buchty s povidly',
        description: 'Nadýchané kynuté buchty jako od babičky, plněné povidly nebo tvarohem, pečené dozlatova.',
        imageUrl: '',
        sourceType: SourceType.MANUAL,
        ingredients: ['500g polohrubé mouky', '250ml mléka', '30g droždí', '80g cukru krupice', '80g másla', '2 žloutky', 'Špetka soli', 'Povidla na náplň'],
        instructions: ['Z droždí, lžičky cukru a vlažného mléka udělejte kvásek.', 'Smíchejte mouku, cukr, sůl, žloutky, rozpuštěné máslo a vzešlý kvásek.', 'Vypracujte hladké těsto a nechte hodinu kynout.', 'Rozválejte, nakrájejte na čtverce, naplňte povidly a vytvořte buchty.', 'Skládejte je do vymazaného pekáče, potřete máslem a pečte dozlatova v troubě předehřáté na 180°C asi 25-30 minut.'],
        prepTime: 30,
        cookTime: 30,
        servings: 6,
        tags: ['dezert', 'sladké jídlo', 'česká kuchyně', 'kynuté'],
        rating: 3,
    }
];

const App: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
    const [activeModal, setActiveModal] = useState<'detail' | 'form' | 'fridge' | 'shopping-list' | 'cooking' | null>(null);
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
    const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentView, setCurrentView] = useState<'recipes' | 'planner'>('recipes');
    
    // Stavy pro "Kouzelnou Ledničku"
    const [fridgeResults, setFridgeResults] = useState<RecipeSuggestionResult | null>(null);
    const [isFridgeLoading, setIsFridgeLoading] = useState(false);
    const [fridgeError, setFridgeError] = useState<string | null>(null);

    // Stavy pro Týdenní Plánovač
    const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({});
    
    // Stavy pro Nákupní Seznam
    const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
    const [isShoppingListLoading, setIsShoppingListLoading] = useState(false);
    const [shoppingListError, setShoppingListError] = useState<string | null>(null);
    
    // Stavy pro Režim Vaření
    const [recipeForCooking, setRecipeForCooking] = useState<Recipe | null>(null);

    const handleOpenForm = useCallback((recipe?: Recipe) => {
        setRecipeToEdit(recipe || null);
        setActiveModal('form');
    }, []);

    const handleSelectRecipe = useCallback((id: string) => {
        setSelectedRecipeId(id);
        setActiveModal('detail');
    }, []);
    
    const handleCloseModal = useCallback(() => {
        setActiveModal(null);
        setSelectedRecipeId(null);
        setRecipeToEdit(null);
        setFridgeResults(null);
        setFridgeError(null);
        setShoppingList(null);
        setShoppingListError(null);
        setRecipeForCooking(null);
    }, []);

    const handleSaveRecipe = useCallback((recipe: Recipe) => {
        setRecipes(prevRecipes => {
            const exists = prevRecipes.some(r => r.id === recipe.id);
            if (exists) {
                return prevRecipes.map(r => r.id === recipe.id ? recipe : r);
            }
            return [...prevRecipes, recipe];
        });
        handleCloseModal();
    }, [handleCloseModal]);

    const handleDeleteRecipe = useCallback((id: string) => {
        setRecipes(prev => prev.filter(r => r.id !== id));
        handleCloseModal();
    }, [handleCloseModal]);

    const handleRatingChange = useCallback((recipeId: string, newRating: number) => {
        setRecipes(prevRecipes => 
            prevRecipes.map(r => r.id === recipeId ? { ...r, rating: newRating } : r)
        );
    }, []);

    const handleFindRecipeFromIngredients = useCallback(async (ingredients: string) => {
        setIsFridgeLoading(true);
        setFridgeResults(null);
        setFridgeError(null);
        try {
            const results = await suggestRecipeFromIngredients(ingredients, recipes);
            setFridgeResults(results);
        } catch (error) {
            console.error(error);
            setFridgeError("Omlouváme se, při komunikaci s AI nastala chyba. Zkuste to prosím znovu.");
        } finally {
            setIsFridgeLoading(false);
        }
    }, [recipes]);
    
    const handleUpdatePlan = useCallback((day: DayOfWeek, meal: MealType, recipeId: string | null) => {
        setWeeklyPlan(prevPlan => ({
            ...prevPlan,
            [day]: {
                ...(prevPlan[day] || {}),
                [meal]: recipeId
            }
        }));
    }, []);

    const handleGenerateShoppingList = useCallback(async () => {
        const plannedRecipeIds = new Set<string>();
        Object.values(weeklyPlan).forEach(day => {
            if (day) {
                Object.values(day).forEach(recipeId => {
                    if (recipeId) plannedRecipeIds.add(recipeId);
                });
            }
        });

        if (plannedRecipeIds.size === 0) {
            alert("V plánu nejsou žádné recepty pro vygenerování seznamu.");
            return;
        }

        const recipesForShoppingList = recipes.filter(r => plannedRecipeIds.has(r.id));
        
        setIsShoppingListLoading(true);
        setShoppingList(null);
        setShoppingListError(null);
        setActiveModal('shopping-list');
        
        try {
            const list = await generateShoppingList(recipesForShoppingList);
            setShoppingList(list);
        } catch (error) {
            console.error(error);
            setShoppingListError("Chyba při generování nákupního seznamu. Zkuste to prosím znovu.");
        } finally {
            setIsShoppingListLoading(false);
        }
    }, [weeklyPlan, recipes]);

    const handleStartCooking = useCallback((recipe: Recipe) => {
        setRecipeForCooking(recipe);
        setActiveModal('cooking');
    }, []);

    const selectedRecipe = useMemo(() => {
        return recipes.find(r => r.id === selectedRecipeId) || null;
    }, [recipes, selectedRecipeId]);

    const filteredRecipes = useMemo(() => {
        if (!searchQuery) return recipes;
        const lowercasedQuery = searchQuery.toLowerCase();
        return recipes.filter(recipe =>
            recipe.title.toLowerCase().includes(lowercasedQuery) ||
            recipe.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery))
        );
    }, [recipes, searchQuery]);

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800">
            <Header 
                onAddRecipe={() => handleOpenForm()} 
                onSearch={setSearchQuery}
                onOpenFridge={() => setActiveModal('fridge')}
                currentView={currentView}
                onSetView={setCurrentView}
            />
            <main className="container mx-auto p-4 md:p-8">
                {currentView === 'recipes' ? (
                    <RecipeList recipes={filteredRecipes} onSelectRecipe={handleSelectRecipe} />
                ) : (
                    <WeeklyPlanner 
                        allRecipes={recipes}
                        weeklyPlan={weeklyPlan}
                        onUpdatePlan={handleUpdatePlan}
                        onGenerateShoppingList={handleGenerateShoppingList}
                        onResetPlan={() => setWeeklyPlan({})}
                    />
                )}
            </main>

            {activeModal === 'detail' && selectedRecipe && (
                <Modal onClose={handleCloseModal}>
                    <RecipeDetail 
                        recipe={selectedRecipe} 
                        onClose={handleCloseModal}
                        onEdit={() => handleOpenForm(selectedRecipe)}
                        onDelete={handleDeleteRecipe}
                        onRatingChange={handleRatingChange}
                        onStartCooking={handleStartCooking}
                    />
                </Modal>
            )}

            {activeModal === 'form' && (
                <Modal onClose={handleCloseModal}>
                    <RecipeForm 
                        recipeToEdit={recipeToEdit} 
                        onSave={handleSaveRecipe} 
                        onClose={handleCloseModal} 
                    />
                </Modal>
            )}
            
            {activeModal === 'fridge' && (
                 <Modal onClose={handleCloseModal}>
                    <MagicFridgeModal
                        onClose={handleCloseModal}
                        onFindRecipes={handleFindRecipeFromIngredients}
                        isLoading={isFridgeLoading}
                        results={fridgeResults}
                        error={fridgeError}
                        allRecipes={recipes}
                        onSelectRecipe={handleSelectRecipe}
                        onSaveRecipe={handleSaveRecipe}
                    />
                 </Modal>
            )}

            {activeModal === 'shopping-list' && (
                 <Modal onClose={handleCloseModal}>
                    <ShoppingListModal
                        isLoading={isShoppingListLoading}
                        shoppingList={shoppingList}
                        error={shoppingListError}
                    />
                 </Modal>
            )}

            {activeModal === 'cooking' && recipeForCooking && (
                 <CookingModeModal
                    recipe={recipeForCooking}
                    onClose={handleCloseModal}
                 />
            )}
        </div>
    );
};

export default App;