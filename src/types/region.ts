export type District = {
  name: string;
  lat: number;
  lng: number;
  restaurantCount: number;
};

export type Region = {
  name: string;
  regionCode: string;
  hasLocalFood: boolean;
  default: string;
  lat: number;
  lng: number;
  districts: District[];
};

export type RegionsFile = {
  regions: Region[];
};
