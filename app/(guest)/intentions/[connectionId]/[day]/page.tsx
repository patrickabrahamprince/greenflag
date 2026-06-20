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
        <div className="aspect-square bg-surface-light relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image className="w-12 h-12 text-muted/40" />
          </div>
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-gold" />
              <span className="text-xs text-white">Photo selected</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => handleSelect('camera')}
        className="card flex flex-col items-center justify-center py-12 gap-3 hover:border-gold/30 transition-all duration-300 ease-out"
      >
        <div className="w-14 h-14 rounded-full bg-surface-light flex items-center justify-center">
          <Camera className="w-6 h-6 text-gold" />
        </div>
        <span className="text-sm text-white font-medium">Camera</span>
        <span className="text-xs text-muted">Take a photo</span>
      </button>
      <button
        onClick={() => handleSelect('gallery')}
        className="card flex flex-col items-center justify-center py-12 gap-3 hover:border-gold/30 transition-all duration-300 ease-out"
      >
        <div className="w-14 h-14 rounded-full bg-surface-light flex items-center justify-center">
          <Image className="w-6 h-6 text-gold" />
        </div>
        <span className="text-sm text-white font-medium">Gallery</span>
        <span className="text-xs text-muted">Choose from library</span>
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
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <Music className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-sm text-white font-medium">Voice note recorded</p>
            <p className="text-xs text-muted">0:24</p>
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
          isRecording
            ? 'bg-red-500/20 animate-pulse'
            : 'bg-surface hover:bg-surface-light'
        )}
      >
        <Mic className={cn('w-8 h-8', isRecording ? 'text-red-500' : 'text-gold')} />
      </button>
      <p className="text-sm text-muted">
        {isRecording ? 'Recording... tap to stop' : 'Tap to start recording'}
      </p>
      <div className="w-full max-w-xs">
        <div className="h-12 bg-surface rounded-xl flex items-center justify-center gap-1 px-4">
          {isRecording && Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-0.5 bg-gold/60 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
          {!isRecording && !recorded && (
            <span className="text-xs text-muted">Waveform preview</span>
          )}
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
        onChange={(e) => {
          setValue(e.target.value);
          onText(e.target.value);
        }}
        placeholder="Write your response here..."
        rows={6}
        className="input resize-none"
      />
      <div className="flex justify-end">
        <span className="text-xs text-muted">{value.length} characters</span>
      </div>
    </div>
  );
}

function LocationPicker({ onLocation }: { onLocation: (location: string) => void }) {
  const [shared, setShared] = useState(false);

  const handleShare = () => {
    setShared(true);
    onLocation('27.1751° N, 78.0421° E');
  };

  if (shared) {
    return (
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-sm text-white font-medium">Location shared</p>
            <p className="text-xs text-muted">27.1751° N, 78.0421° E</p>
          </div>
        </div>
        <Check className="w-5 h-5 text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="card p-0 overflow-hidden h-48 bg-surface-light flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-muted/40 mx-auto mb-2" />
          <p className="text-xs text-muted">Map preview placeholder</p>
        </div>
      </div>
      <button
        onClick={handleShare}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
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
      const { data: connection, error: connError } = await supabase
        .from('connections')
        .select('*')
        .eq('id', connectionId)
        .single();

      if (connError || !connection) {
        setError('Connection not found');
        setLoading(false);
        return;
      }

      const conn = connection as any;

      const { data: standard, error: stdError } = await supabase
        .from('standards')
        .select('id')
        .eq('id', conn.test_id)
        .single();

      if (stdError || !standard) {
        setError('Standard not found');
        setLoading(false);
        return;
      }

      const std = standard as any;

      const { data: intentionData, error: intError } = await supabase
        .from('intentions')
        .select('*')
        .eq('standard_id', std.id)
        .eq('day', day)
        .single();

      if (intError || !intentionData) {
        setError('Intention not found for this day');
        setLoading(false);
        return;
      }

      setIntention(intentionData);
      setLoading(false);
    };

    fetchIntention();
  }, [connectionId, day]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-muted text-sm">Loading...</div>
      </div>
    );
  }

  if (error || !intention) {
    return (
      <div className="page-container flex flex-col justify-center">
        <div className="empty-state">
          <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-muted/40" />
          </div>
          <h3 className="text-lg font-display text-white mb-2">No Intention Found</h3>
          <p className="text-sm text-muted text-center max-w-xs">
            {error || 'There is no intention set for this day yet.'}
          </p>
          <button
            onClick={() => router.back()}
            className="btn-primary mt-6"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const TypeIcon = {
    photo: Camera,
    voice: Mic,
    text: Type,
    location: MapPin,
  }[intention.type];

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="page-container flex flex-col justify-center">
        <div className="empty-state">
          <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-gold" />
          </div>
          <h3 className="text-lg font-display text-white mb-2">Submitted!</h3>
          <p className="text-sm text-muted text-center max-w-xs">
            She&apos;ll review your intention soon.
          </p>
          <button
            onClick={() => router.back()}
            className="btn-primary mt-6"
          >
            Back to Standard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button
          onClick={() => router.back()}
          className="btn-ghost p-2 -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
          <TypeIcon className="w-6 h-6 text-gold" />
        </div>
        <div>
          <h1 className="text-xl font-display text-white">
            Day {intention.day}: {intention.description}
          </h1>
          <p className="text-sm text-muted mt-0.5">{intention.description}</p>
        </div>
      </div>

      <div className="mb-8">
        {intention.type === 'photo' && (
          <PhotoUploader onUpload={(url) => setProofUrl(url)} />
        )}
        {intention.type === 'voice' && (
          <VoiceRecorder onRecord={(url) => setProofUrl(url)} />
        )}
        {intention.type === 'text' && (
          <TextInput onText={(text) => setProofText(text)} />
        )}
        {intention.type === 'location' && (
          <LocationPicker onLocation={(url) => setProofUrl(url)} />
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={
          intention.type !== 'text'
            ? !proofUrl
            : !proofText.trim()
        }
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Upload className="w-4 h-4" />
        Submit Intention
      </button>
    </div>
  );
}
