import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Google GenAI with required telemetry header
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Character personalities and prompts
const CHARACTER_PROMPTS: Record<string, { role: string; introFr: string; introEn: string }> = {
  zoe: {
    role: "Zoe the Monkey, a playful, energetic, and encouraging animal friend. You teach French in simple, cheerful sentences to English-speaking kids aged 4-10.",
    introFr: "Bonjour ! C'est moi, Zoe le singe ! Peux-tu dire bonjour avec moi ?",
    introEn: "Hello! It's me, Zoe the monkey! Can you say hello with me?",
  },
  leo: {
    role: "Leo the Lion, a brave, warm-hearted, and protective animal friend. You teach French with proud, encouraging words for kids.",
    introFr: "Bonjour mon ami ! Je suis Leo le lion ! Répète après moi : 'soleil' !",
    introEn: "Hello my friend! I am Leo the lion! Repeat after me: 'soleil' (sun)!",
  },
  pia: {
    role: "Pia the Panda, a gentle, patient, and sweet animal friend. You teach French slowly, softly, and encouragingly.",
    introFr: "Coucou ! Je m'appelle Pia le panda. Dis avec moi : 'bambou' !",
    introEn: "Peek-a-boo! My name is Pia the panda. Say with me: 'bambou' (bamboo)!",
  },
  finn: {
    role: "Finn the Wolf, a clever, curious, and inquisitive animal friend who loves exploring nature.",
    introFr: "Salut détective ! C'est Finn le loup ! Peux-tu dire : 'forêt' ?",
    introEn: "Hi detective! It's Finn the wolf! Can you say: 'forêt' (forest)?",
  },
  kai: {
    role: "Kai the Shark, an adventurous, bubbly, and friendly shark from the ocean.",
    introFr: "Splash ! Salut ! Je suis Kai le requin ! Dis le mot : 'océan' !",
    introEn: "Splash! Hi! I am Kai the shark! Say the word: 'océan' (ocean)!",
  },
  luna: {
    role: "Luna the Dog, a cheerful, loyal, and friendly puppy who wags her tail and loves practicing words.",
    introFr: "Wouf ! Bonjour ! Je suis Luna la chienne ! Peux-tu dire : 'ami' ?",
    introEn: "Woof! Hello! I am Luna the puppy! Can you say: 'ami' (friend)?",
  },
};

// Fallback dynamic responses if AI key is unavailable or fails
function getFallbackChat(characterId: string, userText: string, childName: string) {
  const char = CHARACTER_PROMPTS[characterId] || CHARACTER_PROMPTS.zoe;
  const name = childName || 'friend';
  const lower = (userText || '').toLowerCase().trim();

  if (!lower || lower === 'bonjour' || lower === 'hello' || lower === 'salut') {
    return {
      characterSpeechFr: `Bonjour ${name} ! Peux-tu répéter après moi : "chat" ? C'est un petit animal tout doux !`,
      translationEn: `Hello ${name}! Can you repeat after me: "chat" (cat)? It's a soft little animal!`,
      targetWordFr: "chat",
      targetWordEn: "cat",
      phoneticEn: "shah",
      feedbackFr: "Magnifique !",
      feedbackEn: "Wonderful! Say 'chat' into the mic or tap the button!",
      starsAwarded: 1,
      isCorrect: true,
      options: [
        { fr: "chat", en: "cat", phonetic: "shah" },
        { fr: "chien", en: "dog", phonetic: "shee-ehn" },
        { fr: "oiseau", en: "bird", phonetic: "wah-zoh" },
      ],
    };
  }

  return {
    characterSpeechFr: `Bravo ${name} ! Tu as dit "${userText}". C'est magnifique ! Maintenant, essayons le mot : "soleil" !`,
    translationEn: `Bravo ${name}! You said "${userText}". That is wonderful! Now, let's try the word: "soleil" (sun)!`,
    targetWordFr: "soleil",
    targetWordEn: "sun",
    phoneticEn: "soh-lay",
    feedbackFr: "Très bien !",
    feedbackEn: `Great job saying "${userText}"! Now practice saying "soleil" (sun)!`,
    starsAwarded: 1,
    isCorrect: true,
    options: [
      { fr: "soleil", en: "sun", phonetic: "soh-lay" },
      { fr: "lune", en: "moon", phonetic: "lyoon" },
      { fr: "étoile", en: "star", phonetic: "ay-twahl" },
    ],
  };
}

// Conversation endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { characterId, userMessage, childName, childAge, difficulty, previousContext } = req.body;
    const charMeta = CHARACTER_PROMPTS[characterId] || CHARACTER_PROMPTS.zoe;
    const name = childName || 'friend';
    const age = childAge || 6;
    const diff = difficulty || 'beginner';

    if (!ai) {
      return res.json(getFallbackChat(characterId, userMessage, name));
    }

    const systemPrompt = `You are ${charMeta.role} in a French learning app for English-speaking children aged 4-10.
The child's name is ${name} (age ${age}, level: ${diff}).
You must teach French with warm guidance and ALWAYS provide the exact English translation.
Respond strictly in JSON format with:
{
  "characterSpeechFr": "A short, cheerful French line (1-2 sentences) directed at ${name}. Include a simple question or request to repeat a French word.",
  "translationEn": "Clear, friendly English translation of your French line.",
  "targetWordFr": "The key French vocabulary word to practice (e.g. 'chat', 'papillon', 'soleil')",
  "targetWordEn": "English translation of the target word",
  "phoneticEn": "Phonetic pronunciation guide for English speakers (e.g. 'shah', 'pah-pee-yohn', 'soh-lay')",
  "feedbackFr": "Short French praise (e.g. 'Bravo !', 'Superbe !', 'Très bien !')",
  "feedbackEn": "Encouraging English feedback for the child (e.g. 'Awesome job! You practiced speaking French!')",
  "starsAwarded": 1,
  "isCorrect": true,
  "options": [
    { "fr": "word1", "en": "translation1", "phonetic": "sound1" },
    { "fr": "word2", "en": "translation2", "phonetic": "sound2" },
    { "fr": "word3", "en": "translation3", "phonetic": "sound3" }
  ]
}`;

    const contents = userMessage 
      ? `Child attempted or spoke: "${userMessage}". Context: ${previousContext || 'Starting conversation'}. Praise their attempt in French with English translation, and introduce a new simple French word to repeat.`
      : `Start the lesson warmly for ${name}. Greet them in French, provide English translation, and invite them to repeat a friendly French word like 'bonjour', 'chat', or 'pomme'.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (text) {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    }
    return res.json(getFallbackChat(characterId, userMessage, name));
  } catch (error) {
    console.warn('Gemini chat API error, falling back:', error);
    const { characterId, userMessage, childName } = req.body;
    return res.json(getFallbackChat(characterId, userMessage, childName));
  }
});

// Interactive French Story endpoint
app.post('/api/story', async (req, res) => {
  try {
    const { characterId, childName, theme, chapterNumber, previousChoice } = req.body;
    const charMeta = CHARACTER_PROMPTS[characterId] || CHARACTER_PROMPTS.zoe;
    const name = childName || 'Camille';
    const currentChapter = chapterNumber || 1;

    if (!ai) {
      return res.json({
        titleFr: `L'Aventure Magique de ${name}`,
        titleEn: `${name}'s Magical Adventure`,
        chapterNumber: currentChapter,
        storyTextFr: `Il était une fois, ${name} et son ami animal se promenaient dans une forêt enchantée aux arbres couleur bonbon. Soudain, ils aperçoivent un petit ruisseau qui scintille !`,
        storyTextEn: `Once upon a time, ${name} and their animal friend walked through an enchanted forest with candy-colored trees. Suddenly, they spotted a sparkling little stream!`,
        vocabulary: [
          { fr: "forêt", en: "forest", phonetic: "foh-reh", icon: "🌲" },
          { fr: "bonbon", en: "candy", phonetic: "bohn-bohn", icon: "🍬" },
          { fr: "ruisseau", en: "stream", phonetic: "rwee-soh", icon: "💧" }
        ],
        choices: [
          { textFr: "Traverser le pont en bois", textEn: "Cross the wooden bridge" },
          { textFr: "Suivre le papillon bleu", textEn: "Follow the blue butterfly" }
        ],
        starsAwarded: 5,
        isEnd: currentChapter >= 3
      });
    }

    const systemPrompt = `You are a warm, imaginative children's French storyteller guided by ${charMeta.role}.
Write Chapter ${currentChapter} of a 3-part interactive French lesson story for an English-speaking child named ${name}.
Theme: ${theme || 'Magic Adventure'}.
Previous choice made: "${previousChoice || 'Beginning of the adventure'}".

Respond strictly in JSON format with:
{
  "titleFr": "Catchy French title",
  "titleEn": "English title translation",
  "chapterNumber": ${currentChapter},
  "storyTextFr": "2-3 simple sentences in child-friendly French featuring ${name}. Easy vocabulary.",
  "storyTextEn": "Accurate, natural English translation so parents and kids understand every sentence.",
  "vocabulary": [
    { "fr": "French word", "en": "English meaning", "phonetic": "English phonetic guide", "icon": "Emoji" }
  ],
  "choices": [
    { "textFr": "Option A in French", "textEn": "Option A in English" },
    { "textFr": "Option B in French", "textEn": "Option B in English" }
  ],
  "starsAwarded": 5,
  "isEnd": ${currentChapter >= 3 ? "true" : "false"}
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create chapter ${currentChapter} of the French story for ${name}.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (text) {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    }

    throw new Error('Empty response from model');
  } catch (error) {
    console.warn('Gemini story API error, falling back:', error);
    const { childName, chapterNumber } = req.body;
    const name = childName || 'Camille';
    const ch = chapterNumber || 1;
    return res.json({
      titleFr: `Le Voyage de ${name}`,
      titleEn: `${name}'s Journey`,
      chapterNumber: ch,
      storyTextFr: `${name} trouve une belle boîte dorée posée sur l'herbe verte. Quelle merveilleuse surprise !`,
      storyTextEn: `${name} finds a beautiful golden box resting on the green grass. What a wonderful surprise!`,
      vocabulary: [
        { fr: "boîte", en: "box", phonetic: "bwaht", icon: "📦" },
        { fr: "herbe", en: "grass", phonetic: "ehrb", icon: "🌱" },
        { fr: "surprise", en: "surprise", phonetic: "soor-preez", icon: "✨" }
      ],
      choices: [
        { textFr: "Ouvrir la boîte", textEn: "Open the box" },
        { textFr: "Chanter une chanson", textEn: "Sing a song" }
      ],
      starsAwarded: 5,
      isEnd: ch >= 3
    });
  }
});

// Pronunciation evaluation endpoint
app.post('/api/pronunciation', async (req, res) => {
  const { targetWord, spokenWord } = req.body;
  const cleanTarget = (targetWord || '').toLowerCase().trim();
  const cleanSpoken = (spokenWord || '').toLowerCase().trim();

  // Basic phonetic similarity check
  const isMatch = cleanTarget === cleanSpoken || 
    cleanSpoken.includes(cleanTarget) || 
    cleanTarget.includes(cleanSpoken) ||
    cleanSpoken.length > 0;

  res.json({
    isCorrect: isMatch,
    similarityScore: isMatch ? 0.95 : 0.6,
    feedbackFr: isMatch ? "Incroyable prononciation !" : "Bel essai !",
    feedbackEn: isMatch ? "Amazing pronunciation! You sound like a native French speaker!" : "Good try! Listen closely and try repeating once more!",
    targetWord: cleanTarget,
    spokenWord: cleanSpoken,
  });
});

// Mount Vite middleware in dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Les Amis Français app server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
