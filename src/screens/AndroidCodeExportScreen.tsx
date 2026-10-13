import React, { useState } from 'react';
import { Code, Copy, Check, Download, FileText, Smartphone, Layers } from 'lucide-react';

interface AndroidFile {
  name: string;
  category: 'manifest' | 'compose' | 'viewmodel' | 'speech' | 'db' | 'gradle';
  path: string;
  content: string;
}

const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    name: 'AndroidManifest.xml',
    category: 'manifest',
    path: 'app/src/main/AndroidManifest.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.amisfrancais.kidsapp">

    <!-- Safe child permissions: Audio recording for French pronunciation, Internet for Gemini -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.LesAmisFrancais">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:theme="@style/Theme.LesAmisFrancais.FullScreen">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
  },
  {
    name: 'MainActivity.kt',
    category: 'compose',
    path: 'app/src/main/java/com/amisfrancais/kidsapp/MainActivity.kt',
    content: `package com.amisfrancais.kidsapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.amisfrancais.kidsapp.ui.navigation.FrenchLearningNavHost
import com.amisfrancais.kidsapp.ui.theme.LesAmisFrancaisTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Android Immersive Full-Screen mode (No distractions for child)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val controller = WindowCompat.getInsetsController(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

        setContent {
            LesAmisFrancaisTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    FrenchLearningNavHost()
                }
            }
        }
    }
}`,
  },
  {
    name: 'FrenchLearningNavHost.kt',
    category: 'compose',
    path: 'app/src/main/java/com/amisfrancais/kidsapp/ui/navigation/FrenchLearningNavHost.kt',
    content: `package com.amisfrancais.kidsapp.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.amisfrancais.kidsapp.ui.screens.CharacterSelectScreen
import com.amisfrancais.kidsapp.ui.screens.ConversationScreen
import com.amisfrancais.kidsapp.ui.screens.StoryModeScreen
import com.amisfrancais.kidsapp.ui.screens.GameModesScreen
import com.amisfrancais.kidsapp.ui.screens.RewardsScreen
import com.amisfrancais.kidsapp.ui.screens.ParentDashboardScreen

sealed class Screen(val route: String) {
    object CharacterSelect : Screen("characters")
    object Conversation : Screen("conversation/{characterId}") {
        fun createRoute(characterId: String) = "conversation/$characterId"
    }
    object StoryMode : Screen("story/{characterId}") {
        fun createRoute(characterId: String) = "story/$characterId"
    }
    object GameModes : Screen("games")
    object Rewards : Screen("rewards")
    object ParentDashboard : Screen("parent")
}

@Composable
fun FrenchLearningNavHost() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = Screen.CharacterSelect.route
    ) {
        composable(Screen.CharacterSelect.route) {
            CharacterSelectScreen(
                onSelectCharacter = { charId ->
                    navController.navigate(Screen.Conversation.createRoute(charId))
                },
                onOpenStories = { charId ->
                    navController.navigate(Screen.StoryMode.createRoute(charId))
                },
                onOpenGames = { navController.navigate(Screen.GameModes.route) },
                onOpenRewards = { navController.navigate(Screen.Rewards.route) },
                onOpenParent = { navController.navigate(Screen.ParentDashboard.route) }
            )
        }
        composable(Screen.Conversation.route) { backStackEntry ->
            val charId = backStackEntry.arguments?.getString("characterId") ?: "zoe"
            ConversationScreen(characterId = charId, onNavigateBack = { navController.popBackStack() })
        }
        composable(Screen.StoryMode.route) { backStackEntry ->
            val charId = backStackEntry.arguments?.getString("characterId") ?: "zoe"
            StoryModeScreen(characterId = charId, onNavigateBack = { navController.popBackStack() })
        }
        composable(Screen.GameModes.route) {
            GameModesScreen(onNavigateBack = { navController.popBackStack() })
        }
        composable(Screen.Rewards.route) {
            RewardsScreen(onNavigateBack = { navController.popBackStack() })
        }
        composable(Screen.ParentDashboard.route) {
            ParentDashboardScreen(onNavigateBack = { navController.popBackStack() })
        }
    }
}`,
  },
  {
    name: 'SpeechAndTtsManager.kt',
    category: 'speech',
    path: 'app/src/main/java/com/amisfrancais/kidsapp/speech/SpeechAndTtsManager.kt',
    content: `package com.amisfrancais.kidsapp.speech

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import java.util.Locale

class TtsManager(context: Context, private val onInitSuccess: () -> Unit) : TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = TextToSpeech(context, this)
    private var isReady = false

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale.FRANCE
            isReady = true
            onInitSuccess()
        }
    }

    fun speak(text: String, pitch: Float = 1.0f, speechRate: Float = 0.9f) {
        if (!isReady) return
        tts?.setPitch(pitch)
        tts?.setSpeechRate(speechRate)
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "UTTERANCE_ID")
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
    }
}

class SpeechRecognizerManager(
    private val context: Context,
    private val onResult: (String) -> Unit,
    private val onError: (String) -> Unit
) {
    private var speechRecognizer: SpeechRecognizer? = null

    fun startListening() {
        if (!SpeechRecognizer.isRecognitionAvailable(context)) {
            onError("Speech recognition not available")
            return
        }

        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
            setRecognitionListener(object : RecognitionListener {
                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    val spoken = matches?.firstOrNull() ?: ""
                    onResult(spoken)
                }
                override fun onError(error: Int) {
                    onError("Code: $error")
                }
                override fun onReadyForSpeech(params: Bundle?) {}
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() {}
                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
            })
        }

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "fr-FR")
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        }
        speechRecognizer?.startListening(intent)
    }

    fun stopListening() {
        speechRecognizer?.stopListening()
        speechRecognizer?.destroy()
    }
}`,
  },
  {
    name: 'FrenchDatabase.kt',
    category: 'db',
    path: 'app/src/main/java/com/amisfrancais/kidsapp/data/local/FrenchDatabase.kt',
    content: `package com.amisfrancais.kidsapp.data.local

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.RoomDatabase
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "child_profile")
data class ChildProfileEntity(
    @PrimaryKey val id: Int = 1,
    val name: String = "Camille",
    val age: Int = 6,
    val avatar: String = "🐱",
    val totalStars: Int = 0,
    val dailyStreak: Int = 1,
    val difficulty: String = "beginner",
    val voiceSpeed: Float = 0.9f
)

@Entity(tableName = "learned_words")
data class LearnedWordEntity(
    @PrimaryKey val word: String,
    val translation: String,
    val masteredAt: Long = System.currentTimeMillis(),
    val pronunciationAccuracy: Int
)

@Dao
interface FrenchDao {
    @Query("SELECT * FROM child_profile WHERE id = 1")
    fun getProfile(): Flow<ChildProfileEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveProfile(profile: ChildProfileEntity)

    @Query("SELECT * FROM learned_words ORDER BY masteredAt DESC")
    fun getLearnedWords(): Flow<List<LearnedWordEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLearnedWord(word: LearnedWordEntity)
}

@Database(entities = [ChildProfileEntity::class, LearnedWordEntity::class], version = 1)
abstract class FrenchDatabase : RoomDatabase() {
    abstract fun frenchDao(): FrenchDao
}`,
  },
  {
    name: 'build.gradle.kts',
    category: 'gradle',
    path: 'app/build.gradle.kts',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.amisfrancais.kidsapp"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.amisfrancais.kidsapp"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform(libs.compose.bom))
    implementation(libs.compose.ui)
    implementation(libs.compose.material3)
    implementation(libs.navigation.compose)
    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.compiler)
    implementation("com.google.ai.client.generativeai:generativeai:0.9.0")
}`,
  },
];

export const AndroidCodeExportScreen: React.FC = () => {
  const [activeFile, setActiveFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[1]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-stone-900 text-stone-100 overflow-y-auto">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-xl font-bold font-['Fredoka',sans-serif]">
                Code Source Android & Jetpack Compose
              </h2>
              <span className="text-xs text-stone-400">
                Architecture complète Kotlin, Jetpack Compose, Room & Speech APIs
              </span>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition active:scale-95 shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copié !' : 'Copier le fichier'}</span>
          </button>
        </div>
      </div>

      {/* File Tabs */}
      <div className="max-w-4xl mx-auto w-full flex flex-wrap gap-2 mb-3">
        {ANDROID_PROJECT_FILES.map((file) => (
          <button
            key={file.name}
            onClick={() => setActiveFile(file)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              activeFile.name === file.name
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{file.name}</span>
          </button>
        ))}
      </div>

      {/* Code Editor Box */}
      <div className="max-w-4xl mx-auto w-full flex-1 bg-stone-950 rounded-2xl border border-stone-800 p-4 font-mono text-xs overflow-x-auto shadow-2xl relative">
        <div className="text-[11px] text-stone-500 pb-2 mb-3 border-b border-stone-800 flex justify-between">
          <span>{activeFile.path}</span>
          <span>Kotlin / Android Jetpack</span>
        </div>
        <pre className="text-stone-300 leading-relaxed">
          <code>{activeFile.content}</code>
        </pre>
      </div>
    </div>
  );
};
