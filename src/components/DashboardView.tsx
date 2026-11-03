/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES_CONFIG, UPSC_SUBJECTS } from '../utils/categories';
import { formatDuration, formatISTTime } from '../utils/time';
import { ActivityCategory, ActivityEntry } from '../types';
import {
  BookOpen,
  PenTool,
  HeartPulse,
  Utensils,
  Moon,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { EditActivityModal } from './EditActivityModal';

export const DashboardView: React.FC = () => {
  const {
    todayEntries,
    goals,
    startTimer,
    deleteEntryById,
    setActiveTab,
    setSelectedDate,
    todayDateStr,
  } = useApp();

  const [editingEntry, setEditingEntry] = useState<ActivityEntry | null>(null);

  // Today totals
  const metrics = useMemo(() => {
    let productive = 0;
    let upsc = 0;
    let answers = 0;
    let wasted = 0;
    let sleep = 0;
    let exercise = 0;
    let english = 0;
    let food = 0;
    let hygiene = 0;
    let rest = 0;

    for (const e of todayEntries) {
      if (e.isProductive) productive += e.durationMinutes;
      if (e.category === 'upsc_study') upsc += e.durationMinutes;
      if (e.category === 'answer_writing') answers += e.durationMinutes;
      if (e.category === 'digital_distraction' && !e.isProductive) wasted += e.durationMinutes;
      if (e.category === 'sleep_rest') {
        if (e.subcategory === 'Night sleep' || e.subcategory === 'Afternoon nap' || e.subcategory === 'Power nap') {
          sleep += e.durationMinutes;
        } else {
          rest += e.durationMinutes;
        }
      }
      if (e.category === 'physical_health') exercise += e.durationMinutes;
      if (e.category === 'english_skills') english += e.durationMinutes;
      if (e.category === 'food_eating') food += e.durationMinutes;
      if (e.category === 'hygiene') hygiene += e.durationMinutes;
    }

    return { productive, upsc, answers, wasted, sleep, exercise, english, food, hygiene, rest };
  }, [todayEntries]);

  // Quick start presets
  const quickPresets: {
    category: ActivityCategory;
    subcategory: string;
    title: string;
  }[] = [
    { category: 'upsc_study', subcategory: 'Indian Polity', title: 'Indian Polity (Laxmikanth)' },
    { category: 'upsc_study', subcategory: 'Modern History', title: 'Modern History (Spectrum)' },
    { category: 'upsc_study', subcategory: 'Current Affairs', title: 'Daily Current Affairs Analysis' },
    { category: 'answer_writing', subcategory: 'GS Paper 2', title: 'GS Paper 2 Answer Writing' },
    { category: 'english_skills', subcategory: 'Newspaper reading in English', title: 'The Hindu Editorial' },
    { category: 'physical_health', subcategory: 'Running', title: 'Running / Physical Exercise' },
    { category: 'physical_health', subcategory: 'Meditation', title: '15-Min Mindful Meditation' },
    { category: 'sleep_rest', subcategory: 'Power nap', title: 'Afternoon Power Nap' },
  ];

  return (
    <div className="space-y-8">
      {/* 8-Metric Quick Summary Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-xs">
            Today's Category Summary
          </h2>
          <button
            onClick={() => {
              setSelectedDate(todayDateStr);
              setActiveTab('daily_report');
            }}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Daily Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <span className="text-[11px] text-neutral-500 block uppercase font-medium">UPSC Study</span>
            <span className="font-mono text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 block tabular-nums">
              {formatDuration(metrics.upsc)}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              Target: {formatDuration(goals.upscStudyMinutes)}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <span className="text-[11px] text-neutral-500 block uppercase font-medium">Answer Writing</span>
            <span className="font-mono text-xl font-bold text-purple-600 dark:text-purple-400 mt-1 block tabular-nums">
              {formatDuration(metrics.answers)}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              Target: {formatDuration(goals.answerWritingMinutes)}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <span className="text-[11px] text-neutral-500 block uppercase font-medium">English Skills</span>
            <span className="font-mono text-xl font-bold text-pink-600 dark:text-pink-400 mt-1 block tabular-nums">
              {formatDuration(metrics.english)}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              Target: {formatDuration(goals.englishMinutes)}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <span className="text-[11px] text-neutral-500 block uppercase font-medium">Physical Health</span>
            <span className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block tabular-nums">
              {formatDuration(metrics.exercise)}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              Target: {formatDuration(goals.exerciseMinutes)}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <span className="text-[11px] text-neutral-500 block uppercase font-medium">Sleep</span>
            <span className="font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block tabular-nums">
              {formatDuration(metrics.sleep)}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              Target: {formatDuration(goals.sleepMinutes)}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <span className="text-[11px] text-neutral-500 block uppercase font-medium">Food & Water</span>
            <span className="font-mono text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 block tabular-nums">
              {formatDuration(metrics.food)}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              Meals & tea
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <span className="text-[11px] text-neutral-500 block uppercase font-medium">Rest & Breaks</span>
            <span className="font-mono text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1 block tabular-nums">
              {formatDuration(metrics.rest)}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              Relaxation
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <span className="text-[11px] text-neutral-500 block uppercase font-medium">Distractions</span>
            <span className={`font-mono text-xl font-bold mt-1 block tabular-nums ${
              metrics.wasted > (goals.maxDistractionMinutes || 30) ? 'text-rose-500' : 'text-neutral-900 dark:text-neutral-100'
            }`}>
              {formatDuration(metrics.wasted)}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              Max: {goals.maxDistractionMinutes}m
            </span>
          </div>
        </div>
      </div>

      {/* Quick Launch Presets */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              One-Click Quick Timers
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('timer')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Custom timer or manual entry &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {quickPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => startTimer(preset.category, preset.subcategory, preset.title)}
              className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-950/40 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors text-left group cursor-pointer"
            >
              <div className="truncate pr-2">
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {preset.subcategory}
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block truncate">
                  {preset.title}
                </span>
              </div>
              <div className="w-6 h-6 rounded-md bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Shortcuts to Deep Trackers */}
      <div>
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
          Dedicated Preparation Trackers
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setActiveTab('upsc')}
            className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-500/40 text-left transition-colors cursor-pointer group"
          >
            <BookOpen className="w-5 h-5 text-blue-500 mb-2" />
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block group-hover:text-blue-500">
              UPSC Subjects
            </span>
            <span className="text-[11px] text-neutral-500 block mt-0.5">
              24 subjects & syllabus
            </span>
          </button>

          <button
            onClick={() => setActiveTab('answer_writing')}
            className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-purple-500/40 text-left transition-colors cursor-pointer group"
          >
            <PenTool className="w-5 h-5 text-purple-500 mb-2" />
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block group-hover:text-purple-500">
              Answer Writing
            </span>
            <span className="text-[11px] text-neutral-500 block mt-0.5">
              GS 1-4, Essay, Words
            </span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-emerald-500/40 text-left transition-colors cursor-pointer group"
          >
            <HeartPulse className="w-5 h-5 text-emerald-500 mb-2" />
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block group-hover:text-emerald-500">
              Physical Health
            </span>
            <span className="text-[11px] text-neutral-500 block mt-0.5">
              Exercise, Gym, Yoga
            </span>
          </button>

          <button
            onClick={() => setActiveTab('food')}
            className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-amber-500/40 text-left transition-colors cursor-pointer group"
          >
            <Utensils className="w-5 h-5 text-amber-500 mb-2" />
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block group-hover:text-amber-500">
              Food & Water
            </span>
            <span className="text-[11px] text-neutral-500 block mt-0.5">
              Meals & 10 water glasses
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sleep')}
            className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-indigo-500/40 text-left transition-colors cursor-pointer group"
          >
            <Moon className="w-5 h-5 text-indigo-500 mb-2" />
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block group-hover:text-indigo-500">
              Sleep & Rest
            </span>
            <span className="text-[11px] text-neutral-500 block mt-0.5">
              Night sleep & naps
            </span>
          </button>

          <button
            onClick={() => setActiveTab('distractions')}
            className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-rose-500/40 text-left transition-colors cursor-pointer group"
          >
            <Smartphone className="w-5 h-5 text-rose-500 mb-2" />
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block group-hover:text-rose-500">
              Distractions
            </span>
            <span className="text-[11px] text-neutral-500 block mt-0.5">
              Social media waste
            </span>
          </button>
        </div>
      </div>

      {/* Today's Stream of Activities */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Today's Recorded Activity Stream ({todayEntries.length})
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Every tracked minute in chronological order for today (Asia/Kolkata).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('timer')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-md hover:bg-neutral-800 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Entry</span>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              24h Timeline
            </button>
          </div>
        </div>

        {todayEntries.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              No activities tracked yet today
            </h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Start your live timer or log your morning routine to maintain continuous 24/7 visibility.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab('timer')}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer transition-colors"
              >
                Start Timer Now
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Load Sample UPSC Data
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-950/40 text-neutral-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Time (24h)</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Activity & Notes</th>
                  <th className="py-2.5 px-4 text-right">Duration</th>
                  <th className="py-2.5 px-4 text-center">Productive</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                {todayEntries.map((entry) => {
                  const meta = CATEGORIES_CONFIG[entry.category];
                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono tabular-nums text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        {formatISTTime(entry.startTime, false)} – {formatISTTime(entry.endTime, false)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${meta?.bgSoft || 'bg-neutral-100 text-neutral-600'}`}>
                          {meta?.name || entry.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {entry.title}
                        </div>
                        {entry.notes && (
                          <div className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                            {entry.notes}
                          </div>
                        )}
                        {/* Domain badges */}
                        {entry.upscDetails && (
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-1">
                            {entry.upscDetails.studyMethod && (
                              <span>Method: {entry.upscDetails.studyMethod}</span>
                            )}
                            {entry.upscDetails.selfAssessment && (
                              <span>Assessment: {entry.upscDetails.selfAssessment}/5 ★</span>
                            )}
                          </div>
                        )}
                        {entry.answerWritingDetails && (
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-1">
                            <span>{entry.answerWritingDetails.answersCount} answers</span>
                            {entry.answerWritingDetails.wordCount && (
                              <span>{entry.answerWritingDetails.wordCount} words</span>
                            )}
                            {entry.answerWritingDetails.selfEvaluation && (
                              <span>Score: {entry.answerWritingDetails.selfEvaluation}/5 ★</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums whitespace-nowrap">
                        {formatDuration(entry.durationMinutes)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {entry.isProductive ? (
                          <span className="text-emerald-500 font-medium text-[11px]">Yes</span>
                        ) : (
                          <span className="text-rose-500 font-medium text-[11px]">Wasted</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingEntry(entry)}
                            title="Edit entry"
                            className="p-1.5 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 rounded cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete entry "${entry.title}"?`)) {
                                deleteEntryById(entry.id);
                              }
                            }}
                            title="Delete entry"
                            className="p-1.5 text-neutral-400 hover:text-rose-500 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingEntry && (
        <EditActivityModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
};

