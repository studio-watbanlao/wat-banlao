'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { localStorageGetItem } from 'src/utils/storage-available';

import { defaultLang } from './config-lang';
import translationTh from './langs/th.json';
import translationEn from './langs/en.json';

// ----------------------------------------------------------------------

const storedLang = localStorageGetItem('i18nextLng', defaultLang.value);
const lng = storedLang === 'th' || storedLang === 'en' ? storedLang : defaultLang.value;

if (typeof window !== 'undefined' && storedLang !== lng) {
  window.localStorage.setItem('i18nextLng', lng);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      th: { translations: translationTh },
      en: { translations: translationEn },
    },
    lng,
    fallbackLng: defaultLang.value,
    supportedLngs: ['th', 'en'],
    load: 'languageOnly',
    cleanCode: true,
    debug: false,
    ns: ['translations'],
    defaultNS: 'translations',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
