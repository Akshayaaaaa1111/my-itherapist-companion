import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────
type Role = "user" | "assistant" | "system";

interface Message {
  id: string;
  role: Role;
  content: string;
  emotion?: string;
  severity?: string;
  isTyping?: boolean;
  turnNumber?: number; // 1-3 for follow-up, 4 = final
}

type EmotionLabel =
  | "joy" | "sadness" | "fear" | "anger"
  | "neutral" | "surprise" | "disgust";

const EMOTION_META: Record<EmotionLabel, { emoji: string; color: string; label: string }> = {
  joy:      { emoji: "😊", color: "bg-emotion-joy",     label: "Joy" },
  sadness:  { emoji: "😔", color: "bg-emotion-sadness", label: "Sadness" },
  fear:     { emoji: "😰", color: "bg-emotion-fear",    label: "Fear" },
  anger:    { emoji: "😠", color: "bg-emotion-anger",   label: "Anger" },
  neutral:  { emoji: "😐", color: "bg-emotion-neutral", label: "Neutral" },
  surprise: { emoji: "😲", color: "bg-emotion-surprise",label: "Surprise" },
  disgust:  { emoji: "😖", color: "bg-emotion-disgust", label: "Disgust" },
};

function getEmotionMeta(emotion?: string) {
  if (!emotion) return null;
  const key = emotion.toLowerCase() as EmotionLabel;
  return EMOTION_META[key] ?? null;
}

// ── Config ────────────────────────────────────────────────────────────────
// Replace this with your deployed Python backend URL, e.g. ngrok / Railway URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

// ── Helpers ────────────────────────────────────────────────────────────────
function generateUserId(): string {
  return `user_${crypto.randomUUID()}`;
}

function getUserId(): string {
  let id = localStorage.getItem("itherapist_user_id");
  if (!id) {
    id = generateUserId();
    localStorage.setItem("itherapist_user_id", id);
  }
  return id;
}

const CRISIS_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "end my life", "don't want to live",
  "want to die", "harm myself", "self harm", "no reason to live",
];

function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

// ── Crisis Banner ──────────────────────────────────────────────────────────
function CrisisBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="animate-fade-up bg-crisis-bg border border-crisis-border rounded-xl p-4 mx-4 mb-2 flex gap-3 items-start shadow-card">
      <span className="text-2xl flex-shrink-0 mt-0.5">🆘</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-crisis-text text-sm mb-1">
          You're not alone — immediate help is available
        </p>
        <p className="text-xs text-crisis-text/80 leading-relaxed mb-2">
          If you're in crisis, please reach out to a professional immediately:
        </p>
        <ul className="text-xs text-crisis-text/90 space-y-0.5">
          <li>🇮🇳 iCall (India): <strong>9152987821</strong></li>
          <li>🌐 International: <strong>findahelpline.com</strong></li>
          <li>🇺🇸 988 Suicide & Crisis Lifeline: <strong>988</strong></li>
        </ul>
      </div>
      <button
        onClick={onDismiss}
        className="text-crisis-text/40 hover:text-crisis-text transition-colors text-lg flex-shrink-0"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

// ── Typing Indicator ───────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 0.15, 0.3].map((delay, i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-primary/40 animate-typing"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  );
}

// ── Message Bubble ──────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const emotionMeta = getEmotionMeta(msg.emotion);

  return (
    <div className={`animate-message-in flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm flex-shrink-0 mr-2.5 mt-auto mb-0.5 shadow-soft">
          <span className="font-serif text-primary-foreground text-xs italic">iT</span>
        </div>
      )}
      <div className={`max-w-[78%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        {!isUser && msg.turnNumber && msg.turnNumber <= 3 && (
          <p className="text-[10px] text-muted-foreground mb-1 ml-0.5 font-medium tracking-wide">
            Follow-up {msg.turnNumber} of 3
          </p>
        )}
        {!isUser && msg.turnNumber === 4 && (
          <p className="text-[10px] text-primary mb-1 ml-0.5 font-semibold tracking-wide">
            ✦ Personalised guidance
          </p>
        )}

        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-soft ${
            isUser
              ? "bg-chat-user-bg text-chat-user-fg rounded-br-sm"
              : "bg-chat-bot-bg text-chat-bot-fg border border-border rounded-bl-sm"
          }`}
        >
          {msg.isTyping ? <TypingDots /> : (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          )}
        </div>

        {isUser && emotionMeta && (
          <div className={`mt-1 mr-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-foreground/70 ${emotionMeta.color}/30`}>
            <span>{emotionMeta.emoji}</span>
            <span>{emotionMeta.label}</span>
            {msg.severity && <span className="opacity-60">· {msg.severity}</span>}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm flex-shrink-0 ml-2.5 mt-auto mb-0.5">
          <span className="text-primary text-xs font-semibold">You</span>
        </div>
      )}
    </div>
  );
}

// ── Turn Progress Bar ───────────────────────────────────────────────────────
function TurnProgress({ turn, isFinal }: { turn: number; isFinal: boolean }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1.5 flex-1">
        {[1, 2, 3].map((t) => (
          <div
            key={t}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              isFinal ? "bg-primary" :
              t <= turn ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
        {isFinal ? "Session complete" : `Question ${turn}/3`}
      </span>
    </div>
  );
}

// ── Main Chat Page ──────────────────────────────────────────────────────────
export default function Chat() {
  const navigate = useNavigate();
  const [userId] = useState(getUserId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turn, setTurn] = useState(0); // 0=awaiting initial, 1-3=follow-ups, 4=final
  const [showCrisis, setShowCrisis] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([]);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if returning user
  useEffect(() => {
    const stored = localStorage.getItem("itherapist_user_id");
    const isReturning = stored !== null && localStorage.getItem("itherapist_session_count") !== null;
    setIsNewUser(!isReturning);

    // Increment session count
    const count = parseInt(localStorage.getItem("itherapist_session_count") ?? "0");
    localStorage.setItem("itherapist_session_count", String(count + 1));

    // Welcome message
    const welcomeText = isReturning
      ? `Welcome back. Your ID: **${userId.slice(0, 12)}…**\n\nWhat's on your mind today?`
      : `Hello. I'm iTherapist — your private mental health companion.\n\nYour unique session ID is **${userId.slice(0, 12)}…** — it's stored securely on your device.\n\nWhenever you're ready, tell me what's on your mind.`;

    setMessages([{
      id: "welcome",
      role: "assistant",
      content: welcomeText,
    }]);
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = useCallback((msg: Omit<Message, "id">) => {
    setMessages(prev => [...prev, { ...msg, id: crypto.randomUUID() }]);
  }, []);

  const replaceTyping = useCallback((content: string, extra: Partial<Message> = {}) => {
    setMessages(prev =>
      prev.map(m => m.isTyping ? { ...m, isTyping: false, content, ...extra } : m)
    );
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Crisis detection
    if (detectCrisis(text)) {
      setShowCrisis(true);
    }

    setInput("");
    setLoading(true);

    // Add user message
    addMessage({ role: "user", content: text });

    // Add typing indicator
    const typingId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: typingId, role: "assistant", content: "", isTyping: true }]);

    // Build updated conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: text }
    ];

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          message: text,
          conversation_history: updatedHistory,
          turn: turn,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      /*
        Expected response shape from Python backend:
        {
          reply: string,
          emotion: string,
          severity: string,
          turn: number,         // 1, 2, 3, or 4 (final)
          is_final: boolean,
          function_called?: string,
        }
      */
      const nextTurn = data.turn ?? (turn + 1);
      setTurn(nextTurn);

      // Update conversation history
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant", content: data.reply }
      ]);

      // Update user message emotion tag
      setMessages(prev =>
        prev.map(m =>
          m.role === "user" && m.content === text && !m.emotion
            ? { ...m, emotion: data.emotion, severity: data.severity }
            : m
        )
      );

      // Replace typing with response
      setMessages(prev =>
        prev.map(m =>
          m.isTyping
            ? {
                ...m,
                isTyping: false,
                content: data.reply,
                emotion: data.emotion,
                severity: data.severity,
                turnNumber: nextTurn,
              }
            : m
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessages(prev => prev.filter(m => !m.isTyping));
      toast.error("Connection error", {
        description: msg.includes("fetch")
          ? "Could not reach the iTherapist backend. Make sure your Python server is running."
          : msg,
      });
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }, [input, loading, userId, sessionId, turn, conversationHistory, addMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewSession = () => {
    setMessages([]);
    setTurn(0);
    setConversationHistory([]);
    setShowCrisis(false);
    const welcomeText = `Ready for a new conversation. What would you like to talk about today?`;
    setMessages([{ id: "welcome2", role: "assistant", content: welcomeText }]);
  };

  const isFinalTurn = turn >= 4;
  const currentTurnDisplay = Math.min(turn, 3);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card px-4 py-3 flex items-center justify-between z-10 shadow-soft">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            ← Back
          </button>
          <div className="w-px h-4 bg-border" />
          <span className="font-serif text-lg text-primary">i<span className="italic">Therapist</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
            <span className="text-xs text-muted-foreground font-mono">
              {userId.slice(0, 10)}…
            </span>
          </div>
          {isFinalTurn && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewSession}
              className="rounded-full text-xs h-8 border-primary/30 text-primary hover:bg-secondary"
            >
              New session
            </Button>
          )}
        </div>
      </header>

      {/* Turn progress — shown after first exchange */}
      {turn > 0 && (
        <div className="flex-shrink-0 border-b border-border bg-card/50 px-2">
          <TurnProgress turn={currentTurnDisplay} isFinal={isFinalTurn} />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scroll px-4 py-4">
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Crisis Banner */}
      {showCrisis && <CrisisBanner onDismiss={() => setShowCrisis(false)} />}

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-border bg-card px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {isFinalTurn ? (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground mb-3">
                This session has concluded. Your guidance has been shared above.
              </p>
              <Button
                onClick={handleNewSession}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 h-9 text-sm"
              >
                Start a new session
              </Button>
            </div>
          ) : (
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    turn === 0
                      ? "Tell me what's on your mind…"
                      : "Continue sharing…"
                  }
                  rows={1}
                  className="resize-none min-h-[48px] max-h-32 rounded-2xl border-border bg-background focus:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30 text-sm leading-relaxed py-3 pr-4 transition-all"
                  style={{ overflow: "hidden auto" }}
                  onInput={e => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
                  }}
                  disabled={loading}
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="rounded-2xl h-12 w-12 p-0 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all active:scale-95 flex-shrink-0"
                aria-label="Send"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" />
                  </svg>
                )}
              </Button>
            </div>
          )}
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            Not a substitute for professional mental health care · Press <kbd className="bg-muted px-1 rounded text-[9px]">Enter</kbd> to send
          </p>
        </div>
      </div>
    </div>
  );
}
