import React, { useEffect, useState } from 'react';
import { Copy, Download, RotateCcw, Share2, Upload } from 'lucide-react';
import type { AppState } from '../types';
import { tr } from '../data/i18n';
import { migrateState } from '../utils/storage';

interface BackupViewProps {
  state: AppState;
  todayKey: string;
  hasWallpaper: boolean;
  onRestoreState: (next: AppState) => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  state,
  todayKey,
  hasWallpaper,
  onRestoreState,
}) => {
  const [text, setText] = useState(() => JSON.stringify(state));
  const [statusMsg, setStatusMsg] = useState('');
  const lang = state.lang;

  useEffect(() => {
    setText(JSON.stringify(state));
  }, [state]);

  const headingClass = hasWallpaper
    ? 'font-display text-base sm:text-lg font-bold text-white drop-shadow-sm'
    : 'font-display text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100';

  const makeBackupFile = () =>
    new File([JSON.stringify(state)], `my-routine-backup-${todayKey}.json`, {
      type: 'application/json',
    });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatusMsg(tr('copiedOk', lang));
    } catch {
      setStatusMsg(tr('copyFailed', lang));
    }
  };

  const handleRestoreText = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.routine) || typeof parsed.logs !== 'object') {
        throw new Error('invalid');
      }
      onRestoreState(migrateState(parsed));
      setStatusMsg(tr('restoredOk', lang));
    } catch {
      setStatusMsg(tr('invalidBackup', lang));
    }
  };

  const handleDownload = () => {
    try {
      const file = makeBackupFile();
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      setStatusMsg(tr('checkDownloads', lang));
    } catch {
      setStatusMsg(tr('copyFailed', lang));
    }
  };

  const handleShare = async () => {
    const file = makeBackupFile();
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My Routine backup' });
      } else if (navigator.share) {
        await navigator.share({ title: 'My Routine backup', text: JSON.stringify(state) });
      } else {
        setStatusMsg(tr('shareUnavailable', lang));
      }
    } catch {
      setStatusMsg(tr('shareUnavailable', lang));
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleRestoreText(String(reader.result || ''));
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className={headingClass}>{tr('dataBackup', lang)}</h2>

      <div className="routine-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {tr('backupInstructions', lang)}
        </p>

        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-3 font-mono-num text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]"
        />

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[var(--pri)] text-white text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>{tr('copy', lang)}</span>
          </button>
          <button
            type="button"
            onClick={() => handleRestoreText(text)}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{tr('restore', lang)}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleDownload}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{tr('saveAsFile', lang)}</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{tr('share', lang)}</span>
          </button>
          <label className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium inline-flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{tr('restoreFromFile', lang)}</span>
            <input
              type="file"
              accept=".json,.txt,application/json,text/plain"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>

        {statusMsg && (
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{statusMsg}</div>
        )}
      </div>
    </div>
  );
};
