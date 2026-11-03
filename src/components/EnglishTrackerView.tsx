/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ENGLISH_SKILLS } from '../utils/categories';
import { formatDuration, getWeekDaysForDate } from '../utils/time';
import { ActivityEntry } from '../types';
import {
  BookMarked,
  Play,
  Languages,
  CheckCircle,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { EditActivityModal } from './EditActivityModal';

export const EnglishTrackerView: React.FC = () => {
  const { entries, todayEntries, goals, startTimer, todayDateStr } = useApp();

  const [editingEntry, setEditingEntry] = useState<ActivityEntry | null>(null);

  // Filter English entries
  const englishEntries = useMemo(() => {
    return entries.filter((e) => e.category === 'english_skills');
  }, [entries]);

  // Daily & Weekly English time
  const stats = useMemo(() => {
    const todayMinutes = todayEntries
      .filter((e) => e.category === 'english_skills')
      .reduce((sum, e) => sum + e.durationMinutes, 0);

    const weekDays = getWeekDaysForDate(todayDateStr);
    const weekMinutes = entries
      .filter((e) => e.category === 'english_skills' && weekDays.includes(e.date))
      .reduce((sum, e) => sum + e.durationMinutes, 0);

    return { todayMinutes, weekMinutes };
  }, [todayEntries, entries, todayDateStr]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-pink-500" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                English Language & Comprehension Skills
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Develop English fluency for UPSC CSAT comprehension, compulsory English paper, and interview board confidence.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Today Practice</span>
              <span className="font-mono text-2xl font-black text-pink-600 dark:text-pink-400 block tabular-nums">
                {formatDuration(stats.todayMinutes)}
              </span>
            </div>
            <div className="border-l border-neutral-200 dark:border-neutral-800 pl-6">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">This Week</span>
              <span className="font-mono text-2xl font-black text-neutral-900 dark:text-neutral-100 block tabular-nums">
                {formatDuration(stats.weekMinutes)}
              </span>
            </div>
          </div>
        </div>

        {/* Goal Indicator */}
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs text-neutral-500">
          <span>Daily Target: {goals.englishMinutes || 30} minutes</span>
          <span className="font-medium text-pink-600 dark:text-pink-400">
            {stats.todayMinutes >= (goals.englishMinutes || 30) ? 'Daily English Goal Met!' : `${(goals.englishMinutes || 30) - stats.todayMinutes}m left today`}
          </span>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ENGLISH_SKILLS.map((skill) => (
          <div
            key={skill}
            className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between hover:border-pink-500/40 transition-colors"
          >
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {skill}
              </h4>
              <span className="text-[11px] text-neutral-400 block mt-1">
                LSRW Skill Module
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => startTimer('english_skills', skill, `${skill} Practice`)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 hover:bg-pink-600 hover:text-white rounded text-xs font-semibold cursor-pointer transition-colors"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Practice Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            English Practice Log History ({englishEntries.length})
          </h3>
        </div>

        {englishEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No English learning sessions logged yet.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Skill Type</th>
                  <th className="py-2.5 px-4">Material / Notes</th>
                  <th className="py-2.5 px-4 text-right">Duration</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                {englishEntries.slice().reverse().map((e) => (
                  <tr key={e.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30">
                    <td className="py-3 px-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                      {e.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {e.subcategory}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">
                      {e.englishDetails?.materialUsed || e.notes || e.title}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-pink-600 dark:text-pink-400 tabular-nums whitespace-nowrap">
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

      {editingEntry && (
        <EditActivityModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
};
