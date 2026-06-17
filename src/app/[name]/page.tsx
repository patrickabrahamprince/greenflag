"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Lock, CheckCircle, Upload, Clock, MessageCircle } from "lucide-react";
import type { Profile, Test, Task, Connection } from "@/lib/types";

export default function StandardDetail() {
  const params = useParams();
  const router = useRouter();
  const nameSlug = params.name as string;
  const [host, setHost] = useState<Profile | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [userId, setUserId] = useState("");
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });

    supabase.from("profiles").select("*").then(({ data: profiles }) => {
      const match = (profiles || []).find(
        (p) => p.name?.toLowerCase() === nameSlug?.toLowerCase()
      );
      if (match) {
        setHost(match);
        supabase.from("tests").select("*").eq("host_id", match.id).maybeSingle().then(({ data: t }) => {
          if (t) {
            setTest(t);
            supabase.from("tasks").select("*").eq("test_id", t.id).order("day_number").then(({ data: ts }) => setTasks(ts || []));
          }
        });
      }
    });
  }, [nameSlug]);

  useEffect(() => {
    if (!userId || !test) return;
    supabase
      .from("connections")
      .select("*")
      .eq("guest_id", userId)
      .eq("test_id", test.id)
      .maybeSingle()
      .then(({ data }) => setConnection(data ?? null));
  }, [userId, test]);

  async function startConnection() {
    if (!userId) { setError("Please log in first"); return; }
    if (!test || !host) return;
    setStarting(true);
    setError("");
    try {
      const { data, error: err } = await supabase
        .from("connections")
        .insert({ guest_id: userId, host_id: host.id, test_id: test.id })
        .select()
        .single();
      if (err) { setError(err.message); return; }
      if (data) setConnection(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setStarting(false);
    }
  }

  async function submitTask(task: Task) {
    if (!connection || !test) return;
    setSubmitting(true);
    setError("");
    try {
      const { error: subErr } = await supabase.from("submissions").insert({
        connection_id: connection.id,
        task_id: task.id,
        day_number: task.day_number,
        proof_url: "https://i.pravatar.cc/400?img=12",
        status: "submitted",
      });
      if (subErr) { setError(subErr.message); return; }
      const next = Math.min(connection.tasks_completed + 1, 8);
      await supabase.from("connections").update({ tasks_completed: next, current_day: next + 1 }).eq("id", connection.id);
      setConnection({ ...connection, tasks_completed: next, current_day: next + 1 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (!host || !test) {
    return (
      <div className="min-h-dvh bg-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-[0.5px] border-accent/30 animate-pulse" />
      </div>
    );
  }

  const completed = connection?.tasks_completed || 0;
  const unlocked = completed >= 5;

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-40 glass-strong">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => router.push("/discover")} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
          <h1 className="text-[17px] font-display font-semibold">{host.name}&apos;s Standard</h1>
        </div>
      </header>

      <div className="px-4 py-6 pb-32">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <img src={host.photos?.[0] || ""} alt="" className="w-20 h-20 rounded-full object-cover" />
            <div>
              <h2 className="text-[22px] font-display font-semibold">{host.name}, {host.age}</h2>
              <p className="text-sm text-text-muted">{host.city}</p>
            </div>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">{host.bio}</p>

          {test && (
            <div className="rounded-[24px] bg-surface border-[0.5px] border-border p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-[17px]">{test.name}</h3>
                <span className="text-xs capitalize text-text-muted">{test.difficulty}</span>
              </div>
              <div className="flex gap-1 mt-3">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i < completed ? "bg-accent" : "bg-border"}`} />
                ))}
              </div>
              <p className="text-xs text-text-muted mt-2">{completed}/8 complete</p>
            </div>
          )}

          {error && <p className="text-xs text-danger text-center">{error}</p>}

          {!connection ? (
            <button onClick={startConnection} disabled={starting}
              className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all duration-400">
              {starting ? "Starting..." : "Meet Her Standard"}
            </button>
          ) : (
            <div className="space-y-2">
              <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium px-1">Intentions</h3>
              {tasks.map((task) => {
                const isComplete = task.day_number <= completed;
                const isActive = task.day_number === completed + 1;
                const isLocked = task.day_number > completed + 1;
                return (
                  <div key={task.id} className={`flex items-center gap-4 p-4 rounded-[24px] border-[0.5px] bg-surface transition-all ${
                    isComplete ? "bg-accent/[0.04] border-accent/20" : isActive ? "border-accent/40" : "opacity-20"
                  }`}>
                    <div className="w-6 flex justify-center">
                      {isComplete ? <CheckCircle className="w-5 h-5 text-accent" strokeWidth={1.5} /> :
                       isActive ? <Clock className="w-5 h-5 text-accent animate-pulse" strokeWidth={1.5} /> :
                       <Lock className="w-5 h-5 text-text-muted/30" strokeWidth={1.5} />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${isComplete ? "text-text-muted/50 line-through" : "text-text"}`}>
                        Day {task.day_number}: {task.description}
                      </p>
                    </div>
                    {isActive && (
                      <button onClick={() => submitTask(task)} disabled={submitting}
                        className="px-4 py-2.5 rounded-[16px] bg-accent text-bg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 transition-all duration-400">
                        <Upload className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {submitting ? "..." : "Submit"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {unlocked && connection && (
            <button onClick={() => router.push(`/messages/${connection.id}`)}
              className="w-full h-14 rounded-[16px] bg-accent/10 border-[0.5px] border-accent/20 text-accent font-semibold flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
              Open Messages
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
