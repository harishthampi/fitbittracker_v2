import React from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Droplets,
  Flame,
  Footprints,
  Plus,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { ActivityRings } from './ActivityRings';
import {
  CompletedWorkout,
  DailyQuest,
  DailyStats,
  DailyTargets,
  FoodItem,
  TabType,
} from '../types';
import { sounds } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';

interface TodayTabProps {
  stats: DailyStats;
  targets: DailyTargets;
  streakDays: number;
  quests: DailyQuest[];
  recentWorkouts: CompletedWorkout[];
  recentMeals: FoodItem[];
  onAddWater: (amountMl: number) => void;
  onAddSteps: (amountSteps: number) => void;
  onClaimQuest: (questId: string) => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenQuickLog: () => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  stats,
  targets,
  streakDays,
  quests,
  recentWorkouts,
  recentMeals,
  onAddWater,
  onAddSteps,
  onClaimQuest,
  onNavigateTab,
  onOpenQuickLog,
}) => {
  // Format current date nicely
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const waterPercent = Math.min(100, Math.round((stats.waterMl / targets.waterMl) * 100));

  const handleWaterTap = (amount: number) => {
    sounds.playWaterSip();
    onAddWater(amount);
  };

  const handleStepTap = (amount: number) => {
    sounds.playTap();
    onAddSteps(amount);
  };

  const handleClaim = (quest: DailyQuest) => {
    sounds.playSuccess();
    fireConfetti();
    onClaimQuest(quest.id);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Greeting & Streak Momentum Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {formattedDate}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Today's Momentum
          </h1>
        </div>

        {/* Momentum & Streak Card */}
        <div className="flex items-center gap-3 p-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/20 dark:border-amber-500/30">
          <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center text-lg shadow-sm">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {streakDays} Days In A Row
              </span>
              <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Shielded
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              3 days until 10-Day Milestone Badge (+100 XP)
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Activity Rings & Daily Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rings and Quick Step Logger (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Daily Activity Rings
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Sync Status</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Real-time Live</span>
            </div>
          </div>

          <ActivityRings
            calories={stats.caloriesBurned}
            caloriesTarget={targets.calories}
            workoutMinutes={stats.workoutMinutes}
            workoutTarget={targets.workoutMinutes}
            steps={stats.steps}
            stepsTarget={targets.steps}
          />

          {/* Quick Step Buttons for rapid interactive engagement */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Footprints className="w-4 h-4 text-cyan-500" />
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                Quick Walk Logger:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStepTap(500)}
                className="px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 rounded-lg transition-colors cursor-pointer"
              >
                +500 steps
              </button>
              <button
                onClick={() => handleStepTap(1000)}
                className="px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 rounded-lg transition-colors cursor-pointer"
              >
                +1,000 steps
              </button>
              <button
                onClick={() => handleStepTap(2500)}
                className="px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 rounded-lg transition-colors cursor-pointer"
              >
                +2,500 steps
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 1-Tap Hydration Station (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              Hydration Fuel
            </h2>
            <span className="text-xs font-mono font-bold tabular-nums text-blue-600 dark:text-blue-400">
              {waterPercent}% of target
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-50/60 to-white dark:from-blue-950/30 dark:to-slate-900 border border-blue-200/70 dark:border-blue-900/50 space-y-5">
            {/* Water progress meter bar */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                  {stats.waterMl}
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">
                    / {targets.waterMl} ml
                  </span>
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {Math.max(0, targets.waterMl - stats.waterMl)} ml left
                </span>
              </div>

              <div className="w-full h-3.5 bg-blue-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
            </div>

            {/* 1-Tap Quick Increment Buttons */}
            <div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2.5">
                Tap to Log Hydration:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleWaterTap(250)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-blue-200/80 dark:border-blue-800/80 hover:border-blue-400 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <span className="text-lg">🥤</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    +250 ml
                  </span>
                  <span className="text-[10px] text-slate-500">Glass</span>
                </button>

                <button
                  onClick={() => handleWaterTap(500)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-blue-200/80 dark:border-blue-800/80 hover:border-blue-400 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <span className="text-lg">🍶</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    +500 ml
                  </span>
                  <span className="text-[10px] text-slate-500">Bottle</span>
                </button>

                <button
                  onClick={() => handleWaterTap(750)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-blue-200/80 dark:border-blue-800/80 hover:border-blue-400 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <span className="text-lg">💧</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    +750 ml
                  </span>
                  <span className="text-[10px] text-slate-500">Shaker</span>
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Optimal metabolic rate requires 500ml per workout hour.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Daily Coach Insight Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Smart Coach Daily Briefing
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
              {stats.workoutMinutes >= targets.workoutMinutes
                ? "Outstanding work hitting your 30m workout target! You're 2,580 steps away from closing all three rings today."
                : 'Ready for today’s session? Push & Core Hypertrophy is scheduled. 45 minutes will close your green exercise ring!'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('workouts')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <span>Start Workout</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Daily Quests & Challenges Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Daily Quests & XP Rewards
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Complete micro-habits to level up your fitness ranking
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('progress')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View Badges</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quests.map((quest) => {
            const isCompleted = quest.currentCount >= quest.targetCount || quest.completed;
            const progress = Math.min(100, Math.round((quest.currentCount / quest.targetCount) * 100));

            return (
              <div
                key={quest.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                      +{quest.xpReward} XP
                    </span>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400">
                        {quest.currentCount} / {quest.targetCount} {quest.unit}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                    {quest.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {quest.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {isCompleted && !quest.completed ? (
                    <button
                      onClick={() => handleClaim(quest)}
                      className="w-full py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer"
                    >
                      Claim {quest.xpReward} XP
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Log Feed: Workouts and Fuel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logged Workouts Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Today's Completed Exercises
            </h3>
            <button
              onClick={() => onNavigateTab('workouts')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Browse Routines
            </button>
          </div>

          <div className="space-y-2.5">
            {recentWorkouts.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No workouts logged yet today. Jump into a routine!
                </p>
                <button
                  onClick={() => onNavigateTab('workouts')}
                  className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
                >
                  Start First Workout
                </button>
              </div>
            ) : (
              recentWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                      🏋️
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {workout.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        <span>{workout.category}</span>
                        <span aria-hidden="true" className="mx-1.5">·</span>
                        <span>{workout.durationMinutes} min</span>
                        <span aria-hidden="true" className="mx-1.5">·</span>
                        <span className="font-mono tabular-nums">{workout.caloriesBurned} kcal</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-400">
                    {workout.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Logged Nutrition Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Today's Fuel Logged
            </h3>
            <button
              onClick={() => onNavigateTab('nutrition')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Add Food
            </button>
          </div>

          <div className="space-y-2.5">
            {recentMeals.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No meals logged yet today. Track your breakfast or lunch!
                </p>
                <button
                  onClick={onOpenQuickLog}
                  className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
                >
                  Quick Log Meal
                </button>
              </div>
            ) : (
              recentMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs capitalize">
                      🥗
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {meal.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        <span className="capitalize">{meal.mealType}</span>
                        <span aria-hidden="true" className="mx-1.5">·</span>
                        <span className="font-mono tabular-nums">{meal.calories} kcal</span>
                        <span aria-hidden="true" className="mx-1.5">·</span>
                        <span className="font-mono tabular-nums">{meal.proteinGrams}g P</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-400">
                    {meal.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
