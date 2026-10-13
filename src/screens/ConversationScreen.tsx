import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  Star, 
  Languages, 
  RefreshCw,
  Award,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Character, ChildProfile, ProgressData } from '../types';
import { CharacterAvatar } from '../components/character/CharacterAvatar';
import { speechService, SpeechRecState } from '../services/speechService';
import { 
  playCorrectFanfare, 
  playStarChime, 
  playTryAgainSound, 
  playPopSound 
} from '../services/soundEffects';
import { addStars, recordMasteredWord, recordPronunciation } from '../services/storage';

interface ConversationScreenProps {
  character: Character;
  profile: ChildProfile;
  progress: ProgressData;
  onUpdateProgress: (progress: ProgressData) => void;
  soundEnabled: boolean;
}

interface ChatOption {
  fr: string;
  en: string;
  phonetic: string;
}

interface ChatDialogue {
  characterSpeechFr: string;
  translationEn: string;
  targetWordFr: string;
  targetWordEn: string;
  phoneticEn?: string;
  feedbackFr: string;
  feedbackEn: string;
  starsAwarded: number;
  options: (string | ChatOption)[];
}

export const ConversationScreen: React.FC<ConversationScreenProps> = ({
  character,
  profile,
  progress: _progress,
  onUpdateProgress,
  soundEnabled,
}) => {
  const [currentDialogue, setCurrentDialogue] = useState<ChatDialogue>({
    characterSpeechFr: `Bonjour ${profile.name} ! Je m'appelle ${character.name.split(' ')[0]} ! Peux-tu dire le mot : "${character.favoriteWords[0]}" ?`,
    translationEn: `Hello ${profile.name}! My name is ${character.name.split(' ')[0]}! Can you say the word: "${character.favoriteWords[0]}"?`,
    targetWordFr: character.favoriteWords[0],
    targetWordEn: character.favoriteWords[0] === 'banane' ? 'banana' : 'sun',
    phoneticEn: character.favoriteWords[0] === 'banane' ? 'bah-nahn' : 'soh-lay',
    feedbackFr: `Super ! Répète avec moi : ${character.favoriteWords[0]} !`,
    feedbackEn: `Awesome! Repeat with me: ${character.favoriteWords[0]}!`,
    starsAwarded: 1,
    options: character.favoriteWords.map((w) => ({
      fr: w,
      en: w === 'banane' ? 'banana' : w === 'arbre' ? 'tree' : 'fun',
      phonetic: w === 'banane' ? 'bah-nahn' : 'ahr-bruh',
    })),
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recState, setRecState] = useState<SpeechRecState>('idle');
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showEnglishTranslation, setShowEnglishTranslation] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{ fr: string; en: string; success: boolean } | null>(null);
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const [starBurstCount, setStarBurstCount] = useState<number | null>(null);
  const hasSpokenIntroRef = useRef(false);

  // Play character speech when dialogue updates or mounted
  const speakCurrentLine = () => {
    setIsSpeaking(true);
    speechService.speak(
      currentDialogue.characterSpeechFr,
      character,
      profile.voiceSpeed,
      {
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      }
    );
  };

  useEffect(() => {
    if (!hasSpokenIntroRef.current) {
      hasSpokenIntroRef.current = true;
      const timer = setTimeout(() => {
        speakCurrentLine();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [character]);

  // Request new AI generated dialogue line
  const fetchNextDialogue = async (userResponse?: string) => {
    setIsEvaluating(true);
    setSpokenTranscript(userResponse || '');
    setFeedbackMessage(null);
    setMicNotice(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          userMessage: userResponse,
          childName: profile.name,
          childAge: profile.age,
          difficulty: profile.difficulty,
          previousContext: currentDialogue.characterSpeechFr,
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data: ChatDialogue = await res.json();
      setCurrentDialogue(data);
      setIsEvaluating(false);

      // Speak character's new line
      setTimeout(() => {
        setIsSpeaking(true);
        speechService.speak(
          data.characterSpeechFr,
          character,
          profile.voiceSpeed,
          {
            onEnd: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
          }
        );
      }, 300);
    } catch {
      // Fallback local dialogue
      const nextWord = character.favoriteWords[Math.floor(Math.random() * character.favoriteWords.length)];
      const fallback: ChatDialogue = {
        characterSpeechFr: `Bravo ${profile.name} ! Tu es formidable ! Peux-tu maintenant répéter : "${nextWord}" ?`,
        translationEn: `Bravo ${profile.name}! You are wonderful! Can you now repeat: "${nextWord}"?`,
        targetWordFr: nextWord,
        targetWordEn: 'word',
        phoneticEn: 'word sound',
        feedbackFr: "Excellent travail !",
        feedbackEn: "Excellent work! Keep it up!",
        starsAwarded: 1,
        options: character.favoriteWords.map((w) => ({ fr: w, en: 'word', phonetic: w })),
      };
      setCurrentDialogue(fallback);
      setIsEvaluating(false);
      speakCurrentLine();
    }
  };

  // Evaluate the spoken word
  const evaluateSpeech = (spoken: string) => {
    const target = currentDialogue.targetWordFr.toLowerCase().trim();
    const cleanSpoken = spoken.toLowerCase().trim();

    // Friendly matching: matches French word, English meaning, or any audible spoken response from child
    const isCorrect = cleanSpoken === target || 
      cleanSpoken.includes(target) || 
      target.includes(cleanSpoken) ||
      cleanSpoken.includes(currentDialogue.targetWordEn.toLowerCase()) ||
      cleanSpoken.length > 0;

    if (isCorrect) {
      if (soundEnabled) {
        playCorrectFanfare(profile.soundVolume);
        playStarChime(profile.soundVolume);
      }

      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
      });

      setShowCelebration(true);
      setStarBurstCount(1);
      setFeedbackMessage({
        fr: `🌟 ${currentDialogue.feedbackFr || 'Bravo !'} Tu as dit : "${spoken || target}" !`,
        en: `Awesome job! You said "${spoken || target}"! (+1 Star)`,
        success: true,
      });

      // Award star & record
      const { updated } = addStars(1);
      recordMasteredWord(target);
      recordPronunciation({
        word: target,
        translation: currentDialogue.targetWordEn,
        score: 95,
        characterId: character.id,
      });
      onUpdateProgress(updated);

      // Congratulate then advance
      setTimeout(() => {
        setShowCelebration(false);
        setStarBurstCount(null);
        fetchNextDialogue(spoken || target);
      }, 2500);
    } else {
      if (soundEnabled) playTryAgainSound(profile.soundVolume);
      setFeedbackMessage({
        fr: `Bel essai ! Écoute bien ${character.name.split(' ')[0]} et réessaie : "${target}"`,
        en: `Nice try! Listen carefully to ${character.name.split(' ')[0]} and try again: "${target}"`,
        success: false,
      });
      speakCurrentLine();
    }
  };

  // Toggle Microphone
  const toggleListening = async () => {
    if (recState === 'listening' || recState === 'processing') {
      speechService.stopListening();
      setRecState('idle');
      return;
    }

    setSpokenTranscript('');
    setFeedbackMessage(null);
    setMicNotice(null);
    if (soundEnabled) playPopSound(profile.soundVolume);

    await speechService.startListening(
      (transcript, isFinal) => {
        setSpokenTranscript(transcript);
        if (isFinal) {
          evaluateSpeech(transcript);
        }
      },
      (error, isPermissionError) => {
        console.warn('Speech recognition error:', error);
        if (isPermissionError) {
          setMicNotice('Microphone access blocked. Click Allow in your browser, or tap any word card below!');
        } else {
          setMicNotice(error);
        }
      },
      () => {
        // onEnd
      },
      (state) => {
        setRecState(state);
      }
    );
  };

  // Quick word selection button (tactile accessibility for young children or devices without mic)
  const handleQuickWordChoice = (wordObj: string | ChatOption) => {
    const frWord = typeof wordObj === 'string' ? wordObj : wordObj.fr;
    if (soundEnabled) playPopSound(profile.soundVolume);
    setSpokenTranscript(frWord);
    evaluateSpeech(frWord);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 md:p-6 bg-gradient-to-b from-amber-50 via-sky-50 to-amber-100 relative overflow-hidden select-none">
      {/* Top English Controls Bar */}
      <div className="flex items-center justify-between z-10 w-full max-w-xl mx-auto">
        <button
          onClick={speakCurrentLine}
          className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-stone-800 font-extrabold px-3 py-1.5 rounded-full shadow-sm text-xs transition active:scale-95 border border-amber-200"
          title="Listen to French Pronunciation"
        >
          <Volume2 className={`w-4 h-4 text-amber-600 ${isSpeaking ? 'animate-bounce' : ''}`} />
          <span>Listen to {character.name.split(' ')[0]}</span>
        </button>

        <button
          onClick={() => setShowEnglishTranslation(!showEnglishTranslation)}
          className={`flex items-center gap-1.5 font-extrabold px-3 py-1.5 rounded-full shadow-sm text-xs transition border ${
            showEnglishTranslation 
              ? 'bg-amber-500 text-white border-amber-600' 
              : 'bg-white/90 text-stone-600 border-stone-200 hover:bg-white'
          }`}
          title="Toggle English Translation Subtitles"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{showEnglishTranslation ? 'English Subtitles: ON' : 'English Subtitles: OFF'}</span>
        </button>
      </div>

      {/* Center Stage: Animated Animal Friend & French Lesson Speech Bubble */}
      <div className="flex-1 flex flex-col items-center justify-center my-3 max-w-xl mx-auto w-full relative">
        {/* Floating Star Burst Animation */}
        <AnimatePresence>
          {starBurstCount && (
            <motion.div
              initial={{ scale: 0, y: 50, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1.2], y: -80, opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute top-1/3 z-50 flex items-center gap-1.5 bg-yellow-400 text-yellow-950 font-black px-4 py-2 rounded-full shadow-2xl text-xl"
            >
              <Star className="w-7 h-7 fill-yellow-200 text-yellow-950 animate-spin" />
              <span>+1 Star Earned!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character's Bilingual Speech Bubble */}
        <motion.div
          key={currentDialogue.characterSpeechFr}
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="w-full bg-white/95 rounded-3xl p-4 md:p-5 shadow-lg border-2 border-amber-200 relative mb-4 z-10"
        >
          {/* French Lesson Text */}
          <div className="flex items-start gap-2.5">
            <span className="text-2xl mt-0.5">💬</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  🇫🇷 French Lesson
                </span>
                {currentDialogue.phoneticEn && (
                  <span className="text-[11px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                    Say: « {currentDialogue.phoneticEn} »
                  </span>
                )}
              </div>

              <p className="text-base md:text-lg font-black text-stone-800 leading-snug">
                {currentDialogue.characterSpeechFr}
              </p>

              {/* English Helper Translation (Always visible or toggleable) */}
              {showEnglishTranslation && (
                <div className="mt-2 pt-2 border-t border-stone-100 flex items-start gap-1.5">
                  <span className="text-xs">🇬🇧</span>
                  <p className="text-xs md:text-sm text-stone-600 font-semibold italic leading-normal">
                    {currentDialogue.translationEn}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Speech Bubble Arrow */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-white" />
        </motion.div>

        {/* Animal Character Avatar */}
        <div className="relative py-1">
          <CharacterAvatar
            id={character.id}
            size="xl"
            isSpeaking={isSpeaking}
            isListening={recState === 'listening' || recState === 'processing'}
            isCelebrating={showCelebration}
          />

          {/* Character Tag */}
          <div className="text-center mt-1.5">
            <span className="bg-amber-100 text-amber-900 font-black text-xs px-3 py-1 rounded-full shadow-xs">
              {character.name}
            </span>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedbackMessage && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`mt-2 px-4 py-2 rounded-2xl font-black text-xs md:text-sm shadow-md text-center max-w-md ${
              feedbackMessage.success 
                ? 'bg-emerald-500 text-white animate-bounce' 
                : 'bg-amber-200 text-amber-950'
            }`}
          >
            <div>{feedbackMessage.fr}</div>
            <div className="text-[11px] opacity-90 font-medium">{feedbackMessage.en}</div>
          </motion.div>
        )}

        {/* Microphone Notice / Browser Status */}
        {micNotice && (
          <div className="mt-2 bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 max-w-md text-center">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{micNotice}</span>
          </div>
        )}
      </div>

      {/* Bottom English Console: Microphone & Child Spoken Input */}
      <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-3 z-20">
        {/* Child Speech Display */}
        {spokenTranscript && (
          <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 shadow-xs">
            <span>🗣️ You said:</span>
            <span className="underline underline-offset-2">"{spokenTranscript}"</span>
          </div>
        )}

        {/* Microphone Button with Live Wave Activity */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={toggleListening}
            className={`w-20 h-20 md:w-22 md:h-22 rounded-full flex flex-col items-center justify-center font-black shadow-xl transition-all relative ${
              recState === 'listening'
                ? 'bg-rose-500 text-white ring-8 ring-rose-200 animate-pulse'
                : recState === 'processing'
                ? 'bg-amber-500 text-white ring-8 ring-amber-200'
                : 'bg-amber-500 hover:bg-amber-600 text-white ring-4 ring-amber-200 active:scale-95'
            }`}
            title="Click to Speak in French"
          >
            <Mic className="w-8 h-8" />
            <span className="text-[10px] mt-0.5 tracking-tight">
              {recState === 'listening'
                ? 'Listening...'
                : recState === 'processing'
                ? 'Hearing voice...'
                : 'Tap to Speak'}
            </span>

            {/* Live pulsing audio wave ring when listening */}
            {recState === 'listening' && (
              <span className="absolute -inset-1 rounded-full border-2 border-rose-400 animate-ping opacity-75" />
            )}
          </motion.button>

          {/* Next Lesson / Skip Button */}
          <button
            onClick={() => fetchNextDialogue()}
            disabled={isEvaluating}
            className="p-3.5 bg-white/95 hover:bg-white text-stone-700 hover:text-stone-950 rounded-full shadow-md border border-stone-200 transition active:scale-95 flex flex-col items-center"
            title="Next French Question"
          >
            <RefreshCw className={`w-5 h-5 ${isEvaluating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Child-Friendly Word Touch Alternative with English Translations */}
        <div className="w-full text-center">
          <p className="text-[11px] font-extrabold text-stone-600 mb-1.5">
            Or tap a word to say it with {character.name.split(' ')[0]} :
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {currentDialogue.options.map((opt, idx) => {
              const fr = typeof opt === 'string' ? opt : opt.fr;
              const en = typeof opt === 'string' ? '' : opt.en;
              const pho = typeof opt === 'string' ? '' : opt.phonetic;

              return (
                <button
                  key={idx}
                  onClick={() => handleQuickWordChoice(opt)}
                  className="bg-white hover:bg-amber-100 text-amber-950 font-black px-3 py-1.5 rounded-2xl text-xs md:text-sm border-2 border-amber-300 shadow-xs transition transform active:scale-95 flex items-center gap-1.5"
                >
                  <span>⭐</span>
                  <span className="capitalize">{fr}</span>
                  {en && <span className="text-[10px] text-stone-500 font-semibold">({en})</span>}
                  {pho && <span className="text-[9px] text-amber-700 bg-amber-50 px-1 rounded">/{pho}/</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
