"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface MatchRow {
  id: string;
  otherPetName: string;
  otherPetPhoto: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: myPet } = await supabase.from("pets").select("id").eq("owner_id", user.id).single();
    if (!myPet) { setLoading(false); return; }

    const { data: matchRows } = await supabase
      .from("matches")
      .select("id, pet1_id, pet2_id, matched_at")
      .or(`pet1_id.eq.${myPet.id},pet2_id.eq.${myPet.id}`)
      .order("matched_at", { ascending: false });

    if (!matchRows) { setLoading(false); return; }

    const rows: MatchRow[] = await Promise.all(matchRows.map(async (m) => {
      const otherPetId = m.pet1_id === myPet.id ? m.pet2_id : m.pet1_id;
      const { data: pet } = await supabase.from("pets").select("name, photos").eq("id", otherPetId as string).single();

      const { data: lastMsgRows } = await supabase
        .from("messages").select("content, image_url, created_at").eq("match_id", m.id)
        .order("created_at", { ascending: false }).limit(1);
      const lastMsg = lastMsgRows?.[0];

      const { count } = await supabase
        .from("messages").select("id", { count: "exact", head: true })
        .eq("match_id", m.id).eq("is_read", false).neq("sender_id", user.id);

      return {
        id: m.id as string,
        otherPetName: (pet?.name as string) ?? "알 수 없음",
        otherPetPhoto: ((pet?.photos as string[])?.[0]) ?? "",
        lastMessage: lastMsg?.image_url ? "📷 사진" : (lastMsg?.content as string) ?? "매칭됐어요!",
        lastTime: (lastMsg?.created_at ?? m.matched_at) as string,
        unread: count ?? 0,
      };
    }));

    setMatches(rows);
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100%", background: "var(--cream)" }}>
      <div style={{ padding: "16px 20px 8px" }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: "#2b1d18" }}>💬 매칭</span>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60, color: "#8c7568" }}>불러오는 중...</div>
      ) : matches.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60dvh", gap: 12 }}>
          <span style={{ fontSize: 52 }}>🐾</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#2b1d18" }}>아직 매칭이 없어요</span>
          <span style={{ fontSize: 13, color: "#8c7568" }}>탐색 화면에서 좋아요를 눌러보세요</span>
        </div>
      ) : (
        <div style={{ padding: "4px 0" }}>
          {matches.map((m) => (
            <button
              key={m.id}
              onClick={() => router.push(`/chat/${m.id}`)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid var(--line)", textAlign: "left" }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                {m.otherPetPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.otherPetPhoto} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#e7b98a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🐾</div>
                )}
                {m.unread > 0 && (
                  <div style={{ position: "absolute", top: 0, right: 0, width: 18, height: 18, borderRadius: "50%", background: "var(--coral)", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {m.unread > 9 ? "9+" : m.unread}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#2b1d18" }}>{m.otherPetName}</span>
                  <span style={{ fontSize: 11, color: "#8c7568" }}>{timeAgo(m.lastTime)}</span>
                </div>
                <span style={{ fontSize: 13, color: m.unread > 0 ? "#2b1d18" : "#8c7568", fontWeight: m.unread > 0 ? 600 : 400, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.lastMessage}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
