'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Mic, Type, MapPin, Check, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Intention } from '@/types';
import { PhotoUploader } from '@/components/guest/PhotoUploader';
import { VoiceRecorder } from '@/components/guest/VoiceRecorder';
import { TextInput } from '@/components/guest/TextInput';

export default function IntentionPage({
  params,
}: {
  params: { connectionId: string; day: string };
}) {
  const { connectionId, day: dayStr } = params;
  const day = parseInt(dayStr, 10);
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [proofUrl, setProofUrl] = useState<string>('');
  const [proofText, setProofText] = useState<string>('');
  const [intention, setIntention] = useState<Intention | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const fetchIntention = async () => {
      const { data: connection, error: connError } = await supabase.from('connections').select('*').eq('id', connectionId).single();
      if (connError || !connection) { setError('Connection not found'); setLoading(false); return; }
      const conn = connection as { standard_id: string } | null;
      if (!conn?.standard_id) { setError('Standard not found'); setLoading(false); return; }
      const { data: standard, error: stdError } = await supabase.from('standards').select('id').eq('id', conn.standard_id).single();
      if (stdError || !standard) { setError('Standard not found'); setLoading(false); return; }
      const std = standard as { id: string } | null;
      if (!std?.id) { setError('Standard not found'); setLoading(false); return; }
      const { data: intentionData, error: intError } = await supabase.from('intentions').select('*').eq('standard_id', std.id).eq('day_number', day).single();
      if (intError || !intentionData) { setError('Intention not found for this day'); setLoading(false); return; }
      setIntention(intentionData as Intention);
      setLoading(false);
    };
    fetchIntention();
  }, [connectionId, day]);

  if (loading) return <div className="page-container flex items-center justify-center"><div className="text-muted text-sm font-thin">Loading...</div></div>;

  if (error || !intention) {
    return (
      <div className="page-container flex flex-col justify-center">
        <div className="empty-state">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#111111' }}><MapPin className="w-8 h-8 text-muted/30" /></div>
          <h3 className="text-lg font-display italic text-white mb-2">No Intention Found</h3>
          <p className="text-sm text-muted text-center max-w-xs font-thin">{error || 'There is no intention set for this day yet.'}</p>
          <button onClick={() => router.back()} className="btn-primary mt-6">Go Back</button>
        </div>
      </div>
    );
  }

  const TypeIcon = { photo: Camera, voice: Mic, text: Type }[intention.type] as React.ComponentType<{ className?: string }>;

  const handleSubmit = () => setSubmitted(true);

  if (submitted) {
    return (
      <div className="page-container flex flex-col justify-center">
        <div className="empty-state">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(212,175,55,0.1)' }}><Check className="w-8 h-8 text-gold" /></div>
          <h3 className="text-lg font-display italic text-white mb-2">Submitted!</h3>
          <p className="text-sm text-muted text-center max-w-xs font-thin">She&apos;ll review your intention soon.</p>
          <button onClick={() => router.back()} className="btn-primary mt-6">Back to Standard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => router.back()} className="btn-ghost p-2 -ml-2"><ArrowLeft className="w-5 h-5" /></button>
      </div>

      <div className="text-center mb-8">
        <p className="text-5xl font-display italic text-gold mb-2" style={{ fontWeight: 500 }}>Day {intention.day_number}</p>
        <div className="hairline mx-auto mt-4 mb-4 w-12" />
        <p className="text-lg font-display italic text-white/80 leading-relaxed max-w-sm mx-auto">{intention.prompt}</p>
      </div>

      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <TypeIcon className="w-5 h-5 text-gold" />
        </div>
        <span className="text-sm text-muted font-thin uppercase tracking-widest-xl">Submit your response</span>
      </div>

      <div className="mb-8">
        {intention.type === 'photo' && <PhotoUploader onUpload={(url) => setProofUrl(url)} />}
        {intention.type === 'voice' && <VoiceRecorder onRecord={(url) => setProofUrl(url)} />}
        {intention.type === 'text' && <TextInput onText={(text) => setProofText(text)} />}
      </div>

      <button
        onClick={handleSubmit}
        disabled={intention.type !== 'text' ? !proofUrl : !proofText.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Submit Intention
      </button>
    </div>
  );
}
