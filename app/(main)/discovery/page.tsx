"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useDiscovery } from "@/hooks/useDiscovery";
import { SwipeCard } from "@/components/cards/SwipeCard";
import { FilterPanel } from "@/components/discovery/FilterPanel";
import { CompatibilityBadge } from "@/components/cards/CompatibilityBadge";
import { Chip } from "@/components/ui/Chip";
import { ActionButton } from "@/components/ui/ActionButton";
import type { DiscoveryFilters, DiscoveryPet } from "@/hooks/useDiscovery";

const SWIPE_THRESHOLD = 100;
type SortKey = "match" | "distance" | "recent";

const SCORE_LABELS: Record<string, string> = {
  energy: "⚡ 에너지 레벨",
  personality: "🐾 성격 궁합",
  timeSlot: "🕐 산책 시간대",
  size: "⚖️ 체급 매칭",
  cafe: "☕ 카페 선호",
};
const SCORE_MAX: Record<string, number> = {
  energy: 20, personality: 20, timeSlot: 25, size: 15, cafe: 20,
};

export default function DiscoveryPage() {
  const router = useRouter();
  const [filters, setFilters]           = useState<DiscoveryFilters>({});
  const [showFilter, setShowFilter]     = useState(false);
  const [sortBy, setSortBy]             = useState<SortKey>("match");
  const [scoreDetail, setScoreDetail]   = useState<DiscoveryPet | null>(null);
  const [matchedPet, setMatchedPet]     = useState<DiscoveryPet | null>(null);
  const [matchId, setMatchId]           = useState<string | null>(null);

  const { cards, setCards, loading, myPetId } = useDiscovery(filters);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const passOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const handleSwipe = useCallback(async (action: "LIKE" | "PASS") => {
    if (!myPetId || cards.length === 0) return;
    const top = cards[0];

    setCards((prev) => prev.slice(1));
    x.set(0);

    const supabase = createClient();
    await supabase.from("swipes").insert({
      swiper_id: myPetId,
      swiped_id: top.pet.id,
      action,
    });

    if (action === "LIKE") {
      const { data: mutual } = await supabase
        .from("swipes")
        .select("id")
        .eq("swiper_id", top.pet.id)
        .eq("swiped_id", myPetId)
        .eq("action", "LIKE")
        .single();

      if (mutual) {
        const { data: match } = await supabase
          .from("matches")
          .insert({ pet1_id: myPetId, pet2_id: top.pet.id })
          .select()
          .single();
        if (match) {
          setMatchedPet(top);
          setMatchId(match.id as string);
        }
      }
    }
  }, [cards, myPetId, setCards, x]);

  async function onDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x > SWIPE_THRESHOLD) await handleSwipe("LIKE");
    else if (info.offset.x < -SWIPE_THRESHOLD) await handleSwipe("PASS");
    else x.set(0);
  }

  return (
    <div
      style={{
        height: "100dvh",
        maxHeight: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at 8% 6%, rgba(244,111,117,0.18), transparent 22rem)," +
          "radial-gradient(circle at 92% 8%, rgba(168,216,185,0.22), transparent 22rem)," +
          "linear-gradient(135deg, var(--cream), #fffaf2 42%, #f7dec4)",
        overflow: "hidden",
      }}
    >
      {/* 헤더 */}
      <div style={{ padding: "18px 22px 6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div className="label-mini" style={{ marginBottom: 2 }}>오늘의 PetMatch</div>
            <h1 className="h-serif" style={{ margin: 0, fontSize: 32, fontWeight: 700, color: "var(--ink)" }}>
              탐색
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setShowFilter(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.66)",
              border: "1px solid var(--line)",
              borderRadius: 999,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 800,
              color: "var(--brown)",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(74,49,40,0.06)",
            }}
          >
            🔍 필터
          </button>
        </div>

        {/* 정렬 카테고리 칩 */}
        <div style={{ display: "flex", gap: 6, marginTop: 14, overflowX: "auto" }} className="hide-scrollbar">
          <Chip variant={sortBy === "match" ? "coral" : "latte"} active={sortBy === "match"} onClick={() => setSortBy("match")}>
            궁합 높은 순
          </Chip>
          <Chip variant={sortBy === "distance" ? "coral" : "latte"} active={sortBy === "distance"} onClick={() => setSortBy("distance")}>
            거리순
          </Chip>
          <Chip variant={sortBy === "recent" ? "coral" : "latte"} active={sortBy === "recent"} onClick={() => setSortBy("recent")}>
            최근 접속
          </Chip>
          {cards.length > 0 && (
            <span style={{ marginLeft: "auto", alignSelf: "center", fontSize: 12, color: "var(--pm-muted)", fontWeight: 700, whiteSpace: "nowrap" }}>
              {cards.length}마리
            </span>
          )}
        </div>
      </div>

      {/* 카드 영역 */}
      <div style={{ flex: 1, position: "relative", margin: "14px 18px 0" }}>
        {loading ? (
          <LoadingSkeleton />
        ) : cards.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* 뒤쪽 카드 스택 */}
            {cards.slice(1, 3).map((card, i) => (
              <div
                key={card.pet.id}
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `scale(${1 - (i + 1) * 0.04}) translateY(${(i + 1) * 10}px)`,
                  transformOrigin: "bottom center",
                  zIndex: 2 - i,
                  borderRadius: 34,
                  overflow: "hidden",
                  pointerEvents: "none",
                  filter: "brightness(0.96)",
                }}
              >
                <SwipeCard data={card} onTap={() => {}} />
              </div>
            ))}

            {/* 맨 위 드래그 카드 */}
            <motion.div
              key={cards[0].pet.id}
              style={{ position: "absolute", inset: 0, zIndex: 10, x, rotate }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={onDragEnd}
            >
              <SwipeCard
                data={cards[0]}
                onTap={() => setScoreDetail(cards[0])}
                onBlock={(ownerId) => setCards((prev) => prev.filter((c) => c.owner.id !== ownerId))}
              />
              <motion.div style={{ position: "absolute", inset: 0, borderRadius: 34, background: "rgba(168,216,185,0.6)", opacity: likeOpacity, pointerEvents: "none", display: "grid", placeItems: "center" }}>
                <span style={{ fontSize: 90 }}>❤️</span>
              </motion.div>
              <motion.div style={{ position: "absolute", inset: 0, borderRadius: 34, background: "rgba(244,111,117,0.6)", opacity: passOpacity, pointerEvents: "none", display: "grid", placeItems: "center" }}>
                <span style={{ fontSize: 90 }}>✕</span>
              </motion.div>
            </motion.div>
          </>
        )}
      </div>

      {/* 액션 버튼 */}
      {!loading && cards.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 18, padding: "20px 0 14px" }}>
          <ActionButton variant="pass" size={56} onClick={() => handleSwipe("PASS")} ariaLabel="PASS">✕</ActionButton>
          <ActionButton variant="primary" size={70} onClick={() => handleSwipe("LIKE")} ariaLabel="LIKE">🐾</ActionButton>
          <ActionButton variant="like" size={56} onClick={() => handleSwipe("LIKE")} ariaLabel="LIKE">❤</ActionButton>
        </div>
      )}

      {/* 필터 패널 */}
      {showFilter && (
        <FilterPanel
          filters={filters}
          onApply={(f) => setFilters(f)}
          onClose={() => setShowFilter(false)}
        />
      )}

      {/* 점수 상세 팝업 */}
      <AnimatePresence>
        {scoreDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(43,29,24,0.55)", display: "flex", alignItems: "flex-end" }}
            onClick={() => setScoreDetail(null)}
          >
            <motion.div
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              style={{ width: "100%", maxWidth: 430, margin: "0 auto", background: "var(--cream)", borderRadius: "32px 32px 0 0", padding: "20px 22px 36px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ width: 44, height: 5, borderRadius: 99, background: "var(--line)", margin: "0 auto 16px" }} />
              <div className="label-mini" style={{ marginBottom: 4 }}>호환성 분석</div>
              <h2 className="h-serif" style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>
                {scoreDetail.pet.name}와의 궁합
              </h2>
              <div style={{ marginBottom: 18 }}>
                <CompatibilityBadge score={scoreDetail.score.total} />
              </div>
              {(["energy", "personality", "timeSlot", "size", "cafe"] as const).map((key) => {
                const val = scoreDetail.score[key];
                const max = SCORE_MAX[key];
                const pct = Math.round((val / max) * 100);
                return (
                  <div key={key} style={{ marginBottom: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--brown)" }}>{SCORE_LABELS[key]}</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: "var(--ink)" }}>{val}/{max}</span>
                    </div>
                    <div style={{ height: 8, background: "var(--latte-soft)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: 8, width: `${pct}%`, background: pct >= 80 ? "var(--matcha)" : pct >= 50 ? "var(--latte)" : "#c4b5ad", borderRadius: 99, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => setScoreDetail(null)}
                style={{ width: "100%", marginTop: 12, padding: 16, borderRadius: 999, background: "var(--coral)", color: "#fff", fontWeight: 950, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 16px 28px rgba(244,111,117,0.32)" }}
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 매칭 팝업 */}
      <AnimatePresence>
        {matchedPet && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(43,29,24,0.72)", display: "grid", placeItems: "center", padding: 24 }}
          >
            <div style={{ background: "var(--cream)", borderRadius: 36, padding: "32px 24px", textAlign: "center", maxWidth: 340, width: "100%", boxShadow: "0 32px 80px rgba(43,29,24,0.4)" }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
              <h2 className="h-serif" style={{ margin: "0 0 8px", fontSize: 36, fontWeight: 700, color: "var(--ink)" }}>
                It is a Match
              </h2>
              <p style={{ margin: "0 0 22px", fontSize: 14, color: "var(--pm-muted)", lineHeight: 1.5 }}>
                {matchedPet.pet.name}와 카페·산책 취향이 잘 맞아요
              </p>
              <CompatibilityBadge score={matchedPet.score.total} />
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => { setMatchedPet(null); setMatchId(null); }}
                  style={{ flex: 1, padding: 14, borderRadius: 999, background: "rgba(255,255,255,0.66)", color: "var(--brown)", fontWeight: 800, fontSize: 14, border: "1px solid var(--line)", cursor: "pointer" }}
                >
                  계속 탐색
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/chat/${matchId}`)}
                  style={{ flex: 1, padding: 14, borderRadius: 999, background: "var(--coral)", color: "#fff", fontWeight: 950, fontSize: 14, border: "none", cursor: "pointer", boxShadow: "0 16px 28px rgba(244,111,117,0.32)" }}
                >
                  💬 채팅 시작
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: 34, background: "linear-gradient(135deg, var(--latte-soft), #fff 70%)", display: "grid", placeItems: "center", border: "1px solid var(--line)" }}>
      <div style={{ fontSize: 50, animation: "pulse 1.5s infinite" }}>🐾</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: 34, background: "rgba(255,255,255,0.55)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24 }}>
      <div style={{ fontSize: 64 }}>🌙</div>
      <h3 className="h-serif" style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--ink)", textAlign: "center" }}>
        오늘의 카드를<br />모두 확인했어요
      </h3>
      <p style={{ margin: 0, fontSize: 13, color: "var(--pm-muted)", textAlign: "center", lineHeight: 1.5 }}>
        내일 다시 와보거나<br />필터를 조정해보세요
      </p>
    </div>
  );
}
