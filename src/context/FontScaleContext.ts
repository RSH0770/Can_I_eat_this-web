import { createContext, useContext } from "react";

export type FontScaleContextValue = {
  scale: number;
  increase: () => void;
  decrease: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
};

export const FontScaleContext = createContext<FontScaleContextValue | null>(
  null,
);

export function useFontScale() {
  const context = useContext(FontScaleContext);
  if (!context) {
    throw new Error(
      "useFontScale은 FontScaleProvider 내부에서만 사용할 수 있습니다.",
    );
  }
  return context;
}
