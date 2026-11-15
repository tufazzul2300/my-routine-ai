import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  HardDriveDownload,
  Home,
  ListChecks,
  Menu,
  Palette,
  Trash2,
  X,
} from 'lucide-react';
import type { LanguageCode, TabKey } from '../types';
import { tr } from '../data/i18n';

interface TopBarProps {
  activeTab: TabKey;
  onNavigate: (tab: TabKey) => void;
  onClearToday: () => void;
  lang?: LanguageCode;
  hasWallpaper: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onNavigate,
  onClearToday,
  lang,
  hasWallpaper,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [armedClear, setArmedClear] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      setArmedClear(false);
      return;
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setArmedClear(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const navItems: { key: TabKey; label: string }[] = [
    { key: 'home', label: tr('home', lang) },
    { key: 'plan', label: tr('myRoutine', lang) },
    { key: 'rep', label: tr('report', lang) },
    { key: 'cal', label: tr('calendar', lang) },
    { key: 'set', label: tr('appearance', lang) },
  ];

  const mobileTabs: { key: TabKey; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'home', label: tr('home', lang), Icon: Home },
    { key: 'plan', label: tr('myRoutine', lang), Icon: ListChecks },
    { key: 'rep', label: tr('report', lang), Icon: BarChart3 },
    { key: 'cal', label: tr('calendar', lang), Icon: CalendarDays },
  ];

  const handleClearClick = () => {
    if (!armedClear) {
      setArmedClear(true);
      return;
    }
    onClearToday();
    setArmedClear(false);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Top Bar (Strict 3-Zone Contract) */}
      <header
        className={`hidden md:block sticky top-0 z-30 border-b transition-colors ${
          hasWallpaper
            ? 'bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-slate-200/70 dark:border-slate-800/70'
            : 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element brand wordmark */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--pri)] rounded"
          >
            {tr('appName', lang)}
          </button>

          {/* Zone 2: 5 clean single-line text nav links */}
          <nav className="flex items-center gap-6" aria-label="Primary">
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNavigate(item.key)}
                  className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--pri)] rounded ${
                    isActive
                      ? 'text-[var(--pri)] font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-[var(--pri)] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('bk')}
              className="px-4 py-2 min-h-[40px] text-sm font-medium text-white bg-[var(--pri)] rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pri)]"
            >
              {tr('backup', lang)}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Compact Top Header */}
      <header
        className={`md:hidden sticky top-0 z-30 h-14 px-4 flex items-center justify-between border-b ${
          hasWallpaper
            ? 'bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-slate-200/70 dark:border-slate-800/70'
            : 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-slate-200 dark:border-slate-800'
        }`}
      >
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
        >
          {tr('appName', lang)}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {menuOpen && (
            <div className="absolute end-0 top-12 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-50">
              <button
                type="button"
                onClick={() => {
                  onNavigate('set');
                  setMenuOpen(false);
                }}
                className="w-full min-h-[44px] px-3 py-2 flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-start"
              >
                <Palette className="w-4 h-4 shrink-0 text-[var(--pri)]" />
                <span className="truncate">{tr('themeAndLang', lang)}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate('bk');
                  setMenuOpen(false);
                }}
                className="w-full min-h-[44px] px-3 py-2 flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-start"
              >
                <HardDriveDownload className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />
                <span className="truncate">{tr('backupRestore', lang)}</span>
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button
                type="button"
                onClick={handleClearClick}
                className={`w-full min-h-[44px] px-3 py-2 flex items-center gap-2.5 text-sm font-medium rounded-lg text-start transition-colors ${
                  armedClear
                    ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                    : 'text-red-600 dark:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-950/40'
                }`}
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {armedClear ? tr('sureTapAgain', lang) : tr('clearToday', lang)}
                </span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Fixed Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe"
      >
        <div className="grid grid-cols-4 h-16">
          {mobileTabs.map(({ key, label, Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onNavigate(key)}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-1 px-1 transition-colors ${
                  isActive
                    ? 'text-[var(--pri)] font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-[11px] leading-none truncate max-w-full">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
