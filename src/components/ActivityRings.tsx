import React from 'react';
import { Flame, Footprints, Timer } from 'lucide-react';

interface ActivityRingsProps {
  calories: number;
  caloriesTarget: number;
  workoutMinutes: number;
  workoutTarget: number;
  steps: number;
  stepsTarget: number;
  size?: number;
}

export const ActivityRings: React.FC<ActivityRingsProps> = ({
  calories,
  caloriesTarget,
  workoutMinutes,
  workoutTarget,
  steps,
  stepsTarget,
  size = 220,
}) => {
  const center = size / 2;
  const strokeWidth = Math.max(10, Math.round(size * 0.065));

  // Radii for concentric rings
  const radiusCal = center - strokeWidth;
  const radiusWork = radiusCal - strokeWidth - 6;
  const radiusStep = radiusWork - strokeWidth - 6;

  const circumCal = 2 * Math.PI * radiusCal;
  const circumWork = 2 * Math.PI * radiusWork;
  const circumStep = 2 * Math.PI * radiusStep;

  // Percentage completion (capped for offset, but shown cleanly)
  const pctCal = Math.min(1.5, calories / (caloriesTarget || 1));
  const pctWork = Math.min(1.5, workoutMinutes / (workoutTarget || 1));
  const pctStep = Math.min(1.5, steps / (stepsTarget || 1));

  const offsetCal = circumCal * (1 - Math.min(1, pctCal));
  const offsetWork = circumWork * (1 - Math.min(1, pctWork));
  const offsetStep = circumStep * (1 - Math.min(1, pctStep));

  const allClosed = calories >= caloriesTarget && workoutMinutes >= workoutTarget && steps >= stepsTarget;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
      {/* Concentric SVG Rings */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background track rings */}
          <circle
            cx={center}
            cy={center}
            r={radiusCal}
            stroke="currentColor"
            className="text-rose-200/60 dark:text-rose-950/80"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={radiusWork}
            stroke="currentColor"
            className="text-emerald-200/60 dark:text-emerald-950/80"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={radiusStep}
            stroke="currentColor"
            className="text-cyan-200/60 dark:text-cyan-950/80"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Active Progress Rings */}
          {/* 1. Calories (Rose) */}
          <circle
            cx={center}
            cy={center}
            r={radiusCal}
            stroke="#f43f5e"
            strokeWidth={strokeWidth}
            strokeDasharray={circumCal}
            strokeDashoffset={offsetCal}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-1000 ease-out"
          />

          {/* 2. Workout Minutes (Emerald) */}
          <circle
            cx={center}
            cy={center}
            r={radiusWork}
            stroke="#10b981"
            strokeWidth={strokeWidth}
            strokeDasharray={circumWork}
            strokeDashoffset={offsetWork}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-1000 ease-out"
          />

          {/* 3. Steps (Cyan) */}
          <circle
            cx={center}
            cy={center}
            r={radiusStep}
            stroke="#06b6d4"
            strokeWidth={strokeWidth}
            strokeDasharray={circumStep}
            strokeDashoffset={offsetStep}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Ring Indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          {allClosed ? (
            <span className="text-2xl animate-bounce">🏆</span>
          ) : (
            <>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Daily Rings
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {Math.round(((pctCal + pctWork + pctStep) / 3) * 100)}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Ring Metric Legends & Progress Breakdown */}
      <div className="flex-1 w-full space-y-3.5">
        {/* Calories */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Move / Burn
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
                {calories} <span className="text-xs text-slate-400 font-normal">/ {caloriesTarget} kcal</span>
              </div>
            </div>
          </div>
          <div className="text-xs font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
            {Math.round((calories / caloriesTarget) * 100)}%
          </div>
        </div>

        {/* Workout Minutes */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Exercise Time
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
                {workoutMinutes} <span className="text-xs text-slate-400 font-normal">/ {workoutTarget} min</span>
              </div>
            </div>
          </div>
          <div className="text-xs font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {Math.round((workoutMinutes / workoutTarget) * 100)}%
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Step Goal
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
                {steps.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ {stepsTarget.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="text-xs font-bold font-mono tabular-nums text-cyan-600 dark:text-cyan-400">
            {Math.round((steps / stepsTarget) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};
