'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  variant?: 'danger' | 'primary';
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Confirm',
  variant = 'primary',
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            className="flex-1"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
