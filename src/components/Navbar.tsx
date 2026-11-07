import React from 'react';
import {
  Activity,
  Award,
  Calendar,
  Download,
  Dumbbell,
  Moon,
  Plus,
  Sun,
  UtensilsCrossed,
} from 'lucide-react';
import { TabType } from '../types';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenQuickLog: () => void;
  onOpenExportZip: () => void;
  streakDays: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isDark,
  onToggleDark,
  onOpenQuickLog,
  onOpenExportZip,
  streakDays,
}) => {
  const navItems: Array<{ id: TabType; label: string; icon: React.ElementType }> = [
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: UtensilsCrossed },
    { id: 'progress', label: 'Progress', icon: Award },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('today')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display whitespace-nowrap">
                BeFit<span className="text-emerald-500">.</span>
              </span>
            </button>

            {/* Streak indicator badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 text-xs font-semibold text-amber-700 dark:text-amber-400"
              title={`${streakDays} days active movement streak!`}
            >
              <span>🔥</span>
              <span className="font-mono tabular-nums">{streakDays}d Streak</span>
            </div>
          </div>

          {/* Zone 2: 4 single-line clean navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action + download + dark toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenExportZip}
              title="Download Project ZIP"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-800 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Export ZIP</span>
            </button>

            <button
              onClick={onToggleDark}
              aria-label="Toggle dark mode"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={onOpenQuickLog}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Quick Log</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Ergonomic thumb zone, Pattern 1) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                  isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-semibold tracking-tight mt-1 truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Central elevated quick log button */}
          <div className="flex items-center justify-center -mt-4">
            <button
              onClick={onOpenQuickLog}
              aria-label="Quick Log Activity"
              className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform"
            >
              <Plus className="w-6 h-6" strokeWidth={2.5} />
            </button>
          </div>

          {navItems.slice(2, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                  isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-semibold tracking-tight mt-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
