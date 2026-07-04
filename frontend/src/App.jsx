import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const MODULES = [
  { id: "brief", icon: "◐", label: "Morning Brief", hint: "Good morning Jarvis, brief me on today" },
  { id: "plan", icon: "◳", label: "Day Planner", hint: "Help me plan my day" },
  { id: "reply", icon: "◈", label: "Reply Assistant", hint: "Help me reply to: " },
  { id: "track", icon: "◉", label: "Deadlines", hint: "What's due this week?" },
  { id: "study", icon: "◫", label: "Study Plan", hint: "Make me a DSA study plan for today" },
  { id: "budget", icon: "◎", label: "Budget", hint: "Budget check — " },
  { id: "stress", icon: "◌", label: "SOS Mode", hint: "I'm overwhelmed right now" },
];

const QUICK_PROMPTS = [
  "Brief me on today",
  "Plan my week",
  "I'm stressed",
  "What's due soon?",
];

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey Ma'am. .\n\n What do you need right now?",
      time: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMsg = { role: "user", content: messageText, time: now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, session_id: "sowjanya-main" }),
      });
      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.reply, time: now() }]);
    } catch {
      setMessages([...updated, {
        role: "assistant",
        content: "Can't reach the backend. Make sure uvicorn is running on port 8000.",
        time: now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleModule = (m) => {
    setActiveModule(m.id);
    setInput(m.hint);
    textareaRef.current?.focus();
  };

  return (
    <div style={s.root}>
      {/* Ambient background glow */}
      <div style={s.glowTop} />
      <div style={s.glowBottom} />

      {/* Sidebar */}
      <aside style={{ ...s.sidebar, width: sidebarOpen ? "220px" : "60px" }}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>⚡</div>
          {sidebarOpen && (
            <div>
              <div style={s.logoText}>JARVIS</div>
              <div style={s.logoSub}>Personal OS</div>
            </div>
          )}
          <button style={s.collapseBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "‹" : "›"}
          </button>
        </div>

        <div style={s.sidebarDivider} />

        {/* Module nav */}
        <nav style={s.nav}>
          {sidebarOpen && <div style={s.navLabel}>MODULES</div>}
          {MODULES.map((m) => (
            <button
              key={m.id}
              onClick={() => handleModule(m)}
              title={m.label}
              style={{
                ...s.navItem,
                ...(activeModule === m.id ? s.navItemActive : {}),
              }}
            >
              <span style={s.navIcon}>{m.icon}</span>
              {sidebarOpen && <span style={s.navText}>{m.label}</span>}
            </button>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* User badge */}
        {sidebarOpen && (
          <div style={s.userBadge}>
            <div style={s.userAvatar}>S</div>
            <div>
              <div style={s.userName}>Sowjanya</div>
              <div style={s.userRole}>CBIT · CSE · 2027</div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main style={s.main}>
        {/* Topbar */}
        <div style={s.topbar}>
          <div style={s.topbarLeft}>
            <div style={s.statusDot} />
            <span style={s.statusText}>Jarvis Online</span>
            <span style={s.topbarSep}>·</span>
            <span style={s.topbarContext}>Placement Season · July 2026</span>
          </div>
          <div style={s.topbarRight}>
            <span style={s.targetBadge}>🎯Cybersecurity </span>
            <span style={s.targetBadge}>🎯 DSA</span>
            <span style={s.targetBadge}>🎯 HR interview prep</span>
            <span style={s.targetBadge}>🎯 System Design</span>
            <span style={s.targetBadge}>🎯 Aptitude</span>
            <span style={s.targetBadge}>🎯 cs fundamentals</span>
            <span style={s.targetBadge}>🎯 projects</span>
            <span style={s.targetBadge}>🎯 certifications</span>
          </div>
        </div>

        {/* Chat */}
        <div style={s.chatWrap}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              ...s.msgRow,
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}>
              {msg.role === "assistant" && (
                <div style={{ ...s.avatar, ...(loading && i === messages.length - 1 ? s.avatarPulse : {}) }}>
                  J
                </div>
              )}
              <div style={{
                ...s.bubble,
                ...(msg.role === "user" ? s.bubbleUser : s.bubbleJarvis),
              }}>
                <div style={s.bubbleContent} className={msg.role === "assistant" ? "jarvis-bubble" : ""}>
  {msg.role === "assistant" 
    ? <ReactMarkdown>{msg.content}</ReactMarkdown>
    : msg.content
  }
</div>
                <div style={s.bubbleTime}>{msg.time}</div>
              </div>
              {msg.role === "user" && (
                <div style={{ ...s.avatar, ...s.avatarUser }}>S</div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ ...s.msgRow, justifyContent: "flex-start" }}>
              <div style={{ ...s.avatar, ...s.avatarPulse }}>J</div>
              <div style={{ ...s.bubble, ...s.bubbleJarvis }}>
                <div style={s.typingDots}>
                  <span style={{ ...s.dot, animationDelay: "0ms" }} />
                  <span style={{ ...s.dot, animationDelay: "150ms" }} />
                  <span style={{ ...s.dot, animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 2 && (
          <div style={s.quickWrap}>
            {QUICK_PROMPTS.map((q) => (
              <button key={q} style={s.quickBtn} onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={s.inputWrap}>
          <div style={s.inputBox}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Talk to Jarvis...  (⏎ send · ⇧⏎ new line)"
              style={s.textarea}
              rows={1}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                ...s.sendBtn,
                opacity: loading || !input.trim() ? 0.3 : 1,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              }}
            >
              <span style={s.sendArrow}>↑</span>
            </button>
          </div>
          <div style={s.inputHint}>Built with FastAPI · React · Gemini · by Sowjanya</div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500&display=swap');
        .jarvis-bubble p { margin-bottom: 8px; }
.jarvis-bubble p:last-child { margin-bottom: 0; }
.jarvis-bubble strong { color: #a5b4fc; font-weight: 600; }
.jarvis-bubble ul { padding-left: 16px; margin: 6px 0; }
.jarvis-bubble li { margin-bottom: 4px; }
.jarvis-bubble h3 { color: #c7d2fe; font-size: 13px; margin-bottom: 6px; font-weight: 600; }
.jarvis-bubble code { background: #0f1729; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050816; overflow: hidden; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e1b4b; border-radius: 2px; }
        textarea:focus { outline: none; }
        button:focus { outline: none; }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
        }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.15; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const s = {
  root: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#050816",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#e2e8f0",
    overflow: "hidden",
    position: "relative",
  },
  glowTop: {
    position: "fixed", top: "-200px", left: "30%",
    width: "600px", height: "400px",
    background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)",
    pointerEvents: "none", zIndex: 0,
  },
  glowBottom: {
    position: "fixed", bottom: "-200px", right: "10%",
    width: "500px", height: "400px",
    background: "radial-gradient(ellipse, rgba(34,211,238,0.06) 0%, transparent 70%)",
    pointerEvents: "none", zIndex: 0,
  },
  sidebar: {
    display: "flex", flexDirection: "column",
    backgroundColor: "#080c1a",
    borderRight: "1px solid #0f1729",
    padding: "20px 0",
    transition: "width 0.2s ease",
    overflow: "hidden",
    flexShrink: 0,
    position: "relative", zIndex: 1,
  },
  logoWrap: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "0 16px 0 20px", marginBottom: "4px",
  },
  logoIcon: { fontSize: "22px", flexShrink: 0 },
  logoText: {
    fontSize: "15px", fontWeight: "700",
    letterSpacing: "0.2em", color: "#fff",
  },
  logoSub: { fontSize: "9px", color: "#334155", letterSpacing: "0.1em", marginTop: "1px" },
  collapseBtn: {
    marginLeft: "auto", background: "none", border: "none",
    color: "#334155", fontSize: "18px", cursor: "pointer",
    padding: "2px 4px", flexShrink: 0,
  },
  sidebarDivider: {
    height: "1px", backgroundColor: "#0f1729", margin: "16px 0",
  },
  nav: { display: "flex", flexDirection: "column", gap: "2px", padding: "0 10px" },
  navLabel: {
    fontSize: "9px", color: "#1e293b", letterSpacing: "0.15em",
    padding: "0 10px", marginBottom: "6px", fontWeight: "600",
  },
  navItem: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "9px 10px", borderRadius: "8px",
    background: "none", border: "none",
    color: "#475569", fontSize: "13px",
    cursor: "pointer", textAlign: "left",
    transition: "all 0.15s", whiteSpace: "nowrap",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  navItemActive: {
    backgroundColor: "#0f1729",
    color: "#a5b4fc",
  },
  navIcon: { fontSize: "15px", flexShrink: 0, width: "20px", textAlign: "center" },
  navText: { fontSize: "13px" },
  userBadge: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "12px 20px",
    borderTop: "1px solid #0f1729",
    margin: "0",
  },
  userAvatar: {
    width: "30px", height: "30px", borderRadius: "50%",
    backgroundColor: "#1e1b4b", border: "1px solid #4f46e5",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "12px", fontWeight: "700", color: "#a5b4fc", flexShrink: 0,
  },
  userName: { fontSize: "12px", fontWeight: "600", color: "#cbd5e1" },
  userRole: { fontSize: "10px", color: "#334155", marginTop: "1px" },
  main: {
    flex: 1, display: "flex", flexDirection: "column",
    overflow: "hidden", position: "relative", zIndex: 1,
  },
  topbar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 24px",
    borderBottom: "1px solid #0f1729",
    backgroundColor: "#060a18",
  },
  topbarLeft: { display: "flex", alignItems: "center", gap: "8px" },
  statusDot: {
    width: "7px", height: "7px", borderRadius: "50%",
    backgroundColor: "#4ade80",
    boxShadow: "0 0 6px #4ade80",
  },
  statusText: { fontSize: "12px", color: "#4ade80", fontWeight: "500" },
  topbarSep: { color: "#1e293b", fontSize: "12px" },
  topbarContext: { fontSize: "12px", color: "#334155" },
  topbarRight: { display: "flex", gap: "8px" },
  targetBadge: {
    fontSize: "11px", padding: "3px 10px",
    backgroundColor: "#0f1729", border: "1px solid #1e1b4b",
    borderRadius: "20px", color: "#6366f1",
  },
  chatWrap: {
    flex: 1, overflowY: "auto",
    padding: "28px 28px 16px",
    display: "flex", flexDirection: "column", gap: "20px",
  },
  msgRow: {
    display: "flex", alignItems: "flex-end", gap: "10px",
    animation: "fadeIn 0.2s ease",
  },
  avatar: {
    width: "32px", height: "32px", borderRadius: "50%",
    backgroundColor: "#0f1729", border: "1px solid #4f46e5",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "12px", fontWeight: "700", color: "#a5b4fc",
    flexShrink: 0,
  },
  avatarPulse: {
    animation: "pulse 1.5s ease infinite",
    borderColor: "#6366f1",
  },
  avatarUser: {
    backgroundColor: "#1a1a3e", border: "1px solid #22d3ee", color: "#67e8f9",
  },
  bubble: {
    maxWidth: "68%", padding: "12px 16px", borderRadius: "16px",
    fontSize: "14px", lineHeight: "1.65",
    fontFamily: "'Inter', sans-serif",
  },
  bubbleJarvis: {
    backgroundColor: "#080c1a",
    border: "1px solid #0f1729",
    color: "#cbd5e1",
    borderBottomLeftRadius: "4px",
  },
  bubbleUser: {
    backgroundColor: "#0f1235",
    border: "1px solid #1e1b4b",
    color: "#c7d2fe",
    borderBottomRightRadius: "4px",
  },
  bubbleContent: { whiteSpace: "pre-wrap" },
  bubbleTime: {
    fontSize: "10px", color: "#1e293b",
    marginTop: "6px", textAlign: "right",
  },
  typingDots: { display: "flex", gap: "5px", padding: "2px 0", alignItems: "center" },
  dot: {
    width: "7px", height: "7px", borderRadius: "50%",
    backgroundColor: "#4f46e5", display: "inline-block",
    animation: "blink 1.2s ease infinite",
  },
  quickWrap: {
    display: "flex", gap: "8px", flexWrap: "wrap",
    padding: "0 28px 12px",
  },
  quickBtn: {
    padding: "7px 14px", borderRadius: "20px",
    border: "1px solid #0f1729",
    backgroundColor: "#080c1a", color: "#475569",
    fontSize: "12px", cursor: "pointer",
    fontFamily: "'Space Grotesk', sans-serif",
    transition: "all 0.15s",
  },
  inputWrap: {
    padding: "12px 24px 20px",
    borderTop: "1px solid #0a0f1e",
  },
  inputBox: {
    display: "flex", gap: "10px", alignItems: "flex-end",
    backgroundColor: "#080c1a",
    border: "1px solid #0f1729",
    borderRadius: "14px",
    padding: "10px 10px 10px 16px",
  },
  textarea: {
    flex: 1, background: "none", border: "none",
    color: "#e2e8f0", fontSize: "14px",
    resize: "none", fontFamily: "'Inter', sans-serif",
    lineHeight: "1.5", maxHeight: "120px",
    overflowY: "auto",
  },
  sendBtn: {
    width: "36px", height: "36px", borderRadius: "10px",
    backgroundColor: "#4f46e5", border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "opacity 0.15s",
  },
  sendArrow: { color: "white", fontSize: "18px", fontWeight: "300" },
  inputHint: {
    fontSize: "10px", color: "#1e293b",
    textAlign: "center", marginTop: "8px", letterSpacing: "0.05em",
  },
};
