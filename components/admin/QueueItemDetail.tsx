import { Check, X, Ban, Loader2 } from 'lucide-react';
import type { QueueItem } from './types';

export interface QueueItemDetailProps {
  item: QueueItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  moderating: boolean;
}

export function QueueItemDetail({ item, onApprove, onReject, moderating }: QueueItemDetailProps) {
  return (
    <div className="card">
      <div className="min-h-[160px] bg-surface-light rounded-xl flex items-center justify-center mb-4 p-4">
        {item.media_type === 'voice' ? (
          <audio controls src={item.img} className="w-full" />
        ) : item.media_type === 'text' ? (
          <p className="text-white text-base leading-relaxed italic text-center">
            {item.content ? `"${item.content}"` : 'No text submitted'}
          </p>
        ) : item.img ? (
          <img src={item.img} alt="" className="w-full h-full object-cover rounded-xl" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
        ) : (
          <span className="text-muted text-sm">No Preview Available</span>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <span className="text-xs text-muted">Guest</span>
          <p className="text-white font-medium">{item.name}</p>
        </div>
        <div>
          <span className="text-xs text-muted">Day</span>
          <p className="text-white font-medium">Day {item.day}</p>
        </div>
        <div>
          <span className="text-xs text-muted">Prompt</span>
          <p className="text-white text-sm">{item.task || 'Not available'}</p>
        </div>
        <div>
          <span className="text-xs text-muted">Previous Reviews</span>
          <p className="text-white text-sm">None</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onApprove(item.id)}
          disabled={moderating}
          className="flex-1 bg-green-500/10 text-green-500 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-green-500/20 transition-colors disabled:opacity-40"
        >
          {moderating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
        </button>
        <button
          onClick={() => onReject(item.id)}
          disabled={moderating}
          className="flex-1 bg-red-500/10 text-red-500 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition-colors disabled:opacity-40"
        >
          {moderating ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />} Reject
        </button>
        <button className="btn-danger text-sm py-2.5 px-3">
          <Ban className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
