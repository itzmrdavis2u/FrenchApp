export type CharacterId = 'zoe' | 'leo' | 'pia' | 'finn' | 'kai' | 'luna';

export interface Character {
  id: CharacterId;
  name: string;
  frenchTitle: string;
  animal: string;
  personality: string;
  catchphraseFr: string;
  catchphraseEn: string;
  voicePitch: number; // 0.8 - 1.4
  voiceRate: number;  // 0.8 - 1.0
  color: {
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    gradient: string;
    light: string;
  };
  introGreetingFr: string;
  introGreetingEn: string;
  funFactFr: string;
  favoriteWords: string[];
}

export interface ChildProfile {
  name: string;
  age: number;
  avatar: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  voiceSpeed: number; // 0.7 - 1.2
  safeMode: boolean;
  soundVolume: number;
  parentPin: string;
}

export interface PronunciationRecord {
  id: string;
  word: string;
  translation: string;
  timestamp: string;
  score: number; // 0 - 100
  characterId: CharacterId;
}

export interface ProgressData {
  totalStars: number;
  dailyStreak: number;
  lastActiveDate: string;
  masteredWords: string[];
  unlockedStickers: string[];
  surpriseBoxOpened: boolean;
  storiesCompleted: number;
  gamesPlayed: number;
  pronunciationHistory: PronunciationRecord[];
}

export interface Sticker {
  id: string;
  nameFr: string;
  nameEn: string;
  emoji: string;
  badge: string;
  starsRequired: number;
  rarity: 'common' | 'rare' | 'legendary';
}

export interface StoryChapter {
  titleFr: string;
  titleEn: string;
  chapterNumber: number;
  storyTextFr: string;
  storyTextEn: string;
  vocabulary: { fr: string; en: string; icon: string }[];
  choices: { textFr: string; textEn: string }[];
  starsAwarded: number;
  isEnd: boolean;
}

export interface VocabularyWord {
  id: string;
  fr: string;
  en: string;
  phonetic: string;
  emoji: string;
  category: 'animals' | 'food' | 'colors' | 'numbers' | 'greetings' | 'nature';
  level: 'beginner' | 'intermediate' | 'advanced';
}

export type ScreenType = 
  | 'characters' 
  | 'conversation' 
  | 'story' 
  | 'games' 
  | 'rewards' 
  | 'parent' 
  | 'android_code';
