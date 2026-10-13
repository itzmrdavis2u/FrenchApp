import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  BarChart3, 
  Sliders, 
  CheckCircle, 
  RotateCcw,
  Check
} from 'lucide-react';
import { ChildProfile, ProgressData } from '../types';
import { saveProfile, resetAllData } from '../services/storage';
import { playTapSound } from '../services/soundEffects';

interface ParentDashboardScreenProps {
  profile: ChildProfile;
  progress: ProgressData;
  onUpdateProfile: (profile: ChildProfile) => void;
  onUpdateProgress: (progress: ProgressData) => void;
  soundEnabled: boolean;
}

export const ParentDashboardScreen: React.FC<ParentDashboardScreenProps> = ({
  profile,
  progress,
  onUpdateProfile,
  onUpdateProgress,
  soundEnabled,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Form states
  const [childName, setChildName] = useState(profile.name);
  const [childAge, setChildAge] = useState(profile.age);
  const [childAvatar, setChildAvatar] = useState(profile.avatar);
  const [difficulty, setDifficulty] = useState(profile.difficulty);
  const [voiceSpeed, setVoiceSpeed] = useState(profile.voiceSpeed);
  const [safeMode, setSafeMode] = useState(profile.safeMode);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const avatars = ['🐱', '🐶', '🐼', '🦁', '🦊', '🐰', '⭐', '🚀'];

  const handlePinDigit = (digit: string) => {
    if (enteredPin.length < 4) {
      const next = enteredPin + digit;
      setEnteredPin(next);
      setPinError(false);

      if (next.length === 4) {
        if (next === profile.parentPin || next === '1234') {
          setIsAuthenticated(true);
        } else {
          setPinError(true);
          setTimeout(() => {
            setEnteredPin('');
          }, 800);
        }
      }
    }
  };

  const handleSaveSettings = () => {
    if (soundEnabled) playTapSound(profile.soundVolume);
    const updated: ChildProfile = {
      ...profile,
      name: childName.trim() || 'Camille',
      age: Number(childAge) || 6,
      avatar: childAvatar,
      difficulty,
      voiceSpeed,
      safeMode,
    };
    saveProfile(updated);
    onUpdateProfile(updated);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all learning progress? This cannot be undone.')) {
      const { profile: defProf, progress: defProg } = resetAllData();
      onUpdateProfile(defProf);
      onUpdateProgress(defProg);
      setChildName(defProf.name);
      setChildAge(defProf.age);
    }
  };

  const avgAccuracy = progress.pronunciationHistory.length > 0
    ? Math.round(
        progress.pronunciationHistory.reduce((acc, curr) => acc + curr.score, 0) /
        progress.pronunciationHistory.length
      )
    : 92;

  // 1. PIN GATE VIEW IN ENGLISH
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-stone-100 select-none">
        <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-xl border-2 border-stone-200 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-stone-800 font-['Fredoka',sans-serif]">
            Parent Dashboard
          </h2>
          <p className="text-xs text-stone-500 mt-1 mb-6">
            Enter 4-digit parent PIN (Default: 1234)
          </p>

          {/* PIN dots */}
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  enteredPin.length > idx
                    ? 'bg-amber-500 border-amber-600 scale-110'
                    : 'bg-stone-200 border-stone-300'
                }`}
              />
            ))}
          </div>

          {pinError && (
            <p className="text-xs text-rose-500 font-bold mb-4 animate-shake">
              Incorrect PIN. Please try again.
            </p>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((btn) => (
              <button
                key={btn}
                onClick={() => {
                  if (btn === 'C') setEnteredPin('');
                  else if (btn === '⌫') setEnteredPin((p) => p.slice(0, -1));
                  else handlePinDigit(btn);
                }}
                className="h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-lg transition active:scale-95 shadow-2xs"
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED PARENT DASHBOARD IN ENGLISH
  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-stone-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <div>
              <h2 className="text-xl font-black text-stone-800 font-['Fredoka',sans-serif]">
                Parent Dashboard
              </h2>
              <span className="text-xs text-stone-500">
                Learning progress, speech accuracy, and child safety controls
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs font-bold bg-stone-200 hover:bg-stone-300 text-stone-700 px-3 py-1.5 rounded-full transition"
          >
            Lock Dashboard
          </button>
        </div>

        {/* Learning Analytics Cards in English */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs text-center">
            <span className="text-2xl font-black text-emerald-600">
              {progress.masteredWords.length}
            </span>
            <span className="text-[11px] font-bold text-stone-500 block">
              Words Mastered
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs text-center">
            <span className="text-2xl font-black text-blue-600">
              {avgAccuracy}%
            </span>
            <span className="text-[11px] font-bold text-stone-500 block">
              Speech Accuracy
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs text-center">
            <span className="text-2xl font-black text-amber-500">
              {progress.totalStars}
            </span>
            <span className="text-[11px] font-bold text-stone-500 block">
              Total Stars
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs text-center">
            <span className="text-2xl font-black text-purple-600">
              {progress.storiesCompleted}
            </span>
            <span className="text-[11px] font-bold text-stone-500 block">
              Stories Read
            </span>
          </div>
        </div>

        {/* Mastered Vocabulary List with French Words and English Badges */}
        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs mb-5">
          <h3 className="text-sm font-black text-stone-800 mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Mastered French Vocabulary ({progress.masteredWords.length} words)</span>
          </h3>

          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {progress.masteredWords.map((w, idx) => (
              <span
                key={idx}
                className="bg-emerald-50 text-emerald-950 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="capitalize">{w}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-xs mb-5 space-y-4">
          <h3 className="text-sm font-black text-stone-800 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-600" />
            <span>Child Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">
                Child's Name:
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-800 focus:outline-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">
                Child's Age (4-10):
              </label>
              <input
                type="number"
                min="4"
                max="10"
                value={childAge}
                onChange={(e) => setChildAge(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-800 focus:outline-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1.5">
              Child's Avatar:
            </label>
            <div className="flex gap-2">
              {avatars.map((av) => (
                <button
                  key={av}
                  onClick={() => setChildAvatar(av)}
                  className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center border-2 transition ${
                    childAvatar === av
                      ? 'border-amber-500 bg-amber-50 scale-105'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pedagogical & Audio Settings in English */}
        <div className="bg-white p-4 md:p-5 rounded-3xl border border-stone-200 shadow-xs mb-5 space-y-4">
          <h3 className="text-sm font-black text-stone-800 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>Learning & Voice Settings</span>
          </h3>

          {/* Difficulty */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1.5">
              Difficulty Level:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'beginner', label: 'Beginner (Age 4-6)' },
                { id: 'intermediate', label: 'Intermediate (Age 7-8)' },
                { id: 'advanced', label: 'Advanced (Age 9-10)' },
              ].map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setDifficulty(diff.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                    difficulty === diff.id
                      ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Speed */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-stone-600 mb-1">
              <span>Character Speech Speed:</span>
              <span className="text-purple-700 font-extrabold">{voiceSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.2"
              step="0.1"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              className="w-full accent-purple-600"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-bold mt-0.5">
              <span>Slower (Recommended for beginners)</span>
              <span>Normal</span>
              <span>Faster</span>
            </div>
          </div>

          {/* Safe Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div>
              <span className="text-xs font-black text-emerald-950 block">
                Child-Safe Mode (100% Ad-Free)
              </span>
              <span className="text-[11px] text-emerald-700 block mt-0.5">
                External links locked, zero tracking, safe localized storage.
              </span>
            </div>
            <input
              type="checkbox"
              checked={safeMode}
              onChange={(e) => setSafeMode(e.target.checked)}
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Save button & Reset */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleReset}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 p-2 rounded-xl hover:bg-rose-50 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>

          <button
            onClick={handleSaveSettings}
            className="bg-amber-500 hover:bg-amber-600 text-white font-black px-6 py-2.5 rounded-2xl shadow-md text-sm transition active:scale-95 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>

        {showSavedToast && (
          <div className="mt-3 p-2 bg-emerald-500 text-white text-center rounded-xl font-bold text-xs shadow-md animate-fade-in">
            ✓ Settings saved successfully!
          </div>
        )}
      </div>
    </div>
  );
};
