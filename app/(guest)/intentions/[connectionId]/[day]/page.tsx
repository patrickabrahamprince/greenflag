'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Mic, Type, MapPin, Check, Upload, Image, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { Intention } from '@/types';

function PhotoUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleSelect = (source: 'camera' | 'gallery') => {
    const placeholder = `https://images.unsplash.com/photo-${Date.now()}?w=800&h=800&fit=crop`;
    setPreview(placeholder);
    onUpload(placeholder);
  };

  if (preview) {
    return (
      <div className="card p-0 overflow-hidden">
        <div className="aspect-square relative" style={{ background: '#161616' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image className="w-12 h-12 text-muted/30" />
          </div>
          <div className="absolute bottom-3 left-3 backdrop-blur-sm rounded-lg px-3 py-1.5" style={{ background: 'rgba(8,8,8,0.7)' }}>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-gold" />
              <span className="text-xs text-white font-thin">Photo selected</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <button onClick={() => handleSelect('camera')} className="card flex flex-col items-center justify-center py-12 gap-3 hover:gold-border-left transition-all duration-300">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#161616' }}>
          <Camera className="w-6 h-6 text-gold" />
        </div>
        <span className="text-sm text-white font-medium">Camera</span>
        <span className="text-xs text-muted font-thin">Take a photo</span>
      </button>
      <button onClick={() => handleSelect('gallery')} className="card flex flex-col items-center justify-center py-12 gap-3 hover:gold-border-left transition-all duration-300">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#161616' }}>
          <Image className="w-6 h-6 text-gold" />
        </div>
        <span className="text-sm text-white font-medium">Gallery</span>
        <span className="text-xs text-muted font-thin">Choose from library</span>
      </button>
    </div>
  );
}

function VoiceRecorder({ onRecord }: { onRecord: (url: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecorded(true);
      onRecord('voice://recording');
    } else {
      setIsRecording(true);
    }
  };

  if (recorded) {
    return (
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
            <Music className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-sm text-white font-medium">Voice note recorded</p>
            <p className="text-xs text-muted font-thin">0:24</p>
          </div>
        </div>
        <Check className="w-5 h-5 text-gold" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <button
        onClick={handleToggleRecording}
        className={cn(
          'w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ease-out',
          isRecording ? 'animate-pulse' : ''
        )}
        style={{
          background: isRecording ? 'rgba(239,68,68,0.15)' : '#111111',
          border: isRecording ? '2px solid rgba(239,68,68,0.4)' : '1px solid #1E1E1E',
        }}
      >
        <Mic className={cn('w-8 h-8', isRecording ? 'text-red-500' : 'text-gold')} />
      </button>
      <p className="text-sm text-muted font-thin">
        {isRecording ? 'Recording... tap to stop' : 'Tap to start recording'}
      </p>
      <div className="w-full max-w-xs">
        <div className="h-12 rounded-xl flex items-center justify-center gap-1 px-4" style={{ background: '#111111' }}>
          {isRecording && Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-0.5 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, background: 'rgba(212,175,55,0.5)', animationDelay: `${i * 0.05}s` }} />
          ))}
          {!isRecording && !recorded && <span className="text-xs text-muted font-thin">Waveform preview</span>}
        </div>
      </div>
    </div>
  );
}

function TextInput({ onText }: { onText: (text: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => { setValue(e.target.value); onText(e.target.value); }}
        placeholder="Write your response here..."
        rows={6}
        className="input resize-none"
      />
      <div className="flex justify-end">
        <span className="text-xs text-muted font-thin">{value.length} characters</span>
      </div>
    </div>
  );
}

function LocationPicker({ onLocation }: { onLocation: (location: string) => void }) {
  const [shared, setShared] = useState(false);
  const handleShare = () => { setShared(true); onLocation('27.1751° N, 78.0421° E'); };

  if (shared) {
    return (
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
            <MapPin className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-sm text-white font-medium">Location shared</p>
            <p className="text-xs text-muted font-thin">27.1751° N, 78.0421° E</p>
          </div>
        </div>
        <Check className="w-5 h-5 text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="card p-0 overflow-hidden h-48 flex items-center justify-center" style={{ background: '#111111' }}>
        <div className="text-center">
          <MapPin className="w-8 h-8 text-muted/30 mx-auto mb-2" />
          <p className="text-xs text-muted font-thin">Map preview placeholder</p>
        </div>
      </div>
      <button onClick={handleShare} className="btn-primary w-full flex items-center justify-center gap-2">
        <MapPin className="w-4 h-4" />
        Share Location
      </button>
    </div>
  );
}

export default function IntentionPage({
  params,
}: {
  params: Promise<{ connectionId: string; day: string }>;
}) {
  const { connectionId, day: dayStr } = use(params);
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
      const conn = connection as any;
      const { data: standard, error: stdError } = await supabase.from('standards').select('id').eq('id', conn.test_id).single();
      if (stdError || !standard) { setError('Standard not found'); setLoading(false); return; }
      const std = standard as any;
      const { data: intentionData, error: intError } = await supabase.from('intentions').select('*').eq('standard_id', std.id).eq('day', day).single();
      if (intError || !intentionData) { setError('Intention not found for this day'); setLoading(false); return; }
      setIntention(intentionData);
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

  const TypeIcon = { photo: Camera, voice: Mic, text: Type, location: MapPin }[intention.type];

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

      {/* Day hero */}
      <div className="text-center mb-8">
        <p className="text-5xl font-display italic text-gold mb-2" style={{ fontWeight: 500 }}>Day {intention.day}</p>
        <div className="hairline mx-auto mt-4 mb-4 w-12" />
        <p className="text-lg font-display italic text-white/80 leading-relaxed max-w-sm mx-auto">{intention.description}</p>
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
        {intention.type === 'location' && <LocationPicker onLocation={(url) => setProofUrl(url)} />}
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
