/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  exportAllDataJSON,
  exportAllDataCSV,
  importDataFromJSON,
  clearAllDatabase,
  seedDemoUPSCData,
} from '../services/db';
import {
  Download,
  Upload,
  Database,
  Trash2,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const SettingsBackupView: React.FC = () => {
  const { entries, refreshData, addToast, theme, toggleTheme } = useApp();

  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  // Export JSON
  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      const jsonStr = await exportAllDataJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `life_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Backup exported successfully (JSON)', 'success');
    } catch (err: unknown) {
      addToast('Failed to export JSON backup', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const csvStr = await exportAllDataCSV();
      const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `life_tracker_activities_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Activity logs exported successfully (CSV)', 'success');
    } catch (err: unknown) {
      addToast('Failed to export CSV', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Import JSON File
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('Reading backup file...');
      const text = await file.text();
      const res = await importDataFromJSON(text);
      await refreshData();
      setImportStatus(`Successfully restored ${res.count} activity entries!`);
      addToast(`Restored ${res.count} entries from backup`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid file format';
      setImportStatus(`Error: ${msg}`);
      addToast('Failed to import backup: ' + msg, 'error');
    }
  };

  // Seed Demo Data
  const handleSeedDemo = async () => {
    try {
      const count = await seedDemoUPSCData();
      await refreshData();
      addToast(`Loaded ${count} sample UPSC & lifestyle activities across recent days`, 'success');
    } catch (err) {
      addToast('Error seeding sample data', 'error');
    }
  };

  // Clear Database
  const handleClearAll = async () => {
    try {
      await clearAllDatabase();
      await refreshData();
      setShowWipeConfirm(false);
      addToast('All local activity records cleared.', 'info');
    } catch (err) {
      addToast('Error resetting database', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Data Persistence & Backup Management
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              LIFE TRACKER 24/7 uses local browser IndexedDB storage. All activities, timestamps, notes, and targets are permanently saved offline.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Stored Records</span>
            <span className="font-mono text-2xl font-black text-neutral-900 dark:text-neutral-100 block tabular-nums">
              {entries.length}
            </span>
          </div>
        </div>
      </div>

      {/* Export & Backup Section */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Export Data & Create Backups
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Download your full preparation logs. You can import JSON backups back into any browser or analyze CSV records in Excel/Sheets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-500/50 bg-neutral-50/70 dark:bg-neutral-950/40 text-xs font-semibold text-neutral-900 dark:text-neutral-100 cursor-pointer transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span>Export Complete JSON Backup</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/50 bg-neutral-50/70 dark:bg-neutral-950/40 text-xs font-semibold text-neutral-900 dark:text-neutral-100 cursor-pointer transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export All Activities to CSV (Spreadsheet)</span>
          </button>
        </div>
      </div>

      {/* Import Backup Section */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Restore Backup from JSON
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Select a previously exported <code className="font-mono text-neutral-700 dark:text-neutral-300">.json</code> file to restore your entries, custom categories, and goals.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg text-xs font-semibold cursor-pointer hover:bg-neutral-800 shadow-xs">
            <Upload className="w-4 h-4" />
            <span>Choose Backup File (.json)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {importStatus && (
            <span className="text-xs text-neutral-600 dark:text-neutral-300">
              {importStatus}
            </span>
          )}
        </div>
      </div>

      {/* Demo Data & Testing Tools */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Sample UPSC Aspirant Data Generator
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Load realistic 24/7 UPSC study routines (Polity, Modern History, GS-2 answer writing, running, meals, sleep, The Hindu reading) across the past 4 days to immediately test timelines and weekly analytics.
          </p>
        </div>

        <div>
          <button
            onClick={handleSeedDemo}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Sample UPSC Demo Data</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Clear Data */}
      <div className="p-6 rounded-xl border border-rose-500/30 bg-rose-50/20 dark:bg-rose-950/10 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
            Danger Zone: Purge Database
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Permanently delete all activity records, active timer states, and custom categories from local IndexedDB storage.
          </p>
        </div>

        {showWipeConfirm ? (
          <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-rose-500/40 space-y-3">
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Confirm permanent deletion of all {entries.length} records? This cannot be undone!</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAll}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold cursor-pointer"
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setShowWipeConfirm(false)}
                className="px-3 py-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowWipeConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-500/30 rounded-lg cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge All Local Records</span>
          </button>
        )}
      </div>
    </div>
  );
};
