# PetMatch — 개발 진행 계획 (Tasks)

> 체크박스를 완료하면 `[x]`로 표시한다.
> 각 Phase는 순서대로 진행한다. 앞 Phase가 완료되어야 다음 Phase를 시작한다.
> 각 작업 예상 소요 시간: 30분~2시간

---

## Phase 0 — 셋업

> 목표: 코드를 한 줄도 짜지 않아도 앱이 Vercel에 빈 화면으로 뜨는 상태

- [ ] **0-1. Next.js 프로젝트 생성**
  - `create-next-app`으로 TypeScript + App Router + Tailwind CSS 옵션으로 생성
  - 완료 조건: `npm run dev` 실행 시 localhost:3000에 기본 화면이 뜬다

- [ ] **0-2. TypeScript strict 모드 설정**
  - `tsconfig.json`에 `"strict": true` 확인 및 불필요한 파일 정리
  - 완료 조건: `npm run build`가 타입 에러 없이 통과한다

- [ ] **0-3. ESLint + Prettier 설정**
  - `.eslintrc`, `.prettierrc` 설정 파일 작성
  - 완료 조건: `npm run lint`가 에러 없이 통과한다

- [ ] **0-4. shadcn/ui 초기화**
  - `npx shadcn-ui@latest init` 실행, 테마 색상을 브랜드에 맞게 설정
  - 완료 조건: `Button` 컴포넌트를 import해서 화면에 렌더링된다

- [ ] **0-5. 폴더 구조 생성**
  - CLAUDE.md의 폴더 구조대로 빈 폴더와 placeholder 파일 생성
  - 완료 조건: `app/`, `components/`, `lib/`, `hooks/`, `stores/`, `types/`, `constants/` 폴더가 존재한다

- [ ] **0-6. Supabase 프로젝트 생성 + 환경변수 설정**
  - Supabase 대시보드에서 프로젝트 생성
  - `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 입력
  - 완료 조건: `.env.local` 파일이 있고 두 변수가 채워져 있다 (`.gitignore`에 포함)

- [ ] **0-7. Supabase 클라이언트 설정**
  - `lib/supabase/client.ts` (브라우저용), `lib/supabase/server.ts` (서버 컴포넌트용) 작성
  - 완료 조건: 두 파일에서 Supabase 클라이언트를 정상적으로 import할 수 있다

- [ ] **0-8. Vercel 초기 배포**
  - GitHub에 저장소 생성 후 연결, Vercel에 환경변수 등록 후 배포
  - 완료 조건: Vercel에서 발급된 URL로 접속하면 빈 화면이 뜬다

---

## Phase 1 — 인증 (Auth)

> 목표: 회원가입·로그인·로그아웃이 실제로 작동한다

- [ ] **1-1. Supabase Auth 설정**
  - Supabase 대시보드에서 이메일 인증 + Google OAuth 활성화
  - 완료 조건: Supabase 대시보드 Auth 탭에서 두 Provider가 활성화된 상태다

- [ ] **1-2. 인증 미들웨어 작성**
  - `middleware.ts` 작성: 로그인하지 않은 사용자가 `/(main)/` 경로에 접근하면 `/login`으로 이동
  - 완료 조건: 비로그인 상태에서 `/discovery`로 직접 접근하면 `/login`으로 이동한다

- [ ] **1-3. AuthStore (Zustand) 작성**
  - `stores/authStore.ts`: 현재 로그인한 사용자 정보와 세션 상태 관리
  - 완료 조건: 로그인 후 `useAuthStore()`로 유저 정보를 읽을 수 있다

- [ ] **1-4. 로그인 페이지 (`/login`)**
  - 이메일 + 비밀번호 폼, Google 로그인 버튼
  - 완료 조건: 이메일·Google 로그인 성공 시 `/discovery`로 이동한다

- [ ] **1-5. 회원가입 페이지 (`/signup`)**
  - 이메일·비밀번호·비밀번호 확인 폼 (Zod 유효성 검사)
  - 완료 조건: 회원가입 성공 시 `/onboarding`으로 이동한다

- [ ] **1-6. 루트 페이지 리다이렉트**
  - `app/page.tsx`: 로그인 상태면 `/discovery`, 비로그인이면 `/login`으로 이동
  - 완료 조건: 로그인·비로그인 상태 모두에서 올바른 페이지로 이동한다

---

## Phase 2 — 데이터베이스 스키마

> 목표: Supabase에 테이블이 생성되고 RLS 보안이 적용된다

- [ ] **2-1. TypeScript 공유 타입 정의**
  - `types/` 폴더에 `User`, `Pet`, `PetLifestyle`, `Match`, `Message`, `Swipe`, `Appointment` 인터페이스 작성
  - 완료 조건: 모든 타입 파일이 컴파일 에러 없이 import된다

- [ ] **2-2. `users` 테이블 생성 + RLS 설정**
  - 컬럼: `id`, `nickname`, `region`, `bio`, `avatar_url`, `purpose_tags`, `created_at`
  - 완료 조건: Supabase 대시보드에서 테이블이 존재하고 RLS가 활성화되어 있다

- [ ] **2-3. `pets` 테이블 생성 + RLS 설정**
  - 컬럼: `id`, `owner_id`, `name`, `species`, `breed`, `age_years`, `gender`, `weight_kg`, `photos`, `personality_tags`, `is_vaccinated`, `is_neutered`, `needs_muzzle`, `dog_friendly`, `human_friendly`, `is_active`
  - 완료 조건: 테이블이 존재하고 owner만 자신의 반려동물을 수정할 수 있다

- [ ] **2-4. `pet_lifestyles` 테이블 생성 + RLS 설정**
  - 컬럼: `id`, `pet_id`, `walk_time_slots`, `walk_days`, `favorite_locations`, `cafe_pref`, `place_type_tags`
  - 완료 조건: `pets`와 1:1로 연결되고 owner만 수정할 수 있다

- [ ] **2-5. `swipes` 테이블 생성 + RLS 설정**
  - 컬럼: `id`, `swiper_id`, `swiped_id`, `action` (`LIKE` / `PASS` / `SUPER_LIKE`), `created_at`
  - 완료 조건: 본인의 스와이프 기록만 insert·read할 수 있다

- [ ] **2-6. `matches` 테이블 생성 + RLS 설정**
  - 컬럼: `id`, `pet1_id`, `pet2_id`, `matched_at`, `safety_check_done`
  - 완료 조건: 매칭된 두 owner만 해당 매칭을 조회할 수 있다

- [ ] **2-7. `messages` 테이블 생성 + RLS 설정**
  - 컬럼: `id`, `match_id`, `sender_id`, `content`, `image_url`, `is_read`, `created_at`
  - 완료 조건: 매칭된 두 owner만 해당 채팅방 메시지를 read/insert할 수 있다

- [ ] **2-8. `appointments` 테이블 생성 + RLS 설정**
  - 컬럼: `id`, `match_id`, `scheduled_at`, `location_name`, `status` (`PENDING` / `CONFIRMED` / `CANCELLED`)
  - 완료 조건: 매칭된 두 owner만 약속을 read/insert/update할 수 있다

- [ ] **2-9. `reports` 테이블 생성**
  - 컬럼: `id`, `reporter_id`, `reported_id`, `reason`, `created_at`
  - 완료 조건: 로그인한 사용자라면 누구나 신고를 insert할 수 있다

- [ ] **2-10. Supabase Storage 버킷 생성**
  - `pet-photos` 버킷 생성, 업로드 권한(로그인 유저만) 설정
  - 완료 조건: 테스트 이미지를 업로드하면 공개 URL로 접근된다

---

## Phase 3 — 온보딩 & 프로필

> 목표: 신규 가입자가 프로필을 완성하고 Discovery에 진입할 수 있다

- [ ] **3-1. 온보딩 레이아웃 + 단계 표시 UI**
  - `app/onboarding/layout.tsx`: 상단 진행 바(Step 1/4, 2/4 …)
  - 완료 조건: 온보딩 각 단계를 이동하면 진행 바가 업데이트된다

- [ ] **3-2. Step 1 — 보호자 프로필 폼**
  - 닉네임·동네(텍스트)·소개글 입력 (React Hook Form + Zod)
  - `users` 테이블에 저장
  - 완료 조건: 저장 후 Supabase `users` 테이블에 데이터가 생성된다

- [ ] **3-3. Step 2 — 반려동물 프로필 폼**
  - 이름·종(강아지/고양이)·품종·나이·성별·체중 입력
  - `pets` 테이블에 저장
  - 완료 조건: 저장 후 Supabase `pets` 테이블에 데이터가 생성된다

- [ ] **3-4. 반려동물 사진 업로드**
  - 최대 5장 선택 + 미리보기, Supabase Storage에 업로드 후 URL 저장
  - 완료 조건: 업로드한 사진이 카드 미리보기에 표시된다

- [ ] **3-5. Step 3 — 신뢰 뱃지 + 성격 태그 입력**
  - 예방접종·중성화·입마개 여부·성향·개/사람 친화도 선택 UI
  - `pets` 테이블 업데이트
  - 완료 조건: 저장한 뱃지 값이 DB에 반영된다

- [ ] **3-6. Step 4 — 목적 태그 선택**
  - 산책친구·플레이데이트·정보교환·훈련동행 중 복수 선택 (최소 1개)
  - `users` 테이블 `purpose_tags` 업데이트
  - 완료 조건: 1개 이상 선택해야 완료 버튼이 활성화된다

- [ ] **3-7. Step 5 — 라이프스타일 설정**
  - 산책 시간대 슬롯 복수 선택, 자주 가는 장소 최대 3곳 텍스트 입력, 카페 선호 선택
  - `pet_lifestyles` 테이블에 저장
  - 완료 조건: 저장 후 `pet_lifestyles` 테이블에 데이터가 생성된다

- [ ] **3-8. 온보딩 완료 → Discovery 이동**
  - 온보딩 완료 시 `/discovery`로 이동, 이후 재접속 시 온보딩 스킵
  - 완료 조건: 프로필 완성 유저가 `/onboarding`에 접근하면 `/discovery`로 이동한다

---

## Phase 4 — Discovery (스와이프 핵심 기능)

> 목표: 카드를 스와이프하고 Like/Pass가 DB에 저장된다

- [ ] **4-1. 견종 데이터 상수 파일 작성**
  - `constants/breedData.ts`: 주요 견종별 에너지 레벨(LOW/MEDIUM/HIGH) 매핑 (50종 이상)
  - 완료 조건: 임의의 견종명을 넣으면 에너지 레벨이 반환된다

- [ ] **4-2. 호환성 점수 계산 로직 작성**
  - `lib/scoring/compatibility.ts`: 5개 항목 가중치 합산으로 0~100 점수 반환
  - 완료 조건: 두 Pet 객체를 넣으면 0~100 사이의 점수와 항목별 점수가 반환된다

- [ ] **4-3. Discovery 카드 목록 조회 훅**
  - `hooks/useDiscovery.ts`: 내가 아직 스와이프하지 않은 상대 반려동물 목록을 Supabase에서 조회
  - 완료 조건: 이미 스와이프한 카드는 목록에 포함되지 않는다

- [ ] **4-4. SwipeCard 컴포넌트**
  - `components/cards/SwipeCard.tsx`: 반려동물 사진(슬라이드)·이름·나이·동네·목적 태그 표시
  - 완료 조건: 카드가 화면에 렌더링되고 사진 슬라이드가 동작한다

- [ ] **4-5. 호환성 점수 뱃지 컴포넌트**
  - `components/cards/CompatibilityBadge.tsx`: 점수에 따라 초록·주황·회색 색상 뱃지
  - 완료 조건: 80점→초록, 70점→주황, 50점→회색으로 올바르게 렌더링된다

- [ ] **4-6. 스와이프 애니메이션 구현**
  - Framer Motion으로 드래그·회전·오버레이(하트/X) 효과 구현
  - 완료 조건: 오른쪽 드래그 시 초록 하트, 왼쪽 드래그 시 빨간 X가 나타나고 카드가 사라진다

- [ ] **4-7. 스와이프 액션 저장**
  - Like/Pass 시 `swipes` 테이블에 저장, Like 시 상대방도 Like했는지 확인해 매칭 생성
  - 완료 조건: 스와이프 후 `swipes` 테이블에 기록이 생기고, 양쪽 Like면 `matches` 테이블에 생성된다

- [ ] **4-8. 매칭 팝업**
  - 양쪽 Like 감지 시 "매칭됐어요!" 팝업 표시, 채팅 시작 버튼
  - 완료 조건: 매칭 성사 시 팝업이 뜨고 "채팅 시작" 버튼으로 채팅방으로 이동한다

- [ ] **4-9. 호환성 점수 상세 팝업**
  - 카드 탭 시 항목별(에너지·성격·시간대·체급·카페) 점수 목록 표시
  - 완료 조건: 카드를 탭하면 5개 항목 점수가 표시된 팝업이 열린다

- [ ] **4-10. 필터 패널**
  - `components/discovery/FilterPanel.tsx`: 거리·종·나이·성별·시간대·카페 선호 필터
  - 완료 조건: 필터 적용 시 카드 목록이 조건에 맞게 바뀐다

- [ ] **4-11. 카드 없음 상태 처리**
  - 더 이상 스와이프할 카드가 없을 때 안내 메시지 표시
  - 완료 조건: 카드가 0장일 때 "주변에 더 이상 카드가 없어요" 화면이 표시된다

---

## Phase 5 — 채팅 & 약속

> 목표: 매칭된 상대와 실시간으로 채팅하고 산책 약속을 잡을 수 있다

- [ ] **5-1. 채팅방 실시간 구독 훅**
  - `hooks/useChat.ts`: Supabase Realtime으로 `messages` 테이블 구독, 새 메시지 수신
  - 완료 조건: 다른 브라우저 탭에서 보낸 메시지가 1초 이내에 수신된다

- [ ] **5-2. 채팅방 UI**
  - `app/(main)/chat/[matchId]/page.tsx`: 메시지 목록·입력창·전송 버튼
  - 완료 조건: 메시지를 입력하고 전송하면 화면에 즉시 표시된다

- [ ] **5-3. 이미지 전송**
  - 채팅창에서 이미지 선택 → Supabase Storage 업로드 → URL을 메시지로 전송
  - 완료 조건: 이미지를 전송하면 채팅창에 이미지 썸네일이 표시된다

- [ ] **5-4. 읽음 표시**
  - 상대방이 메시지를 읽으면 `is_read` 업데이트, 내 메시지에 읽음 표시
  - 완료 조건: 상대방이 채팅방을 열면 내 메시지에 읽음 표시가 나타난다

- [ ] **5-5. 첫 만남 안전 체크리스트 카드**
  - 채팅방 진입 시 자동으로 체크리스트 카드 삽입 (예방접종·장소·친화도·중성화 확인)
  - 모든 항목 체크 완료 전까지 약속 카드 전송 버튼 비활성화
  - 완료 조건: 체크리스트가 미완료이면 약속 카드 버튼이 비활성화된다

- [ ] **5-6. 산책 약속 카드 전송**
  - 날짜·시간·장소 입력 후 약속 카드를 채팅에 전송, `appointments` 테이블에 저장
  - 완료 조건: 약속 카드가 채팅창에 나타나고 DB에 `PENDING` 상태로 저장된다

- [ ] **5-7. 약속 카드 수락**
  - 상대방이 약속 카드의 "수락" 버튼을 누르면 `CONFIRMED` 상태로 변경
  - 완료 조건: 수락 후 카드 상태가 "확정됨"으로 바뀐다

- [ ] **5-8. 탭 타이틀 알림**
  - 채팅창이 비활성 탭일 때 새 메시지가 오면 브라우저 탭 타이틀에 `(1) PetMatch` 표시
  - 완료 조건: 다른 탭에 있을 때 메시지가 오면 탭 타이틀이 바뀐다

---

## Phase 6 — 매칭 목록 & 부가 기능

> 목표: 내 매칭 전체를 보고 신고·차단·프로필 수정이 가능하다

- [ ] **6-1. 매칭 목록 화면**
  - `app/(main)/matches/page.tsx`: 내 매칭 목록, 최근 메시지 미리보기, 읽지 않은 메시지 수
  - 완료 조건: 매칭 목록이 표시되고 항목 클릭 시 채팅방으로 이동한다

- [ ] **6-2. 신고·차단 기능**
  - 카드·채팅방에서 신고/차단 메뉴 접근, `reports` 테이블에 저장, 차단 시 Discovery에서 제외
  - 완료 조건: 차단한 사용자의 카드가 Discovery에 나타나지 않는다

- [ ] **6-3. 내 프로필 수정 화면**
  - `app/(main)/profile/page.tsx`: 보호자·반려동물 정보·사진·라이프스타일·목적 태그 수정
  - 완료 조건: 수정 저장 후 Discovery 카드에 변경된 내용이 반영된다

- [ ] **6-4. 하단 네비게이션 바**
  - `components/layout/BottomNav.tsx`: Discovery·Matches·프로필 탭 이동
  - 완료 조건: 세 탭을 누르면 올바른 페이지로 이동하고 현재 탭이 강조된다

---

## Phase 7 — 마무리

> 목표: 실사용 가능한 품질로 배포 완료

- [ ] **7-1. 반응형 UI 점검**
  - 모바일(375px)·태블릿(768px)·데스크톱(1280px) 세 크기에서 레이아웃 확인 및 수정
  - 완료 조건: 세 breakpoint 모두에서 깨지는 레이아웃이 없다

- [ ] **7-2. 로딩 상태 처리**
  - 데이터 로딩 중 스켈레톤 UI 또는 스피너 표시 (카드 목록·채팅·프로필)
  - 완료 조건: 네트워크 지연 시 빈 화면 대신 로딩 UI가 표시된다

- [ ] **7-3. 에러 상태 처리**
  - Supabase 오류·네트워크 오류 시 사용자에게 읽기 쉬운 에러 메시지 표시
  - 완료 조건: 네트워크를 끊으면 "연결을 확인해주세요" 메시지가 표시된다

- [ ] **7-4. Vercel 환경변수 등록**
  - Vercel 대시보드에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 등록
  - 완료 조건: 배포된 URL에서 로그인이 정상 작동한다

- [ ] **7-5. 최종 배포 및 QA**
  - 핵심 사용자 여정 전체를 배포 환경에서 직접 테스트
  - 완료 조건: 가입→온보딩→스와이프→매칭→채팅→약속 흐름이 끊김 없이 작동한다

---

## 진행 현황 요약

| Phase | 내용 | 작업 수 | 상태 |
|-------|------|---------|------|
| Phase 0 | 셋업 | 8개 | ⬜ 미시작 |
| Phase 1 | 인증 | 6개 | ⬜ 미시작 |
| Phase 2 | DB 스키마 | 10개 | ⬜ 미시작 |
| Phase 3 | 온보딩·프로필 | 8개 | ⬜ 미시작 |
| Phase 4 | Discovery | 11개 | ⬜ 미시작 |
| Phase 5 | 채팅·약속 | 8개 | ⬜ 미시작 |
| Phase 6 | 매칭·부가 기능 | 4개 | ⬜ 미시작 |
| Phase 7 | 마무리 | 5개 | ⬜ 미시작 |
| **합계** | | **60개** | |
