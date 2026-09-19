export type SealVerdict = "RED" | "INK" | "OK";
export type ApiSeal = { verdict: SealVerdict; symbol: string; label: string };

export type FoodItem = {
  id: string;
  name: string;
  region: string;
  sameRegion: boolean;
  tagStatus: string;
  seal: ApiSeal | null;
  summary: string;
};

export type FoodListResponse = {
  region: string | null;
  district: string;
  regionCode: number;
  items: FoodItem[];
  personalized: boolean;
  disclaimer: string;
};

export type CareReason = { name: string; note: string };
export type Tip = { phrase: string; selected: boolean };

export type FoodRestaurant = {
  id: number;
  name: string;
  meta: string;
  lat: number;
  lng: number;
  distanceM: number | null;
  walkMinutes: number | null;
  flags: string[];
  seal: ApiSeal | null;
  summary: string;
  firstImage: string;
};

export type FoodDetail = {
  id: string;
  name: string;
  region: string;
  regionLine: string;
  description: string;
  tagStatus: string;
  seal: ApiSeal | null;
  hasAllergen: boolean;
  allergenText: string | null;
  careReasons: CareReason[];
  tips: Tip[];
  restaurants: FoodRestaurant[];
  restaurantsUnavailable: boolean;
  personalized: boolean;
  disclaimer: string;
};
