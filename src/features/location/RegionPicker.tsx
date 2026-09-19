import { useState } from "react";
import { createPortal } from "react-dom";
import { useAppLocation } from "../../context/LocationContext";
import type { Region } from "../../types/region";

export function RegionPicker() {
  const { pickerOpen, closePicker, regions, selectRegion, locateMe, status } =
    useAppLocation();
  const [openRegion, setOpenRegion] = useState<Region | null>(null);

  if (!pickerOpen) return null;

  function handleMyLocation() {
    locateMe();
    closePicker();
  }

  function handlePickRegion(region: Region) {
    if (region.districts.length === 0) {
      selectRegion(region.name);
      return;
    }
    setOpenRegion(region);
  }

  function handlePickDistrict(region: Region, districtName?: string) {
    selectRegion(region.name, districtName);
    setOpenRegion(null);
  }

  return createPortal(
    <div className="absolute inset-0 z-50 flex flex-col bg-cream text-ink">
      <div className="flex min-h-[52px] items-center border-b border-ink/15 px-[18px]">
        {openRegion ? (
          <button
            type="button"
            onClick={() => setOpenRegion(null)}
            className="border-0 bg-transparent p-0 text-[0.9375rem] text-ink"
          >
            〈 {openRegion.name}
          </button>
        ) : (
          <span className="text-[1.0625rem] font-bold">지역 선택</span>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={closePicker}
          className="border-0 bg-transparent p-0 text-[0.9375rem] text-ink/60"
        >
          닫기
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-[18px] pb-[20px]">
        {!openRegion && (
          <>
            <button
              type="button"
              onClick={handleMyLocation}
              className="flex w-full items-center gap-[10px] border-0 border-b border-ink/10 bg-transparent px-0 py-[16px] text-left"
            >
              <span className="text-[1.125rem]">📍</span>
              <span className="text-[1rem] font-bold">내 위치</span>
              {status === "locating" && (
                <span className="ml-[6px] text-xs text-ink/50">확인 중…</span>
              )}
            </button>
            <div className="flex flex-col">
              {regions.map((region) => (
                <button
                  key={region.name}
                  type="button"
                  onClick={() => handlePickRegion(region)}
                  className="flex w-full items-center border-0 border-b border-ink/10 bg-transparent px-0 py-[14px] text-left"
                >
                  <span className="flex-1 text-[0.96875rem]">
                    {region.name}
                  </span>
                  {region.districts.length > 0 && (
                    <span className="text-ink/30">〉</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {openRegion && (
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => handlePickDistrict(openRegion)}
              className="flex w-full items-center border-0 border-b border-ink/10 bg-transparent px-0 py-[14px] text-left"
            >
              <span className="flex-1 text-[0.96875rem] font-bold">
                {openRegion.name} 전체 ({openRegion.default})
              </span>
            </button>
            {openRegion.districts.map((d) => (
              <button
                key={d.name}
                type="button"
                onClick={() => handlePickDistrict(openRegion, d.name)}
                className="flex w-full items-center border-0 border-b border-ink/10 bg-transparent px-0 py-[13px] text-left"
              >
                <span className="text-[0.9375rem]">{d.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.getElementById("phone-frame") ?? document.body,
  );
}
