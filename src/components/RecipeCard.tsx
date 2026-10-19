import React, { useState, useEffect } from 'react';
import {
  Clock,
  Flame,
  ChefHat,
  RefreshCw,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  Send,
  Zap,
  Check
} from 'lucide-react';
import { Recipe, Ingredient } from '../types';
import { playTimerDing } from '../utils/sound';

interface RecipeCardProps {
  recipe: Recipe;
  inventory: Ingredient[];
  isSwapping: boolean;
  onSwapRecipe: (recipeId: string) => void;
  onTweakRecipe: (recipeId: string, tweakPrompt: string) => void;
  onCompleteCooking: (recipe: Recipe) => void;
}

const QUICK_TWEAK_PROMPTS = [
  '換成免開火涼拌版',
  '不要加蔥薑蒜',
  '改用氣炸鍋做法',
  '降低熱量少油版',
  '加重鹹香更下飯',
];

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  inventory,
  isSwapping,
  onSwapRecipe,
  onTweakRecipe,
  onCompleteCooking,
}) => {
  const [showSteps, setShowSteps] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [customTweakText, setCustomTweakText] = useState('');
  const [showTweakBox, setShowTweakBox] = useState(false);
  const [isTweaking, setIsTweaking] = useState(false);

  // Step Timer state
  const [activeTimerStep, setActiveTimerStep] = useState<number | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Timer interval effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            playTimerDing();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  const startStepTimer = (stepNumber: number, minutes: number) => {
    if (activeTimerStep === stepNumber && isTimerRunning) {
      setIsTimerRunning(false);
    } else if (activeTimerStep === stepNumber && !isTimerRunning && timerSecondsLeft > 0) {
      setIsTimerRunning(true);
    } else {
      setActiveTimerStep(stepNumber);
      setTimerSecondsLeft(minutes * 60);
      setIsTimerRunning(true);
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setActiveTimerStep(null);
    setTimerSecondsLeft(0);
  };

  const toggleStepCompleted = (stepNumber: number) => {
    setCompletedSteps(prev =>
      prev.includes(stepNumber) ? prev.filter(s => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  const handleApplyTweak = async (prompt: string) => {
    if (!prompt.trim()) return;
    setIsTweaking(true);
    await onTweakRecipe(recipe.id, prompt);
    setIsTweaking(false);
    setCustomTweakText('');
    setShowTweakBox(false);
  };

  // Check inventory stock status for used ingredients
  const ingredientStatus = recipe.usedIngredients.map(used => {
    const matched = inventory.find(inv => inv.name.includes(used.name) || used.name.includes(inv.name));
    const inStock = matched ? matched.quantity : 0;
    const isEnough = inStock >= used.amount;
    return {
      ...used,
      inStock,
      isEnough,
      matchedId: matched?.id,
    };
  });

  const canDeduct = ingredientStatus.some(i => i.inStock > 0);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      {/* Top Header Badge & Swapping overlay */}
      <div className="p-5 pb-3 relative">
        {isSwapping && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
            <RefreshCw className="w-6 h-6 text-[#2E7D32] animate-spin mb-1" />
            <span className="text-xs font-semibold text-stone-700">正在換一道新菜色...</span>
          </div>
        )}

        {/* Unboxed Metadata discipline */}
        <div className="flex items-center justify-between gap-2 text-xs text-stone-500 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-emerald-800">{recipe.equipment}</span>
            <span aria-hidden="true">·</span>
            <span>{recipe.difficulty}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-0.5 text-stone-700 font-medium">
              <Clock className="w-3.5 h-3.5 text-stone-500 inline" /> {recipe.cookTime} 分鐘
            </span>
          </div>

          <div className="flex items-center gap-2 text-stone-600 font-medium">
            <span>{recipe.calories} kcal</span>
            <span aria-hidden="true">·</span>
            <span>{recipe.protein}g 蛋白質</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-bold text-stone-900 tracking-tight leading-snug">
            {recipe.title}
          </h3>
          <button
            onClick={() => onSwapRecipe(recipe.id)}
            disabled={isSwapping}
            className="shrink-0 text-xs px-2.5 py-1 text-stone-600 hover:text-emerald-800 bg-stone-100 hover:bg-emerald-50 rounded-lg flex items-center gap-1 font-medium transition-colors"
            title="換一道新菜"
          >
            <RefreshCw className={`w-3 h-3 ${isSwapping ? 'animate-spin' : ''}`} />
            換一道
          </button>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed mb-3">
          {recipe.description}
        </p>

        {/* Dietary tags */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-stone-500">
          {recipe.dietaryTags.map((tag, idx) => (
            <span key={idx} className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Middle: Ingredients Needed & Deduction Preview */}
      <div className="px-5 py-3 bg-stone-50/70 border-t border-b border-stone-100 space-y-3">
        {/* In-stock ingredients checklist */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1.5">
            <span>消耗冰箱食材：</span>
            <span className="text-[11px] text-stone-400">料理完成將自動扣減庫存</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {ingredientStatus.map((item, idx) => (
              <div
                key={idx}
                className="text-xs flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-stone-200"
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.isEnough ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  <span className="font-medium text-stone-800">{item.name}</span>
                </div>
                <div className="text-[11px] text-stone-500">
                  <span className="font-semibold text-stone-800">{item.amount} {item.unit}</span>
                  <span className="text-stone-400 ml-1">
                    (剩 {item.inStock})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonings required */}
        {recipe.seasonings && recipe.seasonings.length > 0 && (
          <div className="text-[11px] text-stone-500 flex items-start gap-1">
            <span className="font-medium text-stone-700 shrink-0">常備調味：</span>
            <span>{recipe.seasonings.join('、')}</span>
          </div>
        )}
      </div>

      {/* Steps Section Accordion */}
      <div className="p-5 py-3">
        <button
          type="button"
          onClick={() => setShowSteps(prev => !prev)}
          className="w-full flex items-center justify-between text-xs font-bold text-stone-800 py-1 hover:text-[#2E7D32] transition-colors"
        >
          <span>
            烹調步驟 ({completedSteps.length}/{recipe.steps.length} 完成)
          </span>
          {showSteps ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
        </button>

        {showSteps && (
          <div className="mt-2.5 space-y-2.5">
            {recipe.steps.map((step) => {
              const isDone = completedSteps.includes(step.stepNumber);
              const isThisTimerActive = activeTimerStep === step.stepNumber;

              return (
                <div
                  key={step.stepNumber}
                  className={`text-xs p-2.5 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-emerald-50/40 border-emerald-200 text-stone-500'
                      : 'bg-white border-stone-200 text-stone-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => toggleStepCompleted(step.stepNumber)}
                      className={`w-5 h-5 rounded-md shrink-0 flex items-center justify-center transition-colors text-xs font-bold ${
                        isDone
                          ? 'bg-[#2E7D32] text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                      aria-label={`完成第 ${step.stepNumber} 步`}
                    >
                      {isDone ? <Check className="w-3 h-3" /> : step.stepNumber}
                    </button>
                    <div className="flex-1">
                      <p className={`leading-relaxed ${isDone ? 'line-through text-stone-400' : ''}`}>
                        {step.text}
                      </p>
                      {step.tip && (
                        <p className="text-[11px] text-amber-700 mt-1 font-medium bg-amber-50/80 px-2 py-0.5 rounded inline-block">
                          💡 小訣竅：{step.tip}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step Timer if available */}
                  {step.timerMinutes && (
                    <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-stone-600">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        <span>建議計時：{step.timerMinutes} 分鐘</span>
                        {isThisTimerActive && (
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                            {Math.floor(timerSecondsLeft / 60)}:
                            {(timerSecondsLeft % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startStepTimer(step.stepNumber, step.timerMinutes || 2)}
                          className="px-2 py-0.5 rounded bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                        >
                          {isThisTimerActive && isTimerRunning ? (
                            <>
                              <Pause className="w-3 h-3" /> 暫停
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" /> {isThisTimerActive ? '繼續' : '開始計時'}
                            </>
                          )}
                        </button>
                        {isThisTimerActive && (
                          <button
                            type="button"
                            onClick={resetTimer}
                            className="p-1 text-stone-400 hover:text-stone-600"
                            title="重置計時器"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FR-03 Conversational Tweaks Bar */}
      <div className="px-5 py-2.5 bg-stone-50/80 border-t border-stone-200">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-[#2E7D32]" />
            對話式微調這道菜
          </span>
          <button
            type="button"
            onClick={() => setShowTweakBox(prev => !prev)}
            className="text-[11px] text-emerald-800 hover:underline font-medium"
          >
            {showTweakBox ? '收合' : '輸入自訂指令'}
          </button>
        </div>

        {/* Quick Tweak Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_TWEAK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isTweaking}
              onClick={() => handleApplyTweak(prompt)}
              className="text-[10px] font-medium px-2 py-1 bg-white border border-stone-200 hover:border-emerald-600 hover:text-emerald-800 rounded-lg whitespace-nowrap transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Custom prompt text input */}
        {showTweakBox && (
          <div className="mt-2 flex items-center gap-1.5">
            <input
              type="text"
              placeholder="例如：我想要免洗鍋做法、或改成偏甜壽喜燒風味..."
              value={customTweakText}
              onChange={e => setCustomTweakText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleApplyTweak(customTweakText);
              }}
              className="flex-1 px-2.5 py-1 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <button
              type="button"
              disabled={!customTweakText.trim() || isTweaking}
              onClick={() => handleApplyTweak(customTweakText)}
              className="px-2.5 py-1 bg-[#2E7D32] text-white text-xs font-medium rounded-lg hover:bg-[#1B5E20] disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              套用
            </button>
          </div>
        )}
      </div>

      {/* FR-04: Action Footer: Complete Cooking & Deduct Inventory */}
      <div className="p-4 bg-white border-t border-stone-200">
        <button
          type="button"
          onClick={() => onCompleteCooking(recipe)}
          className="w-full py-2.5 px-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <ChefHat className="w-4 h-4 text-emerald-200" />
          <span>完成烹飪並扣除庫存</span>
        </button>
      </div>
    </div>
  );
};
