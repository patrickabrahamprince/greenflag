'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader2, Image, Send, AlertCircle, Coins, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCoinStore } from '@/lib/store';
import { uploadFile } from '@/lib/supabase/storage';
import toast from 'react-hot-toast';

interface TaskSubmission {
  id: number;
  connection_id: string;
  task_number: number;
  content_type: string;
  text_content?: string;
  media_url?: string;
  submitted_at: string;
}

interface ConnectionData {
  id: string;
  status: string;
  deadline: string;
  tasks_completed: number;
  host: { id: string; name: string; age: number; photos: string[]; city_auto?: string; standards: unknown[] };
  guest: { id: string; name: string };
  submissions: TaskSubmission[];
}

export default function TasksPage({ params }: { params: Promise<{ hostName: string }> }) {
  const { hostName } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [connection, setConnection] = useState<ConnectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskInputs, setTaskInputs] = useState<Record<number, string>>({});
  const [taskImages, setTaskImages] = useState<Record<number, File | null>>({});
  const [taskImagePreviews, setTaskImagePreviews] = useState<Record<number, string>>({});
  const [uploadingTask, setUploadingTask] = useState<number | null>(null);
  const [submittingTask, setSubmittingTask] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      const hostRes = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('name', hostName.charAt(0).toUpperCase() + hostName.slice(1))
        .single();
      const hostRaw = hostRes?.data as { id: string } | null;

      if (!hostRaw) { setLoading(false); return; }

      const connRes = await (supabase as any)
        .from('connections')
        .select('id, status, deadline, tasks_completed')
        .eq('guest_id', user.id)
        .eq('host_id', hostRaw.id)
        .not('status', 'in', '("rejected","expired")')
        .order('created_at', { ascending: false })
        .limit(1);
      const conns = connRes?.data as { id: string; status: string; deadline: string; tasks_completed: number }[] | null;

      if (!conns?.length) { setLoading(false); return; }

      const res = await fetch(`/api/connections/${conns[0].id}`);
      const data = await res.json();
      if (data.id) setConnection(data);
      setLoading(false);
    };
    load();
  }, [hostName]);

  useEffect(() => {
    if (!connection?.deadline) return;
    const interval = setInterval(() => {
      const diff = new Date(connection.deadline).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Expired'); clearInterval(interval); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
    }, 1000);
    return () => clearInterval(interval);
  }, [connection?.deadline]);

  const handleImageSelect = (taskNumber: number, file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setTaskImages((prev) => ({ ...prev, [taskNumber]: file }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setTaskImagePreviews((prev) => ({ ...prev, [taskNumber]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (taskNumber: number) => {
    setTaskImages((prev) => ({ ...prev, [taskNumber]: null }));
    setTaskImagePreviews((prev) => ({ ...prev, [taskNumber]: '' }));
    if (fileInputRefs.current[taskNumber]) {
      fileInputRefs.current[taskNumber].value = '';
    }
  };

  const handleSubmitTask = async (taskNumber: number) => {
    const task = tasks[taskNumber - 1];
    const imageFile = taskImages[taskNumber];
    const textContent = taskInputs[taskNumber];

    if (task.type === 'image' && !imageFile && !textContent?.trim()) {
      toast.error('Please upload an image or add text');
      return;
    }
    if (task.type === 'text' && !textContent?.trim()) {
      toast.error('Please fill in your response');
      return;
    }

    setSubmittingTask(taskNumber);
    let mediaUrl: string | null = null;

    try {
      if (imageFile) {
        setUploadingTask(taskNumber);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { toast.error('Not authenticated'); return; }

        const fileExt = imageFile.name.split('.').pop() || 'jpg';
        const path = `${user.id}/${connection!.id}/${taskNumber}.${fileExt}`;

        const { url, error: uploadError } = await uploadFile('submissions', path, imageFile);

        if (uploadError) {
          toast.error('Upload failed: ' + uploadError);
          setSubmittingTask(null);
          setUploadingTask(null);
          return;
        }

        mediaUrl = url;
        setUploadingTask(null);
      }

      const res = await fetch(`/api/connections/${connection!.id}/submit-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_number: taskNumber,
          text: textContent?.trim() || null,
          media_url: mediaUrl,
        }),
      });
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      toast.success(`Task ${taskNumber} submitted`);

      setTaskInputs((prev) => ({ ...prev, [taskNumber]: '' }));
      setTaskImages((prev) => ({ ...prev, [taskNumber]: null }));
      setTaskImagePreviews((prev) => ({ ...prev, [taskNumber]: '' }));

      const connRes = await fetch(`/api/connections/${connection!.id}`);
      const updated = await connRes.json();
      if (updated.id) setConnection(updated);
    } catch {
      toast.error('Submission failed');
    } finally {
      setSubmittingTask(null);
      setUploadingTask(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#8E8E93] mx-auto mb-4" />
          <h2 className="text-lg font-display text-[#EDEADE] mb-2">No active connection</h2>
          <p className="text-sm text-[#8E8E93] mb-6">You haven&apos;t applied to meet {hostName} yet.</p>
          <button onClick={() => router.push('/discover')} className="btn-primary">Back to Discover</button>
        </div>
      </div>
    );
  }

  const c = connection;
  const status = c.status;
  const submissions = c.submissions || [];
  const completedCount = submissions.length;
  const STANDARD_DEFAULTS = [
    { title: 'Financial Mindset', prompt: 'Describe your view on wealth building', type: 'text' },
    { title: 'Life Vision', prompt: 'Where do you see yourself in 5 years?', type: 'text' },
    { title: 'Emotional Intelligence', prompt: 'How do you handle conflict?', type: 'text' },
    { title: 'Daily Rituals', prompt: 'Describe your ideal morning routine', type: 'text' },
    { title: 'Adventure Style', prompt: 'Share a photo from your favorite adventure', type: 'image' },
    { title: 'Personal Growth', prompt: 'What is a skill you are developing?', type: 'text' },
    { title: 'Connection Values', prompt: 'What matters most in a partnership?', type: 'text' },
    { title: 'Final Note', prompt: 'Share a photo that represents who you are', type: 'image' },
  ] as const;
  const hostStandards = c.host.standards as { title: string; prompt: string; type: string }[] | null;
  const tasks = hostStandards?.length === 8 ? hostStandards : STANDARD_DEFAULTS;
  const isSubmitted = status === 'tasks_submitted';
  const isChatUnlocked = status === 'chat_unlocked';
  const isRejected = status === 'rejected';
  const isExpired = status === 'expired';

  if (isChatUnlocked) {
    router.push(`/messages/${c.id}`);
    return null;
  }

  if (isRejected) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-display text-[#EDEADE] mb-2">She passed</h2>
          <p className="text-sm text-[#8E8E93] mb-2">Your 5 coins have been refunded.</p>
          <div className="flex items-center justify-center gap-1 text-[#D4AF37] text-sm mb-6">
            <Coins className="w-4 h-4" />+5 coins refunded
          </div>
          <button onClick={() => router.push('/discover')} className="btn-primary">Back to Discover</button>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-display text-[#EDEADE] mb-2">Deadline missed</h2>
          <p className="text-sm text-[#8E8E93] mb-6">Your 48-hour window to complete the tasks has expired.</p>
          <button onClick={() => router.push('/discover')} className="btn-primary">Back to Discover</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      <div className="px-4 py-4">
        <button onClick={() => router.push('/discover')} className="text-[#8E8E93] mb-4">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
            {c.host.photos?.[0] ? (
              <img src={c.host.photos[0]} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
            ) : (
              <span className="text-lg text-[#8E8E93]">{c.host.name?.[0]}</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-display text-[#EDEADE]">{c.host.name}, {c.host.age}</h1>
            <p className="text-xs text-[#8E8E93]">Complete 8 tasks to unlock chat</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-[#D4AF37]" />
          <span className={`text-sm ${timeLeft === 'Expired' ? 'text-red-400' : 'text-[#D4AF37]'}`}>
            {timeLeft || 'Loading...'}
          </span>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[#8E8E93]">Progress</span>
            <span className="text-[#D4AF37]">{completedCount}/8</span>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < completedCount ? 'bg-[#D4AF37]' : isSubmitted ? 'bg-[#D4AF37]/30' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {isSubmitted ? (
          <div className="card text-center py-8">
            <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-3">
              <Send className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h3 className="text-lg font-display text-[#EDEADE] mb-1">Submitted!</h3>
            <p className="text-sm text-[#8E8E93]">She will review your responses soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task, idx) => {
              const taskNum = idx + 1;
              const submission = submissions.find((s) => s.task_number === taskNum);
              const isTaskSubmitted = !!submission;
              const isSubmitting = submittingTask === taskNum;
              const isUploading = uploadingTask === taskNum;
              const imageFile = taskImages[taskNum];
              const imagePreview = taskImagePreviews[taskNum];

              return (
                <div key={taskNum} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[#D4AF37]">Task {taskNum}/8</span>
                    {isTaskSubmitted && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Done
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-[#EDEADE] mb-1">{task.title}</h3>
                  <p className="text-xs text-[#8E8E93] mb-3">{task.prompt}</p>

                  {isTaskSubmitted ? (
                    <div className="text-xs text-[#8E8E93] bg-white/5 rounded-lg p-3">
                      {submission.media_url ? (
                        <img
                          src={submission.media_url}
                          alt="Submitted"
                          className="w-full h-40 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <p className={submission.media_url ? 'hidden' : ''}>
                        {submission.text_content || 'Image uploaded'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {task.type === 'image' ? (
                        <div className="space-y-2">
                          {imagePreview ? (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-xl"
                              />
                              <button
                                onClick={() => handleRemoveImage(taskNum)}
                                className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"
                              >
                                <X className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => fileInputRefs.current[taskNum]?.click()}
                              className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-[#D4AF37]/30 transition-colors"
                            >
                              <Image className="w-6 h-6 text-[#8E8E93] mx-auto mb-2" />
                              <p className="text-xs text-[#8E8E93]">Tap to upload an image</p>
                              <p className="text-[10px] text-[#5A5A5D] mt-1">JPG, PNG up to 5MB</p>
                            </div>
                          )}
                          <input
                            ref={(el) => { fileInputRefs.current[taskNum] = el; }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageSelect(taskNum, e.target.files?.[0] || null)}
                          />
                          <textarea
                            className="input min-h-[60px] resize-none text-sm"
                            placeholder="Optional: add a note..."
                            value={taskInputs[taskNum] || ''}
                            onChange={(e) => setTaskInputs((prev) => ({ ...prev, [taskNum]: e.target.value }))}
                          />
                        </div>
                      ) : (
                        <textarea
                          className="input min-h-[80px] resize-none text-sm"
                          placeholder="Write your response..."
                          value={taskInputs[taskNum] || ''}
                          onChange={(e) => setTaskInputs((prev) => ({ ...prev, [taskNum]: e.target.value }))}
                        />
                      )}
                      <button
                        onClick={() => handleSubmitTask(taskNum)}
                        disabled={isSubmitting || isUploading}
                        className="mt-2 w-full h-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isUploading ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</>
                        ) : isSubmitting ? (
                          'Submitting...'
                        ) : (
                          'Submit'
                        )}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
