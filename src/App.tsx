/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScreenType, Character, ChildProfile, ProgressData } from './types';
import { CHARACTERS } from './data/characters';
import { loadProfile, loadProgress, saveProfile, saveProgress } from './services/storage';
import { AndroidFrame } from './components/ui/AndroidFrame';
import { CharacterSelectScreen } from './screens/CharacterSelectScreen';
import { ConversationScreen } from './screens/ConversationScreen';
import { StoryModeScreen } from './screens/StoryModeScreen';
import { GameModesScreen } from './screens/GameModesScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { ParentDashboardScreen } from './screens/ParentDashboardScreen';
import { AndroidCodeExportScreen } from './screens/AndroidCodeExportScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('characters');
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(CHARACTERS[0]);
  const [profile, setProfile] = useState<ChildProfile>(loadProfile);
  const [progress, setProgress] = useState<ProgressData>(loadProgress);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync profile & progress from storage on mount
  useEffect(() => {
    setProfile(loadProfile());
    setProgress(loadProgress());
  }, []);

  const handleUpdateProfile = (newProfile: ChildProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleUpdateProgress = (newProgress: ProgressData) => {
    setProgress(newProgress);
    saveProgress(newProgress);
  };

  const handleStartConversation = (char: Character) => {
    setSelectedCharacter(char);
    setCurrentScreen('conversation');
  };

  const handleStartStory = (char: Character) => {
    setSelectedCharacter(char);
    setCurrentScreen('story');
  };

  return (
    <AndroidFrame
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      profile={profile}
      progress={progress}
      soundEnabled={soundEnabled}
      onToggleSound={() => setSoundEnabled(!soundEnabled)}
    >
      {currentScreen === 'characters' && (
        <CharacterSelectScreen
          selectedCharacter={selectedCharacter}
          onSelectCharacter={setSelectedCharacter}
          onStartConversation={handleStartConversation}
          onStartStory={handleStartStory}
          profile={profile}
          soundEnabled={soundEnabled}
        />
      )}

      {currentScreen === 'conversation' && (
        <ConversationScreen
          character={selectedCharacter}
          profile={profile}
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          soundEnabled={soundEnabled}
        />
      )}

      {currentScreen === 'story' && (
        <StoryModeScreen
          character={selectedCharacter}
          profile={profile}
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          soundEnabled={soundEnabled}
        />
      )}

      {currentScreen === 'games' && (
        <GameModesScreen
          character={selectedCharacter}
          profile={profile}
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          soundEnabled={soundEnabled}
        />
      )}

      {currentScreen === 'rewards' && (
        <RewardsScreen
          profile={profile}
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          soundEnabled={soundEnabled}
        />
      )}

      {currentScreen === 'parent' && (
        <ParentDashboardScreen
          profile={profile}
          progress={progress}
          onUpdateProfile={handleUpdateProfile}
          onUpdateProgress={handleUpdateProgress}
          soundEnabled={soundEnabled}
        />
      )}

      {currentScreen === 'android_code' && (
        <AndroidCodeExportScreen />
      )}
    </AndroidFrame>
  );
}
