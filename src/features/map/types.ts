// GET /api/restaurants (검색) 응답 스키마
// 식당 상세(features/restaurant/types.ts)의 ApiSeal과 동일한 Seal 스키마를 그대로 재사용힘
import type { ApiSeal } from "../restaurant/types";

export type SearchItem = {
  id: number;
  name: string;
  meta: string;
  lat: number;
  lng: number;
  distanceM: number;
  walkMinutes: number;
  flags: string[];
  seal: ApiSeal | null;
  summary: string;
  firstImage: string;
};

export type SearchResponse = {
  page: number;
  size: number;
  totalCount: number;
  personalized: boolean;
  items: SearchItem[];
  disclaimer: string;
};
