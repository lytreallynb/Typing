import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TypographySettings {
  fontSize: number;
  lineHeight: number;
}

interface SettingsState {
  showTranslation: boolean;
  showCaret: boolean;
  soundOnKeypress: boolean;
  typography: TypographySettings;
  toggleTranslation: () => void;
  toggleCaret: () => void;
  toggleSound: () => void;
  setTypography: (value: Partial<TypographySettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      showTranslation: true,
      showCaret: true,
      soundOnKeypress: false,
      typography: {
        fontSize: 20,
        lineHeight: 32,
      },
      toggleTranslation: () => set((state) => ({ showTranslation: !state.showTranslation })),
      toggleCaret: () => set((state) => ({ showCaret: !state.showCaret })),
      toggleSound: () => set((state) => ({ soundOnKeypress: !state.soundOnKeypress })),
      setTypography: (value) =>
        set((state) => ({
          typography: {
            ...state.typography,
            ...value,
          },
        })),
    }),
    {
      name: "typing-settings",
    }
  )
);
