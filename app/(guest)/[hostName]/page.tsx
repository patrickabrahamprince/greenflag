'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader2, Image, Send, AlertCircle, Coins } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCoinStore } from '@/lib/store';
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
  const [submittingTask, setSubmittingTask] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

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

  const handleSubmitTask = async (taskNumber: number) => {
    const content = taskInputs[taskNumber];
    if (!content?.trim()) { toast.error('Please fill in your response'); return; }
    setSubmittingTask(taskNumber);
    try {
      const res = await fetch(`/api/connections/${connection!.id}/submit-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_number: taskNumber, text: content.trim() }),
      });
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      toast.success(`Task ${taskNumber} submitted`);
      const connRes = await fetch(`/api/connections/${connection!.id}`);
      const updated = await connRes.json();
      if (updated.id) setConnection(updated);
    } catch {
      toast.error('Submission failed');
    } finally {
      setSubmittingTask(null);
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
              <img src={c.host.photos[0]} alt="" className="w-full h-full object-cover" />
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
              const isSubmitted = !!submission;
              const isSubmitting = submittingTask === taskNum;

              return (
                <div key={taskNum} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[#D4AF37]">Task {taskNum}/8</span>
                    {isSubmitted && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Done
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-[#EDEADE] mb-1">{task.title}</h3>
                  <p className="text-xs text-[#8E8E93] mb-3">{task.prompt}</p>

                  {isSubmitted ? (
                    <div className="text-xs text-[#8E8E93] bg-white/5 rounded-lg p-3">
                      {submission.text_content || (submission.media_url && 'Image uploaded')}
                    </div>
                  ) : (
                    <>
                      {task.type === 'image' ? (
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center">
                          <Image className="w-6 h-6 text-[#8E8E93] mx-auto mb-2" />
                          <p className="text-xs text-[#8E8E93]">Tap to upload an image</p>
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
                        disabled={isSubmitting}
                        className="mt-2 w-full h-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
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
