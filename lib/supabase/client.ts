import { createBrowserClient } from "@supabase/ssr";

// 타입은 각 쿼리에서 types/database.ts 타입으로 명시적 캐스팅
// supabase gen types 실행 후 Database 제네릭으로 교체 예정
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
