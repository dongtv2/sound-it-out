import type { TtsSettings } from '@/types';

class TtsService {
  private voices: SpeechSynthesisVoice[] = [];
  private audioCache: Map<string, string> = new Map();
  private currentAudio: HTMLAudioElement | null = null;

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

  public async speak(text: string, settings: TtsSettings) {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();

    this.stop(); // Stop previous audio or speech

    // Option 1: OpenAI Generative Neural TTS API
    if (settings.engine === 'openai_tts') {
      try {
        await this.speakOpenAI(cleanText, settings);
        return;
      } catch (err) {
        console.warn('OpenAI TTS failed, falling back to Native SpeechSynthesis:', err);
        // Fallback to Native Speech below
      }
    }

    // Option 2: Cloud Google Audio Stream CDN Fallback
    if (settings.engine === 'google_tts_cdn') {
      this.speakGoogleCdn(cleanText, settings.accent, settings.rate);
      return;
    }

    // Option 3: Browser Native Web Speech API
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.speakGoogleCdn(cleanText, settings.accent, settings.rate);
      return;
    }

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

  private async speakOpenAI(text: string, settings: TtsSettings) {
    const cacheKey = `${text}-${settings.openaiVoice || 'nova'}-${settings.openaiModel || 'tts-1'}-${settings.rate || 0.9}`;

    let objectUrl = this.audioCache.get(cacheKey);

    if (!objectUrl) {
      const res = await fetch('/api/tts/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: settings.openaiVoice || 'nova',
          model: settings.openaiModel || 'tts-1',
          speed: settings.rate || 0.9,
          apiKey: settings.openaiApiKey || ''
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to fetch OpenAI TTS');
      }

      const blob = await res.blob();
      objectUrl = URL.createObjectURL(blob);
      this.audioCache.set(cacheKey, objectUrl);
    }

    const audio = new Audio(objectUrl);
    audio.playbackRate = settings.rate || 0.9;
    this.currentAudio = audio;
    await audio.play();
  }

  private speakGoogleCdn(text: string, accent: string, rate: number) {
    const lang = accent === 'en-GB' ? 'en-GB' : accent === 'en-AU' ? 'en-AU' : 'en-US';
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
    
    const audio = new Audio(url);
    audio.playbackRate = rate || 0.9;
    this.currentAudio = audio;
    audio.play().catch(() => {
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
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }
}

export const ttsService = new TtsService();
