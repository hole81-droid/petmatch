"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useDiscovery } from "@/hooks/useDiscovery";
import { SwipeCard } from "@/components/cards/SwipeCard";
import { FilterPanel } from "@/components/discovery/FilterPanel";
import { CompatibilityBadge } from "@/components/cards/CompatibilityBadge";
import type { DiscoveryFilters, DiscoveryPet } from "@/hooks/useDiscovery";

const SWIPE_THRESHOLD = 100;

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
  const [scoreDetail, setScoreDetail]   = useState<DiscoveryPet | null>(null);
  const [matchedPet, setMatchedPet]     = useState<DiscoveryPet | null>(null);
  const [matchId, setMatchId]           = useState<string | null>(null);

  const { cards, setCards, loading, myPetId } = useDiscovery(filters);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18]);
  const likeOpacity   = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const passOpacity   = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

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
      // Check if mutual like
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
    if (info.offset.x > SWIPE_THRESHOLD) {
      await handleSwipe("LIKE");
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      await handleSwipe("PASS");
    } else {
      x.set(0);
    }
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--cream)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 8px" }}>
        <div>
          <span style={{ fontSize: 22, fontWeight: 900, color: "#2b1d18" }}>🐾 탐색</span>
          {cards.length > 0 && (
            <span style={{ fontSize: 12, color: "#8c7568", marginLeft: 8 }}>{cards.length}마리</span>
          )}
        </div>
        <button
          onClick={() => setShowFilter(true)}
          style={{ background: "var(--latte-soft)", border: "none", borderRadius: 12, padding: "8px 14px", fontSize: 13, fontWeight: 700, color: "var(--brown)", cursor: "pointer" }}
        >
          🔍 필터
        </button>
      </div>

      {/* Card area */}
      <div style={{ flex: 1, position: "relative", margin: "0 16px" }}>
        {loading ? (
          <LoadingSkeleton />
        ) : cards.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Background cards (stack effect) */}
            {cards.slice(1, 3).map((card, i) => (
              <div
                key={card.pet.id}
                style={{
                  position: "absolute", inset: 0,
                  transform: `scale(${1 - (i + 1) * 0.04}) translateY(${(i + 1) * 8}px)`,
                  transformOrigin: "bottom center",
                  zIndex: 2 - i,
                  borderRadius: 24,
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
                <SwipeCard data={card} onTap={() => {}} />
              </div>
            ))}

            {/* Top card — draggable */}
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
              <motion.div style={{ position: "absolute", inset: 0, borderRadius: 24, background: "rgba(168,216,185,0.6)", opacity: likeOpacity, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 64 }}>❤️</span>
              </motion.div>
              <motion.div style={{ position: "absolute", inset: 0, borderRadius: 24, background: "rgba(244,111,117,0.6)", opacity: passOpacity, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 64 }}>✕</span>
              </motion.div>
            </motion.div>
          </>
        )}
      </div>

      {/* Action buttons */}
      {!loading && cards.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 24, padding: "16px 0 20px" }}>
          <ActionBtn onClick={() => handleSwipe("PASS")} emoji="✕" color="#f46f75" size={56} />
          <ActionBtn onClick={() => handleSwipe("LIKE")} emoji="❤️" color="#a8d8b9" size={68} />
        </div>
      )}

      {/* Filter panel */}
      {showFilter && (
        <FilterPanel
          filters={filters}
          onApply={(f) => setFilters(f)}
          onClose={() => setShowFilter(false)}
        />
      )}

      {/* Score detail popup */}
      <AnimatePresence>
        {scoreDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(43,29,24,0.5)", display: "flex", alignItems: "flex-end" }}
            onClick={() => setScoreDetail(null)}
          >
            <motion.div
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              style={{ width: "100%", maxWidth: 430, margin: "0 auto", background: "#fff7ed", borderRadius: "24px 24px 0 0", padding: "20px 20px 40px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 17, fontWeight: 800, color: "#2b1d18", marginBottom: 4 }}>
                {scoreDetail.pet.name}와의 궁합
              </div>
              <div style={{ marginBottom: 16 }}>
                <CompatibilityBadge score={scoreDetail.score.total} />
              </div>
              {(["energy", "personality", "timeSlot", "size", "cafe"] as const).map((key) => {
                const val = scoreDetail.score[key];
                const max = SCORE_MAX[key];
                const pct = Math.round((val / max) * 100);
                return (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#4a3128" }}>{SCORE_LABELS[key]}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#2b1d18" }}>{val}/{max}</span>
                    </div>
                    <div style={{ height: 8, background: "#e7b98a40", borderRadius: 4 }}>
                      <div style={{ height: 8, width: `${pct}%`, background: pct >= 80 ? "#a8d8b9" : pct >= 50 ? "#f4c06f" : "#c4b5ad", borderRadius: 4, transition: "width 0.4s" }} />
                    </div>
                  </div>
                );
              })}
              <button onClick={() => setScoreDetail(null)} style={{ width: "100%", marginTop: 8, padding: 14, borderRadius: 18, background: "var(--coral)", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer" }}>
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match popup */}
      <AnimatePresence>
        {matchedPet && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(43,29,24,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          >
            <div style={{ background: "#fff7ed", borderRadius: 28, padding: "36px 24px", textAlign: "center", maxWidth: 340, width: "100%" }}>
              <div style={{ fontSize: 52, marginBottom: 8 }}>🎉</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#2b1d18", marginBottom: 6 }}>매칭됐어요!</div>
              <div style={{ fontSize: 15, color: "#8c7568", marginBottom: 24 }}>
                {matchedPet.pet.name}와 서로 좋아요를 눌렀어요
              </div>
              <CompatibilityBadge score={matchedPet.score.total} />
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button
                  onClick={() => { setMatchedPet(null); setMatchId(null); }}
                  style={{ flex: 1, padding: 14, borderRadius: 16, background: "#e7b98a40", color: "#4a3128", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}
                >
                  계속 탐색
                </button>
                <button
                  onClick={() => router.push(`/chat/${matchId}`)}
                  style={{ flex: 1, padding: 14, borderRadius: 16, background: "var(--coral)", color: "#fff", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", boxShadow: "0 6px 16px rgba(244,111,117,0.3)" }}
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

function ActionBtn({ onClick, emoji, color, size }: { onClick: () => void; emoji: string; color: string; size: number }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: size, height: size,
        borderRadius: "50%",
        background: "#fff",
        border: `2.5px solid ${color}`,
        fontSize: size * 0.42,
        cursor: "pointer",
        boxShadow: `0 6px 20px ${color}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {emoji}
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: "#e7b98a40", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 40, animation: "pulse 1.5s infinite" }}>🐾</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <div style={{ fontSize: 56 }}>🌙</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: "#2b1d18" }}>주변에 더 이상 카드가 없어요</div>
      <div style={{ fontSize: 13, color: "#8c7568", textAlign: "center" }}>
        내일 다시 와보거나<br />필터를 조정해보세요
      </div>
    </div>
  );
}
