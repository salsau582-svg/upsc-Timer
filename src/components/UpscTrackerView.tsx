/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { UPSC_SUBJECTS } from '../utils/categories';
import { formatDuration, formatISTTime } from '../utils/time';
import { StudyMethod, ActivityEntry } from '../types';
import {
  BookOpen,
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  Edit2,
  Clock,
  Target,
  Sparkles,
} from 'lucide-react';
import { EditActivityModal } from './EditActivityModal';

export const UpscTrackerView: React.FC = () => {
  const {
    entries,
    todayEntries,
    goals,
    customSubjects,
    addCustomSubjectName,
    deleteCustomSubjectById,
    startTimer,
    setActiveTab,
  } = useApp();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [newCustomSubject, setNewCustomSubject] = useState('');
  const [editingEntry, setEditingEntry] = useState<ActivityEntry | null>(null);

  // Combine standard subjects and custom subjects
  const allSubjects = useMemo(() => {
    const list = [...UPSC_SUBJECTS];
    for (const cs of customSubjects) {
      if (cs.category === 'upsc_study' && !list.includes(cs.name as any)) {
        list.push(cs.name as any);
      }
    }
    return list;
  }, [customSubjects]);

  // Filter UPSC entries
  const upscEntries = useMemo(() => {
    return entries.filter((e) => e.category === 'upsc_study');
  }, [entries]);

  // Subject statistics: today's hours, all-time hours, count
  const subjectStats = useMemo(() => {
    const stats: Record<string, { todayMinutes: number; totalMinutes: number; count: number; avgRating: number }> = {};

    for (const sub of allSubjects) {
      stats[sub] = { todayMinutes: 0, totalMinutes: 0, count: 0, avgRating: 0 };
    }

    const ratingsMap: Record<string, number[]> = {};

    for (const entry of upscEntries) {
      const sub = entry.subcategory;
      if (!stats[sub]) {
        stats[sub] = { todayMinutes: 0, totalMinutes: 0, count: 0, avgRating: 0 };
      }
      stats[sub].totalMinutes += entry.durationMinutes;
      stats[sub].count += 1;

      if (todayEntries.some((te) => te.id === entry.id)) {
        stats[sub].todayMinutes += entry.durationMinutes;
      }

      if (entry.upscDetails?.selfAssessment) {
        if (!ratingsMap[sub]) ratingsMap[sub] = [];
        ratingsMap[sub].push(entry.upscDetails.selfAssessment);
      }
    }

    for (const sub of Object.keys(ratingsMap)) {
      const ratings = ratingsMap[sub];
      const sum = ratings.reduce((a, b) => a + b, 0);
      stats[sub].avgRating = Math.round((sum / ratings.length) * 10) / 10;
    }

    return stats;
  }, [allSubjects, upscEntries, todayEntries]);

  // Today study total
  const todayStudyMinutes = useMemo(() => {
    return todayEntries
      .filter((e) => e.category === 'upsc_study')
      .reduce((sum, e) => sum + e.durationMinutes, 0);
  }, [todayEntries]);

  // Filtered entries table
  const displayedEntries = useMemo(() => {
    if (selectedSubjectFilter === 'all') return upscEntries.slice().reverse();
    return upscEntries.filter((e) => e.subcategory === selectedSubjectFilter).reverse();
  }, [upscEntries, selectedSubjectFilter]);

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomSubject.trim()) return;
    await addCustomSubjectName(newCustomSubject.trim(), 'upsc_study');
    setNewCustomSubject('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Total UPSC study today vs goal */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                UPSC Preparation Hub
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Targeted tracking across 24 syllabus disciplines with chapter coverage, revision methods, and self-evaluations.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-[11px] text-neutral-500 font-medium block uppercase tracking-wider">
                Study Today
              </span>
              <span className="font-mono text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                {formatDuration(todayStudyMinutes)}
              </span>
            </div>
            <div className="border-l border-neutral-200 dark:border-neutral-800 pl-6">
              <span className="text-[11px] text-neutral-500 font-medium block uppercase tracking-wider">
                Daily Goal
              </span>
              <span className="font-mono text-2xl font-black text-neutral-900 dark:text-neutral-100 tabular-nums">
                {formatDuration(goals.upscStudyMinutes)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((todayStudyMinutes / (goals.upscStudyMinutes || 480)) * 100))}%`,
              }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-neutral-500 mt-1.5">
            <span>
              {Math.min(100, Math.round((todayStudyMinutes / (goals.upscStudyMinutes || 480)) * 100))}% of daily 8h target completed
            </span>
            <span>
              {todayStudyMinutes >= goals.upscStudyMinutes ? 'Target Met!' : `${formatDuration(goals.upscStudyMinutes - todayStudyMinutes)} remaining`}
            </span>
          </div>
        </div>
      </div>

      {/* Add Custom Subject Bar */}
      <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs">
          <span className="font-bold text-neutral-900 dark:text-neutral-100">
            Need an extra optional subject or special topic?
          </span>
          <p className="text-neutral-500">
            Add custom subjects to your dropdown and tracking roster.
          </p>
        </div>

        <form onSubmit={handleAddCustom} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={newCustomSubject}
            onChange={(e) => setNewCustomSubject(e.target.value)}
            placeholder="e.g. Sociology Optional, Essay Strategy..."
            className="px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs w-full sm:w-64"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md text-xs font-semibold hover:bg-neutral-800 cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>
        </form>
      </div>

      {/* Grid of All UPSC Subjects with Live Timers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            All 24 Syllabus Subjects ({allSubjects.length})
          </h3>
          <span className="text-xs text-neutral-400">Click any card to start a live study timer</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {allSubjects.map((subject) => {
            const stat = subjectStats[subject] || { todayMinutes: 0, totalMinutes: 0, count: 0, avgRating: 0 };
            const isCustom = customSubjects.some((cs) => cs.name === subject);

            return (
              <div
                key={subject}
                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between hover:border-blue-500/40 transition-colors group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {subject}
                    </h4>
                    {isCustom && (
                      <button
                        onClick={() => {
                          const cs = customSubjects.find((c) => c.name === subject);
                          if (cs && confirm(`Delete custom subject "${subject}"?`)) {
                            deleteCustomSubjectById(cs.id);
                          }
                        }}
                        className="text-neutral-400 hover:text-rose-500 p-0.5 cursor-pointer"
                        title="Remove custom subject"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 block uppercase">Today</span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                        {formatDuration(stat.todayMinutes)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block uppercase">All Time</span>
                      <span className="font-mono font-bold text-neutral-600 dark:text-neutral-400 tabular-nums">
                        {formatDuration(stat.totalMinutes)}
                      </span>
                    </div>
                  </div>

                  {stat.avgRating > 0 && (
                    <div className="mt-2 text-[11px] text-neutral-500">
                      Avg Focus: <span className="font-semibold text-amber-500">{stat.avgRating} / 5 ★</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">
                    {stat.count} {stat.count === 1 ? 'session' : 'sessions'}
                  </span>
                  <button
                    onClick={() => startTimer('upsc_study', subject, `${subject} Study Session`)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical UPSC Logs Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Study Log History ({displayedEntries.length})
            </h3>
            <p className="text-xs text-neutral-500">
              Recorded study sessions with topics and self-assessment scores.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Filter subject:</span>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
            >
              <option value="all">All Subjects</option>
              {allSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {displayedEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No study sessions found for the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-4">Method & Coverage</th>
                  <th className="py-2.5 px-4 text-center">Focus Rating</th>
                  <th className="py-2.5 px-4 text-right">Duration</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                {displayedEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30">
                    <td className="py-3 px-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                      {e.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {e.subcategory}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-neutral-800 dark:text-neutral-200 font-medium">
                        {e.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {e.upscDetails?.studyMethod && <span>Method: {e.upscDetails.studyMethod} · </span>}
                        {e.upscDetails?.topicsCompleted && <span>{e.upscDetails.topicsCompleted}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {e.upscDetails?.selfAssessment ? (
                        <span className="font-semibold text-amber-500">
                          {e.upscDetails.selfAssessment}/5 ★
                        </span>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums whitespace-nowrap">
                      {formatDuration(e.durationMinutes)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditingEntry(e)}
                        className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
                        title="Edit record"
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
