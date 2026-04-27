"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message, Appointment } from "@/types/database";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useChat(matchId: string) {
  const [messages, setMessages]       = useState<Message[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userId, setUserId]           = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [unread, setUnread]           = useState(0);
  const channelRef                    = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    void init();
    return () => { channelRef.current?.unsubscribe(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  // Tab title notification
  useEffect(() => {
    if (unread > 0) {
      document.title = `(${unread}) PetMatch`;
    } else {
      document.title = "PetMatch";
    }
    return () => { document.title = "PetMatch"; };
  }, [unread]);

  async function init() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [{ data: msgRows }, { data: apptRows }] = await Promise.all([
      supabase.from("messages").select("*").eq("match_id", matchId).order("created_at", { ascending: true }),
      supabase.from("appointments").select("*").eq("match_id", matchId).order("created_at", { ascending: true }),
    ]);

    setMessages((msgRows ?? []) as Message[]);
    setAppointments((apptRows ?? []) as Appointment[]);
    setLoading(false);

    // Mark incoming messages as read
    await supabase.from("messages")
      .update({ is_read: true })
      .eq("match_id", matchId)
      .neq("sender_id", user.id)
      .eq("is_read", false);

    // Realtime subscription
    const channel = supabase.channel(`chat:${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => [...prev, msg]);
          if (msg.sender_id !== user.id) {
            if (document.hidden) {
              setUnread((n) => n + 1);
            } else {
              void supabase.from("messages").update({ is_read: true }).eq("id", msg.id);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "appointments", filter: `match_id=eq.${matchId}` },
        (payload) => {
          setAppointments((prev) => [...prev, payload.new as Appointment]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "appointments", filter: `match_id=eq.${matchId}` },
        (payload) => {
          setAppointments((prev) =>
            prev.map((a) => a.id === (payload.new as Appointment).id ? payload.new as Appointment : a)
          );
        }
      )
      .subscribe();

    channelRef.current = channel;
  }

  const sendMessage = useCallback(async (content: string) => {
    if (!userId || !content.trim()) return;
    const supabase = createClient();
    await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: userId,
      content: content.trim(),
    });
  }, [matchId, userId]);

  const sendImage = useCallback(async (file: File) => {
    if (!userId) return;
    const supabase = createClient();
    const ext  = file.name.split(".").pop();
    const path = `${matchId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("chat-images").upload(path, file);
    if (error) return;
    const { data: { publicUrl } } = supabase.storage.from("chat-images").getPublicUrl(path);
    await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: userId,
      content: "",
      image_url: publicUrl,
    });
  }, [matchId, userId]);

  const sendAppointment = useCallback(async (scheduledAt: string, locationName: string) => {
    const supabase = createClient();
    await supabase.from("appointments").insert({
      match_id: matchId,
      scheduled_at: scheduledAt,
      location_name: locationName,
      status: "PENDING",
    });
  }, [matchId]);

  const confirmAppointment = useCallback(async (apptId: string) => {
    const supabase = createClient();
    await supabase.from("appointments").update({ status: "CONFIRMED" }).eq("id", apptId);
  }, []);

  const cancelAppointment = useCallback(async (apptId: string) => {
    const supabase = createClient();
    await supabase.from("appointments").update({ status: "CANCELLED" }).eq("id", apptId);
  }, []);

  function clearUnread() { setUnread(0); }

  return { messages, appointments, userId, loading, unread, sendMessage, sendImage, sendAppointment, confirmAppointment, cancelAppointment, clearUnread };
}
