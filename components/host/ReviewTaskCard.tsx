import { Check, Image } from 'lucide-react';

interface Task {
  title: string;
  prompt: string;
  type: string;
}

interface TaskSubmission {
  task_number: number;
  content_type: string;
  text_content?: string;
  media_url?: string;
}

interface ReviewTaskCardProps {
  task: Task;
  taskNumber: number;
  submission?: TaskSubmission;
}

export function ReviewTaskCard({ task, taskNumber, submission }: ReviewTaskCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#D4AF37]">Task {taskNumber}/8</span>
        {submission ? (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <Check className="w-3 h-3" /> Submitted
          </span>
        ) : (
          <span className="text-xs text-[#8E8E93]">Not submitted</span>
        )}
      </div>
      <h3 className="text-sm font-medium text-[#EDEADE] mb-1">{task.title}</h3>
      <p className="text-xs text-[#8E8E93] mb-2">{task.prompt}</p>

      {submission ? (
        <div className="space-y-2">
          {submission.media_url && (
            <div className="relative">
              <img
                src={submission.media_url}
                alt={`Task ${taskNumber} submission`}
                className="w-full h-48 object-cover rounded-xl"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  const fallback = img.nextElementSibling as HTMLElement;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="hidden bg-white/5 rounded-xl p-4 text-center">
                <Image className="w-6 h-6 text-[#8E8E93] mx-auto mb-1" />
                <p className="text-xs text-[#8E8E93]">Image unavailable</p>
              </div>
            </div>
          )}
          {submission.text_content && (
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-sm text-[#EDEADE] leading-relaxed">{submission.text_content}</p>
            </div>
          )}
          {!submission.media_url && !submission.text_content && (
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-[#5A5A5D] italic">Empty submission</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-[#5A5A5D] italic">Awaiting submission</p>
        </div>
      )}
    </div>
  );
}
