import { ChildProfile, ProgressData, PronunciationRecord } from '../types';
import { STICKERS } from '../data/stickers';

const PROFILE_KEY = 'les_amis_francais_profile_v1';
const PROGRESS_KEY = 'les_amis_francais_progress_v1';

export const DEFAULT_PROFILE: ChildProfile = {
  name: 'Camille',
  age: 6,
  avatar: '🐱',
  difficulty: 'beginner',
  voiceSpeed: 0.9,
  safeMode: true,
  soundVolume: 0.8,
  parentPin: '1234',
};

export const DEFAULT_PROGRESS: ProgressData = {
  totalStars: 7,
  dailyStreak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  masteredWords: ['chat', 'bonjour', 'rouge', 'soleil'],
  unlockedStickers: ['croissant-gold'],
  surpriseBoxOpened: false,
  storiesCompleted: 1,
  gamesPlayed: 4,
  pronunciationHistory: [
    {
      id: 'init-1',
      word: 'chat',
      translation: 'cat',
      timestamp: new Date().toISOString(),
      score: 95,
      characterId: 'zoe',
    },
    {
      id: 'init-2',
      word: 'soleil',
      translation: 'sun',
      timestamp: new Date().toISOString(),
      score: 90,
      characterId: 'leo',
    },
  ],
};

export function loadProfile(): ChildProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to load profile:', e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: ChildProfile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save profile:', e);
  }
}

export function loadProgress(): ProgressData {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const data: ProgressData = JSON.parse(raw);
      // Check streak
      const today = new Date().toISOString().split('T')[0];
      const last = data.lastActiveDate;
      if (last !== today) {
        const lastDate = new Date(last);
        const currDate = new Date(today);
        const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          data.dailyStreak += 1;
        } else if (diffDays > 1) {
          data.dailyStreak = 1;
        }
        data.lastActiveDate = today;
        saveProgress(data);
      }
      return data;
    }
  } catch (e) {
    console.warn('Failed to load progress:', e);
  }
  return DEFAULT_PROGRESS;
}

export function saveProgress(progress: ProgressData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save progress:', e);
  }
}

export function addStars(count: number): { updated: ProgressData; newStickers: string[] } {
  const current = loadProgress();
  const newTotal = current.totalStars + count;
  const newStickers: string[] = [];

  // Check newly unlocked stickers
  STICKERS.forEach((st) => {
    if (newTotal >= st.starsRequired && !current.unlockedStickers.includes(st.id)) {
      current.unlockedStickers.push(st.id);
      newStickers.push(st.id);
    }
  });

  const updated: ProgressData = {
    ...current,
    totalStars: newTotal,
  };

  saveProgress(updated);
  return { updated, newStickers };
}

export function recordMasteredWord(wordId: string): ProgressData {
  const current = loadProgress();
  if (!current.masteredWords.includes(wordId)) {
    current.masteredWords.push(wordId);
    saveProgress(current);
  }
  return current;
}

export function recordPronunciation(record: Omit<PronunciationRecord, 'id' | 'timestamp'>): ProgressData {
  const current = loadProgress();
  const fullRecord: PronunciationRecord = {
    ...record,
    id: 'pr-' + Date.now(),
    timestamp: new Date().toISOString(),
  };

  current.pronunciationHistory.unshift(fullRecord);
  if (current.pronunciationHistory.length > 50) {
    current.pronunciationHistory = current.pronunciationHistory.slice(0, 50);
  }

  saveProgress(current);
  return current;
}

export function resetAllData(): { profile: ChildProfile; progress: ProgressData } {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
  }
  return { profile: DEFAULT_PROFILE, progress: DEFAULT_PROGRESS };
}
