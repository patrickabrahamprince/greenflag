"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Lock, CheckCircle, Clock, MessageCircle, Flag, Snowflake, Brain, ExternalLink, Music, MapPin, Camera, Video, AlertTriangle } from "lucide-react";
import type { Profile, Test, Task, Connection, Submission } from "@/lib/types";
import FileUpload from "@/components/FileUpload";
import VoiceRecorder from "@/components/VoiceRecorder";
import LocationPicker from "@/components/LocationPicker";
import FreezeStreak from "@/components/FreezeStreak";
import { useToast } from "@/components/Toast";
import { requireOnboarded } from "@/lib/auth";
import { isExpired, expireOverdueConnections, daysLeft } from "@/lib/utils";
import { parseTaskDescription } from "@/lib/task-utils";

export default function StandardDetail() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const nameSlug = params.name as string;
  const [host, setHost] = useState<Profile | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissionsMap, setSubmissionsMap] = useState<Record<number, Submission>>({});
  const [connection, setConnection] = useState<Connection | null>(null);
  const [userId, setUserId] = useState("");
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittingDay, setSubmittingDay] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    requireOnboarded().then((uid) => {
      if (!uid) { router.replace("/onboard"); return; }
      if (uid) setUserId(uid);
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
    expireOverdueConnections().then(() => {
      supabase
        .from("connections")
        .select("*")
        .eq("guest_id", userId)
        .eq("test_id", test.id)
        .maybeSingle()
        .then(({ data }) => {
          setConnection(data ?? null);
          if (data) {
            // fetch tasks for the connection
            supabase.from("tasks").select("*").eq("connection_id", data.id).order("day_number").then(({ data: ts }) => {
              if (ts && ts.length > 0) setTasks(ts);
            });
            // fetch submissions map for this connection
            supabase
              .from("submissions")
              .select("day_number,status,rejection_reason")
              .eq("connection_id", data.id)
              .then(({ data: subs, error }) => {
                if (!error && subs) {
                  const map: Record<number, Submission> = {};
                  (subs as any[]).forEach((sub) => {
                    map[sub.day_number] = sub as Submission;
                  });
                  setSubmissionsMap(map);
                }
              });
          }
        });
    });
  }, [userId, test]);

  async function startConnection() {
    if (!userId) { setError("Please log in first"); return; }
    if (!test || !host) return;
    setStarting(true);
    setError("");
    try {
      const res = await fetch("/api/connections/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_id: test.id, host_id: host.id }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to start"); return; }
      if (data) { setConnection(data); toast("success", "Connection started! Complete 8 intentions."); }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setStarting(false);
    }
  }

  async function submitTask(task: Task, proofUrl?: string, proofText?: string) {
    if (!connection || !test) return;
    setSubmitting(true);
    setSubmittingDay(task.day_number);
    setError("");
    try {
      const detail = parseTaskDescription(task.description);
      const res = await fetch("/api/submissions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: test.id,
          taskId: task.id,
          dayNumber: task.day_number,
          proofUrl: proofUrl || null,
          proofType: detail.verification_method,
          proofText: proofText || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit");
        setSubmitting(false);
        return;
      }
      // Refresh submissions map after successful submit
      if (connection) {
        supabase
          .from("submissions")
          .select("day_number,status,rejection_reason")
          .eq("connection_id", connection.id)
          .then(({ data: subs, error }) => {
            if (!error && subs) {
              const map: Record<number, Submission> = {};
              (subs as any[]).forEach((sub) => {
                map[sub.day_number] = sub as Submission;
              });
              setSubmissionsMap(map);
            }
          });
      }
      toast("success", `Day ${task.day_number} submitted for review!`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setSubmitting(false);
      setSubmittingDay(0);
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
    <div className="min-h-dvh bg-bg animate-fade-in">
      <header className="sticky top-0 z-40 glass-strong">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => router.push("/discover")} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
          <h1 className="text-[17px] font-display font-semibold">{host.name}&apos;s Standard</h1>
          <button onClick={() => router.push(`/report?profile_id=${host.id}`)} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center ml-auto">
            <Flag className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <div className="px-4 py-6 pb-24">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <img src={host.photos?.[0] || ""} alt="" className="w-20 h-20 rounded-full object-cover" />
            <div>
              <h2 className="text-[22px] font-display font-semibold">{host.name}, {host.age}</h2>
              <p className="text-sm text-text-muted">{host.city}</p>
            </div>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">{host.bio}</p>

          {host.looking_for_tags && host.looking_for_tags.length > 0 && (
            <div>
              <p className="text-[11px] text-accent uppercase tracking-[0.08em] font-semibold mb-3">She's looking for</p>
              <div className="flex flex-wrap gap-2.5">
                {host.looking_for_tags.map((tag) => (
                  <span key={tag} className="text-sm font-medium px-5 py-2.5 rounded-full bg-accent/10 border border-accent/30 text-accent">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {host.about_me_tags && host.about_me_tags.length > 0 && (
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-[0.08em] font-semibold mb-3">About her</p>
              <div className="flex flex-wrap gap-2.5">
                {host.about_me_tags.map((tag) => (
                  <span key={tag} className="text-sm font-medium px-5 py-2.5 rounded-full bg-surface border border-border text-text">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {host.instagram_url && (
            <a href={host.instagram_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-accent hover:underline">
              <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
              {host.instagram_url.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@")}
            </a>
          )}

          {test && (
            <div className="rounded-[24px] bg-surface border-[0.5px] border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-[17px]">{test.name}</h3>
                <div className="flex items-center gap-2">
                  {connection?.streak_frozen && (
                    <span className="flex items-center gap-1 text-[10px] text-accent bg-accent/10 px-2 py-1 rounded-full">
                      <Snowflake className="w-3 h-3" strokeWidth={1.5} /> Frozen
                    </span>
                  )}
                  <span className="text-xs capitalize text-text-muted">{test.difficulty}</span>
                </div>
              </div>

              <div className="rounded-[16px] bg-bg/40 border-[0.5px] border-border p-4 space-y-2">
                <p className="text-xs text-accent font-semibold uppercase tracking-wider">Rules</p>
                <ul className="text-xs text-text-muted space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    Complete 2 intentions every day for 4 days
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    Each submission is verified by AI before reaching her
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    Messages unlock after 5 intentions completed
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    All 8 must be completed within the timer
                  </li>
                </ul>
              </div>

              <div className="flex gap-1">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < completed ? "bg-accent" : i === completed ? "bg-accent/40 animate-pulse" : "bg-border"}`} />
                ))}
              </div>
              <div className="flex justify-between text-xs text-text-muted">
                <span>{completed}/8 intentions</span>
                {connection && <span>{daysLeft(connection.expires_at)}d left</span>}
              </div>
            </div>
          )}

          {error && <p className="text-xs text-danger text-center">{error}</p>}

          {connection && isExpired(connection.expires_at) && connection.status === "active" && (
            <div className="px-4 py-3 rounded-[16px] bg-danger/10 border-[0.5px] border-danger/20 text-xs text-danger text-center">
              This connection has expired. The standard was not completed in time.
            </div>
          )}

          {!connection ? (
            <button onClick={startConnection} disabled={starting}
              className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all duration-400">
              {starting ? "Starting..." : "Meet Her Green Flags"}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs text-text-muted uppercase tracking-wider font-medium px-1">Intentions</h3>
                {connection && (
                  <span className="text-[10px] text-accent bg-accent/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                    {Math.max(0, 2 - completed % 2 || 2)} today
                  </span>
                )}
              </div>
              {tasks.map((task) => {
                const detail = parseTaskDescription(task.description);
                const submission = submissionsMap[task.day_number];
                const isComplete = task.day_number <= completed;
                const isActive = task.day_number === completed + 1 || (submission?.status === "rejected");
                const isLocked = task.day_number > completed + 1 && !(submission?.status === "rejected");
                const todayCount = completed % 2;
                const isTodayTask = task.day_number > completed && task.day_number <= completed + (2 - todayCount);

                if (isComplete && submission?.status !== "rejected") {
                  return (
                    <div key={task.id} className="flex items-center gap-4 p-4 rounded-[24px] bg-accent/[0.04] border-[0.5px] border-accent/20 transition-all">
                      <CheckCircle className="w-5 h-5 text-accent shrink-0" strokeWidth={1.5} />
                      <div className="flex-1">
                        <p className="text-xs text-text-muted/50">Day {task.day_number}</p>
                        <p className="text-sm text-text-muted/50 line-through">{detail.title}</p>
                      </div>
                    </div>
                  );
                }

                if (isLocked && !isTodayTask) {
                  return (
                    <div key={task.id} className="flex items-center gap-4 p-4 rounded-[24px] bg-surface border-[0.5px] border-border opacity-20 transition-all">
                      <Lock className="w-5 h-5 text-text-muted/30 shrink-0" strokeWidth={1.5} />
                      <div className="flex-1">
                        <p className="text-xs text-text-muted/30">Day {task.day_number}</p>
                        <p className="text-sm text-text-muted/30">Locked</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={task.id} className="rounded-[24px] bg-surface border-[0.5px] border-accent/40 p-5 space-y-4 transition-all">
                    {submission?.status === "rejected" && (
                      <div className="p-3 rounded-[12px] bg-danger/10 text-danger text-xs border border-danger/20">
                        <strong>Rejected:</strong> {submission.rejection_reason || "Please try again."}
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        {detail.verification_method === "photo" ? <Camera className="w-4 h-4 text-accent" strokeWidth={1.5} /> :
                         detail.verification_method === "video" ? <Video className="w-4 h-4 text-accent" strokeWidth={1.5} /> :
                         detail.verification_method === "voice" ? <Music className="w-4 h-4 text-accent" strokeWidth={1.5} /> :
                         <MapPin className="w-4 h-4 text-accent" strokeWidth={1.5} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-accent font-medium">Day {task.day_number}</p>
                          <span className="text-[10px] text-text-muted/50 bg-bg/40 px-2 py-0.5 rounded-full">{detail.time_estimate}</span>
                        </div>
                        <p className="text-sm font-medium text-text mt-1">{detail.title}</p>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">{detail.instruction}</p>
                      </div>
                    </div>

                    {isActive && (
                      <div className="pt-2">
                        {detail.verification_method === "photo" && (
                          <FileUpload
                            onUpload={(url) => submitTask(task, url)}
                            bucket="proofs"
                            mediaType="image"
                            className="w-full h-12 rounded-[12px] bg-accent text-bg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 transition-all duration-400"
                          >
                            {submitting && submittingDay === task.day_number ? (
                              <div className="w-4 h-4 rounded-full border-[1.5px] border-bg/30 border-t-bg animate-spin" />
                            ) : (
                              <Camera className="w-4 h-4" strokeWidth={1.5} />
                            )}
                            {submitting && submittingDay === task.day_number ? "..." : (submission ? "Resubmit Photo" : "Take Photo")}
                          </FileUpload>
                        )}
                        {detail.verification_method === "video" && (
                          <FileUpload
                            onUpload={(url) => submitTask(task, url)}
                            bucket="proofs"
                            mediaType="video"
                            className="w-full h-12 rounded-[12px] bg-accent text-bg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 transition-all duration-400"
                          >
                            {submitting && submittingDay === task.day_number ? (
                              <div className="w-4 h-4 rounded-full border-[1.5px] border-bg/30 border-t-bg animate-spin" />
                            ) : (
                              <Video className="w-4 h-4" strokeWidth={1.5} />
                            )}
                            {submitting && submittingDay === task.day_number ? "..." : (submission ? "Resubmit Video" : "Record Video")}
                          </FileUpload>
                        )}
                        {detail.verification_method === "voice" && (
                          <VoiceRecorder
                            userId={userId}
                            onRecorded={(url) => submitTask(task, url)}
                          />
                        )}
                        {detail.verification_method === "location" && (
                          <LocationPicker
                            onLocated={(text) => submitTask(task, undefined, text)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {connection && completed > 0 && completed < 8 && (
                <div className="rounded-[16px] bg-accent/5 border-[0.5px] border-accent/10 p-4 flex items-center gap-3">
                  <Brain className="w-5 h-5 text-accent shrink-0" strokeWidth={1.5} />
                  <p className="text-xs text-text-muted leading-relaxed">
                    AI is reviewing your submission. She&apos;ll see it once verified.
                  </p>
                </div>
              )}
            </div>
          )}

          {unlocked && connection && (
            <button onClick={() => router.push(`/messages/${connection.id}`)}
              className="w-full h-14 rounded-[16px] bg-accent/10 border-[0.5px] border-accent/20 text-accent font-semibold flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
              Open Messages
            </button>
          )}

          {connection && !connection.streak_frozen && (
            <FreezeStreak connectionId={connection.id} />
          )}
        </div>
      </div>
    </div>
  );
}
