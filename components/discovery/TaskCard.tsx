import { useRef } from 'react';
import { CheckCircle, Loader2, Image, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  title: string;
  prompt: string;
  type: 'text' | 'image';
}

interface TaskSubmission {
  task_number: number;
  text_content?: string;
  media_url?: string;
}

interface TaskCardProps {
  taskNumber: number;
  task: Task;
  submission?: TaskSubmission;
  textContent: string;
  imagePreview: string | null;
  isSubmitting: boolean;
  isUploading: boolean;
  onTextChange: (value: string) => void;
  onImageSelect: (file: File | null) => void;
  onImageRemove: () => void;
  onSubmit: () => void;
}

export function TaskCard({
  taskNumber,
  task,
  submission,
  textContent,
  imagePreview,
  isSubmitting,
  isUploading,
  onTextChange,
  onImageSelect,
  onImageRemove,
  onSubmit,
}: TaskCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isTaskSubmitted = !!submission;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gold">
          Task {taskNumber}/8
        </span>
        {isTaskSubmitted && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Done
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-ink mb-1">{task.title}</h3>
      <p className="text-xs text-ink/50 mb-3">{task.prompt}</p>

      {isTaskSubmitted ? (
        <div className="text-xs text-ink/50 bg-well rounded-lg p-3">
          {submission.media_url ? (
            <img
              src={submission.media_url}
              alt="Submitted"
              className="w-full h-40 object-cover rounded-lg"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                const next = img.nextElementSibling as HTMLElement | null;
                if (next) next.classList.remove('hidden');
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
                    onClick={onImageRemove}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-raised rounded-xl p-6 text-center cursor-pointer hover:border-gold transition-colors"
                >
                  <Image className="w-6 h-6 text-ink/50 mx-auto mb-2" />
                  <p className="text-xs text-ink/50">Tap to take a photo</p>
                  <p className="text-[10px] text-ink/50 mt-1">JPG, PNG up to 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => onImageSelect(e.target.files?.[0] || null)}
              />
              <textarea
                className="input min-h-[60px] resize-none text-sm"
                placeholder="Optional: add a note..."
                value={textContent}
                onChange={(e) => onTextChange(e.target.value)}
              />
            </div>
          ) : (
            <textarea
              className="input min-h-[80px] resize-none text-sm"
              placeholder="Write your response..."
              value={textContent}
              onChange={(e) => onTextChange(e.target.value)}
            />
          )}
          <button
            onClick={onSubmit}
            disabled={isSubmitting || isUploading}
            className={cn(
              'mt-2 w-full h-9 rounded-lg bg-gold/10 border border-gold/30',
              'text-gold text-xs font-medium active:scale-95 transition-all',
              'disabled:opacity-50 flex items-center justify-center gap-2'
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
              </>
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
}
