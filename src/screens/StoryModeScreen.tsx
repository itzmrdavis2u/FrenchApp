import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Volume2, 
  Sparkles, 
  Star, 
  RotateCcw, 
  Compass, 
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Character, ChildProfile, ProgressData, StoryChapter } from '../types';
import { CharacterAvatar } from '../components/character/CharacterAvatar';
import { speechService } from '../services/speechService';
import { playCorrectFanfare, playStarChime, playPopSound } from '../services/soundEffects';
import { addStars, saveProgress } from '../services/storage';

interface StoryModeScreenProps {
  character: Character;
  profile: ChildProfile;
  progress: ProgressData;
  onUpdateProgress: (progress: ProgressData) => void;
  soundEnabled: boolean;
}

export const StoryModeScreen: React.FC<StoryModeScreenProps> = ({
  character,
  profile,
  progress: _progress,
  onUpdateProgress,
  soundEnabled,
}) => {
  const [currentChapter, setCurrentChapter] = useState<StoryChapter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [selectedWordPronounce, setSelectedWordPronounce] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [chapterIndex, setChapterIndex] = useState(1);
  const [activeTheme, setActiveTheme] = useState('La Forêt Enchantée');

  // Load story chapter
  const loadChapter = async (chapNum: number, choiceChosen?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          childName: profile.name,
          theme: activeTheme,
          chapterNumber: chapNum,
          previousChoice: choiceChosen,
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch story');
      const data: StoryChapter = await res.json();
      setCurrentChapter(data);
      setChapterIndex(chapNum);
      setIsLoading(false);

      // Read story aloud
      setTimeout(() => {
        narrateText(data.storyTextFr);
      }, 300);
    } catch {
      // Offline fallback chapter
      const fallback: StoryChapter = {
        titleFr: `L'Aventure Magique de ${profile.name}`,
        titleEn: `${profile.name}'s Magical Adventure`,
        chapterNumber: chapNum,
        storyTextFr: `${profile.name} et ${character.name.split(' ')[0]} découvrent un beau château scintillant sous les étoiles. Les oiseaux chantent une mélodie joyeuse !`,
        storyTextEn: `${profile.name} and ${character.name.split(' ')[0]} discover a beautiful sparkling castle under the stars. The birds sing a joyful tune!`,
        vocabulary: [
          { fr: 'château', en: 'castle', icon: '🏰' },
          { fr: 'étoiles', en: 'stars', icon: '⭐' },
          { fr: 'oiseaux', en: 'birds', icon: '🐦' },
        ],
        choices: [
          { textFr: 'Entrer par la grande porte dorée', textEn: 'Enter through the golden door' },
          { textFr: 'Explorer le jardin aux fleurs', textEn: 'Explore the flower garden' },
        ],
        starsAwarded: 5,
        isEnd: chapNum >= 3,
      };
      setCurrentChapter(fallback);
      setChapterIndex(chapNum);
      setIsLoading(false);
      narrateText(fallback.storyTextFr);
    }
  };

  useEffect(() => {
    loadChapter(1);
  }, [character, activeTheme]);

  const narrateText = (text: string) => {
    setIsNarrating(true);
    speechService.speak(
      text,
      character,
      profile.voiceSpeed,
      {
        onEnd: () => setIsNarrating(false),
        onError: () => setIsNarrating(false),
      }
    );
  };

  const handleChoice = (choiceText: string) => {
    if (soundEnabled) playPopSound(profile.soundVolume);
    if (chapterIndex >= 3) {
      handleFinishStory();
    } else {
      loadChapter(chapterIndex + 1, choiceText);
    }
  };

  const handleFinishStory = () => {
    if (soundEnabled) {
      playCorrectFanfare(profile.soundVolume);
      playStarChime(profile.soundVolume);
    }

    confetti({
      particleCount: 75,
      spread: 85,
      origin: { y: 0.5 },
    });

    const { updated } = addStars(5);
    updated.storiesCompleted += 1;
    saveProgress(updated);
    onUpdateProgress(updated);
    setIsFinished(true);
  };

  const handlePronounceWord = (word: string) => {
    setSelectedWordPronounce(word);
    if (soundEnabled) playPopSound(profile.soundVolume);
    speechService.speak(
      word,
      character,
      profile.voiceSpeed * 0.85,
      {
        onEnd: () => setSelectedWordPronounce(null),
        onError: () => setSelectedWordPronounce(null),
      }
    );
  };

  const themes = [
    { titleFr: 'La Forêt Enchantée', titleEn: 'Enchanted Forest', icon: '🌲' },
    { titleFr: 'L’Océan Magique', titleEn: 'Magic Ocean', icon: '🌊' },
    { titleFr: 'L’Espace et les Étoiles', titleEn: 'Outer Space', icon: '🚀' },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-gradient-to-b from-emerald-50 via-teal-50 to-amber-50 overflow-y-auto">
      {/* Top English Header */}
      <div className="flex items-center justify-between max-w-2xl mx-auto w-full mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl font-black text-stone-800 font-['Fredoka',sans-serif]">
            French Story Adventures
          </h2>
        </div>

        {/* Chapter Steps Indicator in English */}
        <div className="flex items-center gap-1.5 bg-white/90 px-3 py-1 rounded-full border border-emerald-200 text-xs font-black text-emerald-800 shadow-xs">
          <span>Chapter {chapterIndex} of 3</span>
        </div>
      </div>

      {/* Theme Selector Carousel in English & French */}
      <div className="flex items-center justify-center gap-2 max-w-2xl mx-auto w-full mb-4">
        {themes.map((th) => (
          <button
            key={th.titleFr}
            onClick={() => {
              if (activeTheme !== th.titleFr) {
                setActiveTheme(th.titleFr);
                setIsFinished(false);
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition shadow-xs ${
              activeTheme === th.titleFr
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-stone-700 hover:bg-emerald-100'
            }`}
          >
            <span>{th.icon}</span>
            <span>{th.titleEn}</span>
          </button>
        ))}
      </div>

      {/* Main Story Card */}
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-between bg-white rounded-3xl p-5 md:p-6 shadow-xl border-3 border-emerald-200 relative">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
            <Sparkles className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-stone-700 font-bold text-sm">
              {character.name.split(' ')[0]} is writing the next French chapter for {profile.name}...
            </p>
          </div>
        ) : isFinished ? (
          // Story Completion Screen in English
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center py-8 gap-4"
          >
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-300">
              <Trophy className="w-10 h-10 text-yellow-600" />
            </div>

            <h3 className="text-2xl font-black text-stone-800 font-['Fredoka',sans-serif]">
              Congratulations {profile.name}!
            </h3>
            <p className="text-stone-600 max-w-sm text-sm">
              You finished this French story with {character.name.split(' ')[0]} and learned wonderful new vocabulary!
            </p>

            <div className="flex items-center gap-2 bg-yellow-400 text-yellow-950 font-black px-5 py-2.5 rounded-2xl shadow-md text-lg">
              <Star className="w-6 h-6 fill-yellow-100 text-yellow-950" />
              <span>+5 Stars Earned!</span>
            </div>

            <button
              onClick={() => {
                setIsFinished(false);
                loadChapter(1);
              }}
              className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 py-3 rounded-2xl flex items-center gap-2 shadow-md transition transform active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Start a New Story</span>
            </button>
          </motion.div>
        ) : currentChapter ? (
          <>
            {/* Story Header with French Title & English Meaning */}
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3 mb-3">
              <div>
                <h3 className="text-lg md:text-xl font-black text-stone-800 font-['Fredoka',sans-serif]">
                  🇫🇷 {currentChapter.titleFr}
                </h3>
                <span className="text-xs text-stone-500 font-bold">
                  🇬🇧 {currentChapter.titleEn}
                </span>
              </div>

              {/* Replay Narration Audio */}
              <button
                onClick={() => narrateText(currentChapter.storyTextFr)}
                className={`p-2.5 rounded-2xl transition shadow-xs flex items-center gap-1.5 text-xs font-bold ${
                  isNarrating ? 'bg-emerald-500 text-white animate-bounce' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                }`}
                title="Listen to French Story"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Listen</span>
              </button>
            </div>

            {/* Character & Story Paragraphs (French + English) */}
            <div className="flex flex-col md:flex-row items-center gap-4 my-2">
              <div className="shrink-0">
                <CharacterAvatar
                  id={character.id}
                  size="lg"
                  isSpeaking={isNarrating}
                  isCelebrating={false}
                />
              </div>

              <div className="flex-1 bg-amber-50/80 p-4 rounded-2xl border border-amber-200/90 space-y-2">
                <div>
                  <span className="text-[10px] bg-blue-100 text-blue-900 font-black px-2 py-0.5 rounded-full uppercase">
                    French Story
                  </span>
                  <p className="text-base md:text-lg font-black text-stone-800 leading-relaxed mt-1">
                    {currentChapter.storyTextFr}
                  </p>
                </div>

                <div className="border-t border-amber-200/60 pt-2">
                  <span className="text-[10px] bg-stone-200 text-stone-700 font-black px-2 py-0.5 rounded-full uppercase">
                    English Translation
                  </span>
                  <p className="text-xs md:text-sm text-stone-600 italic font-semibold mt-1">
                    {currentChapter.storyTextEn}
                  </p>
                </div>
              </div>
            </div>

            {/* Tap-to-Hear Vocabulary Spotlight */}
            {currentChapter.vocabulary && currentChapter.vocabulary.length > 0 && (
              <div className="mt-3 bg-emerald-50/90 p-3 rounded-2xl border border-emerald-200">
                <span className="text-xs font-black text-emerald-950 block mb-1.5">
                  🔍 Tap any magic French word to hear pronunciation:
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentChapter.vocabulary.map((vocab, i) => (
                    <button
                      key={i}
                      onClick={() => handlePronounceWord(vocab.fr)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition shadow-2xs active:scale-95 ${
                        selectedWordPronounce === vocab.fr
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'bg-white text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      <span>{vocab.icon}</span>
                      <span className="capitalize">{vocab.fr}</span>
                      <span className="text-[10px] text-stone-500 font-medium">({vocab.en})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Story Choices with English Meanings */}
            <div className="mt-4 pt-3 border-t border-emerald-100">
              <p className="text-xs font-black text-stone-700 mb-2 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>What should {profile.name} do next? Choose a path:</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentChapter.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChoice(choice.textFr)}
                    className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-left font-black shadow-md transition transform active:scale-98 flex flex-col justify-between"
                  >
                    <span className="text-sm font-extrabold">👉 {choice.textFr}</span>
                    <span className="text-[11px] text-emerald-100 font-semibold mt-0.5">
                      🇬🇧 {choice.textEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
