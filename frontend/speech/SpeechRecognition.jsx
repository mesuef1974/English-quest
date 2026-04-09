/**
 * Speech Recognition Component — English Quest
 * Uses Web Speech Recognition API to evaluate child's pronunciation
 */
import { useState, useCallback } from "react";

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);

  const startListening = useCallback((expectedWord, lang = "en-US") => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      return { supported: false };
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    return new Promise((resolve) => {
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const results = Array.from(event.results[0]);
        const best = results.reduce((a, b) => a.confidence > b.confidence ? a : b);
        setTranscript(best.transcript);
        setConfidence(best.confidence);

        const spoken = best.transcript.toLowerCase().trim();
        const expected = expectedWord.toLowerCase().trim();
        const isCorrect = spoken === expected || spoken.includes(expected);
        const score = isCorrect ? Math.round(best.confidence * 100) : 0;

        resolve({ spoken, expected, isCorrect, score, confidence: best.confidence, alternatives: results.map(r => r.transcript) });
      };
      recognition.onerror = (e) => resolve({ error: e.error, isCorrect: false, score: 0 });
      recognition.onend = () => setIsListening(false);
      recognition.start();
    });
  }, []);

  return { isListening, transcript, confidence, startListening };
}
