import { Check, X, Ban } from 'lucide-react';
import type { QueueItem } from './types';

export interface QueueItemDetailProps {
  item: QueueItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function QueueItemDetail({ item, onApprove, onReject }: QueueItemDetailProps) {
  return (
    <div className="card">
      <div className="aspect-video bg-surface-light rounded-xl flex items-center justify-center mb-4">
        {item.img ? (
          <img src={item.img} alt="" className="w-full h-full object-cover rounded-xl" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
        ) : (
          <span className="text-muted text-sm">Photo Preview</span>
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
          <span className="text-xs text-muted">Task</span>
          <p className="text-white text-sm">{item.task}</p>
        </div>
        <div>
          <span className="text-xs text-muted">Previous Reviews</span>
          <p className="text-white text-sm">None</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onApprove(item.id)}
          className="flex-1 bg-green-500/10 text-green-500 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-green-500/20 transition-colors"
        >
          <Check className="w-4 h-4" /> Approve
        </button>
        <button
          onClick={() => onReject(item.id)}
          className="flex-1 bg-red-500/10 text-red-500 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition-colors"
        >
          <X className="w-4 h-4" /> Reject
        </button>
        <button className="btn-danger text-sm py-2.5 px-3">
          <Ban className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
