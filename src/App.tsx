import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { FridgeInventorySection } from './components/FridgeInventorySection';
import { PreferenceFilterSection } from './components/PreferenceFilterSection';
import { RecipeRecommendationsSection } from './components/RecipeRecommendationsSection';
import { CookingCompleteModal } from './components/CookingCompleteModal';
import { ShoppingListModal } from './components/ShoppingListModal';
import { CookHistoryModal } from './components/CookHistoryModal';
import { Ingredient, Recipe, RecipeUsedIngredient, CookHistoryItem } from './types';
import { INITIAL_INGREDIENTS } from './data/defaultIngredients';
import { Sparkles, Refrigerator, Sliders, Utensils, ArrowUp } from 'lucide-react';

export default function App() {
  // 1. Ingredients State (persisted to localStorage)
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    try {
      const saved = localStorage.getItem('smartfridge_ingredients');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_INGREDIENTS;
  });

  // Save ingredients changes
  useEffect(() => {
    try {
      localStorage.setItem('smartfridge_ingredients', JSON.stringify(ingredients));
    } catch (e) {}
  }, [ingredients]);

  // 2. Filter Preferences State
  const [appliances, setAppliances] = useState<string[]>(['平底鍋/單口爐', '電鍋']);
  const [dietaryStyles, setDietaryStyles] = useState<string[]>(['高蛋白增肌', '家常鹹香下飯']);
  const [maxTime, setMaxTime] = useState<number>(15);
  const [customNote, setCustomNote] = useState<string>('');

  // 3. Recipes State
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [swappingRecipeId, setSwappingRecipeId] = useState<string | null>(null);

  // 4. Modals & Drawers State
  const [cookingModalRecipe, setCookingModalRecipe] = useState<Recipe | null>(null);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // 5. Shopping list & Cooking history state
  const [shoppingList, setShoppingList] = useState<{ id: string; name: string; amount: string; checked: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem('smartfridge_shopping');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [cookHistory, setCookHistory] = useState<CookHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('smartfridge_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'inventory' | 'filters' | 'recipes'>('inventory');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  useEffect(() => {
    try {
      localStorage.setItem('smartfridge_shopping', JSON.stringify(shoppingList));
    } catch (e) {}
  }, [shoppingList]);

  useEffect(() => {
    try {
      localStorage.setItem('smartfridge_history', JSON.stringify(cookHistory));
    } catch (e) {}
  }, [cookHistory]);

  // Generate initial recipes on first load
  useEffect(() => {
    handleGenerateRecipes(true);
  }, []);

  // Handlers for Inventory
  const handleUpdateIngredients = (newIngredients: Ingredient[]) => {
    setIngredients(newIngredients);
    showToast('冰箱食材已更新！');
  };

  const handleAddIngredient = (item: Omit<Ingredient, 'id'>) => {
    const newItem: Ingredient = {
      ...item,
      id: `custom-${Date.now()}`,
    };
    setIngredients(prev => [newItem, ...prev]);
    showToast(`已將 ${item.name} 加入冰箱庫存！`);
  };

  const handleRemoveIngredient = (id: string) => {
    const target = ingredients.find(i => i.id === id);
    setIngredients(prev => prev.filter(i => i.id !== id));
    if (target) {
      showToast(`已移除 ${target.name}`);
    }
  };

  const handleToggleSelectIngredient = (id: string) => {
    setIngredients(prev =>
      prev.map(i => (i.id === id ? { ...i, isSelected: !i.isSelected } : i))
    );
  };

  const handleToggleSelectAll = (select: boolean) => {
    setIngredients(prev => prev.map(i => ({ ...i, isSelected: select })));
  };

  const handleResetDefault = () => {
    setIngredients(INITIAL_INGREDIENTS);
    showToast('已恢復預設食材庫存');
  };

  // Handlers for Preferences
  const handleToggleAppliance = (appliance: string) => {
    setAppliances(prev =>
      prev.includes(appliance)
        ? (prev.length > 1 ? prev.filter(a => a !== appliance) : prev) // keep at least 1
        : [...prev, appliance]
    );
  };

  const handleToggleDietaryStyle = (style: string) => {
    setDietaryStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleResetFilters = () => {
    setAppliances(['平底鍋/單口爐', '電鍋']);
    setDietaryStyles(['高蛋白增肌', '家常鹹香下飯']);
    setMaxTime(15);
    setCustomNote('');
    showToast('已重置篩選偏好');
  };

  // Generate recipes
  const handleGenerateRecipes = async (isInitial = false) => {
    const selected = ingredients.filter(i => i.isSelected && i.quantity > 0);
    const usableList = selected.length > 0 ? selected : ingredients.filter(i => i.quantity > 0);

    if (usableList.length === 0) {
      if (!isInitial) showToast('請先確認冰箱中有可用食材！');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: usableList,
          appliances,
          dietaryStyles,
          maxTime,
          tweakNotes: customNote,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.recipes)) {
        setRecipes(data.recipes);
        if (!isInitial) {
          showToast('✨ 3 道全新推薦食譜已出爐！');
          // Smooth scroll to recipe section
          const el = document.getElementById('recipes-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    } catch (err) {
      console.error('Error generating recipes:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // FR-03: Swap single recipe
  const handleSwapRecipe = async (recipeId: string) => {
    setSwappingRecipeId(recipeId);
    try {
      const currentRecipe = recipes.find(r => r.id === recipeId);
      const res = await fetch('/api/tweak-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentRecipe,
          tweakPrompt: '換一道截然不同的全新菜色風格',
          availableIngredients: ingredients.filter(i => i.isSelected && i.quantity > 0),
        }),
      });

      const data = await res.json();
      if (data.success && data.recipe) {
        setRecipes(prev => prev.map(r => (r.id === recipeId ? data.recipe : r)));
        showToast('已更換為全新菜色！');
      }
    } catch (err) {
      console.error('Error swapping recipe:', err);
    } finally {
      setSwappingRecipeId(null);
    }
  };

  // FR-03: Conversational tweak on single recipe
  const handleTweakRecipe = async (recipeId: string, tweakPrompt: string) => {
    const currentRecipe = recipes.find(r => r.id === recipeId);
    if (!currentRecipe) return;

    try {
      const res = await fetch('/api/tweak-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentRecipe,
          tweakPrompt,
          availableIngredients: ingredients.filter(i => i.isSelected && i.quantity > 0),
        }),
      });

      const data = await res.json();
      if (data.success && data.recipe) {
        setRecipes(prev => prev.map(r => (r.id === recipeId ? data.recipe : r)));
        showToast(`已套用微調：「${tweakPrompt}」`);
      }
    } catch (err) {
      console.error('Error tweaking recipe:', err);
    }
  };

  // FR-04: Confirm cooking and deduct inventory
  const handleConfirmDeduct = (recipe: Recipe, deductions: RecipeUsedIngredient[]) => {
    const newShoppingItems: { id: string; name: string; amount: string; checked: boolean }[] = [];

    // Deduct from inventory
    const updatedIngredients = ingredients.map(inv => {
      const match = deductions.find(d => inv.name.includes(d.name) || d.name.includes(inv.name));
      if (match) {
        const nextQty = Math.max(0, parseFloat((inv.quantity - match.amount).toFixed(1)));
        if (nextQty === 0 && inv.quantity > 0) {
          // Depleted! Add to shopping list
          newShoppingItems.push({
            id: `depleted-${Date.now()}-${inv.id}`,
            name: inv.name,
            amount: `1 ${inv.unit}`,
            checked: false,
          });
        }
        return { ...inv, quantity: nextQty };
      }
      return inv;
    });

    setIngredients(updatedIngredients);

    if (newShoppingItems.length > 0) {
      setShoppingList(prev => [...newShoppingItems, ...prev]);
    }

    // Add to history
    const historyItem: CookHistoryItem = {
      id: `hist-${Date.now()}`,
      recipeTitle: recipe.title,
      cookedAt: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      deductedIngredients: deductions,
    };
    setCookHistory(prev => [historyItem, ...prev]);

    showToast(`料理完成！已成功自冰箱扣除 ${deductions.length} 項食材。`);
  };

  // Undo last cook
  const handleUndoLastCook = () => {
    if (cookHistory.length === 0) return;
    const lastRecord = cookHistory[0];

    // Restore quantities
    setIngredients(prev =>
      prev.map(inv => {
        const match = lastRecord.deductedIngredients.find(d => inv.name.includes(d.name) || d.name.includes(inv.name));
        if (match) {
          return {
            ...inv,
            quantity: parseFloat((inv.quantity + match.amount).toFixed(1)),
          };
        }
        return inv;
      })
    );

    // Remove last record
    setCookHistory(prev => prev.slice(1));
    showToast(`已復原「${lastRecord.recipeTitle}」扣除之食材！`);
  };

  // Shopping list actions
  const handleToggleShoppingItem = (id: string) => {
    setShoppingList(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleAddShoppingItem = (name: string, amount: string) => {
    setShoppingList(prev => [
      { id: `shop-${Date.now()}`, name, amount, checked: false },
      ...prev,
    ]);
    showToast(`已將 ${name} 加入待買清單`);
  };

  const handleRemoveShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCheckedShopping = () => {
    setShoppingList(prev => prev.filter(item => !item.checked));
    showToast('已清除已採購項目');
  };

  const selectedIngredientsCount = ingredients.filter(i => i.isSelected && i.quantity > 0).length;

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#1A241B] flex flex-col selection:bg-emerald-200">
      {/* 1. Header Navigation */}
      <Header
        ingredients={ingredients}
        shoppingListCount={shoppingList.filter(s => !s.checked).length}
        cookHistoryCount={cookHistory.length}
        onOpenShoppingList={() => setIsShoppingListOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        activeSection={activeSection}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pb-24 sm:pb-16">
        {/* Hero Intro Banner */}
        <section className="pt-6 sm:pt-8 pb-2">
          <div className="bg-gradient-to-r from-emerald-900 to-[#1B5E20] text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-semibold backdrop-blur-xs mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>租屋小資族 · 忙碌上班族的智慧料理救星</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">
                冰箱食材不浪費，15分鐘美味開飯
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl">
                拍照秒辨識冰箱庫存，依您的廚房設備（電鍋、氣炸鍋、微波爐）與飲食風格，AI 生成即刻可煮的客製食譜，煮完自動扣庫存！
              </p>
            </div>

            {/* Decorative background visual subtle circles */}
            <div className="absolute -right-8 -bottom-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
            <div className="absolute right-12 top-6 text-emerald-200/20 hidden md:block">
              <Refrigerator className="w-36 h-36" />
            </div>
          </div>
        </section>

        {/* Section 1: 冰箱食材盤點區 */}
        <FridgeInventorySection
          ingredients={ingredients}
          onUpdateIngredients={handleUpdateIngredients}
          onAddIngredient={handleAddIngredient}
          onRemoveIngredient={handleRemoveIngredient}
          onToggleSelectIngredient={handleToggleSelectIngredient}
          onToggleSelectAll={handleToggleSelectAll}
          onResetDefault={handleResetDefault}
          onProceedToFilters={() => {
            const el = document.getElementById('filters-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Section 2: 條件篩選面板 */}
        <PreferenceFilterSection
          appliances={appliances}
          dietaryStyles={dietaryStyles}
          maxTime={maxTime}
          customNote={customNote}
          selectedIngredientsCount={selectedIngredientsCount}
          isGenerating={isGenerating}
          onToggleAppliance={handleToggleAppliance}
          onToggleDietaryStyle={handleToggleDietaryStyle}
          onSelectMaxTime={setMaxTime}
          onChangeCustomNote={setCustomNote}
          onResetFilters={handleResetFilters}
          onGenerateRecipes={() => handleGenerateRecipes(false)}
        />

        {/* Section 3: 食譜推薦與互動區 */}
        <RecipeRecommendationsSection
          recipes={recipes}
          inventory={ingredients}
          isGenerating={isGenerating}
          swappingRecipeId={swappingRecipeId}
          onRegenerateAll={() => handleGenerateRecipes(false)}
          onSwapRecipe={handleSwapRecipe}
          onTweakRecipe={handleTweakRecipe}
          onCompleteCooking={(rec) => setCookingModalRecipe(rec)}
          onScrollToInventory={() => {
            const el = document.getElementById('inventory-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 text-white text-xs px-4 py-2.5 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Friendly Bottom Quick Navigation Bar (符合單手點擊習慣) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-2 flex items-center justify-around shadow-lg">
        <a
          href="#inventory-section"
          className="flex flex-col items-center gap-0.5 text-stone-600 hover:text-emerald-800 text-[10px] font-medium py-1"
        >
          <Refrigerator className="w-4 h-4 text-emerald-700" />
          <span>冰箱庫存</span>
        </a>

        <a
          href="#filters-section"
          className="flex flex-col items-center gap-0.5 text-stone-600 hover:text-emerald-800 text-[10px] font-medium py-1"
        >
          <Sliders className="w-4 h-4 text-emerald-700" />
          <span>偏好設定</span>
        </a>

        <a
          href="#recipes-section"
          className="flex flex-col items-center gap-0.5 text-stone-600 hover:text-emerald-800 text-[10px] font-medium py-1"
        >
          <Utensils className="w-4 h-4 text-emerald-700" />
          <span>3道食譜</span>
        </a>

        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-stone-400 text-[10px] font-medium py-1"
          aria-label="回頂端"
        >
          <ArrowUp className="w-4 h-4" />
          <span>頂端</span>
        </button>
      </div>

      {/* Modals */}
      <CookingCompleteModal
        recipe={cookingModalRecipe}
        inventory={ingredients}
        onClose={() => setCookingModalRecipe(null)}
        onConfirmDeduct={handleConfirmDeduct}
      />

      {isShoppingListOpen && (
        <ShoppingListModal
          items={shoppingList}
          onClose={() => setIsShoppingListOpen(false)}
          onToggleItem={handleToggleShoppingItem}
          onAddItem={handleAddShoppingItem}
          onRemoveItem={handleRemoveShoppingItem}
          onClearChecked={handleClearCheckedShopping}
        />
      )}

      {isHistoryOpen && (
        <CookHistoryModal
          history={cookHistory}
          onClose={() => setIsHistoryOpen(false)}
          onClearHistory={() => setCookHistory([])}
          onUndoLastCook={handleUndoLastCook}
        />
      )}
    </div>
  );
}
