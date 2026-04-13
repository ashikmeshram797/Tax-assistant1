 import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { FaBars, FaPlus } from "react-icons/fa";
import api from '../../services/api';

export default function ChatWindow() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [typing, setTyping] = useState(false);
  const [language, setLanguage] = useState("en-IN");
  const [isMuted, setIsMuted] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // ✅ Voice Logic
  const speak = (text: string, currentLang: string) => {
    if (isMuted) return;
    window.speechSynthesis.cancel();
    const synth = window.speechSynthesis;
    const cleanText = text.replace(/[*#_]/g, ""); 
    const utterance = new SpeechSynthesisUtterance(cleanText);
    let voices = synth.getVoices();

    if (currentLang === "mr-IN") {
      let marathiVoice = voices.find(v => v.name.includes("Marathi") || v.name.includes("Neel") || v.name.includes("Hemant"));
      if (marathiVoice) {
        utterance.voice = marathiVoice;
        utterance.lang = "mr-IN";
      } else {
        let hindiVoice = voices.find(v => v.name.includes("Hindi") || v.name.includes("Kalpana") || v.name.includes("Hemant"));
        if (hindiVoice) { utterance.voice = hindiVoice; utterance.lang = "hi-IN"; }
      }
    } else {
      let englishVoice = voices.find(v => v.name.includes("Aria") || v.name.includes("English") || v.name.includes("Female"));
      if (englishVoice) { utterance.voice = englishVoice; utterance.lang = "en-US"; }
    }
    utterance.rate = 0.9;
    setTimeout(() => { synth.speak(utterance); }, 150);
  };

  // ✅ Start New Chat
  const startNewChat = () => {
    setChat([]);
    setCurrentSessionId(null);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // ✅ Fetch Sessions
  const fetchSessions = async () => {
    try {
      const response = await api.get("/get-chat-sessions");
      const data = response.data;
      setSessions(data);
    } catch (err) {
      console.error("Sessions लोड झाले नाहीत.");
    }
  };

  // ✅ Load History
  const loadChatFromHistory = async (sessionId: string) => {
    try {
      const response = await api.get(`/get-chat-history?sessionId=${sessionId}`);
      const data = response.data;
      setChat(data);
      setCurrentSessionId(sessionId);
      if (window.innerWidth < 768) setSidebarOpen(false);
    } catch (err) {
      console.error("History लोड होऊ शकली नाही.");
    }
  };

  // ✅ Typewriter Effect
  const typeText = (text: string) => {
    let index = 0;
    let currentText = "";
    const interval = setInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        setChat((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { sender: "bot", text: currentText };
          return updated;
        });
        index++;
      } else {
        clearInterval(interval);
        setTyping(false);
        speak(text, language);
        fetchSessions();
      }
    }, 25);
  };

  // ✅ Send Message
  const sendMessage = async () => {
    if (!message) return;

    const sessionId = currentSessionId || `session_${Date.now()}`;
    if (!currentSessionId) setCurrentSessionId(sessionId);

    const userMessage = { sender: "user", text: message };
    setChat((prev) => [...prev, userMessage]);
    setMessage("");
    setTyping(true);

    try {
      const response = await api.post("/chat", {
        message: userMessage.text,
        source: "chat",
        sessionId: sessionId
      });
      const data = response.data;
      setChat((prev) => [...prev, { sender: "bot", text: "" }]);
      typeText(data.reply);
    } catch (error) {
      setChat((prev) => [...prev, { sender: "bot", text: "Server error." }]);
      setTyping(false);
    }
  };

  // ✅ Voice Input
  const handleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.onresult = (event: any) => { setMessage(event.results[0][0].transcript); };
    recognition.start();
  };

  useEffect(() => {
    fetchSessions();
    window.speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#eef2f7" }}>
      
      {/* 🟢 Sidebar */}
      <div style={{
        width: isSidebarOpen ? "260px" : "0px", transition: "0.3s", overflow: "hidden",
        background: "#111827", color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0
      }}>
        <div style={{ padding: "15px" }}>
          <button onClick={startNewChat} style={{
            width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #333",
            background: "#1f2937", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
          }}>
            <FaPlus /> New Chat
          </button>
        </div>
        <div style={{ padding: "10px", flex: 1, overflowY: "auto" }}>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "10px" }}>Recent History</p>
          {sessions.map((s, idx) => (
            <div key={idx} onClick={() => loadChatFromHistory(s.id || s.session_id)} 
              style={{
                padding: "10px", borderRadius: "6px", marginBottom: "8px", fontSize: "13px", cursor: "pointer",
                background: currentSessionId === (s.id || s.session_id) ? "#374151" : "#1f2937",
                border: currentSessionId === (s.id || s.session_id) ? "1px solid #10b981" : "none",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
              }}>
              {s.title || "Untitled Chat"}
            </div>
          ))}
        </div>
      </div>

      {/* 🔵 Main Chat */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "10px" }}>
        <div style={{
          width: "100%", maxWidth: "900px", height: "95vh", background: "#fff",
          borderRadius: "12px", display: "flex", flexDirection: "column", boxShadow: "0 5px 20px rgba(0,0,0,0.1)"
        }}>
          <div style={{ padding: "15px 20px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: "15px" }}>
            <FaBars style={{ cursor: "pointer", fontSize: "20px" }} onClick={() => setSidebarOpen(!isSidebarOpen)} />
            <h3 style={{ margin: 0 }}>Government Tax AI Assistant</h3>
          </div>

          <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            {chat.length === 0 ? (
              <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", color: "#999" }}>
                नवीन चॅट सुरू करा...
              </div>
            ) : (
              chat.map((c, index) => <MessageBubble key={index} sender={c.sender} text={c.text} />)
            )}
            {typing && <TypingIndicator />}
            <div ref={chatEndRef}></div>
          </div>

          <div style={{ padding: "15px", borderTop: "1px solid #eee", background: "#fafafa" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", background: "#fff", padding: "10px", borderRadius: "10px", border: "1px solid #ddd" }}>
              <button onClick={() => setIsMuted(!isMuted)} style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}>
                {isMuted ? "🔇" : "🔊"}
              </button>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ border: "none", background: "none", outline: "none" }}>
                <option value="mr-IN">मराठी</option>
                <option value="hi-IN">हिंदी</option>
                <option value="en-IN">English</option>
              </select>
              <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="विचारा..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                style={{ flex: 1, padding: "10px", border: "none", outline: "none" }} />
              <button onClick={handleVoice} style={{ border: "none", background: "none", cursor: "pointer", fontSize: "18px" }}>🎙️</button>
              <button onClick={sendMessage} style={{ padding: "8px 15px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}