import React, { useState } from 'react';
import {
  Activity,
  Camera,
  Droplets,
  Dumbbell,
  Footprints,
  Plus,
  Scale,
  Sparkles,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { CompletedWorkout, FoodItem } from '../types';
import { sounds } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWater: (amountMl: number) => void;
  onAddSteps: (steps: number) => void;
  onLogWorkout: (workout: CompletedWorkout) => void;
  onLogMeal: (meal: Omit<FoodItem, 'id' | 'timestamp'>) => void;
  onLogWeight: (weight: number) => void;
  onOpenPhotoScanner?: () => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onAddWater,
  onAddSteps,
  onLogWorkout,
  onLogMeal,
  onLogWeight,
  onOpenPhotoScanner,
}) => {
  const [activeMode, setActiveMode] = useState<
    'select' | 'workout' | 'meal' | 'weight'
  >('select');

  // Workout form state
  const [workoutTitle, setWorkoutTitle] = useState('Outdoor Run');
  const [workoutCategory, setWorkoutCategory] = useState('Cardio');
  const [workoutDuration, setWorkoutDuration] = useState('30');
  const [workoutCalories, setWorkoutCalories] = useState('250');

  // Meal form state
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [mealCalories, setMealCalories] = useState('450');
  const [mealProtein, setMealProtein] = useState('30');

  // Weight form state
  const [weightKg, setWeightKg] = useState('74.2');

  if (!isOpen) return null;

  const handleQuickWater = (ml: number) => {
    sounds.playWaterSip();
    onAddWater(ml);
    onClose();
  };

  const handleQuickSteps = (steps: number) => {
    sounds.playTap();
    onAddSteps(steps);
    onClose();
  };

  const submitWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();
    fireConfetti();
    onLogWorkout({
      id: `workout-quick-${Date.now()}`,
      title: workoutTitle.trim() || 'Custom Session',
      category: workoutCategory,
      durationMinutes: parseInt(workoutDuration) || 30,
      caloriesBurned: parseInt(workoutCalories) || 200,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completedExercisesCount: 1,
      totalExercisesCount: 1,
    });
    onClose();
  };

  const submitMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;
    sounds.playSuccess();
    onLogMeal({
      name: mealName.trim(),
      mealType,
      calories: parseInt(mealCalories) || 0,
      proteinGrams: parseInt(mealProtein) || 0,
      carbsGrams: 30,
      fatGrams: 10,
    });
    onClose();
  };

  const submitWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightKg);
    if (!isNaN(val) && val > 30) {
      sounds.playSuccess();
      onLogWeight(val);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeMode === 'select' && 'Quick Activity Logger'}
              {activeMode === 'workout' && 'Log Completed Exercise'}
              {activeMode === 'meal' && 'Log Food or Fuel'}
              {activeMode === 'weight' && 'Log Body Weight'}
            </h2>
            <p className="text-xs text-slate-500">
              Instant 1-tap tracking to keep your momentum going
            </p>
          </div>

          <button
            onClick={() => {
              if (activeMode !== 'select') {
                setActiveMode('select');
              } else {
                onClose();
              }
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode 1: Quick Action Launcher */}
        {activeMode === 'select' && (
          <div className="space-y-4">
            {/* Rapid 1-Tap Presets */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
              <div className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <Droplets className="w-4 h-4" />
                <span>Quick Hydration</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickWater(250)}
                  className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-blue-400 transition-colors shadow-2xs"
                >
                  +250 ml Glass
                </button>
                <button
                  onClick={() => handleQuickWater(500)}
                  className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-blue-400 transition-colors shadow-2xs"
                >
                  +500 ml Shaker
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200/60 dark:border-cyan-900/40 space-y-2">
              <div className="text-xs font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                <Footprints className="w-4 h-4" />
                <span>Quick Walk / Steps</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickSteps(1000)}
                  className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-cyan-200 dark:border-cyan-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-cyan-400 transition-colors shadow-2xs"
                >
                  +1,000 Steps
                </button>
                <button
                  onClick={() => handleQuickSteps(2500)}
                  className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-cyan-200 dark:border-cyan-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-cyan-400 transition-colors shadow-2xs"
                >
                  +2,500 Steps
                </button>
              </div>
            </div>

            {/* Structured Log Triggers */}
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {onOpenPhotoScanner && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPhotoScanner();
                  }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-300 dark:border-emerald-750 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Scan Meal Photo</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-white">
                          AI Free
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Auto-detect calories & macros from photo
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Snap →
                  </span>
                </button>
              )}

              <button
                onClick={() => setActiveMode('workout')}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      Log Custom Workout
                    </div>
                    <div className="text-xs text-slate-500">
                      Record duration & active calories
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600">Open →</span>
              </button>

              <button
                onClick={() => setActiveMode('meal')}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200/80 dark:border-slate-800 hover:border-amber-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      Log Food & Meal
                    </div>
                    <div className="text-xs text-slate-500">
                      Track calories & protein intake
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-600">Open →</span>
              </button>

              <button
                onClick={() => setActiveMode('weight')}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200/80 dark:border-slate-800 hover:border-teal-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">
                      Log Body Weight
                    </div>
                    <div className="text-xs text-slate-500">
                      Track weekly body composition
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-teal-600">Open →</span>
              </button>
            </div>
          </div>
        )}

        {/* Mode 2: Workout Form */}
        {activeMode === 'workout' && (
          <form onSubmit={submitWorkout} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Workout Activity Name
              </label>
              <input
                type="text"
                required
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={workoutCategory}
                  onChange={(e) => setWorkoutCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                >
                  <option value="Strength">Strength</option>
                  <option value="Cardio">Cardio</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Mobility">Mobility</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  required
                  value={workoutDuration}
                  onChange={(e) => setWorkoutDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Active Calories Burned (kcal)
              </label>
              <input
                type="number"
                required
                value={workoutCalories}
                onChange={(e) => setWorkoutCalories(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveMode('select')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm"
              >
                Log Workout
              </button>
            </div>
          </form>
        )}

        {/* Mode 3: Meal Form */}
        {activeMode === 'meal' && (
          <form onSubmit={submitMeal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meal / Food Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Salmon with Steamed Rice"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meal Slot
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm capitalize text-slate-900 dark:text-white"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  value={mealCalories}
                  onChange={(e) => setMealCalories(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Protein (grams)
              </label>
              <input
                type="number"
                value={mealProtein}
                onChange={(e) => setMealProtein(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveMode('select')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm"
              >
                Log Meal
              </button>
            </div>
          </form>
        )}

        {/* Mode 4: Weight Form */}
        {activeMode === 'weight' && (
          <form onSubmit={submitWeight} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveMode('select')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm"
              >
                Save Weight
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
