import { useEffect, useState, type ReactNode } from "react";
import {
  FontScaleContext,
  type FontScaleContextValue,
} from "./FontScaleContext";

const SCALE_STEPS = [0.9, 1, 1.15, 1.3] as const;
const DEFAULT_STEP_INDEX = 1;
const STORAGE_KEY = "fontScaleStepIndex";
const BASE_FONT_SIZE_PX = 16;

function getInitialStepIndex() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const index = saved ? Number(saved) : DEFAULT_STEP_INDEX;
  return Number.isInteger(index) && index >= 0 && index < SCALE_STEPS.length
    ? index
    : DEFAULT_STEP_INDEX;
}

export function FontScaleProvider({ children }: { children: ReactNode }) {
  const [stepIndex, setStepIndex] = useState(getInitialStepIndex);

  useEffect(() => {
    document.documentElement.style.fontSize = `${BASE_FONT_SIZE_PX * SCALE_STEPS[stepIndex]}px`;
    localStorage.setItem(STORAGE_KEY, String(stepIndex));
  }, [stepIndex]);

  const value: FontScaleContextValue = {
    scale: SCALE_STEPS[stepIndex],
    increase: () =>
      setStepIndex((i) => Math.min(i + 1, SCALE_STEPS.length - 1)),
    decrease: () => setStepIndex((i) => Math.max(i - 1, 0)),
    canIncrease: stepIndex < SCALE_STEPS.length - 1,
    canDecrease: stepIndex > 0,
  };

  return (
    <FontScaleContext.Provider value={value}>
      {children}
    </FontScaleContext.Provider>
  );
}
