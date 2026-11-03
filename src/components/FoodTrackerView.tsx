/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { FOOD_ITEMS } from '../utils/categories';
import { formatDuration } from '../utils/time';
import { ActivityEntry } from '../types';
import {
  Utensils,
  Droplet,
  Coffee,
  AlertTriangle,
  Play,
  Plus,
  Edit2,
  Check,
} from 'lucide-react';
import { EditActivityModal } from './EditActivityModal';

export const FoodTrackerView: React.FC = () => {
  const { entries, todayEntries, goals, startTimer, addManualEntry, todayDateStr } = useApp();

  const [editingEntry, setEditingEntry] = useState<ActivityEntry | null>(null);

  // Filter food entries
  const foodEntries = useMemo(() => {
    return entries.filter((e) => e.category === 'food_eating');
  }, [entries]);

  // Aggregates
  const stats = useMemo(() => {
    let todayEatingMinutes = 0;
    let todayWaterGlasses = 0;
    let todayJunkCount = 0;
    let todayHealthyCount = 0;

    let weekJunkCount = 0;

    for (const e of todayEntries) {
      if (e.category === 'food_eating') {
        todayEatingMinutes += e.durationMinutes;
        if (e.foodDetails?.waterGlasses) {
          todayWaterGlasses += e.foodDetails.waterGlasses;
        }
        if (e.foodDetails && !e.foodDetails.isHealthy) {
          todayJunkCount += 1;
        } else if (e.foodDetails?.isHealthy) {
          todayHealthyCount += 1;
        }
      }
    }

    return {
      todayEatingMinutes,
      todayWaterGlasses,
      todayJunkCount,
      todayHealthyCount,
    };
  }, [todayEntries]);

  // Quick 1-click water glass log
  const handleLogWaterGlass = async () => {
    const now = Date.now();
    await addManualEntry({
      date: todayDateStr,
      startTime: now - 60000,
      endTime: now,
      durationMinutes: 1,
      category: 'food_eating',
      subcategory: 'Water intake',
      title: 'Glass of Water (Hydration)',
      isProductive: true,
      foodDetails: {
        mealType: 'Water intake',
        isHealthy: true,
        waterGlasses: 1,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Nutrition & Hydration Tracker
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Log meals, track healthy vs junk food frequency, sugar/caffeine consumption, and reach 10 glasses of water.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center sm:text-right">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Eating Time</span>
              <span className="font-mono text-xl font-black text-amber-600 dark:text-amber-400 block tabular-nums">
                {formatDuration(stats.todayEatingMinutes)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Water Intake</span>
              <span className="font-mono text-xl font-black text-blue-500 block tabular-nums">
                {stats.todayWaterGlasses} / {goals.waterGlassesTarget || 10}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Junk Food</span>
              <span className={`font-mono text-xl font-black block tabular-nums ${
                stats.todayJunkCount > 0 ? 'text-rose-500' : 'text-emerald-500'
              }`}>
                {stats.todayJunkCount} times
              </span>
            </div>
          </div>
        </div>

        {/* Quick Water Button & Progress */}
        <div className="mt-5 p-4 rounded-xl border border-blue-500/20 bg-blue-50/30 dark:bg-blue-950/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Hydration Station: {stats.todayWaterGlasses} of {goals.waterGlassesTarget || 10} glasses drank today
              </h4>
              <p className="text-[11px] text-neutral-500">
                Drinking enough water boosts memory retention and prevents afternoon exam fatigue.
              </p>
            </div>
          </div>

          <button
            onClick={handleLogWaterGlass}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+1 Glass of Water</span>
          </button>
        </div>
      </div>

      {/* Food items grid */}
      <div>
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
          Meals & Dietary Checkpoints
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {FOOD_ITEMS.map((item) => (
            <div
              key={item}
              className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between hover:border-amber-500/40 transition-colors"
            >
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {item}
                </h4>
                <span className="text-[10px] text-neutral-400 block mt-1">
                  {item === 'Junk food' || item === 'Sugar consumption' ? 'Leisure / Monitor' : 'Healthy habit'}
                </span>
              </div>

              <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => startTimer('food_eating', item, `${item}`)}
                  className="w-full flex items-center justify-center gap-1 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Meal Timer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Nutrition & Meal History ({foodEntries.length})
          </h3>
        </div>
        {foodEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No meal or water entries logged yet.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Meal / Drink</th>
                  <th className="py-2.5 px-4">Quality</th>
                  <th className="py-2.5 px-4">Notes</th>
                  <th className="py-2.5 px-4 text-right">Duration</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                {foodEntries.slice().reverse().map((e) => (
                  <tr key={e.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30">
                    <td className="py-3 px-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                      {e.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {e.subcategory}
                    </td>
                    <td className="py-3 px-4">
                      {e.foodDetails?.isHealthy ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 font-medium">
                          Healthy Food
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-500 font-medium">
                          Junk / Sugar
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {e.foodDetails?.description || e.notes || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums whitespace-nowrap">
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
