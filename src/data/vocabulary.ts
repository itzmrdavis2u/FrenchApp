import { VocabularyWord } from '../types';

export const VOCABULARY_LIST: VocabularyWord[] = [
  // Animals
  { id: 'chat', fr: 'Le Chat', en: 'The Cat', phonetic: 'luh shah', emoji: '🐱', category: 'animals', level: 'beginner' },
  { id: 'chien', fr: 'Le Chien', en: 'The Dog', phonetic: 'luh shee-ehn', emoji: '🐶', category: 'animals', level: 'beginner' },
  { id: 'lion', fr: 'Le Lion', en: 'The Lion', phonetic: 'luh lee-ohn', emoji: '🦁', category: 'animals', level: 'beginner' },
  { id: 'singe', fr: 'Le Singe', en: 'The Monkey', phonetic: 'luh sehnzh', emoji: '🐵', category: 'animals', level: 'beginner' },
  { id: 'panda', fr: 'Le Panda', en: 'The Panda', phonetic: 'luh pahn-dah', emoji: '🐼', category: 'animals', level: 'beginner' },
  { id: 'requin', fr: 'Le Requin', en: 'The Shark', phonetic: 'luh ruh-kehn', emoji: '🦈', category: 'animals', level: 'intermediate' },
  { id: 'loup', fr: 'Le Loup', en: 'The Wolf', phonetic: 'luh loo', emoji: '🐺', category: 'animals', level: 'intermediate' },
  { id: 'papillon', fr: 'Le Papillon', en: 'The Butterfly', phonetic: 'luh pah-pee-yohn', emoji: '🦋', category: 'animals', level: 'intermediate' },
  { id: 'oiseau', fr: 'L’Oiseau', en: 'The Bird', phonetic: 'lwah-zoh', emoji: '🐦', category: 'animals', level: 'beginner' },
  { id: 'grenouille', fr: 'La Grenouille', en: 'The Frog', phonetic: 'lah gruh-noo-ee', emoji: '🐸', category: 'animals', level: 'advanced' },

  // Food
  { id: 'pomme', fr: 'La Pomme', en: 'The Apple', phonetic: 'lah pohm', emoji: '🍎', category: 'food', level: 'beginner' },
  { id: 'banane', fr: 'La Banane', en: 'The Banana', phonetic: 'lah bah-nahn', emoji: '🍌', category: 'food', level: 'beginner' },
  { id: 'croissant', fr: 'Le Croissant', en: 'The Croissant', phonetic: 'luh krwah-sahn', emoji: '🥐', category: 'food', level: 'beginner' },
  { id: 'pain', fr: 'Le Pain', en: 'The Bread', phonetic: 'luh pehn', emoji: '🥖', category: 'food', level: 'beginner' },
  { id: 'fromage', fr: 'Le Fromage', en: 'The Cheese', phonetic: 'luh froh-mahzh', emoji: '🧀', category: 'food', level: 'intermediate' },
  { id: 'fraise', fr: 'La Fraise', en: 'The Strawberry', phonetic: 'lah frehz', emoji: '🍓', category: 'food', level: 'intermediate' },
  { id: 'chocolat', fr: 'Le Chocolat', en: 'The Chocolate', phonetic: 'luh shoh-koh-lah', emoji: '🍫', category: 'food', level: 'beginner' },

  // Colors
  { id: 'rouge', fr: 'Rouge', en: 'Red', phonetic: 'roozh', emoji: '🔴', category: 'colors', level: 'beginner' },
  { id: 'bleu', fr: 'Bleu', en: 'Blue', phonetic: 'bluh', emoji: '🔵', category: 'colors', level: 'beginner' },
  { id: 'jaune', fr: 'Jaune', en: 'Yellow', phonetic: 'zhohn', emoji: '🟡', category: 'colors', level: 'beginner' },
  { id: 'vert', fr: 'Vert', en: 'Green', phonetic: 'vehr', emoji: '🟢', category: 'colors', level: 'beginner' },
  { id: 'rose', fr: 'Rose', en: 'Pink', phonetic: 'rohz', emoji: '🌸', category: 'colors', level: 'beginner' },
  { id: 'violet', fr: 'Violet', en: 'Purple', phonetic: 'vee-oh-leh', emoji: '🟣', category: 'colors', level: 'intermediate' },
  { id: 'orange', fr: 'Orange', en: 'Orange', phonetic: 'oh-rahnzh', emoji: '🟠', category: 'colors', level: 'beginner' },

  // Numbers
  { id: 'un', fr: 'Un (1)', en: 'One', phonetic: 'uhn', emoji: '1️⃣', category: 'numbers', level: 'beginner' },
  { id: 'deux', fr: 'Deux (2)', en: 'Two', phonetic: 'duh', emoji: '2️⃣', category: 'numbers', level: 'beginner' },
  { id: 'trois', fr: 'Trois (3)', en: 'Three', phonetic: 'trwah', emoji: '3️⃣', category: 'numbers', level: 'beginner' },
  { id: 'quatre', fr: 'Quatre (4)', en: 'Four', phonetic: 'katr', emoji: '4️⃣', category: 'numbers', level: 'intermediate' },
  { id: 'cinq', fr: 'Cinq (5)', en: 'Five', phonetic: 'sehnk', emoji: '5️⃣', category: 'numbers', level: 'intermediate' },

  // Greetings & Basics
  { id: 'bonjour', fr: 'Bonjour', en: 'Hello / Good morning', phonetic: 'bohn-zhoor', emoji: '👋', category: 'greetings', level: 'beginner' },
  { id: 'merci', fr: 'Merci', en: 'Thank you', phonetic: 'mehr-see', emoji: '🙏', category: 'greetings', level: 'beginner' },
  { id: 'au-revoir', fr: 'Au revoir', en: 'Goodbye', phonetic: 'oh ruh-vwahr', emoji: '👋', category: 'greetings', level: 'beginner' },
  { id: 'sil-vous-plait', fr: 'S’il vous plaît', en: 'Please', phonetic: 'seel voo pleh', emoji: '✨', category: 'greetings', level: 'intermediate' },
  { id: 'bravo', fr: 'Bravo !', en: 'Well done!', phonetic: 'brah-voh', emoji: '🎉', category: 'greetings', level: 'beginner' },

  // Nature
  { id: 'soleil', fr: 'Le Soleil', en: 'The Sun', phonetic: 'luh soh-lay', emoji: '☀️', category: 'nature', level: 'beginner' },
  { id: 'lune', fr: 'La Lune', en: 'The Moon', phonetic: 'lah lyoon', emoji: '🌙', category: 'nature', level: 'beginner' },
  { id: 'etoile', fr: 'L’Étoile', en: 'The Star', phonetic: 'lay-twahl', emoji: '⭐', category: 'nature', level: 'beginner' },
  { id: 'fleur', fr: 'La Fleur', en: 'The Flower', phonetic: 'lah fluhr', emoji: '🌺', category: 'nature', level: 'beginner' },
  { id: 'arc-en-ciel', fr: 'L’Arc-en-ciel', en: 'The Rainbow', phonetic: 'lahrk-ahn-see-ehl', emoji: '🌈', category: 'nature', level: 'intermediate' },
];
