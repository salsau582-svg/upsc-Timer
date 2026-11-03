/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ActivityCategory,
  StudyMethod,
  AnswerPaperType,
  ExerciseIntensity,
  SleepQuality,
} from '../types';
import { CATEGORIES_CONFIG } from '../utils/categories';
import { formatStopwatchMs, getISTDateString, istDateTimeToEpoch } from '../utils/time';
import {
  Play,
  Pause,
  Square,
  XCircle,
  PlusCircle,
  Clock,
  Sparkles,
  AlertTriangle,
  Check,
} from 'lucide-react';

export const TimerView: React.FC = () => {
  const {
    activeTimer,
    timerElapsedMs,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    discardTimer,
    addManualEntry,
    todayDateStr,
    customSubjects,
  } = useApp();

  const [activeTabMode, setActiveTabMode] = useState<'stopwatch' | 'manual'>('stopwatch');

  // Stopwatch configuration state
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>('upsc_study');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Indian Polity');
  const [title, setTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isProductive, setIsProductive] = useState<boolean>(true);

  // UPSC specific
  const [studyMethod, setStudyMethod] = useState<StudyMethod>('Standard Book Reading');
  const [chaptersCovered, setChaptersCovered] = useState<string>('');
  const [topicsCompleted, setTopicsCompleted] = useState<string>('');
  const [selfAssessment, setSelfAssessment] = useState<number>(4);

  // Answers specific
  const [answersCount, setAnswersCount] = useState<number>(2);
  const [wordCount, setWordCount] = useState<number>(500);

  // Manual entry state
  const [manualDate, setManualDate] = useState<string>(todayDateStr);
  const [manualStart, setManualStart] = useState<string>('09:00');
  const [manualEnd, setManualEnd] = useState<string>('10:30');
  const [manualCategory, setManualCategory] = useState<ActivityCategory>('upsc_study');
  const [manualSubcategory, setManualSubcategory] = useState<string>('Indian Polity');
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');
  const [manualProductive, setManualProductive] = useState<boolean>(true);
  const [manualError, setManualError] = useState<string | null>(null);

  const handleCategorySwitch = (cat: ActivityCategory) => {
    setSelectedCategory(cat);
    const meta = CATEGORIES_CONFIG[cat];
    if (meta.subcategories.length > 0) {
      setSelectedSubcategory(meta.subcategories[0]);
    }
    setIsProductive(meta.defaultProductive);
  };

  const handleManualCategorySwitch = (cat: ActivityCategory) => {
    setManualCategory(cat);
    const meta = CATEGORIES_CONFIG[cat];
    if (meta.subcategories.length > 0) {
      setManualSubcategory(meta.subcategories[0]);
    }
    setManualProductive(meta.defaultProductive);
  };

  const handleStartActiveTimer = () => {
    const defaultTitle = title.trim() || `${selectedSubcategory} Session`;
    startTimer(selectedCategory, selectedSubcategory, defaultTitle, {
      isProductive,
      notes: notes.trim(),
      upscDetails: selectedCategory === 'upsc_study' ? {
        studyMethod,
        chaptersCovered,
        topicsCompleted,
        selfAssessment,
      } : undefined,
      answerWritingDetails: selectedCategory === 'answer_writing' ? {
        answersCount,
        wordCount,
        paperType: selectedSubcategory as AnswerPaperType,
      } : undefined,
    });
  };

  const handleAddManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);

    try {
      const startEpoch = istDateTimeToEpoch(manualDate, manualStart);
      let endEpoch = istDateTimeToEpoch(manualDate, manualEnd);

      if (endEpoch <= startEpoch) {
        endEpoch += 24 * 60 * 60 * 1000; // Crossed midnight
      }

      const durationMinutes = Math.max(1, Math.round((endEpoch - startEpoch) / (1000 * 60)));

      const res = await addManualEntry({
        date: manualDate,
        startTime: startEpoch,
        endTime: endEpoch,
        durationMinutes,
        category: manualCategory,
        subcategory: manualSubcategory,
        title: manualTitle.trim() || manualSubcategory,
        isProductive: manualProductive,
        notes: manualNotes.trim(),
      });

      if (!res.success) {
        setManualError(res.error || 'Failed to save entry');
      } else {
        // Reset inputs
        setManualTitle('');
        setManualNotes('');
      }
    } catch (err: unknown) {
      setManualError(err instanceof Error ? err.message : 'Error submitting manual entry');
    }
  };

  const currentCategoryMeta = CATEGORIES_CONFIG[selectedCategory];
  const manualCategoryMeta = CATEGORIES_CONFIG[manualCategory];

  // Add custom subjects matching category
  const matchingCustomSubjects = customSubjects.filter((s) => s.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Universal Time Engine
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Accurate timestamp-anchored tracking that persists even if you reload or close the browser.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTabMode('stopwatch')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTabMode === 'stopwatch'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Live Timer
          </button>
          <button
            onClick={() => setActiveTabMode('manual')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTabMode === 'manual'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Add Missed Activity
          </button>
        </div>
      </div>

      {activeTabMode === 'stopwatch' ? (
        <div className="space-y-6">
          {/* Active Running Timer Cockpit */}
          {activeTimer && activeTimer.isActive ? (
            <div className="p-8 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-neutral-50 to-white dark:from-amber-950/30 dark:via-neutral-900 dark:to-neutral-900 text-center shadow-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                {activeTimer.isPaused ? 'Timer Paused' : 'Timer Active & Recording'}
              </div>

              {/* Huge live counter */}
              <div className="font-mono text-6xl sm:text-7xl lg:text-8xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight tabular-nums select-none">
                {formatStopwatchMs(timerElapsedMs)}
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {activeTimer.title}
                </h3>
                <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 mt-1">
                  <span>{CATEGORIES_CONFIG[activeTimer.category]?.name}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {activeTimer.subcategory}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{activeTimer.isProductive ? 'Productive Time' : 'Unproductive / Leisure'}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {activeTimer.isPaused ? (
                  <button
                    onClick={resumeTimer}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume Timer</span>
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="flex items-center gap-2 px-6 py-3 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-xl text-sm font-bold cursor-pointer transition-colors"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause Timer</span>
                  </button>
                )}

                <button
                  onClick={() => stopTimer()}
                  className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors shadow-sm"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop & Save Entry</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Discard this active timer session without saving?')) {
                      discardTimer();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 text-xs font-semibold cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Discard</span>
                </button>
              </div>
            </div>
          ) : (
            /* Configure and Start New Timer */
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Select Activity Category
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-3">
                  {Object.values(CATEGORIES_CONFIG).map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySwitch(cat.id)}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                            : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <span className="text-xs block font-bold">{cat.name}</span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          {cat.subcategories.length} topics
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subcategory selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Subcategory / Subject / Platform
                  </label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    {currentCategoryMeta?.subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                    {matchingCustomSubjects.map((cs) => (
                      <option key={cs.id} value={cs.name}>
                        ⭐ Custom: {cs.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Activity Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`e.g. ${selectedSubcategory} Session`}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* UPSC specific inputs */}
              {selectedCategory === 'upsc_study' && (
                <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-50/30 dark:bg-blue-950/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                      UPSC Preparation Parameters
                    </span>
                    <span className="text-[11px] text-neutral-500">Subject: {selectedSubcategory}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Study Method
                      </label>
                      <select
                        value={studyMethod}
                        onChange={(e) => setStudyMethod(e.target.value as StudyMethod)}
                        className="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs"
                      >
                        <option value="Standard Book Reading">Standard Book Reading</option>
                        <option value="NCERT Reading">NCERT Reading</option>
                        <option value="Video Lecture">Video Lecture</option>
                        <option value="Self Notes Making">Self Notes Making</option>
                        <option value="Active Revision">Active Revision</option>
                        <option value="Mock Test Practice">Mock Test Practice</option>
                        <option value="PYQ Analysis">PYQ Analysis</option>
                        <option value="Current Affairs Notes">Current Affairs Notes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Chapter / Book
                      </label>
                      <input
                        type="text"
                        value={chaptersCovered}
                        onChange={(e) => setChaptersCovered(e.target.value)}
                        placeholder="e.g. Ch 15: Supreme Court"
                        className="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Topics Planned
                      </label>
                      <input
                        type="text"
                        value={topicsCompleted}
                        onChange={(e) => setTopicsCompleted(e.target.value)}
                        placeholder="e.g. Appointment, Collegium, Judicial Review"
                        className="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Answer writing inputs */}
              {selectedCategory === 'answer_writing' && (
                <div className="p-4 rounded-lg border border-purple-500/20 bg-purple-50/30 dark:bg-purple-950/10 space-y-3">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                    Answer Writing Parameters
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Planned Answers
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={answersCount}
                        onChange={(e) => setAnswersCount(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Estimated Target Words
                      </label>
                      <input
                        type="number"
                        min="50"
                        step="50"
                        value={wordCount}
                        onChange={(e) => setWordCount(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Session Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Goals, mindset, reference materials..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Productive toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="timer-isProductive"
                  checked={isProductive}
                  onChange={(e) => setIsProductive(e.target.checked)}
                  className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="timer-isProductive" className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer">
                  Mark this session as Productive Time
                </label>
              </div>

              {/* Big Start Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartActiveTimer}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors shadow-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Live Timer for {selectedSubcategory}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Manual Entry Form */
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <form onSubmit={handleAddManualSubmit} className="space-y-4">
            {manualError && (
              <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{manualError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Date (IST)
                </label>
                <input
                  type="date"
                  required
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Start Time (24-Hour)
                </label>
                <input
                  type="time"
                  required
                  value={manualStart}
                  onChange={(e) => setManualStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  End Time (24-Hour)
                </label>
                <input
                  type="time"
                  required
                  value={manualEnd}
                  onChange={(e) => setManualEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Category
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => handleManualCategorySwitch(e.target.value as ActivityCategory)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs"
                >
                  {Object.values(CATEGORIES_CONFIG).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Subcategory
                </label>
                <select
                  value={manualSubcategory}
                  onChange={(e) => setManualSubcategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs"
                >
                  {manualCategoryMeta?.subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Title / Task description
              </label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g. Answer Writing GS-3 Economic Development"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Notes
              </label>
              <textarea
                rows={2}
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="Details of what was covered..."
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="manual-isProductive"
                checked={manualProductive}
                onChange={(e) => setManualProductive(e.target.checked)}
                className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="manual-isProductive" className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer">
                Productive time
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs hover:bg-neutral-800"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Save Past Activity to Timeline</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
