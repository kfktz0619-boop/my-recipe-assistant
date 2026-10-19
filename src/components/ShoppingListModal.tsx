import React, { useState } from 'react';
import { ShoppingBag, Plus, Trash2, Check, Copy, X, CheckSquare, Square } from 'lucide-react';

interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  checked: boolean;
}

interface ShoppingListModalProps {
  items: ShoppingItem[];
  onClose: () => void;
  onToggleItem: (id: string) => void;
  onAddItem: (name: string, amount: string) => void;
  onRemoveItem: (id: string) => void;
  onClearChecked: () => void;
}

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({
  items,
  onClose,
  onToggleItem,
  onAddItem,
  onRemoveItem,
  onClearChecked,
}) => {
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('1 份');
  const [copied, setCopied] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddItem(newName.trim(), newAmount.trim() || '1 份');
    setNewName('');
    setNewAmount('1 份');
  };

  const handleCopyList = () => {
    if (items.length === 0) return;
    const text = `🛒 智慧冰箱待買補貨清單：\n` + items.map((item, idx) => `${idx + 1}. ${item.name} (${item.amount}) ${item.checked ? '✅' : '⬜'}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">待買補貨清單</h3>
            <p className="text-xs text-stone-500">
              用罄的食材會自動歸檔於此，採買時一目了然
            </p>
          </div>
        </div>

        {/* Add item input */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="新增想買的食材..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
          />
          <input
            type="text"
            placeholder="數量/單位"
            value={newAmount}
            onChange={e => setNewAmount(e.target.value)}
            className="w-20 px-2 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white text-center"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            新增
          </button>
        </form>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[160px]">
          {items.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              目前清單空空如也，食材充足！
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-colors ${
                  item.checked ? 'bg-stone-50 text-stone-400 border-stone-200' : 'bg-white text-stone-800 border-stone-200'
                }`}
              >
                <div
                  onClick={() => onToggleItem(item.id)}
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  {item.checked ? (
                    <CheckSquare className="w-4 h-4 text-[#2E7D32]" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-400" />
                  )}
                  <span className={item.checked ? 'line-through' : 'font-medium'}>
                    {item.name}
                  </span>
                  <span className="text-[11px] text-stone-400">({item.amount})</span>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-stone-300 hover:text-rose-500 p-1"
                  aria-label="刪除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClearChecked}
            disabled={!items.some(i => i.checked)}
            className="text-xs text-stone-500 hover:text-stone-800 disabled:opacity-40"
          >
            清除已採購項目
          </button>

          <button
            type="button"
            onClick={handleCopyList}
            disabled={items.length === 0}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? '已複製到剪貼簿！' : '一鍵複製清單 (LINE/備忘錄)'}
          </button>
        </div>
      </div>
    </div>
  );
};
