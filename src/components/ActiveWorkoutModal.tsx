import React, { useEffect, useState } from 'react';
import {
  Check,
  ChevronRight,
  Flame,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Timer,
  X,
} from 'lucide-react';
import { CompletedWorkout, WorkoutExercise, WorkoutPlan } from '../types';
import { sounds } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';

interface ActiveWorkoutModalProps {
  workout: WorkoutPlan;
  onClose: () => void;
  onFinishWorkout: (result: CompletedWorkout) => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  workout,
  onClose,
  onFinishWorkout,
}) => {
  // Active session stopwatch
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Deep clone exercises to avoid modifying original template
  const [exercises, setExercises] = useState<WorkoutExercise[]>(() =>
    JSON.parse(JSON.stringify(workout.exercises))
  );

  // Rest timer state
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const [restInitial, setRestInitial] = useState(60);

  // Active workout stopwatch loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  // Rest interval countdown
  useEffect(() => {
    let restInterval: NodeJS.Timeout | null = null;
    if (restRemaining !== null && restRemaining > 0) {
      restInterval = setInterval(() => {
        setRestRemaining((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            sounds.playTimerFinished();
            return 0;
          }
          if (prev <= 4) {
            sounds.playCountdownTick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (restInterval) clearInterval(restInterval);
    };
  }, [restRemaining]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSetComplete = (exerciseId: string, setId: string) => {
    sounds.playTap();
    let justCompleted = false;

    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set) => {
            if (set.id === setId) {
              justCompleted = !set.completed;
              return { ...set, completed: !set.completed };
            }
            return set;
          }),
        };
      })
    );

    // If marked complete, start standard 60s rest countdown
    if (justCompleted) {
      setRestRemaining(60);
      setRestInitial(60);
    }
  };

  const updateSetWeight = (exerciseId: string, setId: string, delta: number) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => {
            if (s.id === setId) {
              const newWeight = Math.max(0, s.weightKg + delta);
              return { ...s, weightKg: newWeight };
            }
            return s;
          }),
        };
      })
    );
  };

  const updateSetReps = (exerciseId: string, setId: string, delta: number) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => {
            if (s.id === setId) {
              const newReps = Math.max(1, s.reps + delta);
              return { ...s, reps: newReps };
            }
            return s;
          }),
        };
      })
    );
  };

  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSetNumber = ex.sets.length + 1;
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: `set-custom-${Date.now()}`,
              setNumber: newSetNumber,
              weightKg: lastSet ? lastSet.weightKg : 20,
              reps: lastSet ? lastSet.reps : 10,
              completed: false,
            },
          ],
        };
      })
    );
  };

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );

  const handleFinish = () => {
    sounds.playSuccess();
    fireConfetti();

    const durationMins = Math.max(1, Math.round(secondsElapsed / 60));
    // Estimate burned calories based on time and intensity
    const burned = Math.round(durationMins * 8.5);

    const result: CompletedWorkout = {
      id: `workout-completed-${Date.now()}`,
      workoutPlanId: workout.id,
      title: workout.title,
      category: workout.category,
      durationMinutes: durationMins,
      caloriesBurned: Math.max(120, burned),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completedExercisesCount: exercises.filter((e) => e.sets.some((s) => s.completed)).length,
      totalExercisesCount: exercises.length,
    };

    onFinishWorkout(result);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-fadeIn">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Live Workout Mode
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {completedSets} of {totalSets} sets done
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
              {workout.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stopwatch & Rest Interval HUD */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Active Elapsed Time
              </div>
              <div className="text-2xl font-black font-mono tracking-tight text-white tabular-nums">
                {formatTime(secondsElapsed)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsActive(!isActive)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isActive ? 'Pause' : 'Resume'}</span>
            </button>
          </div>
        </div>

        {/* Rest Timer Floating Banner if active */}
        {restRemaining !== null && restRemaining > 0 && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="animate-spin text-base">⏳</span>
              <span className="font-semibold">Rest Interval:</span>
              <span className="font-mono font-bold text-base tabular-nums">
                {restRemaining}s
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRestRemaining((prev) => (prev ? prev + 30 : 30))}
                className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-xs font-semibold cursor-pointer"
              >
                +30s
              </button>
              <button
                onClick={() => setRestRemaining(0)}
                className="px-2 py-1 rounded bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-semibold cursor-pointer"
              >
                Skip Rest
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Exercise Checklist */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {exercises.map((exercise, exIndex) => (
            <div
              key={exercise.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      0{exIndex + 1}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {exercise.name}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Target: {exercise.targetMuscle}
                    {exercise.notes ? ` · ${exercise.notes}` : ''}
                  </div>
                </div>

                <button
                  onClick={() => addSet(exercise.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Set
                </button>
              </div>

              {/* Set Rows */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-400 px-2 pb-1">
                  <div className="col-span-2">SET</div>
                  <div className="col-span-5 text-center">WEIGHT (KG)</div>
                  <div className="col-span-3 text-center">REPS</div>
                  <div className="col-span-2 text-right">DONE</div>
                </div>

                {exercise.sets.map((set) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 items-center p-2 rounded-xl border transition-all ${
                      set.completed
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    {/* Set Number */}
                    <div className="col-span-2 text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                      #{set.setNumber}
                    </div>

                    {/* Weight adjustments */}
                    <div className="col-span-5 flex items-center justify-center gap-1 sm:gap-2">
                      <button
                        onClick={() => updateSetWeight(exercise.id, set.id, -2.5)}
                        disabled={set.completed}
                        className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-40"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white min-w-[3rem] text-center tabular-nums">
                        {set.weightKg} kg
                      </span>
                      <button
                        onClick={() => updateSetWeight(exercise.id, set.id, 2.5)}
                        disabled={set.completed}
                        className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Reps adjustments */}
                    <div className="col-span-3 flex items-center justify-center gap-1">
                      <button
                        onClick={() => updateSetReps(exercise.id, set.id, -1)}
                        disabled={set.completed}
                        className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-40"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white min-w-[1.5rem] text-center tabular-nums">
                        {set.reps}
                      </span>
                      <button
                        onClick={() => updateSetReps(exercise.id, set.id, 1)}
                        disabled={set.completed}
                        className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-40"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {/* Check Complete Button */}
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => toggleSetComplete(exercise.id, set.id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          set.completed
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                      >
                        <Check className="w-4 h-4" strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Finish CTA */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Estimated Burn: ~{Math.round(Math.max(1, secondsElapsed / 60) * 8.5)} kcal
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              <span>Finish Workout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
