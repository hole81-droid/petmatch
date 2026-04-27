// Supabase 테이블 타입 — Phase 2에서 실제 스키마로 교체

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
