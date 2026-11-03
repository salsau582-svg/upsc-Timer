/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LiveClockHeader } from './components/LiveClockHeader';
import { DashboardView } from './components/DashboardView';
import { TimerView } from './components/TimerView';
import { Timeline24hView } from './components/Timeline24hView';
import { UpscTrackerView } from './components/UpscTrackerView';
import { AnswerWritingView } from './components/AnswerWritingView';
import { HealthTrackerView } from './components/HealthTrackerView';
import { FoodTrackerView } from './components/FoodTrackerView';
import { EnglishTrackerView } from './components/EnglishTrackerView';
import { DistractionTrackerView } from './components/DistractionTrackerView';
import { SleepTrackerView } from './components/SleepTrackerView';
import { CalendarHistoryView } from './components/CalendarHistoryView';
import { DailyReportView } from './components/DailyReportView';
import { WeeklyAnalyticsView } from './components/WeeklyAnalyticsView';
import { MonthlyAnalyticsView } from './components/MonthlyAnalyticsView';
import { GoalsHabitsView } from './components/GoalsHabitsView';
import { SettingsBackupView } from './components/SettingsBackupView';
import { ViewTab } from './types';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  BookOpen,
  PenTool,
  HeartPulse,
  Utensils,
  Languages,
  Smartphone,
  Moon,
  FileText,
  BarChart2,
  Calendar,
  Flame,
  Settings,
  X,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

const SubNavTabs: { id: ViewTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'timer', label: 'Start Timer', icon: Clock },
  { id: 'timeline', label: '24h Timeline', icon: CalendarDays },
  { id: 'upsc', label: 'UPSC Tracker', icon: BookOpen },
  { id: 'answer_writing', label: 'Answer Writing', icon: PenTool },
  { id: 'health', label: 'Health & Hygiene', icon: HeartPulse },
  { id: 'food', label: 'Food & Eating', icon: Utensils },
  { id: 'english', label: 'English Skills', icon: Languages },
  { id: 'distractions', label: 'Distractions', icon: Smartphone },
  { id: 'sleep', label: 'Sleep & Rest', icon: Moon },
  { id: 'daily_report', label: 'Daily Report', icon: FileText },
  { id: 'weekly_analytics', label: 'Weekly Analytics', icon: BarChart2 },
  { id: 'monthly_analytics', label: 'Monthly Analytics', icon: BarChart2 },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'goals', label: 'Goals & Habits', icon: Flame },
  { id: 'settings', label: 'Settings & Backup', icon: Settings },
];

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, toasts, removeToast } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Bar Navigation */}
      <Navbar />

      {/* 24/7 Digital Clock & Gauge Banner */}
      <LiveClockHeader />

      {/* Secondary Horizontal Module Bar */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xs sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none no-scrollbar">
            {SubNavTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'timer' && <TimerView />}
        {activeTab === 'timeline' && <Timeline24hView />}
        {activeTab === 'upsc' && <UpscTrackerView />}
        {activeTab === 'answer_writing' && <AnswerWritingView />}
        {activeTab === 'health' && <HealthTrackerView />}
        {activeTab === 'food' && <FoodTrackerView />}
        {activeTab === 'english' && <EnglishTrackerView />}
        {activeTab === 'distractions' && <DistractionTrackerView />}
        {activeTab === 'sleep' && <SleepTrackerView />}
        {activeTab === 'daily_report' && <DailyReportView />}
        {activeTab === 'weekly_analytics' && <WeeklyAnalyticsView />}
        {activeTab === 'monthly_analytics' && <MonthlyAnalyticsView />}
        {activeTab === 'calendar' && <CalendarHistoryView />}
        {activeTab === 'goals' && <GoalsHabitsView />}
        {activeTab === 'settings' && <SettingsBackupView />}
      </main>

      {/* Toast Notifications Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-lg border shadow-lg text-xs font-medium flex items-center justify-between gap-3 transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : 'bg-neutral-900/95 border-neutral-700 text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:opacity-75 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Quiet Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LIFE TRACKER 24/7 &ndash; UPSC Civil Services Examination Preparation Suite</span>
          <span className="font-mono tabular-nums text-[11px] text-neutral-400">
            Asia/Kolkata (IST) · 24-Hour Continuous Storage
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
