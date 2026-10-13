// Speech recognition & Text-to-Speech management for kids French learning
// Enhanced with explicit mic permission requests, error recovery, and status diagnostics
import { Character } from '../types';

export interface TTSOptions {
  pitch?: number;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

export type SpeechRecState = 'idle' | 'requesting_permission' | 'listening' | 'processing' | 'error' | 'unsupported';

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private frenchVoice: SpeechSynthesisVoice | null = null;
  private recognition: any = null;
  private isListening = false;
  private audioStream: MediaStream | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioritize natural French voices
    this.frenchVoice = 
      voices.find(v => v.lang.startsWith('fr') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Amélie') || v.name.includes('Thomas') || v.name.includes('Audrey'))) ||
      voices.find(v => v.lang.startsWith('fr')) ||
      voices.find(v => v.lang.includes('fr')) ||
      null;
  }

  public getAvailableFrenchVoiceName(): string {
    return this.frenchVoice ? `${this.frenchVoice.name} (${this.frenchVoice.lang})` : 'Default System Voice';
  }

  public speak(
    text: string, 
    character: Character, 
    userSpeedMultiplier = 1.0, 
    options?: TTSOptions
  ) {
    if (!this.synth) {
      options?.onStart?.();
      setTimeout(() => options?.onEnd?.(), 1500);
      return;
    }

    try {
      this.synth.cancel(); // Cancel any ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';

      if (this.frenchVoice) {
        utterance.voice = this.frenchVoice;
      }

      // Modulate pitch and rate according to character's personality and parent settings
      utterance.pitch = character.voicePitch;
      utterance.rate = Math.max(0.6, Math.min(1.4, character.voiceRate * userSpeedMultiplier));

      utterance.onstart = () => {
        options?.onStart?.();
      };

      utterance.onend = () => {
        options?.onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn('TTS error:', e);
        options?.onEnd?.();
      };

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('TTS exception:', e);
      options?.onStart?.();
      setTimeout(() => options?.onEnd?.(), 1200);
    }
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as any;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  /**
   * Explicitly request microphone permission first to prevent silent browser blocking in iframes
   */
  public async requestMicrophonePermission(): Promise<{ granted: boolean; error?: string }> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return { granted: false, error: 'Microphone API not supported by this browser.' };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioStream = stream;
      return { granted: true };
    } catch (err: any) {
      console.warn('Microphone permission request error:', err);
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      return {
        granted: false,
        error: isDenied
          ? 'Microphone permission was denied. Please allow microphone access in your browser bar.'
          : err.message || 'Unable to access microphone.',
      };
    }
  }

  public async startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string, isPermissionError: boolean) => void,
    onEnd: () => void,
    onStateChange?: (state: SpeechRecState) => void
  ) {
    if (typeof window === 'undefined') return;
    const win = window as any;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      onStateChange?.('unsupported');
      onError('Speech recognition is not supported in this browser.', false);
      return;
    }

    // First, request or ensure audio stream access
    onStateChange?.('requesting_permission');
    const permResult = await this.requestMicrophonePermission();
    if (!permResult.granted) {
      onStateChange?.('error');
      onError(permResult.error || 'Microphone access denied.', true);
      onEnd();
      return;
    }

    try {
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {
          // Ignore abort errors
        }
      }

      this.recognition = new SpeechRecognitionClass();
      // Listen in French with fallback recognition
      this.recognition.lang = 'fr-FR';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;

      this.recognition.onstart = () => {
        this.isListening = true;
        onStateChange?.('listening');
      };

      this.recognition.onaudiostart = () => {
        onStateChange?.('listening');
      };

      this.recognition.onspeechstart = () => {
        onStateChange?.('processing');
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const transcript = finalTranscript || interimTranscript;
        onResult(transcript.trim(), !!finalTranscript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        console.warn('SpeechRecognition event error:', event.error);
        const errType = event.error || 'unknown';
        const isPermission = errType === 'not-allowed' || errType === 'service-not-allowed';
        
        let message = 'Could not hear your voice clearly. Try again or tap a word!';
        if (isPermission) {
          message = 'Microphone access blocked. Click the lock/mic icon in your address bar to allow.';
        } else if (errType === 'no-speech') {
          message = "We didn't hear any sound. Speak up or tap the word below!";
        } else if (errType === 'network') {
          message = 'Speech recognition network timeout. You can use the tap-to-speak words!';
        }

        onStateChange?.('error');
        onError(message, isPermission);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onStateChange?.('idle');
        onEnd();
      };

      this.recognition.start();
    } catch (err: any) {
      this.isListening = false;
      onStateChange?.('error');
      onError(err?.message || 'Failed to start microphone speech recognition.', false);
      onEnd();
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Safe catch
      }
      this.isListening = false;
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach((t) => t.stop());
      this.audioStream = null;
    }
  }
}

export const speechService = new SpeechService();
