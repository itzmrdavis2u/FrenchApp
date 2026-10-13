import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageCircle, 
  BookOpen, 
  Gamepad2, 
  Trophy, 
  ShieldCheck, 
  Code,
  Flame, 
  Star, 
  Wifi, 
  BatteryMedium,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Lock
} from 'lucide-react';
import { ScreenType, ChildProfile, ProgressData } from '../../types';
import { playTapSound } from '../../services/soundEffects';

interface AndroidFrameProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  profile: ChildProfile;
  progress: ProgressData;
  soundEnabled: boolean;
  onToggleSound: () => void;
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  currentScreen,
  onNavigate,
  profile,
  progress,
  soundEnabled,
  onToggleSound,
  children,
}) => {
  const [timeStr, setTimeStr] = useState('09:41');
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNav = (screen: ScreenType) => {
    if (soundEnabled) playTapSound(profile.soundVolume);
    onNavigate(screen);
  };

  const navItems: { screen: ScreenType; label: string; icon: React.ReactNode; color: string }[] = [
    {
      screen: 'characters',
      label: 'Friends',
      icon: <Users className="w-5 h-5" />,
      color: 'text-amber-500',
    },
    {
      screen: 'conversation',
      label: 'Chat & Speak',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'text-blue-500',
    },
    {
      screen: 'story',
      label: 'Story Time',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'text-emerald-500',
    },
    {
      screen: 'games',
      label: 'Games',
      icon: <Gamepad2 className="w-5 h-5" />,
      color: 'text-purple-500',
    },
    {
      screen: 'rewards',
      label: 'Rewards',
      icon: <Trophy className="w-5 h-5" />,
      color: 'text-pink-500',
    },
    {
      screen: 'parent',
      label: 'Parents',
      icon: <ShieldCheck className="w-5 h-5" />,
      color: 'text-stone-500',
    },
    {
      screen: 'android_code',
      label: 'Kotlin Code',
      icon: <Code className="w-5 h-5" />,
      color: 'text-indigo-600',
    },
  ];

  return (
    <div className={`min-h-screen w-full flex justify-center items-center bg-stone-900 ${isPhoneFrame ? 'p-2 md:p-6' : 'p-0'}`}>
      {/* Device Container */}
      <div
        className={`w-full flex flex-col bg-amber-50 shadow-2xl overflow-hidden transition-all duration-300 relative ${
          isPhoneFrame
            ? 'max-w-md h-[92vh] max-h-[860px] rounded-[42px] border-[10px] border-stone-800'
            : 'min-h-screen rounded-none border-none'
        }`}
      >
        {/* Android Punch Hole Camera (in phone frame mode) */}
        {isPhoneFrame && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-stone-900 rounded-full z-50 pointer-events-none ring-2 ring-stone-800" />
        )}

        {/* Android Status Bar */}
        <div className="w-full bg-amber-100/95 backdrop-blur-md px-3.5 py-2 flex items-center justify-between text-xs font-semibold text-stone-700 select-none border-b border-amber-200/60 z-30">
          {/* Time & Child Avatar */}
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-stone-800">{timeStr}</span>
            <div 
              onClick={() => handleNav('parent')}
              className="flex items-center gap-1.5 bg-amber-200/90 hover:bg-amber-300 px-2.5 py-0.5 rounded-full cursor-pointer transition shadow-xs"
              title="Parent Dashboard (PIN Protected)"
            >
              <span>{profile.avatar}</span>
              <span className="font-extrabold text-amber-950 text-[11px] truncate max-w-[80px]">{profile.name}</span>
            </div>
            {profile.safeMode && (
              <span className="hidden sm:inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Ad-Free & Safe
              </span>
            )}
          </div>

          {/* Streak & Stars & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Daily Streak */}
            <div 
              className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full shadow-xs"
              title={`${progress.dailyStreak} Day Learning Streak`}
            >
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
              <span className="font-black">{progress.dailyStreak}d</span>
            </div>

            {/* Stars Count */}
            <div 
              onClick={() => handleNav('rewards')}
              className="flex items-center gap-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer px-2.5 py-0.5 rounded-full shadow-xs transition transform active:scale-95"
              title="Total Stars Earned"
            >
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" />
              <span className="font-black text-sm">{progress.totalStars}</span>
            </div>

            {/* Sound Mute Toggle */}
            <button
              onClick={onToggleSound}
              className="text-stone-600 hover:text-stone-900 p-1 rounded-full hover:bg-amber-200/60 transition"
              title={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
            </button>

            {/* Frame View Toggle */}
            <button
              onClick={() => setIsPhoneFrame(!isPhoneFrame)}
              className="hidden md:inline-flex text-stone-600 hover:text-stone-900 p-1 rounded-full hover:bg-amber-200/60 transition"
              title={isPhoneFrame ? 'Full-screen mode' : 'Phone frame mode'}
            >
              {isPhoneFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Android System Icons */}
            <div className="flex items-center gap-1 text-stone-600">
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>

        {/* Android Material Bottom Navigation Bar (in English) */}
        <nav className="w-full bg-white/95 backdrop-blur-lg border-t border-amber-200/70 px-2 py-1.5 flex items-center justify-around z-30 shadow-lg">
          {navItems.map((item) => {
            const isActive = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => handleNav(item.screen)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-100/90 text-amber-900 scale-105 font-black shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-amber-50'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${isActive ? 'bg-white shadow-xs' : ''}`}>
                  {React.cloneElement(item.icon as React.ReactElement<any>, {
                    className: `w-5 h-5 ${isActive ? item.color : 'text-stone-500'}`,
                  })}
                </div>
                <span className="text-[11px] leading-tight tracking-tight mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Android Gesture Bar */}
        <div className="w-full bg-white flex justify-center py-1">
          <div className="w-28 h-1 bg-stone-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
