import React, { useState } from 'react';
import {
  Calendar,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Layers,
  Play,
  Plus,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CompletedWorkout, WorkoutPlan } from '../types';
import { ActiveWorkoutModal } from './ActiveWorkoutModal';

interface WorkoutsTabProps {
  workoutPlans: WorkoutPlan[];
  workoutHistory: CompletedWorkout[];
  onFinishWorkout: (workout: CompletedWorkout) => void;
  onOpenQuickLog: () => void;
}

export const WorkoutsTab: React.FC<WorkoutsTabProps> = ({
  workoutPlans,
  workoutHistory,
  onFinishWorkout,
  onOpenQuickLog,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);

  const categories = ['All', 'Strength', 'HIIT', 'Mobility'];

  const filteredPlans = workoutPlans.filter((plan) =>
    selectedCategory === 'All' ? true : plan.category === selectedCategory
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner and Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Workout Training Hub
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Structured routines with real-time rep tracking, set checklists & rest interval timers.
          </p>
        </div>

        <button
          onClick={onOpenQuickLog}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200/80 dark:border-emerald-800 rounded-xl transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Manual Workout</span>
        </button>
      </div>

      {/* Category Segmented Control (Interactive Filter Controls allowed per Constitution §1.A) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl max-w-md">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-1 py-1.5 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Workout Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col justify-between hover:border-emerald-400/60 transition-all duration-300 shadow-xs hover:shadow-lg hover:shadow-emerald-500/5"
          >
            <div>
              {/* Image banner with overlay */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={plan.imageUrl}
                  alt={plan.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback container in case image error
                    const target = e.currentTarget;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Quiet unboxed text metadata in bottom corner */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="font-semibold tracking-wide uppercase text-[11px] drop-shadow-sm">
                    {plan.category} · {plan.difficulty}
                  </span>
                  <div className="flex items-center gap-1 font-mono font-medium drop-shadow-sm">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{plan.durationMinutes} min</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {plan.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {plan.description}
                </p>

                {/* Exercises bullet preview */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Included Movements ({plan.exercises.length})
                  </div>
                  {plan.exercises.slice(0, 3).map((ex, i) => (
                    <div
                      key={ex.id}
                      className="text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between"
                    >
                      <span className="truncate">
                        {i + 1}. {ex.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">
                        {ex.sets.length} sets
                      </span>
                    </div>
                  ))}
                  {plan.exercises.length > 3 && (
                    <div className="text-[11px] text-slate-400 italic">
                      +{plan.exercises.length - 3} more exercises
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card Footer Action */}
            <div className="p-5 pt-0">
              <button
                onClick={() => setActivePlan(plan)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 transition-colors cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Live Workout</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Completed Workout History Strip */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            Recent Workout History
          </h2>
          <span className="text-xs font-mono text-slate-500">
            {workoutHistory.length} Sessions Logged
          </span>
        </div>

        {workoutHistory.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No completed workouts recorded yet. Start any routine above to log your progress!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {workoutHistory.map((item) => (
              <div
                key={item.id}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.durationMinutes} minutes</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{item.caloriesBurned} kcal burned</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-medium text-slate-400">
                    {item.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Workout Modal Trigger */}
      {activePlan && (
        <ActiveWorkoutModal
          workout={activePlan}
          onClose={() => setActivePlan(null)}
          onFinishWorkout={(result) => {
            onFinishWorkout(result);
            setActivePlan(null);
          }}
        />
      )}
    </div>
  );
};
