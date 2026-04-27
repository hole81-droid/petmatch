"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { SafetyChecklist } from "@/components/chat/SafetyChecklist";
import { AppointmentCard } from "@/components/chat/AppointmentCard";
import type { Appointment } from "@/types/database";

interface MatchInfo {
  id: string;
  safety_check_done: boolean;
  otherPetName: string;
  otherPetPhoto: string;
}

interface ApptModalState {
  date: string;
  time: string;
  location: string;
}

type TimelineItem =
  | { kind: "msg"; id: string; created_at: string }
  | { kind: "appt"; id: string; created_at: string };

export default function ChatPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const router = useRouter();

  const { messages, appointments, userId, loading, sendMessage, sendImage, sendAppointment, confirmAppointment, cancelAppointment, clearUnread } =
    useChat(matchId);

  const [matchInfo, setMatchInfo]     = useState<MatchInfo | null>(null);
  const [safetyDone, setSafetyDone]   = useState(true);
  const [text, setText]               = useState("");
  const [showApptModal, setShowApptModal] = useState(false);
  const [apptForm, setApptForm]       = useState<ApptModalState>({ date: "", time: "", location: "" });
  const [sending, setSending]         = useState(false);
  const bottomRef                     = useRef<HTMLDivElement>(null);
  const fileRef                       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadMatch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, appointments]);

  useEffect(() => {
    clearUnread();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMatch() {
    const supabase = createClient();
    const { data: match } = await supabase
      .from("matches")
      .select("id, safety_check_done, pet1_id, pet2_id")
      .eq("id", matchId)
      .single();
    if (!match) return;

    setSafetyDone(match.safety_check_done as boolean);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: myPet } = await supabase.from("pets").select("id").eq("owner_id", user.id).single();
    const otherPetId = myPet?.id === match.pet1_id ? match.pet2_id : match.pet1_id;

    const { data: otherPet } = await supabase.from("pets").select("name, photos").eq("id", otherPetId as string).single();

    setMatchInfo({
      id: match.id as string,
      safety_check_done: match.safety_check_done as boolean,
      otherPetName: (otherPet?.name as string) ?? "상대방",
      otherPetPhoto: ((otherPet?.photos as string[])?.[0]) ?? "",
    });
  }

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    await sendMessage(text);
    setText("");
    setSending(false);
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await sendImage(file);
    e.target.value = "";
  }

  async function handleApptSubmit() {
    if (!apptForm.date || !apptForm.time || !apptForm.location.trim()) return;
    const scheduledAt = new Date(`${apptForm.date}T${apptForm.time}`).toISOString();
    await sendAppointment(scheduledAt, apptForm.location.trim());
    setShowApptModal(false);
    setApptForm({ date: "", time: "", location: "" });
  }

  // Merge messages + appointments into a single timeline sorted by created_at
  const timeline: TimelineItem[] = [
    ...messages.map((m) => ({ kind: "msg" as const, id: m.id, created_at: m.created_at })),
    ...appointments.map((a) => ({ kind: "appt" as const, id: a.id, created_at: a.created_at })),
  ].sort((a, b) => a.created_at.localeCompare(b.created_at));

  const msgMap  = new Map(messages.map((m) => [m.id, m]));
  const apptMap = new Map(appointments.map((a) => [a.id, a]));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#f5ede4" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px 10px", background: "rgba(255,247,237,0.95)", backdropFilter: "blur(12px)", borderBottom: "1.5px solid var(--line)" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#4a3128", padding: 4 }}>‹</button>
        {matchInfo?.otherPetPhoto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={matchInfo.otherPetPhoto} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#2b1d18" }}>{matchInfo?.otherPetName ?? "채팅"}</div>
          <div style={{ fontSize: 11, color: "#8c7568" }}>매칭된 친구</div>
        </div>
      </div>

      {/* Safety checklist */}
      {!loading && !safetyDone && (
        <SafetyChecklist matchId={matchId} onComplete={() => setSafetyDone(true)} />
      )}

      {/* Message list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40, color: "#8c7568", fontSize: 13 }}>불러오는 중...</div>
        ) : timeline.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60%", gap: 8 }}>
            <span style={{ fontSize: 40 }}>🐾</span>
            <span style={{ fontSize: 14, color: "#8c7568" }}>첫 인사를 건네보세요!</span>
          </div>
        ) : (
          timeline.map((item) => {
            if (item.kind === "msg") {
              const m = msgMap.get(item.id)!;
              return (
                <div key={item.id} style={{ padding: "0 16px" }}>
                  <ChatMessage msg={m} isMine={m.sender_id === userId} />
                </div>
              );
            }
            const a = apptMap.get(item.id) as Appointment;
            return (
              <AppointmentCard
                key={item.id}
                appt={a}
                isMine={false}
                onConfirm={() => confirmAppointment(a.id)}
                onCancel={() => cancelAppointment(a.id)}
              />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{ background: "rgba(255,247,237,0.97)", borderTop: "1.5px solid var(--line)", padding: "10px 12px", paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))" }}>
        {safetyDone && (
          <button
            onClick={() => setShowApptModal(true)}
            style={{ fontSize: 11, fontWeight: 700, color: "var(--coral)", background: "rgba(244,111,117,0.08)", border: "1px solid rgba(244,111,117,0.3)", borderRadius: 8, padding: "4px 10px", marginBottom: 8, cursor: "pointer" }}
          >
            📅 약속 잡기
          </button>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <button
            onClick={() => fileRef.current?.click()}
            style={{ width: 40, height: 40, borderRadius: 12, background: "var(--latte-soft)", border: "none", fontSize: 18, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            📷
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} style={{ display: "none" }} />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
            placeholder="메시지 입력..."
            rows={1}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 20, border: "1.5px solid var(--line)", fontSize: 14, resize: "none", outline: "none", background: "#fff", color: "#2b1d18", lineHeight: 1.4, maxHeight: 100, overflowY: "auto" }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            style={{ width: 40, height: 40, borderRadius: 12, background: text.trim() ? "var(--coral)" : "var(--latte-soft)", border: "none", fontSize: 18, cursor: text.trim() ? "pointer" : "default", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
          >
            ➤
          </button>
        </div>
      </div>

      {/* Appointment modal */}
      {showApptModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(43,29,24,0.5)", display: "flex", alignItems: "flex-end" }}
          onClick={() => setShowApptModal(false)}
        >
          <div
            style={{ width: "100%", maxWidth: 430, margin: "0 auto", background: "#fff7ed", borderRadius: "24px 24px 0 0", padding: "20px 20px 40px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: "#2b1d18", marginBottom: 16 }}>📅 산책 약속 잡기</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#8c7568", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>날짜</label>
              <input
                type="date"
                value={apptForm.date}
                onChange={(e) => setApptForm({ ...apptForm, date: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1.5px solid var(--line)", fontSize: 14, color: "#2b1d18", background: "#fff", outline: "none" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#8c7568", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>시간</label>
              <input
                type="time"
                value={apptForm.time}
                onChange={(e) => setApptForm({ ...apptForm, time: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1.5px solid var(--line)", fontSize: 14, color: "#2b1d18", background: "#fff", outline: "none" }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#8c7568", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>장소</label>
              <input
                type="text"
                placeholder="예: 월드컵공원 입구"
                value={apptForm.location}
                onChange={(e) => setApptForm({ ...apptForm, location: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1.5px solid var(--line)", fontSize: 14, color: "#2b1d18", background: "#fff", outline: "none" }}
              />
            </div>
            <button
              onClick={handleApptSubmit}
              disabled={!apptForm.date || !apptForm.time || !apptForm.location.trim()}
              style={{ width: "100%", padding: 14, borderRadius: 18, background: apptForm.date && apptForm.time && apptForm.location.trim() ? "var(--coral)" : "#e7b98a60", color: apptForm.date && apptForm.time && apptForm.location.trim() ? "#fff" : "#8c7568", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer" }}
            >
              약속 카드 전송
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
