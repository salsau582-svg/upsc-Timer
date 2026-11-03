/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActivityEntry } from '../types';
import { CATEGORIES_CONFIG } from '../utils/categories';
import {
  formatDuration,
  formatISTTime,
  getDurationForDate,
  istDateTimeToEpoch,
} from '../utils/time';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Sparkles,
  Edit2,
  Calendar,
} from 'lucide-react';
import { EditActivityModal } from './EditActivityModal';

export const Timeline24hView: React.FC = () => {
  const {
    entries,
    selectedDate,
    setSelectedDate,
    todayDateStr,
    addManualEntry,
    setActiveTab,
  } = useApp();

  const [editingEntry, setEditingEntry] = useState<ActivityEntry | null>(null);
  const [quickGapSlot, setQuickGapSlot] = useState<{ startHour: number; endHour: number } | null>(null);

  // Quick gap add form state
  const [gapTitle, setGapTitle] = useState('');
  const [gapCategory, setGapCategory] = useState('upsc_study');

  // Change date
  const changeDateBy = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
    const yr = dateObj.getUTCFullYear();
    const mo = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const dt = String(dateObj.getUTCDate()).padStart(2, '0');
    setSelectedDate(`${yr}-${mo}-${dt}`);
  };

  // Find all activities that touch selectedDate
  const dayEntries = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dayStartEpoch = Date.UTC(y, m - 1, d, 0, 0, 0) - (5.5 * 3600 * 1000);
    const dayEndEpoch = Date.UTC(y, m - 1, d + 1, 0, 0, 0) - (5.5 * 3600 * 1000);

    return entries
      .filter((e) => e.startTime < dayEndEpoch && e.endTime > dayStartEpoch)
      .sort((a, b) => a.startTime - b.startTime);
  }, [entries, selectedDate]);

  // Aggregate day statistics
  const daySummary = useMemo(() => {
    let trackedMinutes = 0;
    let productiveMinutes = 0;
    let wastedMinutes = 0;

    for (const e of dayEntries) {
      const durationInDay = getDurationForDate(e.startTime, e.endTime, selectedDate);
      trackedMinutes += durationInDay;
      if (e.isProductive) productiveMinutes += durationInDay;
      if (e.category === 'digital_distraction' && !e.isProductive) wastedMinutes += durationInDay;
    }

    const untrackedMinutes = Math.max(0, 1440 - trackedMinutes);
    const productivePercent = trackedMinutes > 0 ? Math.round((productiveMinutes / 1440) * 100) : 0;

    return {
      trackedMinutes,
      untrackedMinutes,
      productiveMinutes,
      wastedMinutes,
      productivePercent,
    };
  }, [dayEntries, selectedDate]);

  // Calculate 24 hourly slots (0 to 23)
  const hourlySlots = useMemo(() => {
    const slots = [];
    const [y, m, d] = selectedDate.split('-').map(Number);

    for (let hour = 0; hour < 24; hour++) {
      const hourStart = Date.UTC(y, m - 1, d, hour, 0, 0) - (5.5 * 3600 * 1000);
      const hourEnd = Date.UTC(y, m - 1, d, hour + 1, 0, 0) - (5.5 * 3600 * 1000);

      // Activities in this hour
      const slotActivities = dayEntries.filter((e) => e.startTime < hourEnd && e.endTime > hourStart);

      // Total tracked minutes in this hour
      let hourTrackedMinutes = 0;
      for (const act of slotActivities) {
        const overlapStart = Math.max(act.startTime, hourStart);
        const overlapEnd = Math.min(act.endTime, hourEnd);
        if (overlapEnd > overlapStart) {
          hourTrackedMinutes += Math.round((overlapEnd - overlapStart) / 60000);
        }
      }

      hourTrackedMinutes = Math.min(60, hourTrackedMinutes);
      const hourUntrackedMinutes = Math.max(0, 60 - hourTrackedMinutes);

      slots.push({
        hour,
        label: `${String(hour).padStart(2, '0')}:00 – ${String(hour + 1).padStart(2, '0')}:00`,
        hourStart,
        hourEnd,
        activities: slotActivities,
        hourTrackedMinutes,
        hourUntrackedMinutes,
      });
    }

    return slots;
  }, [dayEntries, selectedDate]);

  const handleCreateGapEntry = async (startHour: number) => {
    const startStr = `${String(startHour).padStart(2, '0')}:00`;
    const endStr = `${String(startHour + 1).padStart(2, '0')}:00`;

    const startEpoch = istDateTimeToEpoch(selectedDate, startStr);
    const endEpoch = istDateTimeToEpoch(selectedDate, endStr);

    await addManualEntry({
      date: selectedDate,
      startTime: startEpoch,
      endTime: endEpoch,
      durationMinutes: 60,
      category: gapCategory as any,
      subcategory: gapTitle.trim() || 'Tracked Session',
      title: gapTitle.trim() || `${startStr}-${endStr} Activity`,
      isProductive: true,
      notes: 'Logged directly from 24h timeline gap',
    });

    setQuickGapSlot(null);
    setGapTitle('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Date Header & Navigation */}
      <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
            <button
              onClick={() => changeDateBy(-1)}
              className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300 cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDate(todayDateStr)}
              className="px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-700 rounded cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => changeDateBy(1)}
              className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300 cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 text-xs font-mono font-bold rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 cursor-pointer"
            />
          </div>
        </div>

        {/* 24-Hour Quick Metrics */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-neutral-500">Productive:</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
              {formatDuration(daySummary.productiveMinutes)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-neutral-500">Wasted:</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
              {formatDuration(daySummary.wastedMinutes)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span className="text-neutral-500">Untracked Gap:</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
              {formatDuration(daySummary.untrackedMinutes)}
            </span>
          </div>
        </div>
      </div>

      {/* 24-Hour Timeline Rows */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800/60 overflow-hidden">
        {hourlySlots.map((slot) => {
          const hasActivities = slot.activities.length > 0;
          const isFullGap = !hasActivities;

          return (
            <div
              key={slot.hour}
              className={`p-3 sm:px-4 sm:py-3 transition-colors ${
                isFullGap
                  ? 'bg-neutral-50/30 dark:bg-neutral-950/20'
                  : 'hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30'
              }`}
            >
              <div className="grid grid-cols-12 gap-3 items-center">
                {/* Hour Label */}
                <div className="col-span-3 sm:col-span-2 font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">
                  {slot.label}
                </div>

                {/* Content / Activities in this Hour */}
                <div className="col-span-9 sm:col-span-8 flex flex-col gap-1.5">
                  {hasActivities ? (
                    slot.activities.map((act) => {
                      const meta = CATEGORIES_CONFIG[act.category];
                      return (
                        <div
                          key={act.id}
                          onClick={() => setEditingEntry(act)}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all hover:scale-[1.005] ${
                            meta?.bgSoft || 'bg-neutral-100 text-neutral-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-bold truncate">{act.title}</span>
                            <span className="text-[10px] opacity-75">
                              ({formatISTTime(act.startTime, false)} – {formatISTTime(act.endTime, false)})
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono font-semibold tabular-nums">
                              {formatDuration(act.durationMinutes)}
                            </span>
                            <Edit2 className="w-3 h-3 opacity-60 hover:opacity-100" />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-between text-neutral-400 text-xs py-0.5">
                      <span className="italic text-[11px]">No activity recorded for this hour (60m untracked)</span>
                      <button
                        onClick={() => setQuickGapSlot({ startHour: slot.hour, endHour: slot.hour + 1 })}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Log Entry</span>
                      </button>
                    </div>
                  )}

                  {/* Partial gap notice if some minutes untracked */}
                  {hasActivities && slot.hourUntrackedMinutes > 10 && (
                    <div className="text-[10px] text-neutral-400 flex items-center justify-between pl-1">
                      <span>{slot.hourUntrackedMinutes}m untracked in this hour</span>
                      <button
                        onClick={() => setQuickGapSlot({ startHour: slot.hour, endHour: slot.hour + 1 })}
                        className="text-blue-500 hover:underline cursor-pointer"
                      >
                        + fill gap
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress Mini Bar */}
                <div className="hidden sm:block sm:col-span-2 text-right">
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        slot.hourTrackedMinutes >= 50
                          ? 'bg-emerald-500'
                          : slot.hourTrackedMinutes > 0
                          ? 'bg-blue-500'
                          : 'bg-transparent'
                      }`}
                      style={{ width: `${Math.round((slot.hourTrackedMinutes / 60) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 tabular-nums">
                    {slot.hourTrackedMinutes}/60m
                  </span>
                </div>
              </div>

              {/* Quick gap logger inline form */}
              {quickGapSlot && quickGapSlot.startHour === slot.hour && (
                <div className="mt-2.5 p-3 rounded-lg border border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col sm:flex-row items-center gap-2 text-xs">
                  <span className="font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    Add {slot.label}:
                  </span>
                  <input
                    type="text"
                    value={gapTitle}
                    onChange={(e) => setGapTitle(e.target.value)}
                    placeholder="e.g. Modern History Revision"
                    className="flex-1 w-full px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs"
                  />
                  <select
                    value={gapCategory}
                    onChange={(e) => setGapCategory(e.target.value)}
                    className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs"
                  >
                    {Object.values(CATEGORIES_CONFIG).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      onClick={() => handleCreateGapEntry(slot.hour)}
                      className="px-3 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setQuickGapSlot(null)}
                      className="px-2.5 py-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
