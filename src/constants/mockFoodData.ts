// TODO: 실제 데이터로 교체 예정. 이 파일의 FOODS/RESTS는 지도 화면에서 쓸 전국 음식점
// 공공데이터(엑셀/TourAPI, 좌표 포함)와는 다른 별개의 목데이터임
export type FoodItem = {
  id: string;
  name: string;
  region: string;
  cares: string[];
  allergens: string[];
  desc: string;
  tips: string[];
};

export type MenuItem = {
  name: string;
  price: string;
  cares: string[];
  allergens: string[];
};

export type RestItem = {
  id: string;
  name: string;
  area: string;
  dist: string;
  foods: string[];
  flags: string[];
  menus: MenuItem[];
  // TODO: 실제 공공데이터/제휴 데이터 연동 시 식당의 정확한 위경도로 교체할 것
  lat: number;
  lng: number;
};

export const FOODS: FoodItem[] = [
  {
    id: "sundubu",
    name: "초당 순두부",
    region: "강릉",
    cares: ["나트륨"],
    allergens: ["대두"],
    desc: "바닷물로 간을 맞춘 순두부. 두부 자체는 담백하지만 곁들이는 양념장과 짠 반찬에서 나트륨이 올라갑니다.",
    tips: [
      "양념장은 따로 주세요",
      "김치·젓갈 반찬은 빼 주세요",
      "국물은 조금만 떠 주세요",
    ],
  },
  {
    id: "ongsimi",
    name: "감자 옹심이",
    region: "강릉",
    cares: ["나트륨", "정제 탄수화물"],
    allergens: [],
    desc: "감자 전분으로 빚은 옹심이를 멸치 육수에 끓여 냅니다. 국물과 면 양이 함께 부담이 됩니다.",
    tips: ["국물은 따로 담아 주세요", "면은 반만 주세요"],
  },
  {
    id: "mulhoe",
    name: "물회",
    region: "강릉",
    cares: ["나트륨", "당류"],
    allergens: ["새우", "오징어"],
    desc: "초고추장에 얼음을 넣어 먹는 회 요리. 초고추장에 설탕과 소금이 함께 들어갑니다.",
    tips: ["초고추장은 따로 주세요", "새우·오징어는 빼 주세요"],
  },
];

export const RESTS: RestItem[] = [
  {
    id: "r1",
    name: "초당할머니순두부",
    area: "강릉 초당동",
    dist: "도보 6분",
    foods: ["sundubu"],
    flags: ["알레르기 표기 있음", "저염 요청 가능", "입식 좌석", "경사로"],
    lat: 37.7969,
    lng: 128.9312,
    menus: [
      {
        name: "순두부 백반",
        price: "11,000원",
        cares: ["나트륨"],
        allergens: ["대두"],
      },
      {
        name: "짜지 않은 순두부",
        price: "11,000원",
        cares: [],
        allergens: ["대두"],
      },
      {
        name: "순두부 짜글이",
        price: "13,000원",
        cares: ["나트륨", "포화지방"],
        allergens: ["대두", "돼지고기"],
      },
      {
        name: "두부 젤라토",
        price: "4,500원",
        cares: ["당류"],
        allergens: ["대두", "우유"],
      },
    ],
  },
  {
    id: "r2",
    name: "경포호 물회식당",
    area: "강릉 경포동",
    dist: "1.2km",
    foods: ["mulhoe"],
    flags: ["알레르기 표기 있음", "입식 좌석"],
    lat: 37.8048,
    lng: 128.8974,
    menus: [
      {
        name: "물회",
        price: "18,000원",
        cares: ["나트륨", "당류"],
        allergens: ["새우", "오징어"],
      },
      {
        name: "가리비 구이",
        price: "16,000원",
        cares: [],
        allergens: ["조개류"],
      },
      {
        name: "도치 알탕",
        price: "15,000원",
        cares: ["나트륨"],
        allergens: [],
      },
    ],
  },
  {
    id: "r3",
    name: "중앙시장 옹심이칼국수",
    area: "강릉 중앙시장",
    dist: "2.4km",
    foods: ["ongsimi"],
    flags: ["저염 요청 가능", "좌식 좌석"],
    lat: 37.7517,
    lng: 128.8963,
    menus: [
      {
        name: "감자 옹심이",
        price: "10,000원",
        cares: ["나트륨", "정제 탄수화물"],
        allergens: [],
      },
      {
        name: "옹심이 칼국수",
        price: "10,000원",
        cares: ["나트륨", "정제 탄수화물"],
        allergens: ["밀"],
      },
      {
        name: "메밀 전병",
        price: "6,000원",
        cares: ["나트륨"],
        allergens: ["메밀"],
      },
    ],
  },
  {
    id: "r4",
    name: "솔밭 산채정식",
    area: "강릉 성산면",
    dist: "4.8km",
    foods: [],
    flags: ["알레르기 표기 있음", "저염 요청 가능", "입식 좌석", "경사로"],
    lat: 37.7286,
    lng: 128.8462,
    menus: [
      {
        name: "산채 정식",
        price: "15,000원",
        cares: ["칼륨"],
        allergens: ["대두"],
      },
      {
        name: "들깨 수제비",
        price: "11,000원",
        cares: ["정제 탄수화물"],
        allergens: ["밀"],
      },
      { name: "더덕 구이", price: "13,000원", cares: ["당류"], allergens: [] },
    ],
  },
];
