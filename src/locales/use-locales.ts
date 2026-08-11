'use client';

import type { Namespace } from 'i18next';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { allLangs, defaultLang } from './config-lang';

import { localStorageGetItem } from 'src/utils/storage-available';
import { useSettingsContext } from 'src/components/settings';


// ----------------------------------------------------------------------

export function useLocales() {
  const langStorage = localStorageGetItem('i18nextLng');

  const currentLang = allLangs.find((lang) => lang.value === langStorage) || defaultLang;

  return {
    allLangs,
    currentLang,
  };
}

// ----------------------------------------------------------------------

export function useTranslate(namespace?: Namespace) {
  const { t, i18n, ready } = useTranslation(namespace);

  const settings = useSettingsContext();

  const onChangeLang = useCallback(
    (newlang: string) => {
      i18n.changeLanguage(newlang);
      settings.onChangeDirectionByLang(newlang);
    },
    [i18n, settings]
  );

  return {
    t,
    i18n,
    ready,
    currentLang: allLangs.find((lang) => lang.value === i18n.language) || defaultLang,
    onChangeLang,
  };
}

export function useTranslatedNavSections<T>(data: T): T {
  return data;
}

export function useTranslatedMainNav<T>(data: T): T {
  return data;
}
