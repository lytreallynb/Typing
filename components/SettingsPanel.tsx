import { useState } from "react";
import { Settings2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSettingsStore } from "@/hooks/useSettingsStore";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/components/ThemeProvider";

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { showTranslation, toggleTranslation, showCaret, toggleCaret, soundOnKeypress, toggleSound, typography, setTypography } = useSettingsStore();

  return (
    <>
      <Button variant="outline" size="icon" aria-label="settings" onClick={() => setOpen(true)}>
        <Settings2 className="h-4 w-4" />
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Settings</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fine-tune your practice experience.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <ToggleRow label="Show translation" description="Display Chinese hints during practice" checked={showTranslation} onCheckedChange={toggleTranslation} />
                <ToggleRow label="Show caret" description="Blinking caret for the active character" checked={showCaret} onCheckedChange={toggleCaret} />
                <ToggleRow label="Keypress sound" description="Play subtle audio feedback" checked={soundOnKeypress} onCheckedChange={toggleSound} />
                <ToggleRow label="Dark mode" description="Switch between light and dark themes" checked={theme === "dark"} onCheckedChange={toggleTheme} />

                <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Typography</h4>
                  <p className="text-xs text-gray-500">Adjust font size and line height for the typing box.</p>
                  <div className="mt-4 space-y-3">
                    <Slider
                      label={`Font size: ${typography.fontSize}px`}
                      min={16}
                      max={32}
                      value={typography.fontSize}
                      onChange={(event) => setTypography({ fontSize: Number(event.target.value) })}
                    />
                    <Slider
                      label={`Line height: ${typography.lineHeight}px`}
                      min={24}
                      max={48}
                      value={typography.lineHeight}
                      onChange={(event) => setTypography({ lineHeight: Number(event.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: () => void;
}

function ToggleRow({ label, description, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
      <div>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">{label}</div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
