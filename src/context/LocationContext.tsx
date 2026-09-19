import { createContext, useContext } from "react";
import type { Coords } from "../lib/geolocation";
import type { Region } from "../types/region";

export type SelectedLocation =
  | { source: "gps"; coords: Coords; radius: 2000 }
  | {
      source: "manual";
      coords: Coords;
      radius: 5000;
      regionName: string;
      districtName: string;
      label: string;
    };

export type LocationContextValue = {
  status: "locating" | "ready";
  location: SelectedLocation | null;
  fallbackNotice: boolean;
  dismissFallbackNotice: () => void;
  pickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  locateMe: () => void;
  selectRegion: (regionName: string, districtName?: string) => void;
  regions: Region[];
};

export const LocationContext = createContext<LocationContextValue | null>(null);

export function useAppLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx)
    throw new Error("useAppLocation은 LocationProvider 안에서만 쓸 수 있어요.");
  return ctx;
}
