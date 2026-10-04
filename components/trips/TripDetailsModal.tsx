'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  X, 
  MapPin, 
  Calendar, 
  Users, 
  Shield, 
  Share2, 
  Check, 
  Sparkles, 
  Clock, 
  Navigation, 
  IndianRupee,
  MessageCircle,
  Send,
  Lock,
  ArrowRight,
  Star,
  Fuel,
  Bed,
  Utensils
} from 'lucide-react';
import { Trip, TripQAItem } from '@/types';
import { POPULAR_DESTINATIONS } from '@/lib/trips-data';
import { CostSplitCalculator } from '@/components/trips/CostSplitCalculator';
import { hapticTap, hapticSuccess, hapticWarning } from '@/lib/haptics';
import toast from 'react-hot-toast';

interface TripDetailsModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestClick: (trip: Trip) => void;
  onManageClick: (trip: Trip) => void;
  currentUserId?: string;
}

const DEFAULT_QA: TripQAItem[] = [
  {
    id: 'qa-1',
    user_name: 'Ananya S.',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    question: 'Are you taking a car from Indiranagar or meeting directly at the venue?',
    answer: 'I have 2 open seats in my Honda City from Indiranagar Metro!',
    created_at: '2 hours ago',
  },
  {
    id: 'qa-2',
    user_name: 'Rahul K.',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    question: 'Is this beginner-friendly for the sunrise trail?',
    answer: 'Yes absolutely! It is a relaxed morning walk followed by breakfast.',
    created_at: 'Yesterday',
  },
];

export function TripDetailsModal({
  trip,
  isOpen,
  onClose,
  onRequestClick,
  onManageClick,
  currentUserId,
}: TripDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'split' | 'qa' | 'safety'>('itinerary');
  const [qaList, setQaList] = useState<TripQAItem[]>(DEFAULT_QA);
  const [newQuestion, setNewQuestion] = useState('');
  
  // Join request note (Min 10 characters)
  const [showJoinSheet, setShowJoinSheet] = useState(false);
  const [joinIntent, setJoinIntent] = useState<'green' | 'pink'>('green');
  const [joinNote, setJoinNote] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);

  if (!isOpen || !trip) return null;

  const isHost = currentUserId && trip.host_id === currentUserId;
  const popularDest = POPULAR_DESTINATIONS.find(
    (d) => d.name.toLowerCase() === trip.destination.toLowerCase()
  );
  const heroImage = popularDest?.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

  const handleShare = () => {
    hapticTap();
    if (navigator.share) {
      navigator.share({
        title: `${trip.destination} Travel Plan on Greenflag`,
        text: `Heading to ${trip.destination} (${trip.start_date}). Check out the itinerary & cost split on Greenflag:`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Heading to ${trip.destination} (${trip.start_date})! Check out our trip plan on Greenflag: ${window.location.href}`
      );
      toast.success('Trip link copied to clipboard!');
      hapticSuccess();
    }
  };

  const handlePostQuestion = () => {
    if (!newQuestion.trim()) return;
    hapticSuccess();
    const newQA: TripQAItem = {
      id: `qa-${Date.now()}`,
      user_name: 'You',
      question: newQuestion.trim(),
      created_at: 'Just now',
    };
    setQaList([newQA, ...qaList]);
    setNewQuestion('');
    toast.success('Question posted to public trip wall!');
  };

  const handleSubmitJoinRequest = () => {
    if (joinNote.trim().length < 10) {
      hapticWarning();
      toast.error('Please write a note (min 10 characters) introducing yourself');
      return;
    }

    setSubmittingJoin(true);
    hapticSuccess();
    setTimeout(() => {
      setSubmittingJoin(false);
      setShowJoinSheet(false);
      onRequestClick(trip);
      toast.success(`Request sent as ${joinIntent === 'pink' ? '💗 Pink Flag (Date)' : '🟢 Green Flag (Buddy)'}! Host has 2 hours to accept.`);
    }, 600);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          hapticTap();
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-white border border-stone-200 rounded-t-[36px] sm:rounded-[36px] max-w-xl w-full h-[90dvh] max-h-[90dvh] flex flex-col min-h-0 overflow-hidden shadow-2xl text-stone-900">
        
        {/* Destination Hero Banner */}
        <div className="relative h-44 sm:h-52 w-full shrink-0 overflow-hidden">
          <Image
            src={heroImage}
            alt={trip.destination}
            fill
            sizes="650px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/60" />

          {/* Close & Share buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <button
              onClick={() => {
                hapticTap();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-xs text-white font-semibold active:scale-95 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>

          {/* Banner Badges */}
          <div className="absolute bottom-3 left-5 right-5 z-10">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border border-white/40 text-white ${
                trip.flag_color === 'pink' ? 'bg-pink-600' : 'bg-emerald-700'
              }`}>
                {trip.flag_color === 'pink' ? '💗 Pink Flag • Date' : '🟢 Green Flag • Buddy'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold">
                {trip.ladder_level === 3 ? 'Getaway Date (2+ Days)' : trip.ladder_level === 2 ? 'Day Date' : 'Micro Date (60-90m)'}
              </span>
              {trip.female_only && (
                <span className="px-2.5 py-0.5 rounded-full bg-stone-900/90 text-white text-[10px] font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Female-Only
                </span>
              )}
            </div>
            <h2 className="text-2xl font-display font-extrabold text-white tracking-tight drop-shadow-md">
              {trip.destination}
            </h2>
            <p className="text-xs text-white/90 font-semibold flex items-center gap-2 mt-0.5">
              <span>{trip.start_date}</span>
              <span>•</span>
              <span>{trip.why_match || 'Both Free Today • Shared Vibe'}</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="px-5 pt-3 pb-1 bg-white border-b border-stone-200 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'itinerary', label: 'Itinerary & Stops' },
            { id: 'split', label: 'Cost Split (₹)' },
            { id: 'qa', label: `Q&A (${qaList.length})` },
            { id: 'safety', label: 'Host & Safety' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                hapticTap();
                setActiveTab(t.id as unknown as typeof activeTab);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-[#1C1C1E] text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 overflow-y-auto overscroll-contain space-y-4 flex-1 min-h-0 no-scrollbar">

          {/* TAB 1: ITINERARY */}
          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              
              {/* Host Passport Bar */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-[24px] flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-stone-300 bg-stone-100 shrink-0">
                    {trip.host?.photos?.[0] ? (
                      <Image
                        src={trip.host.photos[0]}
                        alt={trip.host.name || 'Host'}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-900 font-extrabold text-base">
                        {trip.host?.name?.charAt(0) || 'H'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-stone-900">{trip.host?.name || 'Verified Host'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Govt ID
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500 font-bold">
                      <span className="text-stone-800 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-stone-900 text-stone-900" /> {trip.host_green_score || 4.9} Green Score
                      </span>
                      <span>•</span>
                      <span>18 Trips Hosted</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-black text-stone-400 block">Spots</span>
                  <span className="text-xs font-extrabold text-stone-900">
                    {trip.spots_available} of {trip.spots_total} left
                  </span>
                </div>
              </div>

              {/* Itinerary Steps */}
              <div className="p-4 bg-white border border-stone-200 rounded-[24px] shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-stone-900" /> Planned Stops & Flow
                </h4>

                <div className="space-y-3 relative pl-4 border-l-2 border-stone-200 ml-2">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-stone-900 ring-4 ring-stone-100" />
                    <div className="font-extrabold text-xs text-stone-900">Stop 1: Meeting & Chai / Coffee</div>
                    <p className="text-[11px] text-stone-500 font-medium">Public meeting spot ({trip.destination}). Quick intros & morning brew.</p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-stone-900 ring-4 ring-stone-100" />
                    <div className="font-extrabold text-xs text-stone-900">Stop 2: Main Activity / Viewpoint</div>
                    <p className="text-[11px] text-stone-500 font-medium">{trip.vibe} session, walking trail or scenic overlook.</p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-stone-900 ring-4 ring-stone-100" />
                    <div className="font-extrabold text-xs text-stone-900">Stop 3: Wrap Up & Secret Spark</div>
                    <p className="text-[11px] text-stone-500 font-medium">Split bills via UPI, return safely & rate your experience in app.</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-[24px] shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  About This Hangout
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed font-medium">
                  {trip.description || `Relaxed ${trip.vibe} hangout at ${trip.destination}. Open to verified members!`}
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: COST SPLIT */}
          {activeTab === 'split' && (
            <div className="space-y-3">
              <CostSplitCalculator
                initialFuel={trip.cost_split?.fuel || 800}
                initialFood={trip.cost_split?.food || 600}
                initialStay={trip.cost_split?.stay || 0}
                initialGroupSize={trip.spots_total || 2}
                tripTitle={trip.destination}
              />
            </div>
          )}

          {/* TAB 3: Q&A WALL */}
          {activeTab === 'qa' && (
            <div className="space-y-4">
              <div className="p-4 bg-white border border-stone-200 rounded-[24px] shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Public Questions & Answers
                </h4>

                <div className="space-y-3">
                  {qaList.map((qa) => (
                    <div key={qa.id} className="p-3 bg-stone-50 border border-stone-200 rounded-[18px] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-stone-900">{qa.user_name}</span>
                        <span className="text-stone-400 font-medium">{qa.created_at}</span>
                      </div>
                      <p className="text-xs font-bold text-stone-800">Q: {qa.question}</p>
                      {qa.answer && (
                        <p className="text-xs text-stone-900 bg-white p-2.5 rounded-[12px] border border-stone-200 font-medium">
                          <strong>Host:</strong> {qa.answer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Ask box */}
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask the host a question about timing, carpool..."
                    className="flex-1 p-2.5 bg-stone-50 border border-stone-200 rounded-full text-xs font-bold text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#1C1C1E] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handlePostQuestion}
                    className="p-2.5 bg-[#1C1C1E] text-white rounded-full hover:bg-black transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAFETY */}
          {activeTab === 'safety' && (
            <div className="space-y-3">
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-[24px] space-y-2">
                <div className="flex items-center gap-2 text-stone-900 font-extrabold text-xs">
                  <Shield className="w-4 h-4 text-stone-900" />
                  <span>Verified Safety Framework</span>
                </div>
                <ul className="text-xs text-stone-700 space-y-1.5 font-medium">
                  <li>• <strong>No Ghosting Guarantee:</strong> Host has 2 hours to accept or request expires automatically.</li>
                  <li>• <strong>Public Place Enforcement:</strong> Level 1 Micro Dates are restricted to verified public venues.</li>
                  <li>• <strong>Govt ID + Face Match:</strong> All attendees are verified with Digilocker.</li>
                  <li>• <strong>Emergency Live Location:</strong> 1-tap share with your emergency contacts during the trip.</li>
                </ul>
              </div>

              <div className="p-4 bg-white border border-stone-200 rounded-[24px] shadow-xs space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Host Badges
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-stone-100 border border-stone-200 text-stone-900 rounded-full text-xs font-bold">
                    ⏱️ On-Time 15x
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-full text-xs font-bold">
                    🛡️ Safe Host (100% 5★)
                  </span>
                  <span className="px-3 py-1 bg-stone-100 border border-stone-200 text-stone-900 rounded-full text-xs font-bold">
                    🚗 Verified Car Owner
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom CTA Bar */}
        <div className="p-4 pb-[max(1.2rem,env(safe-area-inset-bottom))] border-t border-stone-200 bg-white shrink-0">
          {isHost ? (
            <button
              onClick={() => {
                hapticTap();
                onManageClick(trip);
              }}
              className="w-full py-3.5 px-4 bg-[#1C1C1E] hover:bg-black active:scale-[0.99] text-white font-extrabold text-xs rounded-full flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Users className="w-4 h-4 text-stone-300" />
              <span>Manage Requests ({trip.requests_count || 0})</span>
            </button>
          ) : trip.user_request_status === 'pending' ? (
            <div className="w-full py-3.5 px-4 bg-stone-100 border border-stone-200 text-stone-800 font-extrabold text-xs rounded-full text-center">
              Request Sent • Waiting for Host Review (Auto-expires in 2h)
            </div>
          ) : trip.user_request_status === 'accepted' ? (
            <div className="w-full py-3.5 px-4 bg-emerald-100 border border-emerald-300 text-emerald-900 font-extrabold text-xs rounded-full text-center flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Request Accepted • Group Board & Chat Unlocked</span>
            </div>
          ) : showJoinSheet ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-stone-900">Select Join Intent:</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setJoinIntent('green');
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      joinIntent === 'green'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    🟢 Buddy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setJoinIntent('pink');
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      joinIntent === 'pink'
                        ? 'bg-pink-600 text-white'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    💗 Date
                  </button>
                </div>
              </div>

              <textarea
                value={joinNote}
                onChange={(e) => setJoinNote(e.target.value)}
                placeholder="Introduce yourself & why you'd like to join (min 10 chars)..."
                rows={2}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-[18px] text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#1C1C1E] focus:bg-white"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowJoinSheet(false)}
                  className="px-4 py-2.5 bg-stone-100 text-stone-700 rounded-full text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitJoinRequest}
                  disabled={submittingJoin}
                  className="flex-1 py-2.5 bg-[#1C1C1E] hover:bg-black text-white rounded-full text-xs font-extrabold shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Send Request (2h Expiry)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                hapticTap();
                setShowJoinSheet(true);
              }}
              className="w-full py-3.5 px-4 bg-[#1C1C1E] hover:bg-black active:scale-[0.99] text-white font-extrabold text-xs rounded-full flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Request to Join ({trip.spots_available} spot left • ₹{trip.budget_per_day || 0}/pax)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
