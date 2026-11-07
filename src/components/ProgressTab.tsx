import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  CheckCircle2,
  ChevronUp,
  Dumbbell,
  Flame,
  Heart,
  Plus,
  Scale,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { AchievementBadge, DailyStats, LeaderboardMember } from '../types';
import { sounds } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';

interface ProgressTabProps {
  stats: DailyStats;
  badges: AchievementBadge[];
  weeklyActivity: Array<{
    day: string;
    calories: number;
    workoutMin: number;
    steps: number;
    completed: boolean;
  }>;
  leaderboard: LeaderboardMember[];
  onUpdateWeight: (newWeight: number) => void;
  onCheerMember: (memberId: string) => void;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  stats,
  badges,
  weeklyActivity,
  leaderboard,
  onUpdateWeight,
  onCheerMember,
}) => {
  const [badgeCategory, setBadgeCategory] = useState<string>('all');
  const [isLoggingWeight, setIsLoggingWeight] = useState(false);
  const [inputWeight, setInputWeight] = useState(stats.weightKg?.toString() || '74.2');
  const [cheeredMembers, setCheeredMembers] = useState<Record<string, number>>({});

  const filteredBadges = badges.filter((b) =>
    badgeCategory === 'all' ? true : b.category === badgeCategory
  );

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputWeight);
    if (!isNaN(val) && val > 30 && val < 300) {
      sounds.playSuccess();
      onUpdateWeight(val);
      setIsLoggingWeight(false);
    }
  };

  const handleCheer = (memberId: string) => {
    sounds.playTap();
    setCheeredMembers((prev) => ({
      ...prev,
      [memberId]: (prev[memberId] || 0) + 1,
    }));
    onCheerMember(memberId);
  };

  const handleBadgeClick = (badge: AchievementBadge) => {
    if (badge.progressPercent >= 100) {
      sounds.playSuccess();
      fireConfetti();
    } else {
      sounds.playTap();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Progress & Achievements
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Consistency analytics, body composition trends, milestone badges, and community challenges.
          </p>
        </div>

        <button
          onClick={() => setIsLoggingWeight(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200/80 dark:border-emerald-800 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
        >
          <Scale className="w-4 h-4" />
          <span>Log Body Weight</span>
        </button>
      </div>

      {/* Top Metrics Strip: 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weight Tracker Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Body Weight
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                {stats.weightKg ?? 74.2}
              </span>
              <span className="text-sm font-semibold text-slate-400">kg</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Trend: -1.8 kg (Last 30d)</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">On Target</span>
          </div>
        </div>

        {/* Weekly Consistency Score */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Weekly Consistency
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                6 / 7
              </span>
              <span className="text-sm font-semibold text-slate-400">days active</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Streak: 7 consecutive days</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">Top 5% League</span>
          </div>
        </div>

        {/* Total Energy Burned this week */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Weekly Burn
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                4,260
              </span>
              <span className="text-sm font-semibold text-slate-400">kcal burned</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>262 active workout min</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">+12% vs last wk</span>
          </div>
        </div>
      </div>

      {/* Weekly Activity Bar Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              7-Day Activity & Ring Closures
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily active calories burned and step momentum
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Goal Reached
            </span>
          </div>
        </div>

        {/* Bar chart grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 items-end h-48">
          {weeklyActivity.map((item, idx) => {
            const maxCal = 800;
            const barHeightPct = Math.min(100, Math.round((item.calories / maxCal) * 100));

            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end gap-2 group">
                <div className="text-[10px] font-mono font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.calories}
                </div>
                <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex flex-col justify-end h-32 p-1">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      item.completed
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                        : 'bg-gradient-to-t from-emerald-500/50 to-teal-400/50'
                    }`}
                    style={{ height: `${barHeightPct}%` }}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {item.day}
                  </span>
                  {item.completed && (
                    <span className="text-[10px] text-emerald-500">✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Challenge & Leaderboard */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Active Weekly Challenge
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">Ends in 2 days</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Autumn 50K Steps Community League
            </h2>
          </div>

          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Total Pot: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">500 XP Badge</span>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {leaderboard.map((member, index) => {
            const rank = index + 1;
            const cheersCount = cheeredMembers[member.id] || 0;

            return (
              <div
                key={member.id}
                className={`py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 rounded-xl px-2 transition-colors ${
                  member.isCurrentUser
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <span
                    className={`w-6 text-center font-mono font-bold text-sm ${
                      rank === 1
                        ? 'text-amber-500'
                        : rank === 2
                        ? 'text-slate-400'
                        : rank === 3
                        ? 'text-amber-700'
                        : 'text-slate-500'
                    }`}
                  >
                    #{rank}
                  </span>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs font-mono">
                    {member.avatarSeed}
                  </div>

                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{member.name}</span>
                      {member.isCurrentUser && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="font-mono tabular-nums">{member.steps.toLocaleString()} steps</span>
                      <span aria-hidden="true">·</span>
                      <span>{member.workoutsThisWeek} workouts</span>
                      <span aria-hidden="true">·</span>
                      <span>🔥 {member.streakDays}d streak</span>
                    </div>
                  </div>
                </div>

                {/* Cheer button */}
                <button
                  onClick={() => handleCheer(member.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-rose-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Heart className={`w-3.5 h-3.5 ${cheersCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                  <span>{cheersCount > 0 ? `+${cheersCount}` : 'Cheer'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges & Achievements Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Milestone Badges ({badges.filter((b) => b.progressPercent >= 100).length}/{badges.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any badge to celebrate or check requirements
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start sm:self-auto">
            {['all', 'streak', 'workout', 'nutrition', 'community'].map((cat) => (
              <button
                key={cat}
                onClick={() => setBadgeCategory(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors capitalize ${
                  badgeCategory === cat
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge) => {
            const isUnlocked = badge.progressPercent >= 100;

            return (
              <div
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-900 border-amber-300/80 dark:border-amber-700/60 shadow-xs hover:scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-xs ${
                        isUnlocked
                          ? 'bg-amber-500 text-white shadow-amber-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isUnlocked ? '🏆' : '🔒'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {badge.title}
                      </h3>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {isUnlocked ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Unlocked {badge.unlockedAt}
                          </span>
                        ) : (
                          <span className="font-mono">{badge.progressPercent}% in progress</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {badge.description}
                </p>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isUnlocked ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${badge.progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Body Weight Modal */}
      {isLoggingWeight && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Log Weight Measurement
              </h3>
              <button
                onClick={() => setIsLoggingWeight(false)}
                className="text-slate-400 hover:text-slate-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWeight} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Weight (Kilograms)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono text-slate-900 dark:text-white focus:outline-emerald-500"
                  />
                  <span className="absolute right-4 top-2.5 text-sm font-semibold text-slate-400">
                    kg
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Weigh yourself upon waking for consistent hydration baseline.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLoggingWeight(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm"
                >
                  Save Weight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
