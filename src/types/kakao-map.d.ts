// kakao-maps.d.ts
// 카카오맵 JS SDK(전역 window.kakao)용 최소 타입 선언

interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoMapOptions {
  center: KakaoLatLng;
  level?: number;
}

interface KakaoZoomControl {
  readonly __kakaoZoomControlBrand?: never;
}

interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void;
  getCenter(): KakaoLatLng;
  setLevel(level: number): void;
  getLevel(): number;
  relayout(): void;
  addControl(control: KakaoZoomControl, position: number): void;
}

interface KakaoCustomOverlayOptions {
  position: KakaoLatLng;
  content: string | HTMLElement;
  map?: KakaoMap;
  xAnchor?: number;
  yAnchor?: number;
  zIndex?: number;
}

interface KakaoCustomOverlay {
  setMap(map: KakaoMap | null): void;
  setPosition(position: KakaoLatLng): void;
}

interface KakaoMapsNamespace {
  load(callback: () => void): void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap;
  CustomOverlay: new (options: KakaoCustomOverlayOptions) => KakaoCustomOverlay;
  ZoomControl: new () => KakaoZoomControl;
  ControlPosition: { RIGHT: number; [key: string]: number };
  event: {
    addListener(
      target: object,
      type: string,
      handler: (...args: unknown[]) => void,
    ): void;
    removeListener(
      target: object,
      type: string,
      handler: (...args: unknown[]) => void,
    ): void;
  };
}

interface Window {
  kakao: {
    maps: KakaoMapsNamespace;
  };
}

// Vite의 import.meta.env에 카카오맵 키 필드를 추가
interface ImportMetaEnv {
  readonly VITE_KAKAO_MAP_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
