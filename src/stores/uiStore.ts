import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, TranslationKey } from '@/lib/i18n';
import { translations } from '@/lib/i18n';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, replacements?: Record<string, string>) => string;
}

const createTranslator = (lang: Language) => (key: TranslationKey, replacements?: Record<string, string>) => {
  let text: string = translations[key]?.[lang] || key;
  if (replacements) {
    Object.entries(replacements).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }
  return text;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      language: 'en',
      setLanguage: (lang) => set({ language: lang, t: createTranslator(lang) }),
      t: createTranslator('en'),
    }),
    {
      name: 'fooptra-ui',
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        state?.setLanguage?.(state.language ?? 'en');
      },
    }
  )
);
