import React from 'react';
import { ChefHat, Sparkles, RefreshCw, AlertCircle, Utensils, Check } from 'lucide-react';
import { Recipe, Ingredient } from '../types';
import { RecipeCard } from './RecipeCard';

interface RecipeRecommendationsSectionProps {
  recipes: Recipe[];
  inventory: Ingredient[];
  isGenerating: boolean;
  swappingRecipeId: string | null;
  onRegenerateAll: () => void;
  onSwapRecipe: (recipeId: string) => void;
  onTweakRecipe: (recipeId: string, tweakPrompt: string) => void;
  onCompleteCooking: (recipe: Recipe) => void;
  onScrollToInventory: () => void;
}

export const RecipeRecommendationsSection: React.FC<RecipeRecommendationsSectionProps> = ({
  recipes,
  inventory,
  isGenerating,
  swappingRecipeId,
  onRegenerateAll,
  onSwapRecipe,
  onTweakRecipe,
  onCompleteCooking,
  onScrollToInventory,
}) => {
  return (
    <section id="recipes-section" className="py-6 sm:py-8 border-t border-stone-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#2E7D32] text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              食譜推薦與互動區
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            專為您冰箱食材設計的 3 道菜餚。支援單道獨立「換一道」、即時「對話微調」與「烹飪完成扣除庫存」。
          </p>
        </div>

        {recipes.length > 0 && !isGenerating && (
          <button
            onClick={onRegenerateAll}
            className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 flex items-center gap-1.5 font-medium transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            重換全部 3 道菜
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {isGenerating ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center shadow-xs">
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center mb-4">
              <ChefHat className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">
              AI 大廚正在為您的冰箱食材設計食譜...
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              考量即期食材保鮮、搭配指定設備與飲食風格，毫秒計算最佳料理配方
            </p>

            {/* Skeleton Cards preview */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-44 rounded-xl bg-stone-100 animate-pulse p-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-stone-200 rounded w-2/3" />
                    <div className="h-3 bg-stone-200 rounded w-full" />
                    <div className="h-3 bg-stone-200 rounded w-4/5" />
                  </div>
                  <div className="h-8 bg-stone-200 rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : recipes.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-xs">
          <div className="max-w-sm mx-auto flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mb-3">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-800 mb-1">目前尚未生成食譜</h3>
            <p className="text-xs text-stone-500 mb-4">
              請先確認步驟 1 冰箱清單有食材，並在步驟 2 點擊「智慧生成 3 道量身食譜」！
            </p>
            <button
              onClick={onScrollToInventory}
              className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              檢視冰箱食材
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              inventory={inventory}
              isSwapping={swappingRecipeId === recipe.id}
              onSwapRecipe={onSwapRecipe}
              onTweakRecipe={onTweakRecipe}
              onCompleteCooking={onCompleteCooking}
            />
          ))}
        </div>
      )}
    </section>
  );
};
