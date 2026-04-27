# PetMatch — Claude 작업 가이드

> 이 파일은 모든 작업마다 참고하는 기술 기준서다.
> 새 기능을 시작하기 전, 반드시 이 파일을 먼저 읽는다.

---

## 1. 기술 스택

| 역할 | 기술 | 선택 이유 |
|------|------|-----------|
| 프레임워크 | **Next.js 15 (App Router)** | 웹 표준, Vercel 최적 통합 |
| 언어 | **TypeScript (strict)** | 타입 안정성, 버그 사전 방지 |
| 스타일 | **Tailwind CSS** | 빠른 UI 작성, 일관성 |
| UI 컴포넌트 | **shadcn/ui** | 접근성 내장, 커스터마이징 쉬움 |
| 전역 상태 | **Zustand** | 가볍고 타입 추론이 좋음 |
| 폼 + 유효성 | **React Hook Form + Zod** | 유효성 검사를 코드로 표현 |
| 애니메이션 | **Framer Motion** | 스와이프 카드 물리 효과 |
| 백엔드 / DB | **Supabase** | 인증·DB·실시간 채팅·이미지 저장 통합 |
| 실시간 채팅 | **Supabase Realtime** | 별도 WebSocket 서버 불필요 |
| 이미지 저장 | **Supabase Storage** | S3 대체, Supabase와 권한 연동 |
| 배포 | **Vercel** | Next.js 최적 배포 플랫폼 |

---

## 2. 폴더 구조 규칙

```
petmatch/
├── app/                        # Next.js App Router 페이지
│   ├── (auth)/                 # 로그인·회원가입 (레이아웃 별도)
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/                 # 로그인 후 메인 앱 (하단 네비 포함)
│   │   ├── discovery/          # 스와이프 메인 화면
│   │   ├── matches/            # 매칭 목록
│   │   ├── chat/
│   │   │   └── [matchId]/      # 1:1 채팅방
│   │   └── profile/            # 내 프로필·설정
│   ├── onboarding/             # 첫 가입 후 프로필·목적 태그 설정
│   ├── layout.tsx
│   └── page.tsx                # 루트: 로그인 여부에 따라 리다이렉트
│
├── components/
│   ├── ui/                     # shadcn/ui 기본 컴포넌트 (건드리지 않음)
│   ├── cards/                  # SwipeCard, CompatibilityBadge, TrustBadge 등
│   ├── chat/                   # ChatMessage, ChatInput, AppointmentCard 등
│   ├── profile/                # ProfileForm, LifestyleForm, BadgeSelector 등
│   ├── discovery/              # FilterPanel, SwipeDeck 등
│   └── layout/                 # BottomNav, Header, PageShell 등
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # 브라우저용 Supabase 클라이언트
│   │   ├── server.ts           # 서버 컴포넌트용 클라이언트
│   │   └── middleware.ts       # 인증 미들웨어
│   ├── scoring/
│   │   └── compatibility.ts    # 규칙 기반 호환성 점수 계산 로직
│   └── utils.ts                # 공통 유틸 (cn, formatDate 등)
│
├── hooks/                      # 커스텀 훅 (useSwipe, useChat, useMatches 등)
├── stores/                     # Zustand 스토어 (auth, filter, swipe 등)
├── types/                      # 공유 TypeScript 타입·인터페이스
├── constants/                  # 견종 데이터, 시간대 슬롯, 성격 태그 목록 등
└── middleware.ts               # Next.js 미들웨어 (인증 라우트 보호)
```

### 폴더 규칙 요약
- 새 파일을 만들기 전에 이미 맞는 폴더가 있는지 먼저 확인한다
- `app/` 안에는 페이지·레이아웃·로딩 파일만 둔다. 로직은 `hooks/`·`lib/`에 분리한다
- `components/ui/`는 shadcn/ui 자동 생성 파일이다. 직접 수정하지 않는다

---

## 3. 코드 스타일 / 네이밍 규칙

### 파일명
| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `SwipeCard.tsx` |
| 훅·유틸·스토어 | camelCase | `useSwipe.ts`, `compatibility.ts` |
| 페이지·레이아웃 | Next.js 규칙 | `page.tsx`, `layout.tsx` |
| 상수·타입 파일 | camelCase | `breedData.ts`, `petTypes.ts` |

### 코드 규칙
```typescript
// ✅ Named export 사용 (default export 금지)
export function SwipeCard({ pet }: SwipeCardProps) { ... }

// ✅ Props 타입은 인터페이스로 분리
interface SwipeCardProps {
  pet: Pet
  onLike: () => void
  onPass: () => void
}

// ✅ Zod로 데이터 유효성 검사
const petSchema = z.object({
  name: z.string().min(1),
  breed: z.string().min(1),
  ageYears: z.number().int().min(0).max(30),
})

// ❌ any 타입 절대 금지
const data: any = ...         // 금지
const handler = (e: any) => ... // 금지

// ❌ default export 금지 (page.tsx, layout.tsx 제외)
export default function SwipeCard() { ... } // 금지
```

### 변수·함수 네이밍
- 컴포넌트: `PascalCase` — `SwipeCard`, `TrustBadge`
- 함수·변수: `camelCase` — `calculateScore`, `filterPets`
- 상수: `UPPER_SNAKE_CASE` — `MAX_PHOTOS`, `WALK_TIME_SLOTS`
- Zustand 스토어: `use + 대상 + Store` — `useAuthStore`, `useFilterStore`
- 커스텀 훅: `use + 동작` — `useSwipe`, `useChat`
- Supabase 테이블명: `snake_case` — `pets`, `pet_lifestyles`, `matches`

### Tailwind 스타일
- 인라인 클래스를 직접 쓴다. CSS 파일은 전역 스타일(`globals.css`)만 사용한다
- 반복되는 클래스 조합은 `cn()` 헬퍼로 묶는다
- 컴포넌트별 스타일 변형은 `cva()`를 사용한다

---

## 4. Supabase 사용 원칙

- **서버 컴포넌트**에서는 `lib/supabase/server.ts`의 클라이언트를 사용한다
- **클라이언트 컴포넌트**에서는 `lib/supabase/client.ts`의 클라이언트를 사용한다
- Row Level Security (RLS)를 모든 테이블에 반드시 활성화한다
- 이미지 업로드는 항상 Supabase Storage를 통한다. base64 저장 금지
- 환경 변수는 `.env.local`에 보관하고 절대 커밋하지 않는다:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 5. 호환성 점수 계산 원칙 (`lib/scoring/compatibility.ts`)

점수는 서버 없이 **브라우저에서만 계산**한다.

| 항목 | 가중치 | 계산 방식 |
|------|--------|-----------|
| 견종 에너지 레벨 호환성 | 25% | `constants/breedData.ts`의 에너지 레벨 차이 |
| 성격 태그 일치도 | 25% | 공통 태그 수 / 전체 태그 수 |
| 산책 시간대 일치도 | 20% | 공통 시간대 슬롯 수 / 전체 슬롯 수 |
| 체급 호환성 | 15% | 소·중·대형 3단계 차이 |
| 카페·장소 선호 일치도 | 15% | 선호 값 일치 여부 |

- 점수는 0~100 정수로 반환한다
- 계산에 필요한 값이 없으면 해당 항목을 0점으로 처리하고 "정보 부족" 플래그를 함께 반환한다

---

## 6. 작업 원칙 (매 작업 전 반드시 읽기)

### 시작 전
1. **이 파일(CLAUDE.md)을 먼저 읽는다**
2. `prd.md`에서 해당 기능의 수용 기준을 확인한다
3. `tasks.md`에서 현재 작업 체크박스를 확인한다

### 큰 변경 전 계획 승인
- 새 파일을 3개 이상 만들거나, 기존 구조를 바꾸는 작업은 반드시 **계획을 먼저 보여주고 승인을 받은 뒤** 코드를 작성한다
- 계획 형식: 만들거나 수정할 파일 목록 + 각 파일에서 할 일 한 줄

### 작업 단위
- **한 번에 한 기능만** 작업한다
- 기능이 완성되면 `tasks.md`의 체크박스를 완료로 표시한다

### 타입 규칙
- `any` 타입은 어떤 상황에서도 사용하지 않는다
- 외부 데이터(Supabase 응답 등)는 반드시 Zod로 파싱한다

### 커밋 규칙
- 한 기능 = 한 커밋
- 커밋 메시지 형식: `feat: [기능명] — 한 줄 설명`
  - 예: `feat: discovery — 스와이프 카드 UI 구현`
  - 예: `feat: auth — 이메일 + Google 로그인 구현`
- 커밋은 사용자가 요청할 때만 한다

### 하지 않는 것
- 요청하지 않은 리팩토링·추상화를 추가하지 않는다
- 주석은 "왜(Why)"가 명확히 비자명한 경우에만 한 줄 작성한다
- 발생하지 않는 에러에 대한 방어 코드를 추가하지 않는다
- 코드 블록 안에 "무엇을 한다"는 설명 주석을 달지 않는다
