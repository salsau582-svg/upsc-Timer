/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActivityEntry, ActivityCategory, StudyMethod, AnswerPaperType, ExerciseIntensity, SleepQuality } from '../types';
import { CATEGORIES_CONFIG } from '../utils/categories';
import { epochToISTTimeString, istDateTimeToEpoch } from '../utils/time';
import { X, Trash2, Check, AlertCircle } from 'lucide-react';

interface EditActivityModalProps {
  entry: ActivityEntry;
  onClose: () => void;
}

export const EditActivityModal: React.FC<EditActivityModalProps> = ({ entry, onClose }) => {
  const { editEntry, deleteEntryById } = useApp();

  const [date, setDate] = useState<string>(entry.date);
  const [startTimeStr, setStartTimeStr] = useState<string>(epochToISTTimeString(entry.startTime));
  const [endTimeStr, setEndTimeStr] = useState<string>(epochToISTTimeString(entry.endTime));
  const [category, setCategory] = useState<ActivityCategory>(entry.category);
  const [subcategory, setSubcategory] = useState<string>(entry.subcategory);
  const [title, setTitle] = useState<string>(entry.title);
  const [isProductive, setIsProductive] = useState<boolean>(entry.isProductive);
  const [notes, setNotes] = useState<string>(entry.notes || '');

  // UPSC
  const [studyMethod, setStudyMethod] = useState<StudyMethod | undefined>(entry.upscDetails?.studyMethod);
  const [chaptersCovered, setChaptersCovered] = useState<string>(entry.upscDetails?.chaptersCovered || '');
  const [topicsCompleted, setTopicsCompleted] = useState<string>(entry.upscDetails?.topicsCompleted || '');
  const [selfAssessment, setSelfAssessment] = useState<number>(entry.upscDetails?.selfAssessment || 4);

  // Answers
  const [answersCount, setAnswersCount] = useState<number>(entry.answerWritingDetails?.answersCount || 1);
  const [wordCount, setWordCount] = useState<number>(entry.answerWritingDetails?.wordCount || 250);
  const [selfEvaluation, setSelfEvaluation] = useState<number>(entry.answerWritingDetails?.selfEvaluation || 4);

  // Food
  const [isHealthy, setIsHealthy] = useState<boolean>(entry.foodDetails?.isHealthy ?? true);

  // Sleep
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>(entry.sleepDetails?.sleepQuality || 4);

  const [error, setError] = useState<string | null>(null);

  const handleCategoryChange = (newCat: ActivityCategory) => {
    setCategory(newCat);
    const meta = CATEGORIES_CONFIG[newCat];
    if (meta.subcategories.length > 0) {
      setSubcategory(meta.subcategories[0]);
    }
    setIsProductive(meta.defaultProductive);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const newStartEpoch = istDateTimeToEpoch(date, startTimeStr);
      let newEndEpoch = istDateTimeToEpoch(date, endTimeStr);

      // If end time is earlier than start time, assume it crossed midnight to next day
      if (newEndEpoch <= newStartEpoch) {
        newEndEpoch += 24 * 60 * 60 * 1000;
      }

      const durationMinutes = Math.max(1, Math.round((newEndEpoch - newStartEpoch) / (1000 * 60)));

      const updated: ActivityEntry = {
        ...entry,
        date,
        startTime: newStartEpoch,
        endTime: newEndEpoch,
        durationMinutes,
        category,
        subcategory,
        title: title.trim() || subcategory,
        isProductive,
        notes: notes.trim(),
        upscDetails: category === 'upsc_study' ? {
          studyMethod,
          chaptersCovered,
          topicsCompleted,
          selfAssessment,
        } : entry.upscDetails,
        answerWritingDetails: category === 'answer_writing' ? {
          answersCount: Number(answersCount),
          wordCount: Number(wordCount),
          selfEvaluation,
          paperType: subcategory as AnswerPaperType,
        } : entry.answerWritingDetails,
        foodDetails: category === 'food_eating' ? {
          mealType: subcategory,
          isHealthy,
        } : entry.foodDetails,
        sleepDetails: category === 'sleep_rest' ? {
          sleepType: subcategory,
          sleepQuality,
        } : entry.sleepDetails,
      };

      await editEntry(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating entry');
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to permanently delete "${entry.title}"?`)) {
      await deleteEntryById(entry.id);
      onClose();
    }
  };

  const currentCategoryMeta = CATEGORIES_CONFIG[category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Edit Activity Record
            </h3>
            <p className="text-xs text-neutral-500">ID: {entry.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                Date (IST)
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                Start (24h)
              </label>
              <input
                type="time"
                required
                value={startTimeStr}
                onChange={(e) => setStartTimeStr(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                End (24h)
              </label>
              <input
                type="time"
                required
                value={endTimeStr}
                onChange={(e) => setEndTimeStr(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-mono text-xs"
              />
            </div>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as ActivityCategory)}
                className="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs"
              >
                {Object.values(CATEGORIES_CONFIG).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                Subcategory / Subject
              </label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs"
              >
                {currentCategoryMeta?.subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Activity Title */}
          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              Title / Description
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Laxmikanth Chapter 22: Parliament"
              className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs"
            />
          </div>

          {/* Productive switch */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="edit-isProductive"
              checked={isProductive}
              onChange={(e) => setIsProductive(e.target.checked)}
              className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <label htmlFor="edit-isProductive" className="text-neutral-700 dark:text-neutral-300 font-medium">
              Mark as Productive Time
            </label>
          </div>

          {/* Specific UPSC fields */}
          {category === 'upsc_study' && (
            <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-2.5">
              <span className="font-bold text-[11px] text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block">
                UPSC Study Details
              </span>
              <div>
                <label className="block text-neutral-500 text-[11px] mb-1">Study Method</label>
                <select
                  value={studyMethod || ''}
                  onChange={(e) => setStudyMethod(e.target.value as StudyMethod)}
                  className="w-full px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs"
                >
                  <option value="">Select method...</option>
                  <option value="Standard Book Reading">Standard Book Reading</option>
                  <option value="NCERT Reading">NCERT Reading</option>
                  <option value="Video Lecture">Video Lecture</option>
                  <option value="Self Notes Making">Self Notes Making</option>
                  <option value="Active Revision">Active Revision</option>
                  <option value="Mock Test Practice">Mock Test Practice</option>
                  <option value="PYQ Analysis">PYQ Analysis</option>
                </select>
              </div>
              <div>
                <label className="block text-neutral-500 text-[11px] mb-1">Chapters / Topics Covered</label>
                <input
                  type="text"
                  value={topicsCompleted}
                  onChange={(e) => setTopicsCompleted(e.target.value)}
                  placeholder="e.g. Fundamental Rights Articles 19-22"
                  className="w-full px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs"
                />
              </div>
              <div>
                <label className="block text-neutral-500 text-[11px] mb-1">
                  Self Assessment: {selfAssessment} / 5 Stars
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={selfAssessment}
                  onChange={(e) => setSelfAssessment(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Answer Writing fields */}
          {category === 'answer_writing' && (
            <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-2.5">
              <span className="font-bold text-[11px] text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block">
                Answer Writing Metrics
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-500 text-[11px] mb-1">Answers Written</label>
                  <input
                    type="number"
                    min="1"
                    value={answersCount}
                    onChange={(e) => setAnswersCount(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 text-[11px] mb-1">Total Word Count</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={wordCount}
                    onChange={(e) => setWordCount(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              Notes & Reflections
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key learnings, areas for improvement..."
              className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Entry</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
