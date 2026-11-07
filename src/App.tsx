/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { TodayTab } from './components/TodayTab';
import { WorkoutsTab } from './components/WorkoutsTab';
import { NutritionTab } from './components/NutritionTab';
import { ProgressTab } from './components/ProgressTab';
import { QuickLogModal } from './components/QuickLogModal';
import { MealPhotoScannerModal } from './components/MealPhotoScannerModal';
import { ExportZipModal } from './components/ExportZipModal';
import {
  AchievementBadge,
  CompletedWorkout,
  DailyQuest,
  DailyStats,
  DailyTargets,
  FoodItem,
  LeaderboardMember,
  TabType,
  WorkoutPlan,
} from './types';
import {
  INITIAL_BADGES,
  INITIAL_FOOD_ITEMS,
  INITIAL_LEADERBOARD,
  INITIAL_QUESTS,
  INITIAL_TARGETS,
  INITIAL_TODAY_STATS,
  INITIAL_WORKOUT_PLANS,
  WEEKLY_ACTIVITY,
} from './data/initialData';
import { sounds } from './utils/audio';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isPhotoScannerOpen, setIsPhotoScannerOpen] = useState(false);
  const [isExportZipOpen, setIsExportZipOpen] = useState(false);

  // Dark mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('befit_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('befit_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('befit_theme', 'light');
    }
  }, [isDark]);

  // App Data with localStorage persistence
  const [targets] = useState<DailyTargets>(INITIAL_TARGETS);

  const [stats, setStats] = useState<DailyStats>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('befit_stats');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore error
        }
      }
    }
    return INITIAL_TODAY_STATS;
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('befit_streak');
      if (saved) return parseInt(saved) || 7;
    }
    return 7;
  });

  const [workoutPlans] = useState<WorkoutPlan[]>(INITIAL_WORKOUT_PLANS);

  const [workoutHistory, setWorkoutHistory] = useState<CompletedWorkout[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('befit_workout_history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      {
        id: 'hist-1',
        title: 'Morning Upper Body Mobility',
        category: 'Mobility',
        durationMinutes: 20,
        caloriesBurned: 110,
        timestamp: '07:30 AM',
        completedExercisesCount: 3,
        totalExercisesCount: 3,
      },
    ];
  });

  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('befit_food_items');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_FOOD_ITEMS;
  });

  const [quests, setQuests] = useState<DailyQuest[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('befit_quests');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_QUESTS;
  });

  const [badges, setBadges] = useState<AchievementBadge[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('befit_badges');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_BADGES;
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardMember[]>(INITIAL_LEADERBOARD);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('befit_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('befit_workout_history', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    localStorage.setItem('befit_food_items', JSON.stringify(foodItems));
  }, [foodItems]);

  useEffect(() => {
    localStorage.setItem('befit_quests', JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem('befit_streak', streakDays.toString());
  }, [streakDays]);

  // Handlers for logging actions
  const handleAddWater = (amountMl: number) => {
    setStats((prev) => {
      const newWater = prev.waterMl + amountMl;
      return { ...prev, waterMl: newWater };
    });

    // Update hydration quest
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === 'quest-hydration-hero') {
          const updated = q.currentCount + amountMl;
          return { ...q, currentCount: updated, completed: updated >= q.targetCount };
        }
        return q;
      })
    );

    showToast(`Logged +${amountMl} ml of fresh hydration`);
  };

  const handleAddSteps = (amountSteps: number) => {
    setStats((prev) => {
      const newSteps = prev.steps + amountSteps;
      const additionalCalories = Math.round((amountSteps / 1000) * 40);
      return {
        ...prev,
        steps: newSteps,
        caloriesBurned: prev.caloriesBurned + additionalCalories,
      };
    });

    // Update steps quest
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === 'quest-step-master') {
          const updated = q.currentCount + amountSteps;
          return { ...q, currentCount: updated, completed: updated >= q.targetCount };
        }
        return q;
      })
    );

    // Update leaderboard steps for current user
    setLeaderboard((prev) =>
      prev.map((m) => {
        if (m.isCurrentUser) {
          return { ...m, steps: m.steps + amountSteps };
        }
        return m;
      })
    );

    showToast(`Logged +${amountSteps.toLocaleString()} steps`);
  };

  const handleFinishWorkout = (workout: CompletedWorkout) => {
    setWorkoutHistory((prev) => [workout, ...prev]);

    setStats((prev) => ({
      ...prev,
      workoutMinutes: prev.workoutMinutes + workout.durationMinutes,
      caloriesBurned: prev.caloriesBurned + workout.caloriesBurned,
    }));

    // Update workout quest
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === 'quest-strength-burn') {
          const updated = q.currentCount + workout.durationMinutes;
          return { ...q, currentCount: updated, completed: updated >= q.targetCount };
        }
        return q;
      })
    );

    showToast(`Workout finished! +${workout.caloriesBurned} kcal burned`);
  };

  const handleAddFood = (newItem: Omit<FoodItem, 'id' | 'timestamp'>) => {
    const fullItem: FoodItem = {
      ...newItem,
      id: `food-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setFoodItems((prev) => [fullItem, ...prev]);

    setStats((prev) => ({
      ...prev,
      caloriesConsumed: prev.caloriesConsumed + fullItem.calories,
      proteinConsumed: prev.proteinConsumed + fullItem.proteinGrams,
      carbsConsumed: prev.carbsConsumed + fullItem.carbsGrams,
      fatConsumed: prev.fatConsumed + fullItem.fatGrams,
    }));

    // Update protein quest
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === 'quest-protein-power') {
          const updated = q.currentCount + fullItem.proteinGrams;
          return { ...q, currentCount: updated, completed: updated >= q.targetCount };
        }
        return q;
      })
    );

    showToast(`Logged "${fullItem.name}" (${fullItem.calories} kcal)`);
  };

  const handleRemoveFood = (foodId: string) => {
    const target = foodItems.find((f) => f.id === foodId);
    if (!target) return;

    setFoodItems((prev) => prev.filter((f) => f.id !== foodId));

    setStats((prev) => ({
      ...prev,
      caloriesConsumed: Math.max(0, prev.caloriesConsumed - target.calories),
      proteinConsumed: Math.max(0, prev.proteinConsumed - target.proteinGrams),
      carbsConsumed: Math.max(0, prev.carbsConsumed - target.carbsGrams),
      fatConsumed: Math.max(0, prev.fatConsumed - target.fatGrams),
    }));

    showToast(`Removed "${target.name}"`);
  };

  const handleClaimQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completed: true } : q))
    );
    showToast(`XP Claimed! Keep crushing your goals.`);
  };

  const handleUpdateWeight = (newWeight: number) => {
    setStats((prev) => ({ ...prev, weightKg: newWeight }));
    showToast(`Updated weight to ${newWeight} kg`);
  };

  const handleCheerMember = (memberId: string) => {
    const member = leaderboard.find((m) => m.id === memberId);
    if (member) {
      showToast(`Sent cheering high-five to ${member.name}! 👏`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Universal Top Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          sounds.playTap();
          setActiveTab(tab);
        }}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        onOpenQuickLog={() => {
          sounds.playTap();
          setIsQuickLogOpen(true);
        }}
        onOpenExportZip={() => {
          sounds.playTap();
          setIsExportZipOpen(true);
        }}
        streakDays={streakDays}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mb-20 md:mb-8">
        {activeTab === 'today' && (
          <TodayTab
            stats={stats}
            targets={targets}
            streakDays={streakDays}
            quests={quests}
            recentWorkouts={workoutHistory.slice(0, 3)}
            recentMeals={foodItems.slice(0, 3)}
            onAddWater={handleAddWater}
            onAddSteps={handleAddSteps}
            onClaimQuest={handleClaimQuest}
            onNavigateTab={(tab) => {
              sounds.playTap();
              setActiveTab(tab);
            }}
            onOpenQuickLog={() => {
              sounds.playTap();
              setIsQuickLogOpen(true);
            }}
          />
        )}

        {activeTab === 'workouts' && (
          <WorkoutsTab
            workoutPlans={workoutPlans}
            workoutHistory={workoutHistory}
            onFinishWorkout={handleFinishWorkout}
            onOpenQuickLog={() => {
              sounds.playTap();
              setIsQuickLogOpen(true);
            }}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionTab
            stats={stats}
            targets={targets}
            foodItems={foodItems}
            onAddFood={handleAddFood}
            onRemoveFood={handleRemoveFood}
            onOpenPhotoScanner={() => {
              sounds.playTap();
              setIsPhotoScannerOpen(true);
            }}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressTab
            stats={stats}
            badges={badges}
            weeklyActivity={WEEKLY_ACTIVITY}
            leaderboard={leaderboard}
            onUpdateWeight={handleUpdateWeight}
            onCheerMember={handleCheerMember}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 animate-fadeIn">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs sm:text-sm font-semibold shadow-xl backdrop-blur-md border border-slate-700/50 dark:border-slate-200/50">
            <span className="text-emerald-400 dark:text-emerald-600">✓</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Universal Quick Log Modal */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onAddWater={handleAddWater}
        onAddSteps={handleAddSteps}
        onLogWorkout={handleFinishWorkout}
        onLogMeal={handleAddFood}
        onLogWeight={handleUpdateWeight}
        onOpenPhotoScanner={() => {
          sounds.playTap();
          setIsPhotoScannerOpen(true);
        }}
      />

      {/* AI Meal Photo Scanner Modal */}
      <MealPhotoScannerModal
        isOpen={isPhotoScannerOpen}
        onClose={() => setIsPhotoScannerOpen(false)}
        onLogMeal={handleAddFood}
      />

      {/* Export Project ZIP Modal */}
      <ExportZipModal
        isOpen={isExportZipOpen}
        onClose={() => setIsExportZipOpen(false)}
      />
    </div>
  );
}
