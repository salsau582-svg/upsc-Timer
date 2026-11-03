/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ANSWER_PAPERS } from '../utils/categories';
import { formatDuration } from '../utils/time';
import { AnswerPaperType, ActivityEntry } from '../types';
import {
  PenTool,
  Play,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
  Edit2,
  TrendingUp,
} from 'lucide-react';
import { EditActivityModal } from './EditActivityModal';

export const AnswerWritingView: React.FC = () => {
  const { entries, todayEntries, goals, startTimer } = useApp();

  const [editingEntry, setEditingEntry] = useState<ActivityEntry | null>(null);

  // Filter answer writing entries
  const answerEntries = useMemo(() => {
    return entries.filter((e) => e.category === 'answer_writing');
  }, [entries]);

  // Aggregate statistics
  const stats = useMemo(() => {
    let todayMinutes = 0;
    let todayAnswers = 0;
    let todayWords = 0;

    let allTimeMinutes = 0;
    let allTimeAnswers = 0;
    let allTimeWords = 0;

    const paperMap: Record<string, { minutes: number; answers: number; words: number }> = {};
    for (const p of ANSWER_PAPERS) {
      paperMap[p] = { minutes: 0, answers: 0, words: 0 };
    }

    for (const e of answerEntries) {
      const dur = e.durationMinutes;
      const count = e.answerWritingDetails?.answersCount || 1;
      const words = e.answerWritingDetails?.wordCount || 0;

      allTimeMinutes += dur;
      allTimeAnswers += count;
      allTimeWords += words;

      const sub = e.subcategory;
      if (!paperMap[sub]) {
        paperMap[sub] = { minutes: 0, answers: 0, words: 0 };
      }
      paperMap[sub].minutes += dur;
      paperMap[sub].answers += count;
      paperMap[sub].words += words;

      if (todayEntries.some((te) => te.id === e.id)) {
        todayMinutes += dur;
        todayAnswers += count;
        todayWords += words;
      }
    }

    const avgMinutesPerAnswer = allTimeAnswers > 0 ? Math.round((allTimeMinutes / allTimeAnswers) * 10) / 10 : 0;

    return {
      todayMinutes,
      todayAnswers,
      todayWords,
      allTimeMinutes,
      allTimeAnswers,
      allTimeWords,
      avgMinutesPerAnswer,
      paperMap,
    };
  }, [answerEntries, todayEntries]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Answer Writing Practice Center
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Build speed, structure, and word-economy for GS Papers 1 to 4, Essay, and Optionals.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center sm:text-right">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Today Time</span>
              <span className="font-mono text-xl font-black text-purple-600 dark:text-purple-400 block tabular-nums">
                {formatDuration(stats.todayMinutes)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Answers</span>
              <span className="font-mono text-xl font-black text-neutral-900 dark:text-neutral-100 block tabular-nums">
                {stats.todayAnswers}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Speed</span>
              <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400 block tabular-nums">
                {stats.avgMinutesPerAnswer}m / ans
              </span>
            </div>
          </div>
        </div>

        {/* Target indicator */}
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs text-neutral-500">
          <span>
            Daily Target: {formatDuration(goals.answerWritingMinutes || 60)} ({stats.todayMinutes >= (goals.answerWritingMinutes || 60) ? 'Completed!' : `${formatDuration((goals.answerWritingMinutes || 60) - stats.todayMinutes)} to go`})
          </span>
          <span className="font-mono tabular-nums">
            Total Accumulated Practice: {formatDuration(stats.allTimeMinutes)} · {stats.allTimeAnswers} answers
          </span>
        </div>
      </div>

      {/* Paper Breakdown Cards */}
      <div>
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
          Syllabus Papers & Routine Practice
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ANSWER_PAPERS.map((paper) => {
            const paperStat = stats.paperMap[paper] || { minutes: 0, answers: 0, words: 0 };
            return (
              <div
                key={paper}
                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between hover:border-purple-500/40 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {paper}
                  </h4>
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between text-neutral-500">
                      <span>Total Time:</span>
                      <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
                        {formatDuration(paperStat.minutes)}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>Answers Written:</span>
                      <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
                        {paperStat.answers}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>Total Words:</span>
                      <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
                        {paperStat.words}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => startTimer('answer_writing', paper, `${paper} Writing Practice`)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start {paper} Timer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Answer Writing Logs */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Answer Writing History & Improvement Notes ({answerEntries.length})
          </h3>
          <p className="text-xs text-neutral-500">
            Review your time per answer, self-evaluations, and mentor improvement remarks.
          </p>
        </div>

        {answerEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No answer writing sessions recorded yet. Start practicing with the timer above.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Paper</th>
                  <th className="py-2.5 px-4">Answers & Words</th>
                  <th className="py-2.5 px-4">Self-Evaluation & Improvement Notes</th>
                  <th className="py-2.5 px-4 text-right">Duration</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                {answerEntries.slice().reverse().map((e) => (
                  <tr key={e.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30">
                    <td className="py-3 px-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                      {e.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {e.subcategory}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {e.answerWritingDetails?.answersCount || 1} answers
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {e.answerWritingDetails?.wordCount ? `${e.answerWritingDetails.wordCount} words` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {e.answerWritingDetails?.selfEvaluation && (
                        <span className="font-semibold text-amber-500 mr-2">
                          Score: {e.answerWritingDetails.selfEvaluation}/5 ★
                        </span>
                      )}
                      <span className="text-neutral-600 dark:text-neutral-300">
                        {e.answerWritingDetails?.improvementNotes || e.notes || 'No remarks added'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-purple-600 dark:text-purple-400 tabular-nums whitespace-nowrap">
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
