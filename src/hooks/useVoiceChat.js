import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for browser-native voice chat.
 * Uses Web Speech API: SpeechRecognition (STT) + SpeechSynthesis (TTS).
 * 
 * Modular design: swap implementation for AI voice APIs later
 * without changing consuming components.
 */
export function useVoiceChat(voiceConfig = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);

  const voiceSupported = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition) &&
    ('speechSynthesis' in window);

  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const selectedVoiceRef = useRef(null);

  const voiceHints = voiceConfig.voiceNameHints ? voiceConfig.voiceNameHints.join(',') : '';
  const voiceLang = voiceConfig.lang || 'en';

  // Load and select best matching voice
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      if (voices.length > 0 && voiceConfig.voiceNameHints) {
        // Try to find a matching voice from hints
        for (const hint of voiceConfig.voiceNameHints) {
          const match = voices.find(v =>
            v.name.toLowerCase().includes(hint.toLowerCase())
          );
          if (match) {
            selectedVoiceRef.current = match;
            return;
          }
        }
        // Fallback: try to match by lang
        const langMatch = voices.find(v =>
          v.lang.startsWith(voiceLang)
        );
        if (langMatch) selectedVoiceRef.current = langMatch;
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [voiceHints, voiceLang, voiceConfig.voiceNameHints]);

  // Start listening (speech-to-text)
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const recognition = new SpeechRecognition();
    recognition.lang = voiceConfig.lang || 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript || interim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript) {
        setTranscript(finalTranscript);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
    }
  }, [voiceConfig.lang]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Speak text (text-to-speech)
  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window) || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = voiceConfig.pitch || 1;
    utterance.rate = voiceConfig.rate || 1;
    utterance.volume = 1;
    utterance.lang = voiceConfig.lang || 'en-US';

    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [voiceConfig.pitch, voiceConfig.rate, voiceConfig.lang]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Toggle listen
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      window.speechSynthesis.cancel();
    };
  }, []);

  return {
    // State
    isListening,
    isSpeaking,
    transcript,
    voiceSupported,
    availableVoices,

    // Actions
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    setTranscript,
  };
}
