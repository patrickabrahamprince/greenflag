"use client";
import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Upload, Keyboard } from "lucide-react";
import { uploadPhoto } from "@/lib/storage";

interface Props {
  onRecorded: (url?: string, text?: string) => void;
  userId: string;
}

export default function VoiceRecorder({ onRecorded, userId }: Props) {
  const [state, setState] = useState<"idle" | "recording" | "stopped" | "uploading">("idle");
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showTextField, setShowTextField] = useState(false);
  const [typedText, setTypedText] = useState("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorder.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setState("stopped");
      };

      recorder.start();
      setState("recording");
      setDuration(0);
      timer.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Microphone access denied");
    }
  }

  function stopRecording() {
    mediaRecorder.current?.stop();
    if (timer.current) clearInterval(timer.current);
  }

  async function uploadRecording() {
    if (!chunks.current.length) return;
    setState("uploading");
    const blob = new Blob(chunks.current, { type: "audio/webm" });
    const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
    const url = await uploadPhoto(file, "proofs", userId);
    if (url) {
      onRecorded(url);
    } else {
      setError("Upload failed");
      setState("stopped");
    }
  }

  function formatDuration(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  if (state === "uploading") {
    return (
      <div className="flex items-center justify-center gap-2 py-4">
        <Loader2 className="w-4 h-4 text-accent animate-spin" strokeWidth={1.5} />
        <span className="text-xs text-text-muted">Uploading voice note...</span>
      </div>
    );
  }

  if (showTextField) {
    return (
      <div className="space-y-3 animate-fade-in">
        <textarea
          value={typedText}
          onChange={(e) => setTypedText(e.target.value)}
          placeholder="Type your response here..."
          className="w-full h-24 p-3 rounded-[12px] bg-surface border border-border text-text placeholder-text-muted text-xs focus:outline-none focus:border-accent resize-none font-sans"
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowTextField(false);
              setError("");
              setState("idle");
            }}
            className="flex-1 h-12 rounded-[12px] bg-surface border border-border text-text-muted font-medium text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (typedText.trim()) {
                onRecorded(undefined, typedText);
              }
            }}
            disabled={!typedText.trim()}
            className="flex-1 h-12 rounded-[12px] bg-accent text-bg font-semibold text-xs disabled:opacity-30 cursor-pointer"
          >
            Submit Text
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {state === "idle" && (
        <div className="flex gap-2">
          <button onClick={startRecording}
            className="flex-1 h-14 rounded-[16px] bg-accent/10 border border-accent/30 text-accent font-medium flex items-center justify-center gap-2 transition-all cursor-pointer">
            <Mic className="w-5 h-5" strokeWidth={1.5} />
            Record Voice
          </button>
          <button onClick={() => setShowTextField(true)}
            className="w-14 h-14 rounded-[16px] bg-surface border border-border text-text-muted hover:text-text flex items-center justify-center transition-all cursor-pointer">
            <Keyboard className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {state === "recording" && (
        <div className="rounded-[16px] bg-danger/10 border border-danger/30 p-4 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-danger animate-pulse" />
            <span className="text-sm font-medium text-danger">Recording...</span>
            <span className="text-sm text-text-muted font-mono">{formatDuration(duration)}</span>
          </div>
          <button onClick={stopRecording}
            className="w-full h-12 rounded-[12px] bg-danger text-bg font-semibold flex items-center justify-center gap-2 cursor-pointer">
            <Square className="w-4 h-4" strokeWidth={1.5} />
            Stop Recording
          </button>
        </div>
      )}

      {state === "stopped" && audioUrl && (
        <div className="space-y-3">
          <audio controls src={audioUrl} className="w-full h-10 rounded-[8px]" />
          <div className="flex gap-2">
            <button onClick={startRecording}
              className="flex-1 h-12 rounded-[12px] bg-surface border border-border text-text-muted font-medium text-sm cursor-pointer">
              Re-record
            </button>
            <button onClick={uploadRecording}
              className="flex-1 h-12 rounded-[12px] bg-accent text-bg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" strokeWidth={1.5} />
              Submit Voice Note
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="space-y-2">
          <p className="text-xs text-danger text-center">{error}</p>
          <button
            onClick={() => setShowTextField(true)}
            className="w-full h-12 rounded-[12px] bg-surface border border-border text-accent font-semibold text-xs flex items-center justify-center cursor-pointer"
          >
            Type instead
          </button>
        </div>
      )}
    </div>
  );
}
