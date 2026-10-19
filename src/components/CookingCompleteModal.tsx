import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertTriangle, ChefHat, Sparkles, X, ArrowRight, RotateCcw } from 'lucide-react';
import { Recipe, Ingredient, RecipeUsedIngredient } from '../types';
import { playSuccessChime } from '../utils/sound';

interface CookingCompleteModalProps {
  recipe: Recipe | null;
  inventory: Ingredient[];
  onClose: () => void;
  onConfirmDeduct: (recipe: Recipe, deductions: RecipeUsedIngredient[]) => void;
}

export const CookingCompleteModal: React.FC<CookingCompleteModalProps> = ({
  recipe,
  inventory,
  onClose,
  onConfirmDeduct,
}) => {
  const [isDeducted, setIsDeducted] = useState(false);

  if (!recipe) return null;

  // Calculate deductions & projected remainders
  const deductionsSummary = recipe.usedIngredients.map(used => {
    const matched = inventory.find(inv => inv.name.includes(used.name) || used.name.includes(inv.name));
    const currentQty = matched ? matched.quantity : 0;
    const unit = matched ? matched.unit : used.unit;
    const deductQty = Math.min(currentQty, used.amount);
    const remainingQty = Math.max(0, parseFloat((currentQty - deductQty).toFixed(1)));
    const willBeOutOfStock = remainingQty === 0;

    return {
      name: matched ? matched.name : used.name,
      matchedId: matched?.id,
      deductAmount: deductQty > 0 ? deductQty : used.amount,
      currentQty,
      remainingQty,
      unit,
      willBeOutOfStock,
    };
  });

  const handleConfirm = () => {
    // Fire festive confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2E7D32', '#4CAF50', '#81C784', '#FFD54F', '#FFA000'],
    });

    // Play synthesized celebratory chime
    playSuccessChime();

    const finalDeductions: RecipeUsedIngredient[] = deductionsSummary.map(d => ({
      name: d.name,
      amount: d.deductAmount,
      unit: d.unit,
    }));

    onConfirmDeduct(recipe, finalDeductions);
    setIsDeducted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-lg"
          aria-label="關閉"
        >
          <X className="w-5 h-5" />
        </button>

        {!isDeducted ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center mb-3">
              <ChefHat className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-stone-900 mb-1">
              確認完成料理並扣除食材庫存？
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              料理菜色：<strong className="text-stone-800">{recipe.title}</strong>
            </p>

            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 mb-4 divide-y divide-stone-200/70">
              <div className="text-[11px] font-bold text-stone-600 pb-2 flex justify-between">
                <span>預計扣除食材</span>
                <span>剩餘庫存</span>
              </div>
              <div className="pt-2 space-y-2">
                {deductionsSummary.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-stone-900">{item.name}</span>
                      <span className="text-stone-500 ml-1.5">
                        - {item.deductAmount} {item.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={item.willBeOutOfStock ? 'text-rose-600 font-bold' : 'text-stone-700'}>
                        {item.remainingQty} {item.unit}
                      </span>
                      {item.willBeOutOfStock && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-medium">
                          用罄
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {deductionsSummary.some(d => d.willBeOutOfStock) && (
              <div className="mb-4 text-xs bg-amber-50 text-amber-800 border border-amber-200 p-2.5 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  有食材即將歸零！系統將自動移入待買清單，方便日後採購。
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors border border-stone-200"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2.5 px-4 text-xs font-bold bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                確認扣除庫存
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#2E7D32] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-stone-900 mb-1">
              🎉 烹飪大成功！
            </h3>
            <p className="text-xs text-stone-600 mb-4 max-w-xs mx-auto">
              已為您自動扣除冰箱食材庫存，並記入主廚烹飪日誌。好好享用美味的料理吧！
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              返回冰箱庫存
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
