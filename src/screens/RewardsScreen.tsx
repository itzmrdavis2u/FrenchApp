import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  Flame, 
  Lock, 
  Check, 
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChildProfile, ProgressData, Sticker } from '../types';
import { STICKERS } from '../data/stickers';
import { playUnboxSound, playPopSound } from '../services/soundEffects';
import { saveProgress } from '../services/storage';

interface RewardsScreenProps {
  profile: ChildProfile;
  progress: ProgressData;
  onUpdateProgress: (progress: ProgressData) => void;
  soundEnabled: boolean;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({
  profile,
  progress,
  onUpdateProgress,
  soundEnabled,
}) => {
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [openingSurpriseBox, setOpeningSurpriseBox] = useState(false);
  const [boxOpenedSuccess, setBoxOpenedSuccess] = useState(progress.surpriseBoxOpened);

  const canOpenSurpriseBox = progress.totalStars >= 20 && !boxOpenedSuccess;

  const handleOpenSurpriseBox = () => {
    if (!canOpenSurpriseBox) return;
    setOpeningSurpriseBox(true);

    if (soundEnabled) {
      playUnboxSound(profile.soundVolume);
    }

    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.4 },
    });

    setTimeout(() => {
      setOpeningSurpriseBox(false);
      setBoxOpenedSuccess(true);

      const updated = {
        ...progress,
        surpriseBoxOpened: true,
        unlockedStickers: Array.from(new Set([...progress.unlockedStickers, 'surprise-box'])),
      };
      saveProgress(updated);
      onUpdateProgress(updated);
    }, 1200);
  };

  const handleStickerClick = (sticker: Sticker) => {
    if (soundEnabled) playPopSound(profile.soundVolume);
    setSelectedSticker(sticker);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-gradient-to-b from-pink-50 via-yellow-50 to-amber-50 overflow-y-auto select-none">
      {/* English Header & Stats Banner */}
      <div className="max-w-xl mx-auto w-full mb-4">
        <div className="text-center mb-3">
          <h2 className="text-2xl md:text-3xl font-black text-stone-800 font-['Fredoka',sans-serif]">
            {profile.name}’s Rewards & Stickers
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Earn stars by practicing French speech, reading stories, and playing games!
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2">
          {/* Total Stars */}
          <div className="bg-white rounded-2xl p-2.5 border-2 border-yellow-200 shadow-sm flex flex-col items-center">
            <div className="flex items-center gap-1 text-yellow-600 font-black text-base">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-500" />
              <span>{progress.totalStars}</span>
            </div>
            <span className="text-[10px] text-stone-500 font-bold uppercase mt-0.5">
              Stars Earned
            </span>
          </div>

          {/* Daily Streak */}
          <div className="bg-white rounded-2xl p-2.5 border-2 border-orange-200 shadow-sm flex flex-col items-center">
            <div className="flex items-center gap-1 text-orange-600 font-black text-base">
              <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
              <span>{progress.dailyStreak} Days</span>
            </div>
            <span className="text-[10px] text-stone-500 font-bold uppercase mt-0.5">
              Daily Streak
            </span>
          </div>

          {/* Mastered Words */}
          <div className="bg-white rounded-2xl p-2.5 border-2 border-emerald-200 shadow-sm flex flex-col items-center">
            <div className="flex items-center gap-1 text-emerald-600 font-black text-base">
              <Award className="w-5 h-5 text-emerald-500" />
              <span>{progress.masteredWords.length}</span>
            </div>
            <span className="text-[10px] text-stone-500 font-bold uppercase mt-0.5">
              Words Mastered
            </span>
          </div>
        </div>
      </div>

      {/* 20-STAR SURPRISE MYSTERY BOX */}
      <div className="max-w-xl mx-auto w-full mb-5">
        <div
          onClick={handleOpenSurpriseBox}
          className={`rounded-3xl p-4 md:p-5 border-3 transition-all relative overflow-hidden shadow-lg ${
            boxOpenedSuccess
              ? 'bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-300'
              : progress.totalStars >= 20
              ? 'bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 border-amber-400 cursor-pointer animate-pulse ring-4 ring-yellow-300/50'
              : 'bg-stone-100 border-stone-300 opacity-90'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: openingSurpriseBox ? [0, -15, 15, -15, 0] : canOpenSurpriseBox ? [0, -5, 5, 0] : 0,
                  scale: canOpenSurpriseBox ? [1, 1.1, 1] : 1,
                }}
                transition={{ repeat: Infinity, duration: canOpenSurpriseBox ? 1.2 : 0.5 }}
                className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-md border-2 border-amber-300"
              >
                {boxOpenedSuccess ? '🏆' : '🎁'}
              </motion.div>

              <div>
                <h4 className="font-black text-stone-800 text-sm md:text-base font-['Fredoka',sans-serif]">
                  {boxOpenedSuccess ? 'Mystery Treasure Unlocked!' : '20-Star Surprise Treasure Box'}
                </h4>
                <p className="text-xs text-stone-600 font-medium mt-0.5">
                  {boxOpenedSuccess
                    ? 'Congratulations! You unlocked the rare royal treasure trophy!'
                    : progress.totalStars >= 20
                    ? '🎉 Tap to open your mystery surprise reward now!'
                    : `Earn ${20 - progress.totalStars} more stars to unlock this surprise box!`}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {boxOpenedSuccess ? (
                <div className="bg-emerald-500 text-white rounded-full p-2 shadow-sm">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              ) : progress.totalStars >= 20 ? (
                <button className="bg-amber-500 hover:bg-amber-600 text-white font-black px-4 py-2 rounded-2xl text-xs shadow-md">
                  Open!
                </button>
              ) : (
                <div className="bg-stone-300 text-stone-600 rounded-full p-2">
                  <Lock className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>

          {/* Progress bar towards 20 stars */}
          {!boxOpenedSuccess && (
            <div className="w-full bg-black/10 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (progress.totalStars / 20) * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* STICKER COLLECTION ALBUM */}
      <div className="max-w-xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-stone-800 text-base font-['Fredoka',sans-serif]">
            French Sticker Album ({progress.unlockedStickers.length} of {STICKERS.length})
          </h3>
          <span className="text-[11px] font-bold text-pink-600">
            Collect all milestones!
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {STICKERS.map((sticker) => {
            const isUnlocked = progress.unlockedStickers.includes(sticker.id);

            return (
              <motion.div
                key={sticker.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStickerClick(sticker)}
                className={`aspect-square rounded-2xl p-2 flex flex-col items-center justify-center cursor-pointer border-2 transition-all relative ${
                  isUnlocked
                    ? 'bg-white border-pink-300 shadow-sm hover:border-pink-400'
                    : 'bg-stone-100 border-stone-200 opacity-60'
                }`}
              >
                {/* Rarity Star */}
                {isUnlocked && sticker.rarity === 'legendary' && (
                  <div className="absolute top-1 right-1 text-xs">👑</div>
                )}

                {isUnlocked ? (
                  <>
                    <span className="text-3xl md:text-4xl">{sticker.emoji}</span>
                    <span className="text-[10px] font-black text-stone-800 text-center truncate max-w-full mt-1">
                      {sticker.nameFr}
                    </span>
                    <span className="text-[9px] text-stone-500 font-semibold text-center truncate max-w-full">
                      {sticker.nameEn}
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Lock className="w-5 h-5 text-stone-400" />
                    <span className="text-[10px] font-bold text-stone-500">
                      {sticker.starsRequired} ⭐
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* STICKER DETAILS MODAL IN ENGLISH */}
      <AnimatePresence>
        {selectedSticker && (
          <div
            onClick={() => setSelectedSticker(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl border-2 border-pink-200"
            >
              <div className="text-6xl mb-2">{selectedSticker.emoji}</div>
              <h4 className="text-xl font-black text-stone-800 font-['Fredoka',sans-serif]">
                🇫🇷 {selectedSticker.nameFr}
              </h4>
              <p className="text-xs text-stone-600 font-bold mb-3">
                🇬🇧 English: {selectedSticker.nameEn}
              </p>

              <div className="bg-pink-50 p-2.5 rounded-xl border border-pink-200 text-xs font-bold text-pink-900 mb-4">
                {progress.unlockedStickers.includes(selectedSticker.id) ? (
                  <span className="text-emerald-700 flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> Unlocked in your sticker album!
                  </span>
                ) : (
                  <span>Requires {selectedSticker.starsRequired} stars to unlock!</span>
                )}
              </div>

              <button
                onClick={() => setSelectedSticker(null)}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-black py-2.5 rounded-2xl shadow-sm text-sm"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
