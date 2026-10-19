import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Plus,
  Trash2,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Ingredient, IngredientCategory } from '../types';
import { SAMPLE_PRESET_CARDS } from '../data/defaultIngredients';

interface FridgeInventorySectionProps {
  ingredients: Ingredient[];
  onUpdateIngredients: (newIngredients: Ingredient[]) => void;
  onAddIngredient: (item: Omit<Ingredient, 'id'>) => void;
  onRemoveIngredient: (id: string) => void;
  onToggleSelectIngredient: (id: string) => void;
  onToggleSelectAll: (select: boolean) => void;
  onResetDefault: () => void;
  onProceedToFilters: () => void;
}

const CATEGORY_MAP: Record<IngredientCategory, { label: string; icon: string }> = {
  vegetable: { label: '蔬菜時蔬', icon: '🥦' },
  meat: { label: '肉品肉類', icon: '🥩' },
  dairy: { label: '蛋奶豆製品', icon: '🥚' },
  seafood: { label: '海鮮水產', icon: '🐟' },
  staple: { label: '主食米麵', icon: '🍚' },
  condiment: { label: '常備辛香料', icon: '🧂' },
  other: { label: '其他食材', icon: '🥫' },
};

export const FridgeInventorySection: React.FC<FridgeInventorySectionProps> = ({
  ingredients,
  onUpdateIngredients,
  onAddIngredient,
  onRemoveIngredient,
  onToggleSelectIngredient,
  onToggleSelectAll,
  onResetDefault,
  onProceedToFilters,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [scanPreviewUrl, setScanPreviewUrl] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New ingredient form state
  const [newName, setNewName] = useState('');
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [newUnit, setNewUnit] = useState('個');
  const [newCategory, setNewCategory] = useState<IngredientCategory>('vegetable');
  const [newDays, setNewDays] = useState<number>(4);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered ingredients
  const filteredIngredients = ingredients.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const selectedCount = ingredients.filter(i => i.isSelected && i.quantity > 0).length;
  const allSelected = ingredients.length > 0 && ingredients.every(i => i.isSelected);

  // Handle Photo Upload
  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setScanPreviewUrl(base64);
      runVisionRecognition(base64, undefined);
    };
    reader.readAsDataURL(file);
  };

  // Handle Preset Sample selection
  const handleSelectPreset = (presetId: string, imageUrl: string) => {
    setScanPreviewUrl(imageUrl);
    runVisionRecognition(undefined, presetId);
  };

  const runVisionRecognition = async (imageBase64?: string, samplePresetId?: string) => {
    setIsScanning(true);
    setScanMessage('AI 智慧多模態辨識中，正在盤點生鮮包裝與食材...');

    try {
      const res = await fetch('/api/recognize-fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, samplePresetId }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.ingredients)) {
        // Merge or replace
        const newItems: Ingredient[] = data.ingredients.map((ing: any) => ({
          id: ing.id || `ing-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: ing.name,
          quantity: ing.quantity || 1,
          unit: ing.unit || '個',
          category: ing.category || 'vegetable',
          daysUntilExpiry: ing.daysUntilExpiry || 3,
          isSelected: true,
        }));
        onUpdateIngredients(newItems);
        setScanMessage(`🎉 成功辨識出 ${newItems.length} 項食材！已更新下方庫存清單。`);
        setTimeout(() => setScanMessage(null), 4000);
      }
    } catch (err) {
      console.error('Scan error:', err);
      setScanMessage('辨識服務忙碌中，已切換為智慧模擬盤點。');
    } finally {
      setIsScanning(false);
    }
  };

  const handleQuantityChange = (id: string, delta: number) => {
    const updated = ingredients.map(ing => {
      if (ing.id === id) {
        const nextQty = Math.max(0, parseFloat((ing.quantity + delta).toFixed(1)));
        return { ...ing, quantity: nextQty };
      }
      return ing;
    });
    onUpdateIngredients(updated);
  };

  const handleExpiryDaysChange = (id: string, days: number) => {
    const updated = ingredients.map(ing => (ing.id === id ? { ...ing, daysUntilExpiry: Math.max(1, days) } : ing));
    onUpdateIngredients(updated);
  };

  const handleCreateIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddIngredient({
      name: newName.trim(),
      quantity: Number(newQuantity) || 1,
      unit: newUnit.trim() || '個',
      category: newCategory,
      daysUntilExpiry: Number(newDays) || 3,
      isSelected: true,
    });
    setNewName('');
    setNewQuantity(1);
    setShowAddForm(false);
  };

  return (
    <section id="inventory-section" className="py-6 sm:py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#2E7D32] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">冰箱食材視覺盤點</h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            拍照上傳或點選情境照片，AI 5秒自動辨識名稱與數量，亦可彈性手動增修。
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onResetDefault}
            className="text-xs text-stone-600 hover:text-stone-900 px-2.5 py-1.5 rounded-md border border-stone-200 bg-white hover:bg-stone-50 flex items-center gap-1.5 transition-colors"
            title="恢復預設庫存"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            重置庫存
          </button>
          <button
            onClick={() => setShowAddForm(prev => !prev)}
            className="text-xs bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            手動新增食材
          </button>
        </div>
      </div>

      {/* Upload & Scenario Showcase Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 mb-6 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Drag & Drop / Camera Upload Box */}
          <div className="lg:col-span-5">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isScanning
                  ? 'border-emerald-600 bg-emerald-50/40'
                  : 'border-stone-300 hover:border-[#2E7D32] hover:bg-stone-50/80 bg-[#FBFBFA]'
              }`}
            >
              {scanPreviewUrl ? (
                <div className="relative rounded-lg overflow-hidden h-40 bg-stone-900 flex items-center justify-center">
                  <img
                    src={scanPreviewUrl}
                    alt="冰箱食材照片"
                    className="w-full h-full object-cover opacity-90"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute animate-scanner" />
                      <Sparkles className="w-7 h-7 text-emerald-300 animate-spin mb-2" />
                      <span className="text-xs font-semibold tracking-wide bg-stone-900/80 px-2.5 py-1 rounded">
                        AI 深度視覺解析中...
                      </span>
                    </div>
                  )}
                  {!isScanning && (
                    <div className="absolute bottom-2 right-2 bg-stone-900/80 text-white text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
                      <Camera className="w-3 h-3" /> 點擊更換照片
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#2E7D32] flex items-center justify-center mb-3">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-stone-900 mb-1">
                    拍照或上傳冰箱照片
                  </h3>
                  <p className="text-xs text-stone-500 mb-3 max-w-xs">
                    支援 JPG / PNG，自動辨識冷藏蔬果、蛋奶與肉品
                  </p>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 bg-[#2E7D32] text-white text-xs font-medium rounded-lg hover:bg-[#1B5E20] transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    選擇照片上傳
                  </button>
                </div>
              )}
            </div>

            {scanMessage && (
              <div className="mt-2.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{scanMessage}</span>
              </div>
            )}
          </div>

          {/* Right: Quick Sample Presets */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-700 tracking-wide uppercase">
                或是直接體驗情境示範（一鍵載入）
              </span>
              <span className="text-[11px] text-stone-400">免上傳即可模擬</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_PRESET_CARDS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id, preset.imageUrl)}
                  disabled={isScanning}
                  className="group text-left p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-emerald-50/60 hover:border-emerald-300 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="h-20 rounded-lg overflow-hidden mb-2 bg-stone-200">
                    <img
                      src={preset.imageUrl}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-stone-900 group-hover:text-emerald-900">
                      {preset.title}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-1">
                    {preset.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Add Ingredient Accordion Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateIngredient}
          className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#2E7D32]" />
              手動新增食材到冰箱
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              取消
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-700 mb-1">
                食材名稱
              </label>
              <input
                type="text"
                placeholder="例如：牛番茄、松阪豬"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                數量與單位
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={newQuantity}
                  onChange={e => setNewQuantity(parseFloat(e.target.value) || 1)}
                  className="w-16 px-2 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-center"
                />
                <input
                  type="text"
                  placeholder="顆/盒/g"
                  value={newUnit}
                  onChange={e => setNewUnit(e.target.value)}
                  className="w-16 px-2 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                食材分類
              </label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as IngredientCategory)}
                className="w-full px-2 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {Object.entries(CATEGORY_MAP).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.icon} {info.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                建議保鮮天數
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={newDays}
                  onChange={e => setNewDays(parseInt(e.target.value) || 3)}
                  className="w-20 px-2 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-center"
                />
                <span className="text-xs text-stone-600">天</span>
                <button
                  type="submit"
                  className="ml-auto px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-medium rounded-lg transition-colors"
                >
                  加入
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Inventory List Controls Bar */}
      <div className="bg-white border border-stone-200 rounded-t-2xl p-4 border-b-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs (Segmented Buttons) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeCategory === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              全部 ({ingredients.length})
            </button>
            {Object.entries(CATEGORY_MAP).map(([catKey, info]) => {
              const count = ingredients.filter(i => i.category === catKey).length;
              if (count === 0 && activeCategory !== catKey) return null;
              return (
                <button
                  key={catKey}
                  onClick={() => setActiveCategory(catKey)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeCategory === catKey
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>{info.icon}</span>
                  <span>{info.label}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Select all toggle & Count summary */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onToggleSelectAll(!allSelected)}
              className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium cursor-pointer"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-[#2E7D32]" />
              ) : (
                <Square className="w-4 h-4 text-stone-400" />
              )}
              {allSelected ? '取消全選' : '全部勾選'}
            </button>
            <span className="text-xs text-stone-400">|</span>
            <span className="text-xs text-stone-600">
              已選取 <strong className="text-emerald-800">{selectedCount}</strong> 項烹飪食材
            </span>
          </div>
        </div>
      </div>

      {/* Inventory Items Grid / Table */}
      <div className="bg-white border border-stone-200 rounded-b-2xl overflow-hidden shadow-xs divide-y divide-stone-100">
        {filteredIngredients.length === 0 ? (
          <div className="py-12 text-center text-stone-500">
            <p className="text-sm font-medium mb-1">此分類目前無食材</p>
            <p className="text-xs text-stone-400">點選上方「手動新增」或選擇示範照片載入</p>
          </div>
        ) : (
          filteredIngredients.map(item => {
            const isOutOfStock = item.quantity <= 0;
            const isUrgent = item.daysUntilExpiry <= 2 && !isOutOfStock;
            const isWarning = item.daysUntilExpiry <= 4 && !isOutOfStock && !isUrgent;

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isOutOfStock
                    ? 'bg-stone-50/80 opacity-60'
                    : item.isSelected
                    ? 'hover:bg-emerald-50/20'
                    : 'bg-stone-50/40 hover:bg-stone-50'
                }`}
              >
                {/* Left: Checkbox + Name + Category Icon */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleSelectIngredient(item.id)}
                    className="shrink-0 text-stone-400 hover:text-[#2E7D32] transition-colors"
                    aria-label={`選取 ${item.name}`}
                  >
                    {item.isSelected && !isOutOfStock ? (
                      <CheckSquare className="w-4 h-4 text-[#2E7D32]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-base shrink-0">
                    {CATEGORY_MAP[item.category]?.icon || '🥗'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold truncate ${isOutOfStock ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                        {item.name}
                      </span>
                      {isOutOfStock && (
                        <span className="text-[11px] text-rose-600 font-medium">已用罄</span>
                      )}
                    </div>
                    {/* Unboxed Metadata discipline */}
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <span>{CATEGORY_MAP[item.category]?.label || '食材'}</span>
                      <span aria-hidden="true">·</span>
                      {isUrgent ? (
                        <span className="text-rose-700 font-medium flex items-center gap-0.5">
                          剩 {item.daysUntilExpiry} 天保鮮 (請盡早料理)
                        </span>
                      ) : isWarning ? (
                        <span className="text-amber-700 font-medium">
                          剩 {item.daysUntilExpiry} 天
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          保鮮充足 ({item.daysUntilExpiry} 天)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Inline Quantity Controls + Days Adjuster + Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-11 sm:pl-0">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden shadow-xs">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, -1)}
                      disabled={item.quantity <= 0}
                      className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition-colors text-sm font-bold"
                      aria-label="減少數量"
                    >
                      -
                    </button>
                    <span className="px-2.5 text-xs font-semibold text-stone-800 min-w-[50px] text-center">
                      {item.quantity} {item.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors text-sm font-bold"
                      aria-label="增加數量"
                    >
                      +
                    </button>
                  </div>

                  {/* Expiry Days Dropdown */}
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <select
                      value={item.daysUntilExpiry}
                      onChange={e => handleExpiryDaysChange(item.id, parseInt(e.target.value))}
                      className="text-xs bg-stone-50 border border-stone-200 rounded px-1.5 py-1 text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value={1}>1 天 (即期)</option>
                      <option value={2}>2 天 (搶救)</option>
                      <option value={3}>3 天</option>
                      <option value={5}>5 天</option>
                      <option value={7}>7 天</option>
                      <option value={14}>14 天</option>
                    </select>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => onRemoveIngredient(item.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="移除食材"
                    aria-label={`移除 ${item.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Section CTA / Guide to Next Step */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-100/70 p-3.5 rounded-xl text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            確認好食材後，接著在下方設定您手邊擁有的廚房設備與想要的飲食風格！
          </span>
        </div>
        <button
          onClick={onProceedToFilters}
          className="w-full sm:w-auto px-4 py-2 bg-[#2E7D32] text-white rounded-lg font-medium hover:bg-[#1B5E20] transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
        >
          <span>前往設定設備與偏好</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
