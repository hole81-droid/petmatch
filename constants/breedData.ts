export type EnergyLevel = "LOW" | "MEDIUM" | "HIGH";

const BREED_ENERGY: Record<string, EnergyLevel> = {
  // 소형견 - LOW/MEDIUM
  "믹스견": "MEDIUM",
  "말티즈": "LOW",
  "비숑프리제": "MEDIUM",
  "시츄": "LOW",
  "치와와": "MEDIUM",
  "닥스훈트": "MEDIUM",
  "바셋하운드": "LOW",
  "불도그": "LOW",
  "프렌치불도그": "LOW",
  "세인트버나드": "LOW",

  // 소중형견 - MEDIUM/HIGH
  "푸들": "HIGH",
  "포메라니안": "MEDIUM",
  "요크셔테리어": "HIGH",
  "스피츠": "MEDIUM",
  "아키타": "MEDIUM",
  "시바이누": "MEDIUM",
  "로트와일러": "MEDIUM",
  "그레이트데인": "MEDIUM",
  "삽살개": "MEDIUM",

  // 활발한 견종 - HIGH
  "골든리트리버": "HIGH",
  "래브라도리트리버": "HIGH",
  "보더콜리": "HIGH",
  "허스키": "HIGH",
  "진돗개": "HIGH",
  "풍산개": "HIGH",
  "웰시코기": "HIGH",
  "비글": "HIGH",
  "사모예드": "HIGH",
  "말라뮤트": "HIGH",
  "셔틀랜드십독": "HIGH",
  "콜리": "HIGH",
  "달마시안": "HIGH",
  "저먼셰퍼드": "HIGH",
  "도베르만": "HIGH",
  "복서": "HIGH",

  // 고양이 - 대부분 LOW~MEDIUM
  "믹스묘": "MEDIUM",
  "코리안숏헤어": "MEDIUM",
  "러시안블루": "LOW",
  "페르시안": "LOW",
  "메인쿤": "MEDIUM",
  "브리티시숏헤어": "LOW",
  "스코티시폴드": "LOW",
  "아비시니안": "HIGH",
  "뱅갈": "HIGH",
  "노르웨이숲": "MEDIUM",
  "버만": "MEDIUM",
  "샴": "HIGH",
  "터키시앙고라": "MEDIUM",
};

export function getEnergyLevel(breed: string): EnergyLevel {
  return BREED_ENERGY[breed] ?? "MEDIUM";
}
