'use client';

import merge from 'lodash/merge';
import { enUS as enUSAdapter, th as thTHAdapter } from 'date-fns/locale';
import { enUS as enUSDate } from '@mui/x-date-pickers/locales';
import { enUS as enUSCore, thTH as thTHCore } from '@mui/material/locale';
import { enUS as enUSDataGrid } from '@mui/x-data-grid/locales';

// The MUI X packages used by this project do not ship a Thai locale bundle yet.
// Date input formatting uses date-fns Thai while untranslated MUI X labels use English.
export const allLangs = [
  {
    label: 'ไทย',
    value: 'th',
    systemValue: merge(enUSDate, enUSDataGrid, thTHCore),
    adapterLocale: thTHAdapter,
    icon: 'flagpack:th',
    countryCode: 'TH',
  },
  {
    label: 'English',
    value: 'en',
    systemValue: merge(enUSDate, enUSDataGrid, enUSCore),
    adapterLocale: enUSAdapter,
    icon: 'flagpack:gb-nir',
    countryCode: 'GB',
  },
] as const;

export const defaultLang = allLangs[0];

export const languageOptions = allLangs.map(({ value, label, countryCode }) => ({
  value,
  label,
  countryCode,
}));

export type LangCode = (typeof allLangs)[number]['value'];
