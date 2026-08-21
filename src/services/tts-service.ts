import type { TtsSettings } from '@/types';

class TtsService {
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.initVoices();
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      this.voices = window.speechSynthesis.getVoices();
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  public getAvailableVoices(accent: 'en-US' | 'en-GB' | 'en-AU' = 'en-US'): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }

    return this.voices.filter(v => 
      v.lang.toLowerCase().replace('_', '-').startsWith(accent.toLowerCase()) ||
      v.lang.toLowerCase().startsWith('en')
    );
  }

  public getAllEnglishVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices.filter(v => v.lang.toLowerCase().startsWith('en'));
  }

  public speak(text: string, settings: TtsSettings) {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();

    // Option 1: Cloud Google Audio Stream CDN Fallback
    if (settings.engine === 'google_tts_cdn') {
      this.speakGoogleCdn(cleanText, settings.accent, settings.rate);
      return;
    }

    // Option 2: Browser Native Web Speech API
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.speakGoogleCdn(cleanText, settings.accent, settings.rate);
      return;
    }

    window.speechSynthesis.cancel(); // Stop current playing speech

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = settings.accent || 'en-US';
    utterance.rate = settings.rate || 0.9;
    utterance.pitch = settings.pitch || 1.0;

    // Discover matching native voice
    const available = this.getAvailableVoices(settings.accent);
    
    if (settings.voiceName && settings.voiceName !== 'auto') {
      const selectedVoice = this.voices.find(v => v.name === settings.voiceName);
      if (selectedVoice) utterance.voice = selectedVoice;
    } else if (available.length > 0) {
      // Prioritize high quality Natural / Google / Premium voices
      const preferred = available.find(v => 
        v.name.includes('Google') || 
        v.name.includes('Natural') || 
        v.name.includes('Premium') ||
        v.name.includes('Samantha') ||
        v.name.includes('Daniel')
      ) || available[0];
      utterance.voice = preferred;
    }

    window.speechSynthesis.speak(utterance);
  }

  private speakGoogleCdn(text: string, accent: string, rate: number) {
    const lang = accent === 'en-GB' ? 'en-GB' : accent === 'en-AU' ? 'en-AU' : 'en-US';
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
    
    const audio = new Audio(url);
    audio.playbackRate = rate || 0.9;
    audio.play().catch(() => {
      // Fallback to native SpeechSynthesis if audio play fails
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        window.speechSynthesis.speak(utterance);
      }
    });
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const ttsService = new TtsService();
