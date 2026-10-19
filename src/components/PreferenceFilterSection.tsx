import React from 'react';
import {
  Flame,
  Zap,
  Clock,
  Sparkles,
  UtensilsCrossed,
  ChefHat,
  Heart,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';

interface PreferenceFilterSectionProps {
  appliances: string[];
  dietaryStyles: string[];
  maxTime: number;
  customNote: string;
  selectedIngredientsCount: number;
  isGenerating: boolean;
  onToggleAppliance: (appliance: string) => void;
  onToggleDietaryStyle: (style: string) => void;
  onSelectMaxTime: (minutes: number) => void;
  onChangeCustomNote: (note: string) => void;
  onResetFilters: () => void;
  onGenerateRecipes: () => void;
}

const APPLIANCE_OPTIONS = [
  { id: '電鍋', label: '電鍋 (一鍵蒸煮)', icon: '⚡' },
  { id: '氣炸鍋', label: '氣炸鍋 (少油酥脆)', icon: '🌪️' },
  { id: '微波爐', label: '微波爐 (超快加熱)', icon: '♨️' },
  { id: '平底鍋/單口爐', label: '平底鍋 / 單口瓦斯爐', icon: '🍳' },
  { id: '免開火/涼拌', label: '免開火 / 涼拌常備', icon: '🥗' },
  { id: '烤箱', label: '家用烤箱', icon: '🔥' },
];

const DIETARY_OPTIONS = [
  { id: '高蛋白增肌', label: '高蛋白增肌 (低脂高肉量)', icon: '💪' },
  { id: '低醣生酮', label: '低醣 / 減醣生酮', icon: '🥑' },
  { id: '蔬食輕盈減重', label: '蔬食輕盈 (多纖維少負擔)', icon: '🥬' },
  { id: '家常鹹香下飯', label: '經典家常 (濃郁開胃好配飯)', icon: '🍚' },
  { id: '清爽少油暖胃', label: '清爽無油 / 暖心溫潤', icon: '🥣' },
];

const TIME_OPTIONS = [
  { minutes: 15, label: '15 分鐘極速出菜', tag: '忙碌上班首選' },
  { minutes: 30, label: '30 分鐘豐盛開飯', tag: '標準家常' },
  { minutes: 60, label: '不限時間 (燉煮入味)', tag: '週末享受' },
];

export const PreferenceFilterSection: React.FC<PreferenceFilterSectionProps> = ({
  appliances,
  dietaryStyles,
  maxTime,
  customNote,
  selectedIngredientsCount,
  isGenerating,
  onToggleAppliance,
  onToggleDietaryStyle,
  onSelectMaxTime,
  onChangeCustomNote,
  onResetFilters,
  onGenerateRecipes,
}) => {
  return (
    <section id="filters-section" className="py-6 sm:py-8 border-t border-stone-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#2E7D32] text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              條件篩選面板
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            依租屋廚房設備、健身或飲食偏好與出菜時間，一鍵客製化專屬菜單。
          </p>
        </div>

        <button
          onClick={onResetFilters}
          className="self-start sm:self-auto text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置條件
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
        {/* 1. Kitchen Appliances (Multi-select Chips) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#2E7D32]" />
              現有廚房設備（可複選，配合租屋族限制）
            </label>
            <span className="text-[11px] text-stone-400">已選 {appliances.length} 項設備</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {APPLIANCE_OPTIONS.map(item => {
              const isSelected = appliances.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggleAppliance(item.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                    isSelected
                      ? 'border-[#2E7D32] bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-emerald-600/30'
                      : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <span className="block text-xs font-bold leading-tight">
                      {item.id}
                    </span>
                    <span className="text-[10px] text-stone-500 block truncate">
                      {item.label.split('(')[1]?.replace(')', '') || ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Dietary Styles (Multi-select) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#2E7D32]" />
              飲食風格與健康目標（可複選）
            </label>
            <span className="text-[11px] text-stone-400">已選 {dietaryStyles.length} 項偏好</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map(diet => {
              const isSelected = dietaryStyles.includes(diet.id);
              return (
                <button
                  key={diet.id}
                  type="button"
                  onClick={() => onToggleDietaryStyle(diet.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <span>{diet.icon}</span>
                  <span>{diet.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Cook Time Limit (Segmented Control) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2E7D32]" />
              出菜時間限制（優先過濾超速料理）
            </label>
            <span className="text-[11px] text-stone-400">目前上限：{maxTime} 分鐘</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {TIME_OPTIONS.map(timeOpt => {
              const isSelected = maxTime === timeOpt.minutes;
              return (
                <button
                  key={timeOpt.minutes}
                  type="button"
                  onClick={() => onSelectMaxTime(timeOpt.minutes)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-[#2E7D32] bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600/30'
                      : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{timeOpt.label}</div>
                    <div className="text-[11px] text-stone-500">{timeOpt.tag}</div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#2E7D32] bg-[#2E7D32]' : 'border-stone-300'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Optional Special Requests Notes */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            額外料理要求（可選）
          </label>
          <input
            type="text"
            placeholder="例如：一鍋到底免洗碗、去蔥薑蒜、少鹽少油、小朋友要吃..."
            value={customNote}
            onChange={e => onChangeCustomNote(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
          />
        </div>

        {/* 5. Big Primary CTA Generation Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onGenerateRecipes}
            disabled={isGenerating || selectedIngredientsCount === 0}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md ${
              selectedIngredientsCount === 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : isGenerating
                ? 'bg-emerald-800 text-white cursor-wait opacity-90'
                : 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white hover:shadow-lg active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin text-emerald-200" />
                <span>AI 大廚正在精算食譜中... (預計小於 5 秒)</span>
              </>
            ) : (
              <>
                <ChefHat className="w-5 h-5 text-emerald-200" />
                <span>
                  智慧生成 3 道量身食譜 (利用選取的 {selectedIngredientsCount} 項食材)
                </span>
              </>
            )}
          </button>

          {selectedIngredientsCount === 0 && (
            <p className="text-center text-xs text-rose-600 mt-2 font-medium">
              請在步驟 1 勾選至少 1 項冰箱食材，以供大廚配對食譜。
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
