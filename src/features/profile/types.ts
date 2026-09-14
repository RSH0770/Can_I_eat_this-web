export type CareView = {
  value: string;
  auto: boolean;
  note: string;
};

export type ProfileResponse = {
  loginId: string;
  name: string;
  gender: string;
  birthYear?: number;
  bloodType?: string;
  diseases: string[];
  cares: CareView[];
  allergies: string[];
  chewingDifficulty: boolean;
  medications: string[];
  medNote: string;
  showMedsOnCard: boolean;
  fontScaleIdx: number;
  disclaimer: string;
};
