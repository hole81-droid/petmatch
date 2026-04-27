export const DOG_BREEDS = [
  "믹스견", "푸들", "말티즈", "포메라니안", "비숑프리제", "시츄", "치와와",
  "닥스훈트", "골든리트리버", "래브라도리트리버", "보더콜리", "허스키",
  "진돗개", "삽살개", "풍산개", "웰시코기", "프렌치불도그", "불도그",
  "비글", "요크셔테리어", "스피츠", "사모예드", "말라뮤트", "아키타",
  "시바이누", "셔틀랜드십독", "콜리", "달마시안", "로트와일러", "저먼셰퍼드",
  "도베르만", "복서", "그레이트데인", "세인트버나드", "바셋하운드",
] as const;

export const CAT_BREEDS = [
  "믹스묘", "코리안숏헤어", "러시안블루", "페르시안", "메인쿤", "브리티시숏헤어",
  "스코티시폴드", "아비시니안", "뱅갈", "노르웨이숲", "버만", "샴", "터키시앙고라",
] as const;

export const PERSONALITY_TAGS = [
  "얌전해요", "활발해요", "낯가림 있어요", "사람 좋아해요",
  "강아지 친해요", "산책 좋아해요", "카페 좋아해요", "훈련됐어요",
  "애교 많아요", "독립적이에요", "장난기 많아요", "조용해요",
  "호기심 많아요", "겁이 없어요", "예민해요",
] as const;

export const PURPOSE_TAGS = [
  { id: "WALK",      label: "산책 친구",    emoji: "🦮" },
  { id: "PLAYDATE",  label: "플레이데이트", emoji: "🎾" },
  { id: "INFO",      label: "정보 교환",    emoji: "💬" },
  { id: "TRAINING",  label: "훈련 동행",    emoji: "🏋️" },
] as const;

export const WALK_TIME_SLOTS = [
  { label: "새벽", description: "05~07시", hours: [5, 6] },
  { label: "아침", description: "07~09시", hours: [7, 8] },
  { label: "오전", description: "09~12시", hours: [9, 10, 11] },
  { label: "점심", description: "12~14시", hours: [12, 13] },
  { label: "오후", description: "14~17시", hours: [14, 15, 16] },
  { label: "저녁", description: "17~20시", hours: [17, 18, 19] },
  { label: "밤",   description: "20~23시", hours: [20, 21, 22] },
] as const;

export const PLACE_TYPE_TAGS = [
  "반려견 카페", "일반 카페 (펫 허용)", "공원", "실내 놀이터", "한강", "산책로",
] as const;
