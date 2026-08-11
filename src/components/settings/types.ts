// ----------------------------------------------------------------------

export type SettingsValueProps = {
  themeStretch: boolean;
  themeMode: 'light' | 'dark';
  themeDirection: 'rtl' | 'ltr';
  themeContrast: 'default' | 'bold';
  themeLayout: 'vertical' | 'horizontal' | 'mini';
  themeColorPresets: 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red';
};

export type SettingsState = {
  direction?: 'rtl' | 'ltr';
  fontFamily?: string;
  fontSize?: number;
  contrast?: 'default' | 'high';
  primaryColor?: 'default' | 'preset1' | 'preset2' | 'preset3' | 'preset4' | 'preset5';
  navLayout?: 'vertical' | 'horizontal' | 'mini';
  navColor?: 'integrate' | 'apparent';
  compactLayout?: boolean;
};

export type SettingsContextProps = SettingsValueProps & {
  state: SettingsState;
  setField: (name: 'navLayout' | 'navColor' | 'compactLayout', value: string | boolean) => void;
  // Update
  onUpdate: (name: string, value: string | boolean) => void;
  // Direction by lang
  onChangeDirectionByLang: (lang: string) => void;
  // Reset
  canReset: boolean;
  onReset: VoidFunction;
  // Drawer
  open: boolean;
  onToggle: VoidFunction;
  onToggleDrawer: VoidFunction;
  onClose: VoidFunction;
};
