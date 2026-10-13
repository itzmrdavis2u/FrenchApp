import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, BookOpen, Volume2, Sparkles, Heart } from 'lucide-react';
import { Character, CharacterId, ChildProfile } from '../types';
import { CHARACTERS } from '../data/characters';
import { CharacterAvatar } from '../components/character/CharacterAvatar';
import { speechService } from '../services/speechService';
import { playPopSound, playTapSound } from '../services/soundEffects';

interface CharacterSelectScreenProps {
  selectedCharacter: Character;
  onSelectCharacter: (char: Character) => void;
  onStartConversation: (char: Character) => void;
  onStartStory: (char: Character) => void;
  profile: ChildProfile;
  soundEnabled: boolean;
}

export const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({
  selectedCharacter,
  onSelectCharacter,
  onStartConversation,
  onStartStory,
  profile,
  soundEnabled,
}) => {
  const [speakingId, setSpeakingId] = useState<CharacterId | null>(null);

  const handleAuditionVoice = (char: Character, e: React.MouseEvent) => {
    e.stopPropagation();
    if (soundEnabled) playTapSound(profile.soundVolume);
    setSpeakingId(char.id);

    speechService.speak(
      char.introGreetingFr,
      char,
      profile.voiceSpeed,
      {
        onEnd: () => setSpeakingId(null),
        onError: () => setSpeakingId(null),
      }
    );
  };

  const handleCardClick = (char: Character) => {
    if (soundEnabled) playPopSound(profile.soundVolume);
    onSelectCharacter(char);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-50">
      {/* English Header */}
      <div className="text-center mb-5">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 bg-amber-200/90 text-amber-950 px-4 py-1.5 rounded-full font-black text-xs md:text-sm shadow-xs mb-2"
        >
          <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
          <span>Pick your animal friend to begin learning French!</span>
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-black text-stone-800 tracking-tight font-['Fredoka',sans-serif]">
          Welcome {profile.name}! Who do you want to talk to?
        </h1>
        <p className="text-xs md:text-sm text-stone-600 mt-1 max-w-md mx-auto">
          Tap any animal below to hear their French voice and start an interactive speaking lesson or story!
        </p>
      </div>

      {/* Grid of 6 Animated Characters */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto w-full flex-1">
        {CHARACTERS.map((char) => {
          const isSelected = selectedCharacter.id === char.id;
          const isSpeaking = speakingId === char.id;

          return (
            <motion.div
              key={char.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(char)}
              className={`relative rounded-3xl p-3 md:p-4 flex flex-col items-center justify-between cursor-pointer border-3 transition-all duration-300 shadow-md ${
                isSelected
                  ? 'border-amber-400 bg-white ring-4 ring-amber-300/40 shadow-xl'
                  : 'border-white/80 bg-white/70 hover:bg-white/95 hover:border-amber-200'
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-3 left-3 bg-amber-500 text-white rounded-full p-1 shadow-xs">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                </div>
              )}

              {/* Character Voice Speaker Button */}
              <button
                onClick={(e) => handleAuditionVoice(char, e)}
                className={`absolute top-3 right-3 p-2 rounded-2xl transition shadow-xs z-10 ${
                  isSpeaking
                    ? 'bg-amber-500 text-white animate-bounce'
                    : 'bg-amber-100/90 text-amber-800 hover:bg-amber-200'
                }`}
                title="Hear French Voice"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {/* Animated Avatar */}
              <div className="py-2">
                <CharacterAvatar
                  id={char.id}
                  size="md"
                  isSpeaking={isSpeaking}
                  isCelebrating={isSelected}
                />
              </div>

              {/* Character Details in English with French Lesson Sample */}
              <div className="text-center w-full mt-1">
                <h3 className="font-black text-base md:text-lg text-stone-800 leading-tight font-['Fredoka',sans-serif]">
                  {char.name}
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-0.5 bg-amber-100 text-amber-900">
                  {char.personality}
                </span>

                <div className="mt-2 text-left bg-amber-50/70 p-2 rounded-xl border border-amber-100">
                  <p className="text-[11px] text-amber-950 font-bold leading-tight">
                    🇫🇷 « {char.catchphraseFr} »
                  </p>
                  <p className="text-[10px] text-stone-500 font-medium italic mt-0.5">
                    🇬🇧 "{char.catchphraseEn}"
                  </p>
                </div>
              </div>

              {/* Action Buttons for Selected Character */}
              {isSelected ? (
                <div className="w-full mt-3 pt-2 border-t border-amber-100 flex flex-col gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (soundEnabled) playPopSound(profile.soundVolume);
                      onStartConversation(char);
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold py-2 px-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm text-xs md:text-sm active:scale-95 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Start French Chat</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (soundEnabled) playPopSound(profile.soundVolume);
                      onStartStory(char);
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-2 px-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm text-xs md:text-sm active:scale-95 transition"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Story Adventure</span>
                  </button>
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-amber-700 font-bold flex items-center gap-1 opacity-75">
                  <span>Tap to choose {char.name.split(' ')[0]}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
