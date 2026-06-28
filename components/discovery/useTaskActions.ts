'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadFile } from '@/lib/supabase/storage';
import toast from 'react-hot-toast';

export interface TaskSubmission {
  id: number;
  connection_id: string;
  task_number: number;
  content_type: string;
  text_content?: string;
  media_url?: string;
  submitted_at: string;
}

export interface Host {
  id: string;
  name: string;
  age: number;
  photos: string[];
  standards: unknown[];
}

export interface ConnectionData {
  id: string;
  status: string;
  deadline: string;
  tasks_completed: number;
  host: Host;
  submissions: TaskSubmission[];
}

export interface StandardTask {
  title: string;
  prompt: string;
  type: 'text' | 'image';
}

export const STANDARD_DEFAULTS: StandardTask[] = [
  { title: 'Financial Mindset', prompt: 'Describe your view on wealth building', type: 'text' },
  { title: 'Life Vision', prompt: 'Where do you see yourself in 5 years?', type: 'text' },
  { title: 'Emotional Intelligence', prompt: 'How do you handle conflict?', type: 'text' },
  { title: 'Daily Rituals', prompt: 'Describe your ideal morning routine', type: 'text' },
  { title: 'Adventure Style', prompt: 'Share a photo from your favorite adventure', type: 'image' },
  { title: 'Personal Growth', prompt: 'What is a skill you are developing?', type: 'text' },
  { title: 'Connection Values', prompt: 'What matters most in a partnership?', type: 'text' },
  { title: 'Final Note', prompt: 'Share a photo that represents who you are', type: 'image' },
];

export function useTaskActions(connection: ConnectionData | null, setConnection: (c: ConnectionData) => void) {
  const supabase = createClient();
  const [taskInputs, setTaskInputs] = useState<Record<number, string>>({});
  const [taskImages, setTaskImages] = useState<Record<number, File | null>>({});
  const [taskImagePreviews, setTaskImagePreviews] = useState<Record<number, string>>({});
  const [uploadingTask, setUploadingTask] = useState<number | null>(null);
  const [submittingTask, setSubmittingTask] = useState<number | null>(null);

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
  };

  const handleSubmitTask = async (tasks: StandardTask[], taskNumber: number) => {
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
      if (data.error) {
        if (data.error === 'INSUFFICIENT_COINS') {
          toast.error(`Not enough coins. You need ${data.coins_needed} coins to submit.`);
        } else {
          toast.error(data.error);
        }
        return;
      }
      toast.success(
        data.day_advanced ? `Day complete! Moving to the next day.` : `Task ${taskNumber} submitted`
      );

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

  return {
    taskInputs,
    taskImages,
    taskImagePreviews,
    uploadingTask,
    submittingTask,
    handleImageSelect,
    handleRemoveImage,
    handleSubmitTask,
    setTaskInputs,
  };
}
