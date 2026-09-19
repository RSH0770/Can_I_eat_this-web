import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { locate, type Coords, type LocateResult } from "../lib/geolocation";
import regionsData from "../data/regions.json";
import type { Region, RegionsFile } from "../types/region";
import { LocationContext, type SelectedLocation } from "./LocationContext";

const regions = (regionsData as RegionsFile).regions;
const STORAGE_KEY = "mukeodo:lastRegion";

type ManualSelection = { regionName: string; districtName: string };

function findRegion(regionName: string): Region | undefined {
  return regions.find((r) => r.name === regionName);
}

function districtCoords(region: Region, districtName: string): Coords {
  const district = region.districts.find((d) => d.name === districtName);
  return district
    ? { lat: district.lat, lng: district.lng }
    : { lat: region.lat, lng: region.lng };
}

function loadSaved(): ManualSelection | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ManualSelection;
    return parsed.regionName ? parsed : null;
  } catch {
    return null;
  }
}

function saveSelection(sel: ManualSelection) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sel));
  } catch {
    // 저장 실패해도 이번 세션 동작엔 지장 없음
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"locating" | "ready">("locating");
  const [location, setLocation] = useState<SelectedLocation | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const runId = useRef(0);

  const applyManual = useCallback(
    (regionName: string, districtName?: string) => {
      const region = findRegion(regionName);
      if (!region) return;
      const district = districtName ?? region.default;
      setLocation({
        source: "manual",
        coords: districtCoords(region, district),
        radius: 5000,
        regionName: region.name,
        districtName: district,
        label: districtName ? `${region.name} ${district}` : region.name,
      });
      setStatus("ready");
      saveSelection({ regionName: region.name, districtName: district });
    },
    [],
  );

  const runLocate = useCallback(() => {
    const id = ++runId.current;
    setStatus("locating");
    setFallbackNotice(false);
    locate().then((result: LocateResult) => {
      if (runId.current !== id) return;
      if (result.kind === "ok") {
        setLocation({ source: "gps", coords: result.coords, radius: 2000 });
        setStatus("ready");
        return;
      }
      const saved = loadSaved();
      if (saved) {
        applyManual(saved.regionName, saved.districtName);
        setFallbackNotice(true);
      } else {
        setLocation(null);
        setStatus("ready");
        setPickerOpen(true);
      }
    });
  }, [applyManual]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) runLocate();
    });
    return () => {
      cancelled = true;
    };
  }, [runLocate]);

  const selectRegion = useCallback(
    (regionName: string, districtName?: string) => {
      applyManual(regionName, districtName);
      setPickerOpen(false);
    },
    [applyManual],
  );

  const value = useMemo(
    () => ({
      status,
      location,
      fallbackNotice,
      dismissFallbackNotice: () => setFallbackNotice(false),
      pickerOpen,
      openPicker: () => setPickerOpen(true),
      closePicker: () => setPickerOpen(false),
      locateMe: runLocate,
      selectRegion,
      regions,
    }),
    [status, location, fallbackNotice, pickerOpen, runLocate, selectRegion],
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}
