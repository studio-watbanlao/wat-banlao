'use client';

import isEqual from 'lodash/isEqual';
import { useMemo, useState, useCallback } from 'react';

import { SettingsValueProps } from '../types';

import { SettingsContext } from './settings-context';

import { useLocalStorage } from 'src/hooks/use-local-storage';


// ----------------------------------------------------------------------

const STORAGE_KEY = 'settings';

type SettingsProviderProps = {
  children: React.ReactNode;
  defaultSettings: SettingsValueProps;
};

export function SettingsProvider({ children, defaultSettings }: SettingsProviderProps) {
  const { state, update, reset } = useLocalStorage(STORAGE_KEY, defaultSettings);

  const [openDrawer, setOpenDrawer] = useState(false);

  // Direction by lang
  const onChangeDirectionByLang = useCallback(
    (_lang: string) => {
      update('themeDirection', 'ltr');
    },
    [update]
  );

  // Drawer
  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  const canReset = !isEqual(state, defaultSettings);

  const modernState = {
    navLayout: state.themeLayout,
    navColor: 'integrate' as const,
    compactLayout: state.themeStretch,
  };

  const setField = useCallback(
    (name: 'navLayout' | 'navColor' | 'compactLayout', value: string | boolean) => {
      if (name === 'navLayout') update('themeLayout', value);
      if (name === 'compactLayout') update('themeStretch', value);
    },
    [update]
  );

  const memoizedValue = useMemo(
    () => ({
      ...state,
      state: modernState,
      setField,
      onUpdate: update,
      // Direction
      onChangeDirectionByLang,
      // Reset
      canReset,
      onReset: reset,
      // Drawer
      open: openDrawer,
      onToggle: onToggleDrawer,
      onToggleDrawer,
      onClose: onCloseDrawer,
    }),
    [
      reset,
      update,
      state,
      setField,
      canReset,
      openDrawer,
      onCloseDrawer,
      onToggleDrawer,
      onChangeDirectionByLang,
    ]
  );

  return <SettingsContext.Provider value={memoizedValue}>{children}</SettingsContext.Provider>;
}
