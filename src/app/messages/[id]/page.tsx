"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Send, Lock } from "lucide-react";
import type { Message, Profile, Connection } from "@/lib/types";

export default function MessagesRoom() {
  const params = useParams();
  const router = useRouter();
  const connectionId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connection, setConnection] = useState<Connection | null>(null);
  const [host, setHost] = useState<Profile | null>(null);
  const [userId, setUserId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return router.push("/login");
      setUserId(user.id);
    });

    supabase
      .from("connections")
      .select("*, host:host_id(*)")
      .eq("id", connectionId)
      .single()
      .then(({ data }) => {
        if (data) {
          setConnection(data as unknown as Connection);
          setHost((data as any).host as Profile);
        }
      });

    supabase
      .from("messages")
      .select("*")
      .eq("connection_id", connectionId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data || []));

    const sub = supabase
      .channel(`messages:${connectionId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `connection_id=eq.${connectionId}` },
        (payload) => setMessages((m) => [...m, payload.new as Message])
      )
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [connectionId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !userId) return;
    await supabase.from("messages").insert({
      connection_id: connectionId,
      sender_id: userId,
      content: input.trim(),
    });
    setInput("");
  }

  const locked = connection && connection.tasks_completed < 5;

  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <header className="sticky top-0 z-40 glass-strong">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
          <img src={host?.photos?.[0] || ""} alt="" className="w-8 h-8 rounded-full object-cover" />
          <div className="flex-1">
            <h1 className="text-[17px] font-display font-semibold">{host?.name}</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 overflow-y-auto space-y-3">
        {locked && (
          <div className="text-center py-10 space-y-2">
            <Lock className="w-8 h-8 text-text-muted mx-auto" strokeWidth={1.5} />
            <p className="text-sm text-text-muted">Messages unlock after 5 intentions</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-[16px] text-sm ${
              msg.sender_id === userId
                ? "bg-accent text-bg rounded-br-[4px]"
                : "bg-surface-elevated text-text/90 rounded-bl-[4px] border-[0.5px] border-border"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {!locked && (
        <div className="sticky bottom-0 glass-strong border-t-[0.5px] border-border p-4">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Write..." className="flex-1 h-12 px-5 rounded-full bg-surface-elevated border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all" />
            <button onClick={handleSend} disabled={!input.trim()}
              className="w-12 h-12 rounded-full bg-accent flex items-center justify-center disabled:opacity-30 transition-all">
              <Send className="w-5 h-5 text-bg" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
