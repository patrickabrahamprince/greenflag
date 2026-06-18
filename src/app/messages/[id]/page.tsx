"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Send, Lock, Camera } from "lucide-react";
import type { Message, Profile, Connection } from "@/lib/types";
import { requireOnboarded } from "@/lib/auth";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function MessagesRoom() {
  const params = useParams();
  const router = useRouter();
  const connectionId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connection, setConnection] = useState<Connection | null>(null);
  const [host, setHost] = useState<Profile | null>(null);
  const [userId, setUserId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [now, setNow] = useState(Date.now());
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    requireOnboarded().then((uid) => {
      if (!uid) { router.replace("/onboard"); return; }
      setUserId(uid);
    });

    supabase
      .from("connections")
      .select("*, host:host_id(*)")
      .eq("id", connectionId)
      .maybeSingle()
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

  // Subscribe to connection updates for unlocking chat without manual refresh
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // Ensure we have latest connection data for unlock status
    if (!connectionId) return;
    const connSub = supabase
      .channel(`connections:${connectionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'connections',
        filter: `id=eq.${connectionId}`,
      }, (payload) => {
        const updated = payload.new as Connection;
        setConnection(updated);
      })
      .subscribe();
    return () => { supabase.removeChannel(connSub); };
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

  async function handleCamera(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    const path = `chat/${connectionId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("proofs").upload(path, file);
    if (error) { setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("proofs").getPublicUrl(path);
    await supabase.from("messages").insert({
      connection_id: connectionId,
      sender_id: userId,
      content: publicUrl,
      message_type: "image",
    });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  if (!connection?.messages_unlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-bg text-center p-6">
        <Lock className="w-12 h-12 text-text-muted mb-4" />
        <h2 className="text-xl font-semibold mb-2">Messages unlock after 5 approved tasks</h2>
        <p className="text-sm text-text-muted">Complete {5 - (connection?.tasks_completed || 0)} more to chat</p>
      </div>
    );
  }

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
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] space-y-1 ${msg.sender_id === userId ? "items-end" : "items-start"}`}>
              {(msg as any).message_type === "image" ? (
                <img src={msg.content} alt="" className="max-w-full rounded-[16px] object-cover max-h-80"
                  onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
              ) : (
                <div className={`px-4 py-2.5 rounded-[16px] text-sm ${
                  msg.sender_id === userId
                    ? "bg-accent text-bg rounded-br-[4px]"
                    : "bg-surface-elevated text-text/90 rounded-bl-[4px] border-[0.5px] border-border"
                }`}>
                  {msg.content}
                </div>
              )}
              <p className={`text-[10px] text-text-muted/50 px-1 ${msg.sender_id === userId ? "text-right" : "text-left"}`}>
                {timeAgo(msg.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {
        <div className="sticky bottom-0 glass-strong border-t-[0.5px] border-border p-4">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-12 h-12 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center disabled:opacity-30 transition-all shrink-0">
              <Camera className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleCamera} className="hidden" />
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Write..." className="flex-1 h-12 px-5 rounded-full bg-surface-elevated border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all" />
            <button onClick={handleSend} disabled={!input.trim() || uploading}
              className="w-12 h-12 rounded-full bg-accent flex items-center justify-center disabled:opacity-30 transition-all shrink-0">
              {uploading ? <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5 text-bg" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      }
    </div>
  );
}
