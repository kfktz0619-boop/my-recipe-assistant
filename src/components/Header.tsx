import React from 'react';
import { Sparkles, Refrigerator, ShoppingBag, History, AlertTriangle, ChefHat } from 'lucide-react';
import { Ingredient } from '../types';

interface HeaderProps {
  ingredients: Ingredient[];
  shoppingListCount: number;
  cookHistoryCount: number;
  onOpenShoppingList: () => void;
  onOpenHistory: () => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({
  ingredients,
  shoppingListCount,
  cookHistoryCount,
  onOpenShoppingList,
  onOpenHistory,
  activeSection,
}) => {
  const expiringSoonCount = ingredients.filter(i => i.daysUntilExpiry <= 2 && i.quantity > 0).length;
  const inStockCount = ingredients.filter(i => i.quantity > 0).length;

  return (
    <header className="sticky top-0 z-40 bg-[#F9F9F6]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2E7D32] flex items-center justify-center text-white shadow-sm">
            <Refrigerator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg text-stone-900 tracking-tight">SmartFridge AI</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-[#1B5E20] font-medium hidden sm:inline-block">
                料理助理
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>現存 {inStockCount} 項食材</span>
              {expiringSoonCount > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-700 font-medium flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3 text-amber-600 inline" />
                    {expiringSoonCount} 項急需料理
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Nav Anchors for Desktop */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs font-medium text-stone-600">
          <a
            href="#inventory-section"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSection === 'inventory' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'hover:text-stone-900'
            }`}
          >
            1. 冰箱盤點
          </a>
          <a
            href="#filters-section"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSection === 'filters' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'hover:text-stone-900'
            }`}
          >
            2. 設備與偏好
          </a>
          <a
            href="#recipes-section"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSection === 'recipes' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'hover:text-stone-900'
            }`}
          >
            3. 推薦食譜
          </a>
        </nav>

        {/* Quick Utilities: Shopping list & Cook record */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenShoppingList}
            className="relative p-2 text-stone-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors border border-stone-200 bg-white"
            title="待買補貨清單"
            aria-label="待買補貨清單"
          >
            <ShoppingBag className="w-4 h-4" />
            {shoppingListCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {shoppingListCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenHistory}
            className="relative p-2 text-stone-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors border border-stone-200 bg-white"
            title="烹飪紀錄"
            aria-label="烹飪紀錄"
          >
            <History className="w-4 h-4" />
            {cookHistoryCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-stone-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cookHistoryCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
