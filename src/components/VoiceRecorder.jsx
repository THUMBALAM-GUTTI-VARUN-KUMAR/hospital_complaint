import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const VoiceRecorder = ({ onTranscriptChange, currentText, selectedLang }) => {
  const { t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const [permissionError, setPermissionError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      // Use kn-IN for Kannada, en-IN for Indian English
      recognition.lang = selectedLang === 'kn' ? 'kn-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setPermissionError(null);
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        setInterimText(interim);

        if (final) {
          const updated = currentText ? `${currentText.trim()} ${final.trim()}` : final.trim();
          onTranscriptChange(updated);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setPermissionError('Microphone permission was denied. Please allow microphone access in your browser bar.');
        } else if (event.error === 'no-speech') {
          // Normal timeout if user was silent
        } else {
          setPermissionError(`Voice input error (${event.error}). You can continue by typing.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Error initializing speech recognition:', e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [selectedLang, currentText, onTranscriptChange]);

  const toggleListening = () => {
    if (!isSupported) return;

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      setPermissionError(null);
      try {
        // Update language dynamically before starting
        if (recognitionRef.current) {
          recognitionRef.current.lang = selectedLang === 'kn' ? 'kn-IN' : 'en-IN';
          recognitionRef.current.start();
        }
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl flex items-start space-x-3 text-xs text-[#5b616e]">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#0a0b0d]">
            {selectedLang === 'kn' ? 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ' : 'Voice Input Notice'}
          </span>
          <p className="mt-0.5 text-[11px] leading-relaxed">
            {t('regMicUnsupported')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Microphone trigger box */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isListening 
          ? 'bg-blue-50/60 border-[#0052ff] ring-2 ring-blue-100' 
          : 'bg-[#f7f7f7] border-[#dee1e6] hover:border-[#a8b8cc]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={toggleListening}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xs ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-[#0052ff] hover:bg-[#003ecc] text-white'
              }`}
              title={isListening ? t('regMicStop') : t('regMicStart')}
              aria-label={isListening ? t('regMicStop') : t('regMicStart')}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-[#0a0b0d]">
                  {isListening ? t('regMicListening') : t('regMicStart')}
                </span>
                <span className="badge-pill bg-white text-[#0052ff] border border-[#dee1e6] text-[10px]">
                  {selectedLang === 'kn' ? 'ಕನ್ನಡ (kn-IN)' : 'English (en-IN)'}
                </span>
              </div>
              <p className="text-xs text-[#7c828a] mt-0.5">
                {isListening 
                  ? (selectedLang === 'kn' ? 'ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ, ಮುಗಿದ ನಂತರ ನಿಲ್ಲಿಸಿ' : 'Speak clearly into your microphone')
                  : t('regMicInstruction')
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-center">
            {isListening && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600 mr-2"></span>
                Recording
              </span>
            )}
            <button
              type="button"
              onClick={toggleListening}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                isListening
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-white border border-[#dee1e6] text-[#0a0b0d] hover:bg-[#eef0f3]'
              }`}
            >
              {isListening ? t('regMicStop') : (selectedLang === 'kn' ? 'ಧ್ವನಿ ಪ್ರಾರಂಭಿಸಿ' : 'Start Mic')}
            </button>
          </div>
        </div>

        {/* Real-time interim preview */}
        {interimText && (
          <div className="mt-3 pt-3 border-t border-blue-200/60 text-xs italic text-[#0052ff] flex items-center space-x-2">
            <Volume2 className="w-4 h-4 animate-bounce shrink-0" />
            <span>"{interimText}"</span>
          </div>
        )}
      </div>

      {/* Permission or error alert */}
      {permissionError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{permissionError}</span>
          </div>
        </div>
      )}
    </div>
  );
};

