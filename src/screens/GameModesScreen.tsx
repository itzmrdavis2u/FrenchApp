import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Star, 
  RotateCcw, 
  Volume2, 
  Mic, 
  Trophy, 
  Brain, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Character, ChildProfile, ProgressData, VocabularyWord } from '../types';
import { VOCABULARY_LIST } from '../data/vocabulary';
import { speechService, SpeechRecState } from '../services/speechService';
import { 
  playCorrectFanfare, 
  playStarChime, 
  playTryAgainSound, 
  playPopSound 
} from '../services/soundEffects';
import { addStars, recordMasteredWord, recordPronunciation } from '../services/storage';

interface GameModesScreenProps {
  character: Character;
  profile: ChildProfile;
  progress: ProgressData;
  onUpdateProgress: (progress: ProgressData) => void;
  soundEnabled: boolean;
}

type MiniGameMode = 'memory' | 'pronunciation' | 'quickpick';

interface MemoryCard {
  id: string;
  uniqueKey: string;
  type: 'word' | 'image';
  content: string;
  wordFr: string;
  wordEn: string;
  matched: boolean;
  flipped: boolean;
}

export const GameModesScreen: React.FC<GameModesScreenProps> = ({
  character,
  profile,
  progress: _progress,
  onUpdateProgress,
  soundEnabled,
}) => {
  const [activeGame, setActiveGame] = useState<MiniGameMode>('memory');

  // -------------------------------------------------------------
  // GAME 1: MEMORY MATCH (French words <-> Picture Cards)
  // -------------------------------------------------------------
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<MemoryCard[]>([]);
  const [memoryMatchesCount, setMemoryMatchesCount] = useState(0);
  const [memoryGameOver, setMemoryGameOver] = useState(false);

  const initMemoryGame = () => {
    const shuffled = [...VOCABULARY_LIST].sort(() => 0.5 - Math.random()).slice(0, 4);
    const cards: MemoryCard[] = [];

    shuffled.forEach((item) => {
      // Word card
      cards.push({
        id: item.id,
        uniqueKey: `${item.id}-word`,
        type: 'word',
        content: item.fr,
        wordFr: item.fr,
        wordEn: item.en,
        matched: false,
        flipped: false,
      });
      // Image card
      cards.push({
        id: item.id,
        uniqueKey: `${item.id}-img`,
        type: 'image',
        content: item.emoji,
        wordFr: item.fr,
        wordEn: item.en,
        matched: false,
        flipped: false,
      });
    });

    setMemoryCards(cards.sort(() => 0.5 - Math.random()));
    setFlippedCards([]);
    setMemoryMatchesCount(0);
    setMemoryGameOver(false);
  };

  useEffect(() => {
    if (activeGame === 'memory') {
      initMemoryGame();
    } else if (activeGame === 'pronunciation') {
      initPronunciationBattle();
    } else if (activeGame === 'quickpick') {
      initQuickPick();
    }
  }, [activeGame]);

  const handleCardClick = (card: MemoryCard) => {
    if (card.flipped || card.matched || flippedCards.length === 2) return;
    if (soundEnabled) playPopSound(profile.soundVolume);

    speechService.speak(card.wordFr, character, profile.voiceSpeed);

    const updated = memoryCards.map((c) =>
      c.uniqueKey === card.uniqueKey ? { ...c, flipped: true } : c
    );
    setMemoryCards(updated);

    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      if (newFlipped[0].id === newFlipped[1].id) {
        setTimeout(() => {
          if (soundEnabled) playStarChime(profile.soundVolume);
          const matchedState = updated.map((c) =>
            c.id === newFlipped[0].id ? { ...c, matched: true } : c
          );
          setMemoryCards(matchedState);
          setFlippedCards([]);
          setMemoryMatchesCount((prev) => {
            const next = prev + 1;
            if (next === 4) {
              handleGameComplete(3);
              setMemoryGameOver(true);
            }
            return next;
          });
        }, 500);
      } else {
        setTimeout(() => {
          if (soundEnabled) playTryAgainSound(profile.soundVolume);
          const unFlipped = updated.map((c) =>
            newFlipped.some((f) => f.uniqueKey === c.uniqueKey)
              ? { ...c, flipped: false }
              : c
          );
          setMemoryCards(unFlipped);
          setFlippedCards([]);
        }, 1100);
      }
    }
  };

  // -------------------------------------------------------------
  // GAME 2: PRONUNCIATION CHALLENGE
  // -------------------------------------------------------------
  const [battleWordIndex, setBattleWordIndex] = useState(0);
  const [battleWords, setBattleWords] = useState<VocabularyWord[]>([]);
  const [battleRecState, setBattleRecState] = useState<SpeechRecState>('idle');
  const [battleScore, setBattleScore] = useState(0);
  const [battleFeedback, setBattleFeedback] = useState<{ fr: string; en: string } | null>(null);
  const [battleMicNotice, setBattleMicNotice] = useState<string | null>(null);
  const [battleGameOver, setBattleGameOver] = useState(false);

  const initPronunciationBattle = () => {
    const list = [...VOCABULARY_LIST].sort(() => 0.5 - Math.random()).slice(0, 5);
    setBattleWords(list);
    setBattleWordIndex(0);
    setBattleScore(0);
    setBattleFeedback(null);
    setBattleMicNotice(null);
    setBattleGameOver(false);
  };

  const currentBattleWord = battleWords[battleWordIndex];

  const speakBattleWord = () => {
    if (!currentBattleWord) return;
    speechService.speak(currentBattleWord.fr, character, profile.voiceSpeed);
  };

  const handleBattleMic = async () => {
    if (battleRecState === 'listening' || battleRecState === 'processing') {
      speechService.stopListening();
      setBattleRecState('idle');
      return;
    }

    setBattleFeedback(null);
    setBattleMicNotice(null);
    if (soundEnabled) playPopSound(profile.soundVolume);

    await speechService.startListening(
      (transcript, isFinal) => {
        if (isFinal) {
          evaluateBattleSpeech(transcript);
        }
      },
      (error, isPermError) => {
        if (isPermError) {
          setBattleMicNotice('Microphone blocked. Click Allow in your browser, or tap "Tap to Repeat" below!');
        } else {
          setBattleMicNotice(error);
        }
      },
      () => {},
      (state) => {
        setBattleRecState(state);
      }
    );
  };

  const evaluateBattleSpeech = (spoken: string) => {
    if (!currentBattleWord) return;
    const target = currentBattleWord.fr.toLowerCase();
    const clean = spoken.toLowerCase();

    const isMatch = clean.includes(target) || target.includes(clean) || clean.length > 0;

    if (isMatch) {
      if (soundEnabled) playCorrectFanfare(profile.soundVolume);
      setBattleScore((prev) => prev + 1);
      setBattleFeedback({
        fr: `🌟 Magnifique ! Tu as dit "${spoken || currentBattleWord.fr}" !`,
        en: `Great job! You pronounced "${currentBattleWord.fr}" (${currentBattleWord.en})!`,
      });
      recordMasteredWord(currentBattleWord.id);
      recordPronunciation({
        word: currentBattleWord.fr,
        translation: currentBattleWord.en,
        score: 95,
        characterId: character.id,
      });

      setTimeout(() => {
        if (battleWordIndex + 1 >= battleWords.length) {
          handleGameComplete(3);
          setBattleGameOver(true);
        } else {
          setBattleWordIndex((i) => i + 1);
          setBattleFeedback(null);
          setBattleMicNotice(null);
        }
      }, 1800);
    } else {
      if (soundEnabled) playTryAgainSound(profile.soundVolume);
      setBattleFeedback({
        fr: `Bel essai ! Réécoute et répète : "${currentBattleWord.fr}"`,
        en: `Nice try! Listen closely and try saying: "${currentBattleWord.fr}"`,
      });
      speakBattleWord();
    }
  };

  // -------------------------------------------------------------
  // GAME 3: QUICK PICK (Choose the right French picture)
  // -------------------------------------------------------------
  const [quickTarget, setQuickTarget] = useState<VocabularyWord | null>(null);
  const [quickOptions, setQuickOptions] = useState<VocabularyWord[]>([]);
  const [quickRound, setQuickRound] = useState(1);
  const [quickScore, setQuickScore] = useState(0);
  const [quickFeedback, setQuickFeedback] = useState<{ correct: boolean; fr: string; en: string } | null>(null);
  const [quickGameOver, setQuickGameOver] = useState(false);

  const initQuickPick = () => {
    setQuickRound(1);
    setQuickScore(0);
    setQuickFeedback(null);
    setQuickGameOver(false);
    generateQuickRound();
  };

  const generateQuickRound = () => {
    const shuffled = [...VOCABULARY_LIST].sort(() => 0.5 - Math.random());
    const target = shuffled[0];
    const options = shuffled.slice(0, 4).sort(() => 0.5 - Math.random());
    setQuickTarget(target);
    setQuickOptions(options);
    setQuickFeedback(null);

    setTimeout(() => {
      speechService.speak(`Où est : ${target.fr} ?`, character, profile.voiceSpeed);
    }, 200);
  };

  const handleQuickOptionPick = (option: VocabularyWord) => {
    if (!quickTarget || quickFeedback) return;

    if (option.id === quickTarget.id) {
      if (soundEnabled) playCorrectFanfare(profile.soundVolume);
      setQuickFeedback({
        correct: true,
        fr: `🎉 C'est bien : ${quickTarget.fr} !`,
        en: `Correct! You found ${quickTarget.fr} (${quickTarget.en})!`,
      });
      setQuickScore((s) => s + 1);
      recordMasteredWord(quickTarget.id);

      setTimeout(() => {
        if (quickRound >= 5) {
          handleGameComplete(3);
          setQuickGameOver(true);
        } else {
          setQuickRound((r) => r + 1);
          generateQuickRound();
        }
      }, 1500);
    } else {
      if (soundEnabled) playTryAgainSound(profile.soundVolume);
      setQuickFeedback({
        correct: false,
        fr: `Oups ! C'est ${option.fr}. Retrouve : ${quickTarget.fr} !`,
        en: `Oops! That's ${option.fr} (${option.en}). Find ${quickTarget.fr} (${quickTarget.en})!`,
      });
      setTimeout(() => setQuickFeedback(null), 1500);
    }
  };

  const handleGameComplete = (stars: number) => {
    if (soundEnabled) {
      playCorrectFanfare(profile.soundVolume);
      playStarChime(profile.soundVolume);
    }

    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.6 },
    });

    const { updated } = addStars(stars);
    updated.gamesPlayed += 1;
    onUpdateProgress(updated);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 overflow-y-auto">
      {/* English Game Mode Tabs */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-center gap-2 mb-4">
        <button
          onClick={() => setActiveGame('memory')}
          className={`flex-1 py-2 px-3 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-1.5 transition shadow-xs ${
            activeGame === 'memory'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-stone-700 hover:bg-purple-50'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Memory Match</span>
        </button>

        <button
          onClick={() => setActiveGame('pronunciation')}
          className={`flex-1 py-2 px-3 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-1.5 transition shadow-xs ${
            activeGame === 'pronunciation'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-stone-700 hover:bg-rose-50'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Speak Challenge</span>
        </button>

        <button
          onClick={() => setActiveGame('quickpick')}
          className={`flex-1 py-2 px-3 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-1.5 transition shadow-xs ${
            activeGame === 'quickpick'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-stone-700 hover:bg-amber-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Quick Pick</span>
        </button>
      </div>

      {/* Main Game Container */}
      <div className="max-w-xl mx-auto w-full flex-1 flex flex-col justify-between bg-white rounded-3xl p-4 md:p-6 shadow-xl border-2 border-purple-200 relative">
        {/* ================= 1. MEMORY MATCH ================= */}
        {activeGame === 'memory' && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 border-b border-purple-100 pb-2">
              <div>
                <h3 className="font-black text-stone-800 text-lg font-['Fredoka',sans-serif]">
                  Memory Match: Words & Pictures
                </h3>
                <p className="text-xs text-stone-500">
                  Match each French word card with its illustration!
                </p>
              </div>
              <div className="bg-purple-100 text-purple-900 font-black px-3 py-1 rounded-full text-xs">
                Pairs: {memoryMatchesCount} / 4
              </div>
            </div>

            {memoryGameOver ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8 gap-3">
                <Trophy className="w-14 h-14 text-yellow-500 animate-bounce" />
                <h4 className="text-2xl font-black text-stone-800 font-['Fredoka',sans-serif]">
                  You Won, {profile.name}!
                </h4>
                <div className="flex items-center gap-1.5 bg-yellow-400 text-yellow-950 font-black px-4 py-2 rounded-2xl shadow-md">
                  <Star className="w-5 h-5 fill-yellow-200" />
                  <span>+3 Stars Earned!</span>
                </div>
                <button
                  onClick={initMemoryGame}
                  className="mt-3 bg-purple-600 hover:bg-purple-700 text-white font-black px-6 py-2.5 rounded-2xl flex items-center gap-2 shadow-md transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2.5 my-auto">
                {memoryCards.map((card) => {
                  const isVisible = card.flipped || card.matched;
                  return (
                    <motion.div
                      key={card.uniqueKey}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCardClick(card)}
                      className={`h-24 md:h-28 rounded-2xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-300 border-2 select-none ${
                        card.matched
                          ? 'bg-emerald-100 border-emerald-400 opacity-90'
                          : isVisible
                          ? 'bg-white border-purple-400 shadow-md ring-2 ring-purple-200'
                          : 'bg-purple-500 hover:bg-purple-600 border-purple-600 text-white shadow-sm'
                      }`}
                    >
                      {isVisible ? (
                        card.type === 'image' ? (
                          <div className="text-center">
                            <span className="text-3xl md:text-4xl">{card.content}</span>
                            <span className="text-[10px] text-stone-500 font-bold block mt-0.5">
                              {card.wordEn}
                            </span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="font-black text-xs md:text-sm text-purple-950 leading-tight block">
                              {card.content}
                            </span>
                            <span className="text-[10px] text-stone-500 font-bold block mt-0.5">
                              ({card.wordEn})
                            </span>
                          </div>
                        )
                      ) : (
                        <div className="text-center font-black text-2xl text-purple-200">
                          ❓
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= 2. PRONUNCIATION CHALLENGE ================= */}
        {activeGame === 'pronunciation' && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 border-b border-rose-100 pb-2">
              <div>
                <h3 className="font-black text-stone-800 text-lg font-['Fredoka',sans-serif]">
                  French Pronunciation Challenge
                </h3>
                <p className="text-xs text-stone-500">
                  Listen to the French word and repeat into the microphone!
                </p>
              </div>
              <div className="bg-rose-100 text-rose-900 font-black px-3 py-1 rounded-full text-xs">
                Score: {battleScore} / 5
              </div>
            </div>

            {battleGameOver ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8 gap-3">
                <Trophy className="w-14 h-14 text-yellow-500 animate-bounce" />
                <h4 className="text-2xl font-black text-stone-800 font-['Fredoka',sans-serif]">
                  Challenge Completed!
                </h4>
                <p className="text-sm text-stone-600">
                  You successfully practiced {battleScore} out of 5 French words!
                </p>
                <div className="flex items-center gap-1.5 bg-yellow-400 text-yellow-950 font-black px-4 py-2 rounded-2xl shadow-md">
                  <Star className="w-5 h-5 fill-yellow-200" />
                  <span>+3 Stars Earned!</span>
                </div>
                <button
                  onClick={initPronunciationBattle}
                  className="mt-3 bg-rose-600 hover:bg-rose-700 text-white font-black px-6 py-2.5 rounded-2xl flex items-center gap-2 shadow-md transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play New Challenge</span>
                </button>
              </div>
            ) : currentBattleWord ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 my-auto">
                <div className="text-6xl">{currentBattleWord.emoji}</div>
                <div className="text-center">
                  <h4 className="text-2xl md:text-3xl font-black text-stone-800">
                    🇫🇷 {currentBattleWord.fr}
                  </h4>
                  <p className="text-sm text-stone-600 font-bold mt-0.5">
                    🇬🇧 Meaning: {currentBattleWord.en}
                  </p>
                  <p className="text-xs text-amber-800 font-black bg-amber-100 px-3 py-1 rounded-full inline-block mt-1">
                    Pronounce: « {currentBattleWord.phonetic} »
                  </p>
                </div>

                <button
                  onClick={speakBattleWord}
                  className="flex items-center gap-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold px-4 py-1.5 rounded-full text-xs transition active:scale-95"
                >
                  <Volume2 className="w-4 h-4 text-rose-600" />
                  <span>Listen to {character.name.split(' ')[0]} speak</span>
                </button>

                {battleFeedback && (
                  <div className="text-center bg-emerald-50 text-emerald-950 border border-emerald-300 p-2 rounded-xl text-xs font-black max-w-sm">
                    <div>{battleFeedback.fr}</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">{battleFeedback.en}</div>
                  </div>
                )}

                {battleMicNotice && (
                  <div className="flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200 text-xs px-3 py-1.5 rounded-xl max-w-sm text-center font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{battleMicNotice}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-1">
                  {/* Microphone Button */}
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleBattleMic}
                    className={`w-18 h-18 rounded-full flex flex-col items-center justify-center font-black shadow-xl transition-all ${
                      battleRecState === 'listening'
                        ? 'bg-rose-500 text-white ring-8 ring-rose-200 animate-pulse'
                        : 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-100'
                    }`}
                  >
                    <Mic className="w-7 h-7" />
                    <span className="text-[10px] mt-0.5">
                      {battleRecState === 'listening' ? 'Listening...' : 'Speak'}
                    </span>
                  </motion.button>

                  {/* Accessible Tap to Say Button */}
                  <button
                    onClick={() => evaluateBattleSpeech(currentBattleWord.fr)}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-950 font-black px-4 py-2.5 rounded-2xl text-xs border border-amber-300 shadow-xs transition active:scale-95 flex items-center gap-1.5"
                    title="Tap to Repeat & Learn"
                  >
                    <span>⭐</span>
                    <span>Tap to Say: "{currentBattleWord.fr}"</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ================= 3. QUICK PICK ================= */}
        {activeGame === 'quickpick' && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 border-b border-amber-100 pb-2">
              <div>
                <h3 className="font-black text-stone-800 text-lg font-['Fredoka',sans-serif]">
                  Quick Pick
                </h3>
                <p className="text-xs text-stone-500">
                  Tap the picture matching the French word!
                </p>
              </div>
              <div className="bg-amber-100 text-amber-900 font-black px-3 py-1 rounded-full text-xs">
                Round: {quickRound} / 5
              </div>
            </div>

            {quickGameOver ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8 gap-3">
                <Trophy className="w-14 h-14 text-yellow-500 animate-bounce" />
                <h4 className="text-2xl font-black text-stone-800 font-['Fredoka',sans-serif]">
                  Game Complete!
                </h4>
                <p className="text-sm text-stone-600">
                  Score: {quickScore} out of 5 correct answers!
                </p>
                <div className="flex items-center gap-1.5 bg-yellow-400 text-yellow-950 font-black px-4 py-2 rounded-2xl shadow-md">
                  <Star className="w-5 h-5 fill-yellow-200" />
                  <span>+3 Stars Earned!</span>
                </div>
                <button
                  onClick={initQuickPick}
                  className="mt-3 bg-amber-600 hover:bg-amber-700 text-white font-black px-6 py-2.5 rounded-2xl flex items-center gap-2 shadow-md transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
              </div>
            ) : quickTarget ? (
              <div className="flex-1 flex flex-col justify-between my-auto">
                <div className="text-center my-2">
                  <span className="text-xs font-black text-amber-800 uppercase tracking-wider block">
                    Find the picture for:
                  </span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <h4 className="text-2xl md:text-3xl font-black text-amber-950">
                      « {quickTarget.fr} »
                    </h4>
                    <button
                      onClick={() => speechService.speak(quickTarget.fr, character, profile.voiceSpeed)}
                      className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-full transition"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-stone-500 font-bold block mt-0.5">
                    🇬🇧 English: {quickTarget.en} • Pronounced: « {quickTarget.phonetic} »
                  </span>
                </div>

                {quickFeedback && (
                  <div
                    className={`text-center py-2 px-3 rounded-2xl text-xs font-black mx-auto mb-2 max-w-sm ${
                      quickFeedback.correct
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    <div>{quickFeedback.fr}</div>
                    <div className="text-[10px] opacity-80">{quickFeedback.en}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 my-2">
                  {quickOptions.map((opt) => (
                    <motion.button
                      key={opt.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleQuickOptionPick(opt)}
                      className="h-28 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-2xl flex flex-col items-center justify-center p-3 shadow-sm transition active:scale-95"
                    >
                      <span className="text-4xl mb-1">{opt.emoji}</span>
                      <span className="text-xs font-black text-stone-800">
                        {opt.fr}
                      </span>
                      <span className="text-[10px] text-stone-500 font-semibold">
                        ({opt.en})
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
