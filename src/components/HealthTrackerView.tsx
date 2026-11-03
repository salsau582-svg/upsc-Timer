/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { HEALTH_ACTIVITIES, HYGIENE_ACTIVITIES } from '../utils/categories';
import { formatDuration } from '../utils/time';
import { ActivityEntry, ExerciseIntensity } from '../types';
import {
  HeartPulse,
  Sparkles,
  Sun,
  Flame,
  Play,
  CheckCircle,
  Plus,
  Edit2,
  Clock,
  Compass,
} from 'lucide-react';
import { EditActivityModal } from './EditActivityModal';

export const HealthTrackerView: React.FC = () => {
  const { entries, todayEntries, goals, startTimer } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'physical' | 'hygiene'>('physical');
  const [editingEntry, setEditingEntry] = useState<ActivityEntry | null>(null);

  // Health entries
  const healthEntries = useMemo(() => {
    return entries.filter((e) => e.category === 'physical_health');
  }, [entries]);

  // Hygiene entries
  const hygieneEntries = useMemo(() => {
    return entries.filter((e) => e.category === 'hygiene');
  }, [entries]);

  // Today aggregates
  const todayHealthMinutes = useMemo(() => {
    return todayEntries
      .filter((e) => e.category === 'physical_health')
      .reduce((sum, e) => sum + e.durationMinutes, 0);
  }, [todayEntries]);

  const todayHygieneMinutes = useMemo(() => {
    return todayEntries
      .filter((e) => e.category === 'hygiene')
      .reduce((sum, e) => sum + e.durationMinutes, 0);
  }, [todayEntries]);

  const outdoorTouchGrassMinutes = useMemo(() => {
    return todayEntries
      .filter(
        (e) =>
          e.category === 'physical_health' &&
          (e.subcategory === 'Touch grass/outdoor time' ||
            e.subcategory === 'Walking in nature' ||
            e.subcategory === 'Sunlight exposure' ||
            e.subcategory === 'Running' ||
            e.subcategory === 'Walking')
      )
      .reduce((sum, e) => sum + e.durationMinutes, 0);
  }, [todayEntries]);

  const meditationMinutes = useMemo(() => {
    return todayEntries
      .filter(
        (e) =>
          e.category === 'physical_health' &&
          (e.subcategory === 'Meditation' || e.subcategory === 'Breathing exercises')
      )
      .reduce((sum, e) => sum + e.durationMinutes, 0);
  }, [todayEntries]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Physical Health & Personal Hygiene
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Maintain high physical energy, mental clarity, sunlight exposure, and cleanliness routines.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center sm:text-right">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Exercise Today</span>
              <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400 block tabular-nums">
                {formatDuration(todayHealthMinutes)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Sunlight & Outdoor</span>
              <span className="font-mono text-xl font-black text-amber-500 block tabular-nums">
                {formatDuration(outdoorTouchGrassMinutes)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Meditation</span>
              <span className="font-mono text-xl font-black text-cyan-500 block tabular-nums">
                {formatDuration(meditationMinutes)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub tabs: Physical Health vs Personal Hygiene */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveSubTab('physical')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'physical'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          Physical Exercise & Outdoor ({HEALTH_ACTIVITIES.length} categories)
        </button>
        <button
          onClick={() => setActiveSubTab('hygiene')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'hygiene'
              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          Personal Hygiene & Cleanliness ({HYGIENE_ACTIVITIES.length} categories)
        </button>
      </div>

      {activeSubTab === 'physical' ? (
        <div className="space-y-6">
          {/* Grid of Physical Activities with 1-click start */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {HEALTH_ACTIVITIES.map((act) => (
              <div
                key={act}
                className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between hover:border-emerald-500/40 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {act}
                  </h4>
                  <span className="text-[10px] text-neutral-400 block mt-1">
                    Fitness & Wellness
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => startTimer('physical_health', act, `${act} Session`)}
                    className="w-full flex items-center justify-center gap-1 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start Timer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Historical Physical Activity logs */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Exercise & Wellness History ({healthEntries.length})
              </h3>
            </div>
            {healthEntries.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No exercise sessions logged yet.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-500 font-medium">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Activity</th>
                      <th className="py-2.5 px-4">Intensity / Distance</th>
                      <th className="py-2.5 px-4">Notes</th>
                      <th className="py-2.5 px-4 text-right">Duration</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                    {healthEntries.slice().reverse().map((e) => (
                      <tr key={e.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                          {e.date}
                        </td>
                        <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                          {e.subcategory}
                        </td>
                        <td className="py-3 px-4">
                          {e.healthDetails?.intensity && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium mr-2">
                              {e.healthDetails.intensity}
                            </span>
                          )}
                          {e.healthDetails?.repsOrDistance && (
                            <span className="font-mono text-neutral-500">
                              {e.healthDetails.repsOrDistance}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-neutral-500">
                          {e.notes || '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                          {formatDuration(e.durationMinutes)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setEditingEntry(e)}
                            className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Hygiene Tracker */
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {HYGIENE_ACTIVITIES.map((act) => (
              <div
                key={act}
                className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between hover:border-cyan-500/40 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {act}
                  </h4>
                  <span className="text-[10px] text-neutral-400 block mt-1">
                    Hygiene Routine
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => startTimer('hygiene', act, `${act}`)}
                    className="w-full flex items-center justify-center gap-1 py-1 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-600 hover:text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Log Routine</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Hygiene & Cleanliness History ({hygieneEntries.length})
              </h3>
            </div>
            {hygieneEntries.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No hygiene routines logged yet.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-500 font-medium">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Routine</th>
                      <th className="py-2.5 px-4">Notes</th>
                      <th className="py-2.5 px-4 text-right">Duration</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                    {hygieneEntries.slice().reverse().map((e) => (
                      <tr key={e.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                          {e.date}
                        </td>
                        <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                          {e.subcategory}
                        </td>
                        <td className="py-3 px-4 text-neutral-500">
                          {e.notes || '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-cyan-600 dark:text-cyan-400 tabular-nums whitespace-nowrap">
                          {formatDuration(e.durationMinutes)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setEditingEntry(e)}
                            className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {editingEntry && (
        <EditActivityModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
};
