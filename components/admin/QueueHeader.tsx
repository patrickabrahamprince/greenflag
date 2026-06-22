import { Inbox } from 'lucide-react';

export function QueueHeader() {
  return (
    <>
      <h1 className="text-2xl font-display text-white mb-2">Photo Moderation Queue</h1>
      <p className="text-sm text-muted mb-6">
        Keyboard shortcuts: <kbd className="px-1.5 py-0.5 bg-surface-light rounded text-xs">A</kbd> Approve{' '}
        <kbd className="px-1.5 py-0.5 bg-surface-light rounded text-xs">R</kbd> Reject{' '}
        <kbd className="px-1.5 py-0.5 bg-surface-light rounded text-xs">Space</kbd> Next
      </p>
    </>
  );
}

export function QueueEmptyState() {
  return (
    <div className="empty-state py-16">
      <div className="empty-state-icon">
        <Inbox className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Queue is empty</h3>
      <p className="text-muted text-sm">No submissions pending review. Check back later.</p>
    </div>
  );
}
