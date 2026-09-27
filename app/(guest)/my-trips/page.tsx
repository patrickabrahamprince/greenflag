'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Radio, 
  MessageSquare, 
  Plus, 
  Check, 
  Sparkles, 
  Shield, 
  Heart, 
  IndianRupee, 
  ArrowRight,
  Share2,
  Car,
  ChevronRight,
  Star,
  Flame,
  CheckSquare,
  Square,
  Send,
  X
} from 'lucide-react';
import { Trip, TripRequest, TripRatingSubmission } from '@/types';
import { useUserStore } from '@/lib/store';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import { ManageRequestsModal } from '@/components/trips/ManageRequestsModal';
import { TripDetailsModal } from '@/components/trips/TripDetailsModal';
import toast from 'react-hot-toast';

interface ChecklistItem {
  id: string;
  task: string;
  assignedTo: string;
  isDone: boolean;
}

interface GroupChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

export default function MyTripsPage() {
  const user = useUserStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<'hosting' | 'joining' | 'past'>('hosting');
  const [selectedTripForBoard, setSelectedTripForBoard] = useState<Trip | null>(null);
  
  // Post-Trip Rating Modal
  const [ratingTrip, setRatingTrip] = useState<Trip | null>(null);
  const [didShowUp, setDidShowUp] = useState<boolean>(true);
  const [safetyScore, setSafetyScore] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['On-Time', 'Good Listener']);
  const [secretSpark, setSecretSpark] = useState<boolean>(false);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  // Group Board State
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', task: 'Bring Car (Honda City from Indiranagar)', assignedTo: 'Rohan', isDone: true },
    { id: '2', task: 'Pack First Aid & Trek Water bottles', assignedTo: 'You', isDone: false },
    { id: '3', task: 'Coordinate Highway Toll / Fastag', assignedTo: 'Ananya', isDone: true },
  ]);
  const [newChecklistTask, setNewChecklistTask] = useState('');

  const [groupMessages, setGroupMessages] = useState<GroupChatMessage[]>([
    { id: 'm-1', sender: 'Rohan', text: 'Hey guys! Meeting at Indiranagar Metro exit at 5:00 AM sharp 🌅', time: '8:30 PM' },
    { id: 'm-2', sender: 'Ananya', text: 'Sounds great! I will bring filter coffee flask ☕', time: '8:45 PM' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Sample Hosted & Joined Trips
  const hostedTrips: Trip[] = [
    {
      id: 'hosted-1',
      destination: 'Nandi Hills Sunrise Drive',
      flag_color: 'green',
      trip_type: 'day_date',
      ladder_level: 2,
      vibe: 'Trek & Talk',
      start_date: 'Tomorrow, 5:00 AM',
      spots_total: 4,
      spots_available: 1,
      requests_count: 3,
      budget_per_day: 450,
      description: 'Sunrise drive to Nandi Hills. 3 requests pending review.',
      cost_split: { fuel: 1200, stay: 0, food: 600, per_person: 450, total: 1800 },
    },
  ];

  const joinedTrips: Trip[] = [
    {
      id: 'joined-1',
      destination: 'Third Wave Coffee, Indiranagar',
      flag_color: 'pink',
      trip_type: 'micro_date',
      ladder_level: 1,
      vibe: 'Chai & Chill',
      start_date: 'Today, 5:30 PM',
      spots_total: 1,
      spots_available: 0,
      budget_per_day: 350,
      user_request_status: 'accepted',
      host: {
        id: 'host-1',
        name: 'Ananya Sharma',
        photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'],
      },
    },
  ];

  const pastTrips: Trip[] = [
    {
      id: 'past-1',
      destination: 'Toit Craft Brewery, Indiranagar',
      flag_color: 'pink',
      trip_type: 'micro_date',
      ladder_level: 1,
      vibe: 'Chai & Chill',
      start_date: 'Completed Yesterday',
      spots_total: 1,
      spots_available: 0,
      budget_per_day: 800,
      host: {
        id: 'host-2',
        name: 'Karan Mehra',
        photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80'],
      },
    },
  ];

  const toggleChecklist = (id: string) => {
    hapticTap();
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, isDone: !item.isDone } : item
      )
    );
  };

  const addChecklistTask = () => {
    if (!newChecklistTask.trim()) return;
    hapticSuccess();
    setChecklist([
      ...checklist,
      {
        id: `task-${Date.now()}`,
        task: newChecklistTask.trim(),
        assignedTo: 'You',
        isDone: false,
      },
    ]);
    setNewChecklistTask('');
  };

  const handleSendGroupMessage = () => {
    if (!chatInput.trim()) return;
    hapticSuccess();
    setGroupMessages([
      ...groupMessages,
      {
        id: `msg-${Date.now()}`,
        sender: 'You',
        text: chatInput.trim(),
        time: 'Just now',
      },
    ]);
    setChatInput('');
  };

  const handleRatingSubmit = () => {
    hapticSuccess();
    setRatingSubmitted(true);
    setTimeout(() => {
      setRatingTrip(null);
      setRatingSubmitted(false);
      toast.success(
        secretSpark
          ? '💖 Secret Spark recorded! If they spark back, Level 2 Day Date unlocks!'
          : 'Rating & Green Score feedback submitted!'
      );
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#382A21] pb-32 max-w-app mx-auto px-4 pt-safe-top">
      
      {/* Top Header */}
      <header className="py-4">
        <h1 className="font-display text-2xl font-black tracking-tight text-[#382A21] flex items-center gap-2">
          <span>My Trips & Group Boards</span>
        </h1>
        <p className="text-xs text-stone-500 font-medium mt-0.5">
          Active Live Activities, Co-planning & Post-Trip Ratings
        </p>
      </header>

      {/* APPLE 4.3 MANDATORY: LIVE ACTIVITY WIDGET FOR ACTIVE TRIP */}
      <div className="mb-5 p-4 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-[28px] shadow-xl border border-stone-700/80 space-y-3 animate-fade-in relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              Live Activity • Active Trip
            </span>
          </div>
          <span className="text-xs font-mono font-bold bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
            Starts in 1h 45m
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-extrabold text-base text-white">
              Third Wave Coffee, Indiranagar
            </h3>
            <p className="text-xs text-stone-300 font-medium mt-0.5">
              Micro Date (1-on-1) • Ananya Sharma
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              hapticTap();
              setSelectedTripForBoard(joinedTrips[0]);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Group Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* UPI Split Tracker Bar */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-stone-400 flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" /> UPI Split: ₹350/person
          </span>
          <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
            Split Settled ✓
          </span>
        </div>
      </div>

      {/* Tab Navigation: Hosting / Joining / Past */}
      <div className="flex gap-2 p-1.5 bg-stone-200/70 rounded-full mb-4 border border-stone-200">
        {[
          { id: 'hosting', label: `Hosting (${hostedTrips.length})` },
          { id: 'joining', label: `Joining (${joinedTrips.length})` },
          { id: 'past', label: `Past & Ratings (${pastTrips.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              hapticTap();
              setActiveTab(t.id as unknown as typeof activeTab);
            }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-[#1D3B2A] text-white shadow-sm'
                : 'text-stone-600 hover:text-[#382A21]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: HOSTING */}
      {activeTab === 'hosting' && (
        <div className="space-y-3">
          {hostedTrips.map((trip) => (
            <div
              key={trip.id}
              className="p-5 bg-white border border-stone-200/90 rounded-[28px] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🟢</span>
                  <div>
                    <h3 className="font-display font-extrabold text-sm text-[#382A21]">
                      {trip.destination}
                    </h3>
                    <p className="text-[11px] text-stone-500 font-medium">
                      {trip.start_date} • {trip.spots_available} spots left
                    </p>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full">
                  {trip.requests_count} Pending Requests
                </span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setSelectedTripForBoard(trip);
                  }}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-full transition-all"
                >
                  Open Group Board
                </button>
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    toast.success('Managing 3 member join requests');
                  }}
                  className="flex-1 py-2.5 bg-[#1D3B2A] hover:bg-[#2D5A3F] text-white font-extrabold text-xs rounded-full shadow-xs transition-all"
                >
                  Review Requests ({trip.requests_count})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: JOINING */}
      {activeTab === 'joining' && (
        <div className="space-y-3">
          {joinedTrips.map((trip) => (
            <div
              key={trip.id}
              className="p-5 bg-white border border-stone-200/90 rounded-[28px] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-emerald-500">
                    <Image
                      src={trip.host?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt="Host"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-sm text-[#382A21]">
                      {trip.destination}
                    </h3>
                    <p className="text-[11px] text-stone-500 font-medium">
                      Host: {trip.host?.name} • {trip.start_date}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full">
                  Confirmed ✓
                </span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setSelectedTripForBoard(trip);
                  }}
                  className="w-full py-2.5 bg-[#1D3B2A] hover:bg-[#2D5A3F] text-white font-extrabold text-xs rounded-full shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Open Trip Board & Logistics</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: PAST & POST-TRIP RATING */}
      {activeTab === 'past' && (
        <div className="space-y-3">
          {pastTrips.map((trip) => (
            <div
              key={trip.id}
              className="p-5 bg-white border border-stone-200/90 rounded-[28px] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-sm text-[#382A21]">
                    {trip.destination}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium">
                    With {trip.host?.name} • {trip.start_date}
                  </p>
                </div>

                <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                  Ended
                </span>
              </div>

              {/* Rate & Secret Spark CTA */}
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  setRatingTrip(trip);
                }}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-extrabold text-xs rounded-full shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Rate Companion & Secret Spark 💖</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================= SCREEN 3B: TRIP GROUP BOARD MODAL ================= */}
      {selectedTripForBoard && (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-[#FAF9F6] border border-stone-200/90 rounded-t-[36px] sm:rounded-[36px] max-w-xl w-full h-[90dvh] flex flex-col overflow-hidden text-[#382A21] shadow-2xl">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 bg-white flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-base text-[#382A21]">
                  Trip Group Board (Logistics)
                </h3>
                <p className="text-[11px] font-medium text-stone-500">
                  {selectedTripForBoard.destination} • Auto-deletes 2h after trip
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTripForBoard(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
              
              {/* Co-Builder Checklist */}
              <div className="p-4 bg-white border border-stone-200/90 rounded-[24px] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-[#382A21] flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckSquare className="w-4 h-4 text-emerald-700" /> Trip Checklist (Who brings what)
                  </h4>
                  <span className="text-[10px] font-bold text-stone-400">
                    {checklist.filter((c) => c.isDone).length}/{checklist.length} Done
                  </span>
                </div>

                <div className="space-y-2">
                  {checklist.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleChecklist(item.id)}
                      className={`w-full p-2.5 rounded-[16px] border flex items-center justify-between text-left transition-all ${
                        item.isDone
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-stone-50 border-stone-200 text-[#382A21]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400 shrink-0" />
                        )}
                        <span className={`text-xs font-bold ${item.isDone ? 'line-through text-stone-400' : ''}`}>
                          {item.task}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-stone-200 text-stone-600">
                        {item.assignedTo}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Add Task Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newChecklistTask}
                    onChange={(e) => setNewChecklistTask(e.target.value)}
                    placeholder="Add item (e.g. bluetooth speaker, umbrella)..."
                    className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-full text-xs font-medium text-[#382A21] focus:outline-none focus:border-[#1D3B2A]"
                  />
                  <button
                    type="button"
                    onClick={addChecklistTask}
                    className="px-3.5 py-2 bg-[#1D3B2A] text-white rounded-full text-xs font-bold hover:bg-[#2D5A3F]"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Group Logistics Chat */}
              <div className="p-4 bg-white border border-stone-200/90 rounded-[24px] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-[#382A21] flex items-center gap-1.5 uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4 text-[#1D3B2A]" /> Group Logistics Chat
                  </h4>
                  <span className="text-[10px] font-bold text-stone-400">
                    Auto-expires
                  </span>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto no-scrollbar">
                  {groupMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-[18px] text-xs space-y-0.5 ${
                        msg.sender === 'You'
                          ? 'bg-emerald-50 border border-emerald-200 ml-6 text-emerald-950'
                          : 'bg-stone-50 border border-stone-200 mr-6 text-[#382A21]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-extrabold">
                        <span>{msg.sender}</span>
                        <span className="text-stone-400 font-normal">{msg.time}</span>
                      </div>
                      <p className="font-medium">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Message the trip group for pickup & timing..."
                    className="flex-1 p-2.5 bg-stone-50 border border-stone-200 rounded-full text-xs font-medium text-[#382A21] focus:outline-none focus:border-[#1D3B2A]"
                  />
                  <button
                    type="button"
                    onClick={handleSendGroupMessage}
                    className="p-2.5 bg-[#1D3B2A] text-white rounded-full hover:bg-[#2D5A3F]"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= SCREEN 3C: POST-TRIP RATING & SECRET SPARK 💖 ================= */}
      {ratingTrip && (
        <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-[#FAF9F6] border border-stone-200/90 rounded-t-[36px] sm:rounded-[36px] max-w-lg w-full p-6 space-y-5 text-[#382A21] shadow-2xl">
            
            <div className="text-center space-y-1">
              <span className="text-3xl">🌟</span>
              <h3 className="font-display font-black text-lg text-[#382A21]">
                Post-Trip Rating & Safety
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Rate your experience with {ratingTrip.host?.name}
              </p>
            </div>

            {/* Did they show up? */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#382A21]/70 block">
                Did they show up on time?
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setDidShowUp(true);
                  }}
                  className={`py-2.5 rounded-[18px] text-xs font-bold border transition-all ${
                    didShowUp
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-950 shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600'
                  }`}
                >
                  ✓ Yes, Showed Up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setDidShowUp(false);
                  }}
                  className={`py-2.5 rounded-[18px] text-xs font-bold border transition-all ${
                    !didShowUp
                      ? 'bg-red-100 border-red-400 text-red-950 shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600'
                  }`}
                >
                  ✕ No-Show / Ghosted
                </button>
              </div>
            </div>

            {/* Safety Score (1 to 5 Stars) */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#382A21]/70 block">
                How safe & respectful did you feel?
              </label>
              <div className="flex justify-center gap-3 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setSafetyScore(star);
                    }}
                    className="text-2xl transition-transform hover:scale-125 active:scale-95"
                  >
                    {star <= safetyScore ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* Positive Tags */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#382A21]/70 block">
                Positive Feedback Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['On-Time', 'Good Listener', 'Great Vibe', 'Safe Driver', 'Helpful'].map((tag) => {
                  const isSel = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setSelectedTags(
                          isSel ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                        isSel
                          ? 'bg-[#1D3B2A] text-white border-[#1D3B2A]'
                          : 'bg-white text-stone-600 border-stone-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECRET SPARK 💖 (APPLE 4.3 CORE MECHANIC) */}
            <div className="p-4 bg-gradient-to-br from-pink-500/15 via-rose-500/10 to-amber-500/10 border-2 border-pink-400/80 rounded-[24px] space-y-2 text-left shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💖</span>
                  <div>
                    <h4 className="font-display font-extrabold text-xs text-pink-950">
                      Secret Spark? (Double-Blind)
                    </h4>
                    <p className="text-[10px] text-pink-800/80 font-medium">
                      Only revealed if BOTH people spark. Unlocks Level 2 Day Date!
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={secretSpark}
                  onChange={(e) => {
                    hapticTap();
                    setSecretSpark(e.target.checked);
                  }}
                  className="w-5 h-5 accent-pink-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRatingTrip(null)}
                className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-full"
              >
                Skip / Later
              </button>
              <button
                type="button"
                onClick={handleRatingSubmit}
                className="flex-1 py-3 bg-[#1D3B2A] hover:bg-[#2D5A3F] text-white font-extrabold text-xs rounded-full shadow-md active:scale-95 transition-all"
              >
                Submit Rating & Feedback
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
