'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { HostHeader } from '@/components/discovery/HostHeader';
import { TaskProgressBar } from '@/components/discovery/TaskProgressBar';
import { TaskCard } from '@/components/discovery/TaskCard';
import { TaskEmptyState } from '@/components/discovery/TaskEmptyState';
import {
  useTaskActions,
  STANDARD_DEFAULTS,
  type ConnectionData,
  type StandardTask,
} from '@/components/discovery/useTaskActions';

export default function TasksPage({ params }: { params: Promise<{ hostName: string }> }) {
  const { hostName } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [connection, setConnection] = useState<ConnectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  const {
    taskInputs, taskImagePreviews, uploadingTask, submittingTask,
    handleImageSelect, handleRemoveImage, handleSubmitTask, setTaskInputs,
  } = useTaskActions(connection, setConnection);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      const hostRes = await supabase
        .from('profiles')
        .select('id')
        .eq('name', hostName.charAt(0).toUpperCase() + hostName.slice(1))
        .single();
      const hostRaw = hostRes?.data as { id: string } | null;
      if (!hostRaw) { setLoading(false); return; }

      const connRes = await supabase
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!connection) {
    return <TaskEmptyState type="no-connection" hostName={hostName} onNavigate={router.push} />;
  }

  const status = connection.status;
  const submissions = connection.submissions || [];
  const completedCount = submissions.length;
  const hostStandards = connection.host.standards as StandardTask[] | null;
  const tasks: StandardTask[] = hostStandards?.length === 8 ? hostStandards : STANDARD_DEFAULTS;
  const isSubmitted = status === 'tasks_submitted';

  if (status === 'chat_unlocked') { router.push(`/messages/${connection.id}`); return null; }
  if (status === 'rejected') return <TaskEmptyState type="rejected" onNavigate={router.push} />;
  if (status === 'expired') return <TaskEmptyState type="expired" onNavigate={router.push} />;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      <div className="px-4 py-4">
        <HostHeader host={connection.host} timeLeft={timeLeft} onBack={() => router.push('/discover')} />
        <TaskProgressBar completedCount={completedCount} isSubmitted={isSubmitted} />

        {isSubmitted ? (
          <TaskEmptyState type="submitted" onNavigate={router.push} />
        ) : (
          <div className="space-y-4">
            {tasks.map((task, idx) => {
              const taskNum = idx + 1;
              const submission = submissions.find((s) => s.task_number === taskNum);
              return (
                <TaskCard
                  key={taskNum}
                  taskNumber={taskNum}
                  task={task}
                  submission={submission}
                  textContent={taskInputs[taskNum] || ''}
                  imagePreview={taskImagePreviews[taskNum] || null}
                  isSubmitting={submittingTask === taskNum}
                  isUploading={uploadingTask === taskNum}
                  onTextChange={(val) => setTaskInputs((p) => ({ ...p, [taskNum]: val }))}
                  onImageSelect={(file) => handleImageSelect(taskNum, file)}
                  onImageRemove={() => handleRemoveImage(taskNum)}
                  onSubmit={() => handleSubmitTask(tasks, taskNum)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
