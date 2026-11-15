import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { LanguageCode } from '../types';
import {
  COUNTRY_TIMEZONES,
  getCityFromTimezone,
  getCountryDisplayName,
  suggestLanguageForCountry,
} from '../data/countries';
import { getLocale, tr } from '../data/i18n';

interface CountryModalProps {
  currentCountry?: string;
  currentTz?: string;
  lang?: LanguageCode;
  onApply: (country: string, tz: string, suggestedLang?: LanguageCode) => void;
  onUsePhoneSettings: () => void;
  onClose: () => void;
}

export const CountryModal: React.FC<CountryModalProps> = ({
  currentCountry = '',
  currentTz = '',
  lang,
  onApply,
  onUsePhoneSettings,
  onClose,
}) => {
  const [country, setCountry] = useState(currentCountry);
  const [tz, setTz] = useState(currentTz);
  const locale = getLocale(lang);

  const sortedCountries = useMemo(
    () =>
      Object.keys(COUNTRY_TIMEZONES).sort((a, b) =>
        getCountryDisplayName(a, locale).localeCompare(getCountryDisplayName(b, locale), locale),
      ),
    [locale],
  );

  const timezones = country ? COUNTRY_TIMEZONES[country] || [] : [];

  const handleCountryChange = (nextCountry: string) => {
    setCountry(nextCountry);
    const list = COUNTRY_TIMEZONES[nextCountry] || [];
    setTz(list[0] || '');
  };

  const handleContinue = () => {
    if (!country) return;
    const chosenTz = tz || COUNTRY_TIMEZONES[country]?.[0] || '';
    const suggested = suggestLanguageForCountry(country);
    onApply(country, chosenTz, suggested || undefined);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              {tr('chooseCountryTitle', lang)}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {tr('chooseCountryDesc', lang)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="country-select"
              className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5"
            >
              {tr('countryAndTime', lang)}
            </label>
            <select
              id="country-select"
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]"
            >
              <option value="">—</option>
              {sortedCountries.map((code) => (
                <option key={code} value={code}>
                  {getCountryDisplayName(code, locale)}
                </option>
              ))}
            </select>
          </div>

          {timezones.length > 1 && (
            <div>
              <label
                htmlFor="timezone-select"
                className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5"
              >
                {tr('timeZone', lang)}
              </label>
              <select
                id="timezone-select"
                value={tz || timezones[0]}
                onChange={(e) => setTz(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--pri)]"
              >
                {timezones.map((zone) => (
                  <option key={zone} value={zone}>
                    {getCityFromTimezone(zone)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            disabled={!country}
            onClick={handleContinue}
            className="w-full min-h-[44px] py-2.5 rounded-xl bg-[var(--pri)] text-white text-sm font-medium disabled:opacity-45 hover:opacity-90 cursor-pointer disabled:cursor-not-allowed"
          >
            {tr('continue', lang)}
          </button>
          <button
            type="button"
            onClick={onUsePhoneSettings}
            className="w-full min-h-[44px] py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium cursor-pointer"
          >
            {tr('skipPhoneSettings', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};
