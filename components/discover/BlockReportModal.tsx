'use client';

import { useEffect, useState } from 'react';
import { Ban, Flag, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InfoBanner } from '@/components/ui/info-banner';
import { MenuOption } from '@/components/ui/menu-option';
import { REPORT_REASONS, useBlockReport } from '@/lib/hooks/useBlockReport';

interface BlockReportModalProps {
  profileId: string;
  profileName: string;
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'menu' | 'report' | 'block';

const DIALOG_CONTENT_CLASS =
  'max-h-[85vh] overflow-y-auto border-white/10 bg-surface/80 shadow-flat-dark backdrop-blur-2xl data-[state=open]:animate-card-enter';

export function BlockReportModal({ profileId, profileName, isOpen, onClose }: BlockReportModalProps) {
  const [step, setStep] = useState<Step>('menu');

  const {
    reportReason,
    setReportReason,
    reportDetails,
    setReportDetails,
    loading,
    handleBlock,
    handleReport,
    reset,
  } = useBlockReport({ profileId, profileName, onDone: onClose });

  useEffect(() => {
    if (isOpen) return;
    const timeout = setTimeout(() => {
      setStep('menu');
      reset();
    }, 250);
    return () => clearTimeout(timeout);
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={DIALOG_CONTENT_CLASS}>
        <DialogHeader>
          <DialogTitle>What's wrong?</DialogTitle>
        </DialogHeader>

        <div key={step} className="animate-slide-up space-y-4">
          {step === 'menu' && (
            <div className="space-y-3">
              <MenuOption
                icon={Flag}
                iconClassName="text-amber-500"
                title={`Report ${profileName}`}
                description="They broke community guidelines"
                onClick={() => setStep('report')}
              />
              <MenuOption
                icon={Ban}
                iconClassName="text-[#D2042D]"
                title={`Block ${profileName}`}
                description="You won't see them again"
                onClick={() => setStep('block')}
              />
            </div>
          )}

          {step === 'report' && (
            <>
              <InfoBanner tone="warning">
                Reports help keep GreenFlag safe. Our team will review this.
              </InfoBanner>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-ink/70">What's the issue?</p>
                <div role="radiogroup" aria-label="Report reason" className="space-y-2">
                  {REPORT_REASONS.map((reason) => (
                    <MenuOption
                      key={reason.value}
                      title={reason.label}
                      selected={reportReason === reason.value}
                      onClick={() => setReportReason(reason.value)}
                      className="px-4 py-3"
                    />
                  ))}
                </div>
              </div>

              {reportReason === 'other' && (
                <div className="space-y-1.5">
                  <label htmlFor="report-details" className="text-xs font-semibold text-ink/70">
                    Tell us more (optional)
                  </label>
                  <textarea
                    id="report-details"
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="What happened?"
                    maxLength={500}
                    rows={3}
                    className="w-full resize-none rounded-tile border border-raised bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted transition-all duration-300 ease-out focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                  />
                  <p className="text-right text-[10px] text-ink/40">{reportDetails.length}/500</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setStep('menu')}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={loading || !reportReason}
                  onClick={handleReport}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Submit report'}
                </Button>
              </div>
            </>
          )}

          {step === 'block' && (
            <>
              <InfoBanner tone="danger">
                {profileName} won't be able to see your profile or message you.
              </InfoBanner>

              <div className="flex gap-2 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setStep('menu')}>
                  Cancel
                </Button>
                <Button variant="danger" className="flex-1" disabled={loading} onClick={handleBlock}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Block'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
