'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Camera, Mic, Type, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { IntentionRecord } from './types';

interface SubmitSheetProps {
  connectionId: string;
  dayNumber: number;
  taskNumber: number;
  intention: IntentionRecord;
  onClose: () => void;
  onSubmit: () => void;
}

function Waveform({ stream, isRecording }: { stream: MediaStream | null; isRecording: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!stream || !isRecording || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barCount = 20;

    const draw = () => {
      if (!ctx || !canvas) return;
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / barCount;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] / 255;
        const barHeight = value * canvas.height;
        const x = i * barWidth + barWidth * 0.1;
        const w = barWidth * 0.8;
        ctx.fillStyle = `rgba(212, 175, 55, ${0.3 + value * 0.7})`;
        ctx.fillRect(x, canvas.height - barHeight, w, barHeight);
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      audioCtx.close();
    };
  }, [stream, isRecording]);

  if (!isRecording) return null;

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={64}
      className="w-full max-w-[240px] h-16 rounded-xl"
      style={{ background: '#111' }}
    />
  );
}

export function SubmitSheet({ connectionId, dayNumber, taskNumber, intention, onClose, onSubmit }: SubmitSheetProps) {
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const uploadFile = useCallback(async (file: Blob, ext: string): Promise<string | null> => {
    const filename = `${Date.now()}.${ext}`;
    const path = `${connectionId}/day${dayNumber}/${filename}`;
    const { error } = await supabase.storage.from('submissions').upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from('submissions').getPublicUrl(path);
    return data.publicUrl;
  }, [supabase, connectionId, dayNumber]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let mediaUrl: string | null = null;
      let text: string | null = null;
      let mediaType = intention.type;

      if (intention.type === 'text') {
        text = textContent;
      } else if (intention.type === 'photo' && photoFile) {
        mediaUrl = await uploadFile(photoFile, photoFile.name.split('.').pop() || 'jpg');
      } else if (intention.type === 'voice' && recordedBlob) {
        mediaUrl = await uploadFile(recordedBlob, 'webm');
      }

      if (intention.type !== 'text' && !mediaUrl) {
        setSubmitting(false);
        return;
      }

      const res = await fetch(`/api/connections/${connectionId}/submit-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_number: taskNumber,
          text,
          media_url: mediaUrl,
          media_type: mediaType,
        }),
      });

      if (res.ok) onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const startRecording = async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(ms);
      const recorder = new MediaRecorder(ms);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        ms.getTracks().forEach((t) => t.stop());
        setStream(null);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recorder.start();
      setIsRecording(true);
      setRecordedDuration(0);
      timerRef.current = setInterval(() => setRecordedDuration((p) => p + 1), 1000);
    } catch {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const canSubmit =
    (intention.type === 'text' && textContent.length >= 50 && textContent.length <= 500) ||
    (intention.type === 'photo' && photoFile) ||
    (intention.type === 'voice' && recordedBlob);

  const typeIcon = { photo: Camera, voice: Mic, text: Type }[intention.type] || Type;
  const Icon = typeIcon;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="w-full max-w-app rounded-t-3xl p-5 pb-8 animate-slide-up"
        style={{ background: '#1C1C1E' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-gold" />
            <h3 className="text-white font-display">Day {dayNumber}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#8E8E93] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {intention.type === 'text' && (
          <div className="space-y-2">
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Write your response (50–500 characters)..."
              rows={5}
              className="input resize-none"
            />
            <p className="text-right text-xs text-[#8E8E93] font-thin">{textContent.length}/500</p>
          </div>
        )}

        {intention.type === 'photo' && (
          <div className="space-y-4">
            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-video" style={{ background: '#111' }}>
                <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  className="absolute top-3 right-3 p-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.6)' }}
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-xl flex flex-col items-center justify-center gap-3 border border-dashed border-[#3A3A3C] hover:border-gold/50 transition-colors"
                style={{ background: '#111' }}
              >
                <Camera className="w-10 h-10 text-[#8E8E93]" />
                <span className="text-sm text-[#8E8E93] font-thin">Tap to select photo</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
          </div>
        )}

        {intention.type === 'voice' && (
          <div className="flex flex-col items-center gap-5 py-4">
            <Waveform stream={stream} isRecording={isRecording} />

            {recordedBlob ? (
              <div className="text-center">
                <p className="text-gold text-sm mb-1">Voice recorded</p>
                <p className="text-[#8E8E93] text-xs font-thin">{recordedDuration}s</p>
                <button onClick={() => { setRecordedBlob(null); setRecordedDuration(0); }} className="text-xs text-[#8E8E93] mt-2 underline">
                  Re-record
                </button>
              </div>
            ) : (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className="w-20 h-20 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: isRecording ? 'rgba(239,68,68,0.15)' : '#111',
                  border: isRecording ? '2px solid rgba(239,68,68,0.4)' : '1px solid #2A2A2C',
                }}
              >
                <Mic className={`w-8 h-8 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gold'}`} />
              </button>
            )}
            <p className="text-xs text-[#8E8E93] font-thin">
              {isRecording ? 'Tap to stop' : recordedBlob ? 'Ready to submit' : 'Tap to start recording'}
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
