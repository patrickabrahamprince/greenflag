'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Navigation,
  ChevronDown,
  Sun,
  Moon,
  Plus,
  Clock,
  MapPin,
  Sparkles,
  Check,
  Calendar as CalendarIcon,
  Home as HomeIcon,
  Users,
  Trophy,
} from 'lucide-react';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';

interface ScheduleSlot {
  id: string;
  time: string;
  location: string;
  title: string;
  sport: 'squash' | 'badminton' | 'swimming' | 'tabletennis' | 'trek';
  icon: string;
  iconBg: string;
  category: 'Game' | 'Coaching' | 'Lap Session';
  subtitle: string;
  isTrial?: boolean;
  price?: number;
}

const SCHEDULE_DATA: Record<string, ScheduleSlot[]> = {
  'Sep, 30': [
    {
      id: '1',
      time: '6 AM',
      location: 'Indiranagar 100ft road',
      title: 'Squash – Game',
      sport: 'squash',
      icon: '🎾',
      iconBg: 'bg-pink-500',
      category: 'Game',
      subtitle: 'Intermediate, Advanced',
      price: 350,
    },
    {
      id: '2',
      time: '6 AM',
      location: 'Kaggadasapura',
      title: 'Badminton – Game',
      sport: 'badminton',
      icon: '🏸',
      iconBg: 'bg-emerald-400 text-black',
      category: 'Game',
      subtitle: 'Intermediate, Advanced',
      price: 250,
    },
    {
      id: '3',
      time: '6 AM',
      location: 'Kaggadasapura',
      title: 'Swimming – Coaching',
      sport: 'swimming',
      icon: '🏊‍♂️',
      iconBg: 'bg-cyan-400 text-black',
      category: 'Coaching',
      subtitle: 'Coach Adarsh Sreedhar',
      isTrial: true,
      price: 500,
    },
    {
      id: '4',
      time: '6 AM',
      location: 'Kaggadasapura',
      title: 'Table Tennis – Coaching',
      sport: 'tabletennis',
      icon: '🏓',
      iconBg: 'bg-lime-400 text-black',
      category: 'Coaching',
      subtitle: 'Coach Ullas',
      isTrial: true,
      price: 400,
    },
    {
      id: '5',
      time: '6 AM',
      location: 'Kaggadasapura',
      title: 'Badminton – Coaching',
      sport: 'badminton',
      icon: '🏸',
      iconBg: 'bg-emerald-400 text-black',
      category: 'Coaching',
      subtitle: 'Coach Abhishek Singh',
      price: 450,
    },
    {
      id: '6',
      time: '6 AM',
      location: 'Kaggadasapura',
      title: 'Swimming – Lap Session',
      sport: 'swimming',
      icon: '🏊‍♂️',
      iconBg: 'bg-cyan-400 text-black',
      category: 'Lap Session',
      subtitle: 'Open 25m Heated Pool',
      price: 200,
    },
  ],
};

export default function ScheduleBookingPage() {
  const router = useRouter();

  // State
  const [selectedDate, setSelectedDate] = useState('Sep, 30');
  const [selectedLocation, setSelectedLocation] = useState('Indiranagar');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookingSuccess, setBookingSuccess] = useState<ScheduleSlot | null>(null);

  const DATES = [
    { key: 'Sep, 30', day: 'Sep, 30', weekday: 'Wednesday' },
    { key: '01', day: '01', weekday: 'Thu' },
    { key: '02', day: '02', weekday: 'Fri' },
    { key: '03', day: '03', weekday: 'Sat' },
    { key: '04', day: '04', weekday: 'Sun' },
  ];

  const SPORTS_TAGS = [
    { id: 'badminton', label: 'Badminton', icon: '🏸' },
    { id: 'squash', label: 'Squash', icon: '🎾' },
    { id: 'tabletennis', label: 'Table Tennis', icon: '🏓' },
    { id: 'swimming', label: 'Swimming', icon: '🏊‍♂️' },
  ];

  const CATEGORIES = [
    { id: 'classes', label: 'Group Classes', badge: 'NEW' },
    { id: 'trial', label: 'Trial' },
    { id: 'games', label: 'Games' },
    { id: 'coaching', label: 'Coaching' },
  ];

  const slots = SCHEDULE_DATA[selectedDate] || SCHEDULE_DATA['Sep, 30'];

  const filteredSlots = slots.filter((slot) => {
    if (selectedActivity && slot.sport !== selectedActivity) return false;
    if (selectedCategory === 'Trial' && !slot.isTrial) return false;
    if (selectedCategory === 'Games' && slot.category !== 'Game') return false;
    if (selectedCategory === 'Coaching' && slot.category !== 'Coaching') return false;
    return true;
  });

  const handleBookSlot = (slot: ScheduleSlot) => {
    hapticSuccess();
    setBookingSuccess(slot);
    toast.success(`Booked ${slot.title}!`, {
      icon: '🎉',
      style: { background: '#16181A', color: '#F7F6EB' },
    });
  };

  return (
    <div className={`min-h-screen w-full ${isDarkMode ? 'bg-[#000000] text-white' : 'bg-[#F7F6EB] text-black'} flex flex-col font-sans select-none max-w-md mx-auto relative overflow-x-hidden pb-28 antialiased`}>
      
      {/* ================= TOP NAVIGATION HEADER (IMG_1100) ================= */}
      <header className="px-4 pt-[max(14px,env(safe-area-inset-top,14px))] pb-2.5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl bg-opacity-90">
        
        {/* Back Arrow */}
        <button
          type="button"
          onClick={() => {
            hapticTap();
            router.back();
          }}
          className="w-9 h-9 flex items-center justify-center cursor-pointer active:scale-90 transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Location Selector Dropdown */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => toast('Hub: Indiranagar 100ft Rd', { icon: '📍' })}>
          <Navigation className="w-4 h-4 fill-white rotate-45" />
          <span className="text-[17px] font-[700] tracking-tight">{selectedLocation}</span>
          <ChevronDown className="w-4 h-4 opacity-70" />
        </div>

        {/* Light / Dark Mode Toggle Pill */}
        <div className="flex items-center bg-[#1E2124] rounded-full p-1 border border-white/10 shadow-inner">
          <button
            type="button"
            onClick={() => {
              hapticTap();
              setIsDarkMode(false);
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
              !isDarkMode ? 'bg-white text-black shadow' : 'text-white/40'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              hapticTap();
              setIsDarkMode(true);
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
              isDarkMode ? 'bg-white/20 text-white shadow' : 'text-white/40'
            }`}
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ================= HORIZONTAL DATE SELECTOR STRIP (IMG_1100) ================= */}
      <div className="px-4 my-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
          {DATES.map((d) => {
            const isSelected = selectedDate === d.key;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => {
                  hapticTap();
                  setSelectedDate(d.key);
                }}
                className={`relative shrink-0 rounded-2xl flex flex-col items-center justify-center transition cursor-pointer ${
                  isSelected
                    ? 'w-[105px] h-[72px] bg-[#222528] text-white border-2 border-white shadow-xl'
                    : 'w-[68px] h-[72px] bg-[#16181A] text-white/70 border border-white/10 hover:border-white/20'
                }`}
              >
                <span className={`font-[800] leading-none ${isSelected ? 'text-[17px]' : 'text-[19px]'}`}>
                  {d.day}
                </span>
                <span className="text-[11px] font-medium text-white/50 mt-1">
                  {d.weekday}
                </span>
                {isSelected && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= ACTIVITY PILL TAGS WITH PLUS (IMG_1100) ================= */}
      <div className="px-4 my-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {SPORTS_TAGS.map((sport) => {
            const isSelected = selectedActivity === sport.id;
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => {
                  hapticTap();
                  setSelectedActivity(isSelected ? null : sport.id);
                }}
                className={`shrink-0 h-10 px-4 rounded-full font-[700] text-[13px] flex items-center gap-1.5 transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#E2F84F] text-[#111315] shadow-md'
                    : 'bg-[#1C1F22] text-white border border-white/10 hover:border-white/25'
                }`}
              >
                <span>{sport.icon}</span>
                <span>{sport.label}</span>
                <Plus className="w-3.5 h-3.5 opacity-60 ml-0.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= CATEGORY FILTER PILLS (IMG_1100) ================= */}
      <div className="px-4 my-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  hapticTap();
                  setSelectedCategory(isSelected ? 'All' : cat.label);
                }}
                className={`shrink-0 h-9 px-4 rounded-xl font-[700] text-[12px] flex items-center gap-1.5 transition cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black shadow'
                    : 'bg-[#16181A] text-white/80 border border-white/10 hover:border-white/20'
                }`}
              >
                <span>{cat.label}</span>
                {cat.badge && (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-black text-[9px] font-[900]">
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TIMELINE AGENDA LIST (IMG_1100, IMG_1101) ================= */}
      <div className="px-4 mt-3 flex-1">
        
        {/* Time Divider */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[14px] font-[900] tracking-tight text-white">6 AM</span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        {/* Schedule Slots Grouped */}
        <div className="space-y-4">
          
          {/* Indiranagar Hub */}
          <div>
            <span className="text-[12px] font-[700] text-white/50 block mb-2">
              Indiranagar 100ft road
            </span>

            <div className="space-y-2">
              {filteredSlots
                .filter((s) => s.location.includes('Indiranagar'))
                .map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => handleBookSlot(slot)}
                    className="bg-[#16181A] rounded-[20px] p-3.5 border border-white/10 flex items-center justify-between shadow-md active:scale-[0.99] transition cursor-pointer hover:border-white/25"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl ${slot.iconBg} flex items-center justify-center text-[20px] shadow-sm shrink-0`}>
                        {slot.icon}
                      </div>
                      <div>
                        <h4 className="text-[14px] font-[800] text-white tracking-tight leading-snug">
                          {slot.title}
                        </h4>
                        <p className="text-[11px] text-white/50 font-medium mt-0.5">
                          {slot.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {slot.price && (
                        <span className="text-[13px] font-[800] text-white block">
                          ₹{slot.price}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-[#E2F84F] uppercase tracking-wider">
                        Book
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Kaggadasapura Hub */}
          <div>
            <span className="text-[12px] font-[700] text-white/50 block mb-2">
              Kaggadasapura
            </span>

            <div className="space-y-2">
              {filteredSlots
                .filter((s) => s.location.includes('Kaggadasapura'))
                .map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => handleBookSlot(slot)}
                    className="bg-[#16181A] rounded-[20px] p-3.5 border border-white/10 flex items-center justify-between shadow-md active:scale-[0.99] transition cursor-pointer hover:border-white/25 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl ${slot.iconBg} flex items-center justify-center text-[20px] shadow-sm shrink-0`}>
                        {slot.icon}
                      </div>
                      <div>
                        <h4 className="text-[14px] font-[800] text-white tracking-tight leading-snug">
                          {slot.title}
                        </h4>
                        <p className="text-[11px] text-white/50 font-medium mt-0.5">
                          {slot.subtitle}
                        </p>
                        {slot.isTrial && (
                          <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                            Trial Available
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {slot.price && (
                        <span className="text-[13px] font-[800] text-white block">
                          ₹{slot.price}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-[#E2F84F] uppercase tracking-wider">
                        Book
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM NAVIGATION BAR ================= */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#16181A]/95 backdrop-blur-2xl border-t border-white/10 z-30 max-w-md mx-auto px-4 pt-2.5 pb-[max(12px,env(safe-area-inset-bottom,12px))]">
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => router.push('/home-hub')}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer py-1"
          >
            <HomeIcon className="w-5 h-5 text-white/40" />
            <span className="text-[10px] font-bold text-white/40">Home</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1 cursor-pointer py-1"
          >
            <CalendarIcon className="w-5 h-5 text-[#E2F84F]" />
            <span className="text-[10px] font-bold text-[#E2F84F]">Book</span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/home-hub')}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer py-1"
          >
            <Users className="w-5 h-5 text-white/40" />
            <span className="text-[10px] font-bold text-white/40">Coaching</span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/membership')}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer py-1"
          >
            <Trophy className="w-5 h-5 text-white/40" />
            <span className="text-[10px] font-bold text-white/40">Academy</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
