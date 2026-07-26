'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Camera, Mic, Type, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { IntentionRecord } from './types';

interface SubmitSheetProps {
  matchId: string;
  dayNumber: number;
  intention: IntentionRecord;
  isLastTaskToday: boolean;
  onClose: () => void;
  onSubmit: (result?: { status?: string }) => void;
}

export function SubmitSheet({ matchId, dayNumber, intention, isLastTaskToday, onClose, onSubmit }: SubmitSheetProps) {
  const supabase = createClient();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ status?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const [barHeights, setBarHeights] = useState<number[]>([10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds));
    return `0:${String(s % 60).padStart(2, '0')}`;
  };

  // Keep audioUrlRef in sync
  useEffect(() => {
    audioUrlRef.current = audioUrl;
    if (audioElRef.current) {
      audioElRef.current.load();
    }
  }, [audioUrl]);

  const togglePlay = () => {
    const el = audioElRef.current;
    if (!el || !audioUrl) {
      setError('No recording available.');
      return;
    }

    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      setError(null);
      if (el.currentTime >= el.duration || playbackTime >= recordedDuration) {
        el.currentTime = 0;
      }
      el.play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.error('Play rejected:', e);
          setIsPlaying(false);
          setError('Playback failed: ' + (e?.message || 'Unknown error'));
        });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (audioElRef.current) {
        audioElRef.current.pause();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const uploadFile = useCallback(async (file: Blob, ext: string): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const filename = `${Date.now()}.${ext}`;
    const path = `${user.id}/day${dayNumber}/${filename}`;
    const { error } = await supabase.storage.from('submissions').upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from('submissions').getPublicUrl(path);
    return data.publicUrl;
  }, [supabase, dayNumber]);

  const handleSubmit = async () => {
    setError(null);
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
        const fileExt = recordedBlob.type.includes('mp4') ? 'mp4' : recordedBlob.type.includes('aac') ? 'aac' : 'webm';
        mediaUrl = await uploadFile(recordedBlob, fileExt);
      }

      if (intention.type !== 'text' && !mediaUrl) {
        setError('Failed to upload media file.');
        setSubmitting(false);
        return;
      }

      const res = await fetch(`/api/matches/${matchId}/submit-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_number: intention.task_number || 1,
          text,
          media_url: mediaUrl,
          media_type: mediaType,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body?.error === 'INSUFFICIENT_COINS') {
          setError(`Not enough coins. You need ${body.coins_needed} coins to submit.`);
        } else {
          setError(body?.error || 'Submission failed.');
        }
        setSubmitting(false);
        return;
      }

      const result = await res.json().catch(() => ({}));
      setSubmitResult(result);
      setShowSuccessPopup(true);
    } catch (e) {
      setError('Network error. Please try again.');
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
    setError(null);
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support microphone access.');
      }
      if (typeof MediaRecorder === 'undefined') {
        throw new Error('Your browser does not support audio recording.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Let the browser pick its default MIME — no mimeType option at all
      // This is the most compatible approach across all browsers
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      // Audio Analyzer Setup — isolated from recording
      try {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (AC) {
          const audioCtx = new AC();
          if (audioCtx.state === 'suspended') {
            // getUserMedia() above is awaited, so by the time we get here we're
            // outside the original click's gesture context — Chrome creates the
            // AudioContext suspended in that case. Without awaiting resume()
            // here, the analyser starts reading silence before it's running,
            // so the visualizer bars never move off their flat minimum height.
            await audioCtx.resume();
          }
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 32;
          source.connect(analyser);
          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;

          const bufLen = analyser.frequencyBinCount;
          const buf = new Uint8Array(bufLen);

          const tick = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteTimeDomainData(buf);
            let peak = 0;
            for (let i = 0; i < bufLen; i++) {
              const v = Math.abs(buf[i] - 128);
              if (v > peak) peak = v;
            }
            const vol = Math.min(1, peak / 64);
            const m = [0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3, 0.75, 0.45, 0.65];
            setBarHeights(m.map(mult => Math.max(6, 6 + vol * mult * 36)));
            animationFrameRef.current = requestAnimationFrame(tick);
          };
          animationFrameRef.current = requestAnimationFrame(tick);
        }
      } catch (vizErr) {
        console.warn('Visualizer init failed (non-critical):', vizErr);
      }

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        // Use base MIME type without codec params (e.g. 'audio/webm' not 'audio/webm;codecs=opus')
        const baseMime = (recorder.mimeType || 'audio/webm').split(';')[0];
        const blob = new Blob(chunksRef.current, { type: baseMime });
        
        // Revoke previous blob URL
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
        }
        const url = URL.createObjectURL(blob);

        setRecordedBlob(blob);
        setAudioUrl(url);

        // Stop mic stream
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (timerRef.current) clearInterval(timerRef.current);

        // Clean up visualizer
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }
        analyserRef.current = null;
        setBarHeights([10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
      };

      recorder.onerror = (e: any) => {
        console.error('MediaRecorder error:', e);
        setError('Recording error occurred. Please try again.');
        setIsRecording(false);
      };

      // NO timeslice — single valid audio file produced on stop
      recorder.start();
      setIsRecording(true);
      setRecordedDuration(0);
      timerRef.current = setInterval(() => {
        setRecordedDuration((p) => {
          const next = p + 1;
          // Displayed as "Xs / 30s" but nothing actually stopped the
          // recorder at 30 before -- it just kept counting past the
          // limit shown to the user.
          if (next >= 30) stopRecording();
          return next;
        });
      }, 1000);
    } catch (e: any) {
      console.error('Recording start error:', e);
      setIsRecording(false);
      setError(e?.message || 'Failed to access microphone. Please allow mic permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const canSubmit =
    (intention.type === 'text' && textContent.length >= 10 && textContent.length <= 500) ||
    (intention.type === 'photo' && photoFile) ||
    (intention.type === 'voice' && recordedBlob);

  const typeIcon = { photo: Camera, voice: Mic, text: Type }[intention.type] || Type;
  const Icon = typeIcon;

  if (showSuccessPopup) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
        <div className="w-full max-w-sm rounded-none p-6 text-center animate-scale-in bg-[#000000]">
          <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl text-green-600 font-bold">✓</span>
          </div>
          <h4 className="font-display text-ink text-lg mb-2">Response Submitted!</h4>
          <p className="text-[#9DA0A6] text-xs mb-6 leading-relaxed">
            {!isLastTaskToday
              ? 'Awaiting her review. Move on to the next task for today, or explore other profiles in the meantime.'
              : dayNumber >= 3
                ? "You've completed all 3 days! She now has a 24-hour window to review your responses and decide whether to continue."
                : "That's all 3 tasks for today. She has a 24-hour window to review before tomorrow's tasks unlock."}
          </p>
          <div className="flex gap-3">
            {!isLastTaskToday && (
              <button
                onClick={() => {
                  onSubmit(submitResult);
                }}
                className="btn-primary flex-1 py-2.5 text-xs font-semibold"
              >
                Next Task
              </button>
            )}
            <button
              onClick={() => {
                onSubmit(submitResult);
                router.push('/discover');
              }}
              className={isLastTaskToday ? 'btn-primary flex-1 py-2.5 text-xs font-semibold' : 'btn-secondary flex-1 py-2.5 text-xs font-medium'}
            >
              Explore New
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-app rounded-t-none p-5 pb-8 animate-slide-up bg-[#000000]"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-gold" />
            <h3 className="font-display text-ink">Day {dayNumber}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#9DA0A6] hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        {intention.type === 'text' && (
          <div className="space-y-2">
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Write your response (10–500 characters)..."
              rows={5}
              className="input resize-none"
            />
            <p className="text-right text-xs text-[#9DA0A6]">{textContent.length}/500</p>
          </div>
        )}

        {intention.type === 'photo' && (
          <div className="space-y-4">
            {photoPreview ? (
              <div className="relative rounded-none overflow-hidden aspect-video bg-[#1C1C1E]">
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
                className="w-full aspect-video flex flex-col items-center justify-center gap-3 border border-dashed border-[#2A2A2A] hover:border-gold/50 transition-colors bg-[#1C1C1E]"
              >
                <Camera className="w-10 h-10 text-[#9DA0A6]" />
                <span className="text-sm text-[#9DA0A6]">Tap to take a photo</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelect} />
          </div>
        )}

        {intention.type === 'voice' && (
          <div className="flex flex-col items-center gap-5 py-4 w-full">
            {recordedBlob ? (
              <div className="text-center flex flex-col items-center gap-4 py-2">
                <p className="text-gold text-sm font-medium">Voice recorded ({recordedDuration}s)</p>

                {/* Native browser audio player hidden, controlled by the scrubber below */}
                {audioUrl && (
                  <audio
                    ref={audioElRef}
                    src={audioUrl}
                    onEnded={() => { setIsPlaying(false); setPlaybackTime(0); }}
                    onTimeUpdate={(e) => setPlaybackTime(e.currentTarget.currentTime)}
                    preload="auto"
                    className="hidden"
                  />
                )}

                <div className="flex items-center gap-3 w-full max-w-xs">
                  <button
                    onClick={() => { setError(null); togglePlay(); }}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-black active:scale-95 transition-all shrink-0"
                    style={{ background: '#C026D3' }}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <rect x="5" y="4" width="4" height="16" />
                        <rect x="15" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                        <polygon points="6,4 20,12 6,20" />
                      </svg>
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={recordedDuration || 1}
                    step={0.1}
                    value={Math.min(playbackTime, recordedDuration || 1)}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setPlaybackTime(value);
                      if (audioElRef.current) audioElRef.current.currentTime = value;
                    }}
                    className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-gold"
                    style={{
                      background: `linear-gradient(to right, #C026D3 ${(playbackTime / (recordedDuration || 1)) * 100}%, #2A2A2A ${(playbackTime / (recordedDuration || 1)) * 100}%)`,
                    }}
                    aria-label="Playback position"
                  />
                  <span className="text-xs text-[#9DA0A6] font-mono tabular-nums shrink-0">
                    {formatTime(playbackTime)}/{formatTime(recordedDuration)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (audioElRef.current) audioElRef.current.pause();
                    if (audioUrl) URL.revokeObjectURL(audioUrl);
                    setRecordedBlob(null);
                    setAudioUrl(null);
                    setRecordedDuration(0);
                    setIsPlaying(false);
                    setError(null);
                  }}
                  className="text-xs text-[#9DA0A6] underline hover:text-ink mt-1"
                >
                  Re-record
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full">
                {isRecording && (
                  <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-[200px] overflow-hidden">
                    {barHeights.map((height, idx) => (
                      <div
                        key={idx}
                        className="w-[3px] bg-gold rounded-full transition-all duration-75"
                        style={{
                          height: `${height}px`,
                        }}
                      />
                    ))}
                  </div>
                )}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className="w-20 h-20 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: isRecording ? 'rgba(239,68,68,0.1)' : '#1C1C1E',
                    border: isRecording ? '2px solid rgba(239,68,68,0.4)' : '1px solid #2A2A2A',
                  }}
                >
                  <Mic className={`w-8 h-8 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gold'}`} />
                </button>
                {isRecording && <p className="text-red-500 text-xs font-medium animate-pulse">{recordedDuration}s / 30s</p>}
              </div>
            )}
            <p className="text-xs text-[#9DA0A6] font-thin">
              {isRecording ? 'Tap to stop' : recordedBlob ? 'Ready to submit' : 'Tap to start recording'}
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center mt-5 font-medium">{error}</p>
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
