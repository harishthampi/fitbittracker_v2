import React, { useState } from 'react';
import {
  Apple,
  Camera,
  ChevronRight,
  Flame,
  PieChart,
  Plus,
  Salad,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { DailyStats, DailyTargets, FoodItem } from '../types';
import { sounds } from '../utils/audio';

interface NutritionTabProps {
  stats: DailyStats;
  targets: DailyTargets;
  foodItems: FoodItem[];
  onAddFood: (item: Omit<FoodItem, 'id' | 'timestamp'>) => void;
  onRemoveFood: (foodId: string) => void;
  onOpenPhotoScanner: () => void;
}

export const NutritionTab: React.FC<NutritionTabProps> = ({
  stats,
  targets,
  foodItems,
  onAddFood,
  onRemoveFood,
  onOpenPhotoScanner,
}) => {
  const [activeMealFilter, setActiveMealFilter] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all');
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [customFoodName, setCustomFoodName] = useState('');
  const [customMealType, setCustomMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [customCalories, setCustomCalories] = useState('350');
  const [customProtein, setCustomProtein] = useState('25');
  const [customCarbs, setCustomCarbs] = useState('30');
  const [customFat, setCustomFat] = useState('10');

  // Calorie calculations
  const remainingCalories = targets.calories - stats.caloriesConsumed + stats.caloriesBurned;
  const proteinPercent = Math.min(100, Math.round((stats.proteinConsumed / targets.proteinGrams) * 100));
  const carbsPercent = Math.min(100, Math.round((stats.carbsConsumed / targets.carbsGrams) * 100));
  const fatPercent = Math.min(100, Math.round((stats.fatConsumed / targets.fatGrams) * 100));

  const mealCategories: Array<{ id: 'breakfast' | 'lunch' | 'dinner' | 'snack'; label: string; icon: string }> = [
    { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { id: 'lunch', label: 'Lunch', icon: '🥗' },
    { id: 'dinner', label: 'Dinner', icon: '🍲' },
    { id: 'snack', label: 'Snacks & Fuel', icon: '🥑' },
  ];

  const handleQuickAddPredefined = (name: string, cal: number, p: number, c: number, f: number, type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    sounds.playTap();
    onAddFood({
      name,
      mealType: type,
      calories: cal,
      proteinGrams: p,
      carbsGrams: c,
      fatGrams: f,
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFoodName.trim()) return;
    sounds.playSuccess();
    onAddFood({
      name: customFoodName.trim(),
      mealType: customMealType,
      calories: parseInt(customCalories) || 0,
      proteinGrams: parseInt(customProtein) || 0,
      carbsGrams: parseInt(customCarbs) || 0,
      fatGrams: parseInt(customFat) || 0,
    });
    setCustomFoodName('');
    setIsAddingFood(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Nutrition & Macro Fuel
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Calorie budgeting, precise macronutrient balance, and clean wholesome meals.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenPhotoScanner}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Meal Photo (Free AI)</span>
          </button>

          <button
            onClick={() => setIsAddingFood(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Calorie & Macro Target Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calorie Energy Equation (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 text-white flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Daily Calorie Balance
              </span>
              <Flame className="w-5 h-5 text-rose-400" />
            </div>

            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight tabular-nums text-white">
                {remainingCalories.toLocaleString()}
                <span className="text-sm font-normal text-slate-400 ml-1.5">kcal remaining</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Target {targets.calories} - Consumed {stats.caloriesConsumed} + Burned {stats.caloriesBurned}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800 text-center">
            <div>
              <div className="text-[11px] text-slate-400">Target</div>
              <div className="text-sm font-bold font-mono tabular-nums text-slate-200 mt-0.5">
                {targets.calories}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Food Logged</div>
              <div className="text-sm font-bold font-mono tabular-nums text-amber-400 mt-0.5">
                {stats.caloriesConsumed}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Burned</div>
              <div className="text-sm font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
                +{stats.caloriesBurned}
              </div>
            </div>
          </div>
        </div>

        {/* Macro Bars (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-500" />
              Macronutrient Targets
            </h2>
            <span className="text-xs text-slate-400">Clean Athletic Split</span>
          </div>

          <div className="space-y-4">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-800 dark:text-slate-200">Protein (Muscle Repair)</span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {stats.proteinConsumed}g / {targets.proteinGrams}g ({proteinPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-800 dark:text-slate-200">Carbohydrates (Glycogen Energy)</span>
                <span className="font-mono tabular-nums text-blue-600 dark:text-blue-400">
                  {stats.carbsConsumed}g / {targets.carbsGrams}g ({carbsPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${carbsPercent}%` }}
                />
              </div>
            </div>

            {/* Fats */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-800 dark:text-slate-200">Healthy Fats (Hormone Balance)</span>
                <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  {stats.fatConsumed}g / {targets.fatGrams}g ({fatPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${fatPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Optimal recovery: Aim for 1.6g–2.2g of protein per kg of body weight.</span>
          </div>
        </div>
      </div>

      {/* Featured Healthy Meal Prep Card with generated image */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-4 rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-slate-800">
          <img
            src="/src/assets/images/nutrition_healthy_bowl_1794015956548.jpg"
            alt="Healthy Fitness Bowl"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="md:col-span-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Salad className="w-4 h-4" />
            <span>Chef's Clean Fuel Spotlight</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Superfood Roasted Chicken & Avocado Quinoa Bowl
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Loaded with 54g lean protein, slow-digesting complex carbs from roasted sweet potatoes, and omega-3 fatty acids from Hass avocado. Perfect post-workout meal.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 pt-1">
            <span>620 kcal</span>
            <span aria-hidden="true">·</span>
            <span>54g Protein</span>
            <span aria-hidden="true">·</span>
            <span>64g Carbs</span>
            <span aria-hidden="true">·</span>
            <span>16g Fat</span>
          </div>
          <button
            onClick={() =>
              handleQuickAddPredefined(
                'Superfood Chicken & Quinoa Bowl',
                620,
                54,
                64,
                16,
                'lunch'
              )
            }
            className="mt-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log This Meal into Lunch</span>
          </button>
        </div>
      </div>

      {/* Logged Meal Breakdown per Category */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Today's Meal Breakdown
          </h2>
          <span className="text-xs text-slate-500">{foodItems.length} items logged</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealCategories.map((cat) => {
            const itemsInMeal = foodItems.filter((item) => item.mealType === cat.id);
            const totalMealCal = itemsInMeal.reduce((acc, curr) => acc + curr.calories, 0);

            return (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {cat.label}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {totalMealCal} kcal
                  </span>
                </div>

                {itemsInMeal.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400 italic">
                    Nothing logged yet
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {itemsInMeal.map((item) => (
                      <div
                        key={item.id}
                        className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {item.calories} kcal · {item.proteinGrams}g P · {item.carbsGrams}g C · {item.fatGrams}g F
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            sounds.playTap();
                            onRemoveFood(item.id);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    setCustomMealType(cat.id);
                    setIsAddingFood(true);
                  }}
                  className="w-full py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer border border-dashed border-emerald-300 dark:border-emerald-800/80 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to {cat.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Custom Food Modal */}
      {isAddingFood && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Log Food / Fuel
              </h3>
              <button
                onClick={() => setIsAddingFood(false)}
                className="text-slate-400 hover:text-slate-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Food Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Greek Yogurt with Honey"
                  value={customFoodName}
                  onChange={(e) => setCustomFoodName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meal Slot
                </label>
                <select
                  value={customMealType}
                  onChange={(e) => setCustomMealType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-emerald-500 capitalize"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingFood(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm"
                >
                  Save & Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
