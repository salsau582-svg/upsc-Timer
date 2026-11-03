/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { ViewTab } from '../types';
import {
  Clock,
  LayoutDashboard,
  CalendarDays,
  Flame,
  BookOpen,
  PieChart,
  Settings,
  Sun,
  Moon,
  Play,
  Square,
  Pause,
} from 'lucide-react';
import { formatStopwatchMs } from '../utils/time';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeTimer,
    timerElapsedMs,
    pauseTimer,
    resumeTimer,
    stopTimer,
    theme,
    toggleTheme,
  } = useApp();

  const primaryNavItems: { id: ViewTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timer', label: 'Live Timer', icon: Clock },
    { id: 'timeline', label: '24h Timeline', icon: CalendarDays },
    { id: 'upsc', label: 'UPSC Tracker', icon: BookOpen },
    { id: 'weekly_analytics', label: 'Analytics', icon: PieChart },
    { id: 'goals', label: 'Habits & Goals', icon: Flame },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-900 font-bold text-sm">
                24
              </div>
              <span className="font-extrabold text-base tracking-tight text-neutral-900 dark:text-neutral-100 uppercase">
                Life Tracker 24/7
              </span>
            </button>
          </div>

          {/* Zone 2: Primary Nav Links */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Active Timer Fast-Control & Theme Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            {activeTimer && activeTimer.isActive ? (
              <div className="flex items-center gap-2 pl-3 pr-2 py-1 bg-amber-500/10 border border-amber-500/25 rounded-md text-amber-600 dark:text-amber-400 text-xs">
                <span className="font-mono tabular-nums font-semibold">
                  {formatStopwatchMs(timerElapsedMs)}
                </span>
                <span className="hidden sm:inline font-medium truncate max-w-[110px]">
                  {activeTimer.subcategory}
                </span>

                <div className="flex items-center gap-1 border-l border-amber-500/30 pl-1.5">
                  {activeTimer.isPaused ? (
                    <button
                      onClick={resumeTimer}
                      title="Resume timer"
                      className="p-1 hover:bg-amber-500/20 rounded cursor-pointer transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  ) : (
                    <button
                      onClick={pauseTimer}
                      title="Pause timer"
                      className="p-1 hover:bg-amber-500/20 rounded cursor-pointer transition-colors"
                    >
                      <Pause className="w-3 h-3 fill-current" />
                    </button>
                  )}
                  <button
                    onClick={() => stopTimer()}
                    title="Stop & Save"
                    className="p-1 hover:bg-rose-500/20 text-rose-500 rounded cursor-pointer transition-colors"
                  >
                    <Square className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('timer')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Timer</span>
              </button>
            )}

            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-md transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
