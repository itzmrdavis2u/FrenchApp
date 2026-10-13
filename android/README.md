# Les Amis Français - Android App (Kotlin & Jetpack Compose)

An ad-free, child-safe Android app for children aged 4–10 to learn French through conversational animal friends, speech recognition, Google TTS, and AI stories powered by Gemini.

## Project Structure
```
android/
├── build.gradle.kts
├── settings.gradle.kts
├── app/
│   ├── build.gradle.kts
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml
│           └── java/
│               └── com/amisfrancais/kidsapp/
│                   ├── MainActivity.kt
│                   ├── data/
│                   │   ├── local/FrenchDatabase.kt
│                   │   └── model/Character.kt
│                   ├── speech/
│                   │   └── SpeechAndTtsManager.kt
│                   └── ui/
│                       ├── navigation/FrenchLearningNavHost.kt
│                       └── screens/ConversationViewModel.kt
```

## How to Build & Run
1. Open **Android Studio Ladybug (or newer)**.
2. Select **Open an Existing Project** and navigate to the `android/` directory.
3. Allow Gradle to sync.
4. Add your `GEMINI_API_KEY` to `local.properties`:
   ```properties
   gemini.api.key=YOUR_API_KEY
   ```
5. Connect an Android device (Android 7.0 / API 24 or newer) or launch an Android Emulator with microphone audio enabled.
6. Click **Run 'app'** (Shift + F10).
