/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDuration, getDurationForDate, formatISTTime } from '../utils/time';
import { CATEGORIES_CONFIG } from '../utils/categories';
import { ActivityEntry } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { EditActivityModal } from './EditActivityModal';

export const CalendarHistoryView: React.FC = () => {
  const {
    entries,
    selectedDate,
    setSelectedDate,
    todayDateStr,
    setActiveTab,
    deleteEntryById,
  } = useApp();

  const [currentYearMonth, setCurrentYearMonth] = useState<string>(() => {
    return selectedDate.slice(0, 7); // e.g. "2026-11"
  });

  const [compareDate, setCompareDate] = useState<string>('');
  const [editingEntry, setEditingEntry] = useState<ActivityEntry | null>(null);

  // Month navigation
  const [yrStr, moStr] = currentYearMonth.split('-');
  const year = parseInt(yrStr, 10);
  const month = parseInt(moStr, 10); // 1-12

  const changeMonth = (delta: number) => {
    let newM = month + delta;
    let newY = year;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    } else if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    const yStr = String(newY);
    const mStr = String(newM).padStart(2, '0');
    setCurrentYearMonth(`${yStr}-${mStr}`);
  };

  // Calendar days grid
  const calendarDays = useMemo(() => {
    // Total days in current month
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    // First day of month (0: Sun, 1: Mon, ...)
    const firstDayOfWeek = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    // Monday as 0:
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const days = [];

    // Empty lead cells
    for (let i = 0; i < startOffset; i++) {
      days.push({ dayNumber: null, dateStr: '' });
    }

    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr: dStr });
    }

    return days;
  }, [year, month]);

  // Aggregate daily minutes per date for color dots
  const dailyMetrics = useMemo(() => {
    const map: Record<string, { productiveMins: number; studyMins: number; count: number }> = {};

    for (const e of entries) {
      if (!map[e.date]) {
        map[e.date] = { productiveMins: 0, studyMins: 0, count: 0 };
      }
      map[e.date].count += 1;
      if (e.isProductive) map[e.date].productiveMins += e.durationMinutes;
      if (e.category === 'upsc_study') map[e.date].studyMins += e.durationMinutes;
    }

    return map;
  }, [entries]);

  // Day entries for selectedDate
  const dayEntries = useMemo(() => {
    return entries.filter((e) => e.date === selectedDate).sort((a, b) => a.startTime - b.startTime);
  }, [entries, selectedDate]);

  // Day entries for compareDate (if active)
  const compareEntries = useMemo(() => {
    if (!compareDate) return [];
    return entries.filter((e) => e.date === compareDate).sort((a, b) => a.startTime - b.startTime);
  }, [entries, compareDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Calendar Header & Controls */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Calendar & Historical Archive
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Pick any past day to review its activity timeline, daily reports, or compare two days side-by-side.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-xs font-bold text-neutral-800 dark:text-neutral-200">
              {monthNames[month - 1]} {year}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedDate(todayDateStr);
              setCurrentYearMonth(todayDateStr.slice(0, 7));
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Go to Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-neutral-400 mb-2">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs">
          {calendarDays.map((cell, idx) => {
            if (!cell.dayNumber) {
              return <div key={idx} className="h-16 rounded-md bg-neutral-50/40 dark:bg-neutral-950/20" />;
            }

            const isSelected = selectedDate === cell.dateStr;
            const isToday = todayDateStr === cell.dateStr;
            const isCompare = compareDate === cell.dateStr;
            const metric = dailyMetrics[cell.dateStr];
            const studyHours = metric ? Math.round((metric.studyMins / 60) * 10) / 10 : 0;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(cell.dateStr)}
                className={`h-16 p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10 font-bold ring-2 ring-blue-500/20'
                    : isCompare
                    ? 'border-purple-500 bg-purple-500/10 font-bold'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isToday ? 'font-extrabold text-blue-600 dark:text-blue-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                    {cell.dayNumber}
                  </span>
                  {metric && metric.count > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </div>

                {metric && metric.studyMins > 0 ? (
                  <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold truncate tabular-nums">
                    {studyHours}h study
                  </div>
                ) : (
                  <span className="text-[9px] text-neutral-400">-</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Selected Day: {selectedDate} ({dayEntries.length} activities logged)
          </h3>
          <p className="text-xs text-neutral-500">
            Review detailed timeline or compare with another historical date.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('daily_report')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded cursor-pointer"
          >
            <span>View Full Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className="px-3 py-1.5 text-xs font-semibold rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 cursor-pointer shadow-xs"
          >
            Open 24h Timeline
          </button>
        </div>
      </div>

      {/* Selected Day Activities Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Activity Log for {selectedDate}
          </h4>
        </div>

        {dayEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No activities recorded for this date.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Time</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Title & Notes</th>
                  <th className="py-2.5 px-4 text-right">Duration</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                {dayEntries.map((e) => {
                  const meta = CATEGORIES_CONFIG[e.category];
                  return (
                    <tr key={e.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30">
                      <td className="py-3 px-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                        {formatISTTime(e.startTime, false)} &ndash; {formatISTTime(e.endTime, false)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${meta?.bgSoft || 'bg-neutral-100 text-neutral-700'}`}>
                          {meta?.name || e.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {e.title}
                        </div>
                        {e.notes && (
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            {e.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums whitespace-nowrap">
                        {formatDuration(e.durationMinutes)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingEntry(e)}
                            className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${e.title}"?`)) {
                                deleteEntryById(e.id);
                              }
                            }}
                            className="p-1 text-neutral-400 hover:text-rose-500 cursor-pointer"
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
