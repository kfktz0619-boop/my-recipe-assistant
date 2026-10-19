import React from 'react';
import { History, X, RotateCcw, Utensils, Calendar } from 'lucide-react';
import { CookHistoryItem } from '../types';

interface CookHistoryModalProps {
  history: CookHistoryItem[];
  onClose: () => void;
  onClearHistory: () => void;
  onUndoLastCook?: () => void;
}

export const CookHistoryModal: React.FC<CookHistoryModalProps> = ({
  history,
  onClose,
  onClearHistory,
  onUndoLastCook,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-lg"
          aria-label="關閉"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">烹飪成就紀錄</h3>
            <p className="text-xs text-stone-500">
              記錄每一道用心完成的料理與扣除明細
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px]">
          {history.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              尚未有完成的料理紀錄。煮好一道菜後點擊「完成烹飪」，成就將顯示在此！
            </div>
          ) : (
            history.map((record) => (
              <div
                key={record.id}
                className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span className="flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#2E7D32]" />
                    {record.recipeTitle}
                  </span>
                  <span className="text-[11px] text-stone-400 font-normal">
                    {record.cookedAt}
                  </span>
                </div>

                <div className="text-[11px] text-stone-600 flex flex-wrap gap-1">
                  <span className="text-stone-400">消耗食材：</span>
                  {record.deductedIngredients.map((ing, i) => (
                    <span key={i} className="bg-white px-1.5 py-0.5 rounded border border-stone-200">
                      {ing.name} {ing.amount}{ing.unit}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
          {onUndoLastCook && history.length > 0 && (
            <button
              type="button"
              onClick={onUndoLastCook}
              className="text-stone-600 hover:text-emerald-800 font-medium flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              復原上一道料理庫存
            </button>
          )}

          <button
            type="button"
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="ml-auto text-stone-400 hover:text-stone-700 disabled:opacity-30"
          >
            清空紀錄
          </button>
        </div>
      </div>
    </div>
  );
};
