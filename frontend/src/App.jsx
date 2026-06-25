import { useState, useRef, useEffect } from "react";

// ── Unique ID Generator ──────────────────────────────────────────────────────
function genId() { 
  return Date.now() + Math.random(); 
}

// ── Default Course Templates ─────────────────────────────────────────────────
const defaultCourse = {
  id: "photosynthesis-default",
  title: "La photosynthèse",
  description: "Commencer à écrire ou parlez au micro...",
  descColor: "#2563eb",
  pointsCles: [
    "Les plantes absorbent la lumière",
    "Elles utilisent le CO₂ et l'eau",
    "Elles produisent du sucre",
    "L'oxygène est rejeté dans l'air"
  ],
  question: "Pourquoi la lumière est-elle essentielle à la photosynthèse ?",
  aiSummary: "La photosynthèse est le processus par lequel les plantes utilisent la lumière, le CO₂ et l'eau pour produire du sucre et libérer de l'oxygène.",
  cards: []
};

const swotCourse = {
  id: "swot-default",
  title: "Analyse SWOT",
  description: "L'analyse SWOT est un outil stratégique qui permet d'évaluer les forces et les faiblesses d'une organisation, ainsi que les opportunités et les menaces de son environnement.",
  descColor: "#16a34a",
  pointsCles: [
    "Outil d'aide à la décision",
    "Analyse interne et externe",
    "Vision claire de la stratégie",
    "Anticipation des risques et opportunités"
  ],
  aiSummary: "L'analyse SWOT structure les forces, faiblesses, opportunités et menaces pour orienter les décisions d'entreprise.",
  cards: [
    {
      id: "swot-force-card",
      type: "notes_cours",
      title: "Force :",
      content: "Les forces sont les atouts internes qui donnent à l'organisation un avantage concurrentiel.",
      x: 100,
      y: 350,
      isPinned: true,
      color: "#16a34a"
    },
    {
      id: "swot-faiblesse-card",
      type: "notes_cours",
      title: "Faiblesse :",
      content: "Les faiblesses sont les points internes à améliorer. Elles peuvent limiter la performance.",
      x: 100,
      y: 535,
      isPinned: true,
      color: "#ea580c"
    }
  ]
};

const pestelCourse = {
  id: "pestel-default",
  title: "Analyse PESTEL",
  description: "L'analyse PESTEL permet de surveiller les facteurs environnementaux macro-économiques (Politique, Économique, Social, Technologique, Écologique, Légal) qui ont un impact sur une entreprise.",
  descColor: "#2563eb",
  pointsCles: [
    "Analyse macro-environnementale",
    "6 dimensions clés d'analyse",
    "Anticipation des grandes tendances"
  ],
  aiSummary: "Le modèle PESTEL classe les influences externes en 6 catégories majeures pour aider à anticiper les évolutions du marché.",
  cards: []
};

// ── Profile Local Storage Helpers ────────────────────────────────────────────
function getProfiles() {
  try {
    const data = localStorage.getItem("ideagrid_profiles");
    if (!data) {
      // Default mock profiles from the screenshot
      const defaultProfiles = [
        { id: "profile-1", firstName: "Aghiles", lastName: "ALKAMA", email: "alkama.aghiles@example.com", color: "#22c55e", lastActive: "Aujourd'hui à 10:15" },
        { id: "profile-2", firstName: "Amina", lastName: "SMADI", email: "smadi.amina@example.com", color: "#ea580c", lastActive: "Hier à 16:40" },
        { id: "profile-3", firstName: "samir", lastName: "ARHAB", email: "arhab.samir@example.com", color: "#3b82f6", lastActive: "Hier à 14:22" },
        { id: "profile-4", firstName: "abdnour", lastName: "KHAMES", email: "khames.abdnour@example.com", color: "#a855f7", lastActive: "07/05/2024 à 09:30" }
      ];
      localStorage.setItem("ideagrid_profiles", JSON.stringify(defaultProfiles));
      return defaultProfiles;
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveProfiles(profiles) {
  localStorage.setItem("ideagrid_profiles", JSON.stringify(profiles));
}

function getCours(profileId) {
  try {
    const key = `ideagrid_cours_${profileId || "guest"}`;
    const data = localStorage.getItem(key);
    if (!data) {
      // Seed with appropriate profile courses
      if (profileId === "profile-1" || profileId === "guest") {
        return [defaultCourse];
      } else if (profileId === "profile-2") {
        return [swotCourse];
      } else if (profileId === "profile-3") {
        return [pestelCourse];
      }
      return [defaultCourse];
    }
    // Clean photosynthesis-default if still populated with old template description
    let list = JSON.parse(data);
    list = list.map(c => {
      if (c.id === "photosynthesis-default" && !c.description.includes("Commencer à écrire")) {
        return defaultCourse;
      }
      return c;
    });
    return list;
  } catch {
    return [];
  }
}

function saveCours(profileId, arr) {
  const key = `ideagrid_cours_${profileId || "guest"}`;
  localStorage.setItem(key, JSON.stringify(arr));
}

// ── Base64 UTF-8 URL Sharing Encrypters ──────────────────────────────────────
function encodeCourse(course) {
  try {
    const json = JSON.stringify(course);
    return btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  } catch (e) {
    console.error("Failed to encode course data", e);
    return "";
  }
}

function decodeCourse(base64Str) {
  try {
    const decodedJson = decodeURIComponent(Array.prototype.map.call(atob(base64Str), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(decodedJson);
  } catch (e) {
    console.error("Failed to decode course data", e);
    return null;
  }
}

// ── Icons SVG ─────────────────────────────────────────────────────────────────
const Icons = {
  Ecrire: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  Selectionner: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>,
  Effacer: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Assistant: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 15h.01M16 15h.01"/></svg>,
  Historique: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Nouvelle: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  Partager: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Accueil: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Parametres: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, onTab }) {
  const navTop = [
    { id: "ecrire",       icon: <Icons.Ecrire />,       label: "Écrire" },
    { id: "selectionner", icon: <Icons.Selectionner />, label: "Sélectionner" },
    { id: "effacer",      icon: <Icons.Effacer />,      label: "Effacer" },
    { id: "assistant",    icon: <Icons.Assistant />,    label: "Assistant IA" },
    { id: "historique",   icon: <Icons.Historique />,   label: "Historique" },
    { id: "nouvelle",     icon: <Icons.Nouvelle />,     label: "Nouvelle page" },
    { id: "partager",     icon: <Icons.Partager />,     label: "Partager" },
  ];
  const navBot = [
    { id: "accueil",     icon: <Icons.Accueil />,      label: "Accueil" },
    { id: "parametres",  icon: <Icons.Parametres />,   label: "Paramètres" },
  ];

  const btn = (n) => {
    const isAi = n.id === "assistant";
    const isActive = activeTab === n.id;
    return (
      <button key={n.id} onClick={() => onTab(n.id)} style={{
        display: "flex", alignItems: "center", gap: 14, padding: "12px 22px",
        background: isActive ? "#1e293b" : "transparent",
        border: "none", color: isActive || isAi ? "#fff" : "#94a3b8",
        fontSize: 14, fontWeight: isActive ? 600 : 500,
        cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.15s"
      }}>
        <span style={{ 
          display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 8,
          background: isAi ? "#3b82f6" : "transparent", color: isAi ? "white" : "inherit"
        }}>{n.icon}</span>
        {n.label}
      </button>
    );
  };

  return (
    <aside style={{ width: 220, minWidth: 220, background: "#0f172a", display: "flex", flexDirection: "column", padding: "20px 0", gap: 4, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 22px 24px", color: "white", fontWeight: 700, fontSize: 18, letterSpacing: "0.5px" }}>
        <span style={{ background: "#3b82f6", borderRadius: 6, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: "bold" }}>▢▢</span>
        IdeaGrid
      </div>
      {navTop.map(btn)}
      <div style={{ flex: 1 }} />
      {navBot.map(btn)}
    </aside>
  );
}

// ── Assistant Panel ───────────────────────────────────────────────────────────
function AssistantPanel({ onClose, aiSummary, onSuggestAction, onSendMessage }) {
  const [chatInput, setChatInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput("");
  };

  return (
    <div style={{ width: 340, minWidth: 340, background: "white", borderLeft: "1px solid #e2e8f0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ background: "#eff6ff", color: "#3b82f6", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}><Icons.Assistant /></span>
          <span style={{ fontWeight: 600, fontSize: 15, color: "#0f172a" }}>Assistant IA</span>
        </div>
        <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Résumé */}
        <div>
          <p style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", marginBottom: 8 }}>Résumé du contenu</p>
          <div style={{ background: "#eff6ff", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>
            {aiSummary}
          </div>
        </div>

        {/* Schéma généré */}
        <div>
          <p style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", marginBottom: 8 }}>Schéma généré par l'IA</p>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px", display: "flex", flexDirection: "column", gap: 12, fontSize: 12, color: "#1e293b" }}>
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 24 }}>☀️</span>
                <div style={{ fontSize: 10, color: "#64748b" }}>Lumière</div>
              </div>
              <div style={{ fontSize: 20 }}>🌱</div>
              <div style={{ fontSize: 11 }}>
                <div>O₂ ➔</div>
                <div style={{ marginTop: 8 }}>Sucre ➔</div>
              </div>
            </div>
            <div style={{ fontSize: 11, borderTop: "1px dashed #e2e8f0", paddingTop: 8, color: "#64748b" }}>
              CO₂ ➔ <br /> H₂O ➔
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <p style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", marginBottom: 10 }}>Suggestions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Résumer le contenu", icon: "📋", action: "summary" },
              { label: "Générer un schéma", icon: "🧬", action: "schema" },
              { label: "Donner des exemples", icon: "💡", action: "examples" }
            ].map((s, idx) => (
              <button 
                key={idx} 
                onClick={() => onSuggestAction(s.action)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                  background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8,
                  fontSize: 13, color: "#334155", cursor: "pointer", textAlign: "left", fontWeight: 500
                }}
              >
                <span style={{ color: "#3b82f6" }}>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ padding: "16px", borderTop: "1px solid #e2e8f0", display: "flex", gap: 8, background: "#fff" }}>
        <input 
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Posez votre question…" 
          style={{ flex: 1, padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#0f172a", background: "#f8fafc", outline: "none" }} 
        />
        <button type="submit" style={{ background: "#2563eb", border: "none", borderRadius: 8, color: "white", width: 38, height: 38, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>➔</button>
      </form>
    </div>
  );
}

// ── Main Board Canvas ─────────────────────────────────────────────────────────
function Whiteboard({ 
  course, 
  activeTab, 
  zoom, 
  setZoom, 
  isRecording, 
  speechText, 
  toggleRecording,
  onAddNotesCard,
  onAddQuestionCard,
  selectedColor,
  onPenColorSelect,
  onUpdateTitle,
  onUpdateDesc,
  onUpdatePoint,
  onDeletePoint,
  onAddPoint,
  onUpdateCardContent,
  onDeleteCard,
  onPointerDown,
  draggingCard,
  onSave,
  onShare
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [editingPtIndex, setEditingPtIndex] = useState(null);
  const [editingCardId, setEditingCardId] = useState(null);
  const [showToolbar, setShowToolbar] = useState(true);
  const [tempDesc, setTempDesc] = useState("");

  // Helper to get formatted local time
  const [localTime, setLocalTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const renderPin = (color) => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      style={{ 
        position: "absolute", top: -10, right: 15, zIndex: 100, 
        transform: "rotate(45deg)", color: color || "#ef4444" 
      }}
    >
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z" />
    </svg>
  );

  // Live text calculation that incorporates interim speech recognition in real-time
  const displayDescription = course.description === "Commencer à écrire ou parlez au micro..."
    ? (speechText ? speechText : "Commencer à écrire ou parlez au micro...")
    : course.description + (speechText ? " " + speechText : "");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f8fafc", overflow: "hidden", position: "relative" }}>
      {/* Top Banner */}
      <div style={{ background: "#0f172a", color: "#94a3b8", padding: "8px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
        <div>Cours : {course.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span>{localTime}</span>
          <span>📶 🔋</span>
        </div>
      </div>

      {/* Floating active speech transcript indicator */}
      {isRecording && (
        <div style={{
          position: "absolute", bottom: 130, left: "50%", transform: "translateX(-50%)",
          background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(4px)",
          color: "white", padding: "12px 24px", borderRadius: 30, fontSize: 14,
          display: "flex", alignItems: "center", gap: 12, zIndex: 1000,
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)",
          maxWidth: "80%", width: "max-content", animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#ef4444", animation: "pulse-anim 0.8s infinite" }}></span>
          <span style={{ fontWeight: 600, color: "#3b82f6" }}>Micro Prof actif :</span>
          <span style={{ fontStyle: speechText ? "normal" : "italic", color: speechText ? "white" : "#94a3b8" }}>
            {speechText || "Parlez maintenant..."}
          </span>
        </div>
      )}

      {/* Whiteboard Content Area */}
      <div 
        id="whiteboard-canvas-area"
        style={{ flex: 1, overflow: "auto", padding: "40px", display: "flex", justifyContent: "center", alignItems: "flex-start" }}
      >
        <div style={{
          width: "100%", maxWidth: 900, background: "white", borderRadius: 16, boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
          padding: "50px", minHeight: "850px", position: "relative", transform: `scale(${zoom / 100})`, transformOrigin: "top center", transition: "transform 0.15s ease"
        }}>
          
          {/* Top Right Header Circular Control Buttons (mic, save, share) */}
          <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 10, zIndex: 100 }}>
            <button 
              onClick={toggleRecording} 
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36,
                borderRadius: "50%", background: isRecording ? "#ef4444" : "#f1f5f9",
                border: "none", cursor: "pointer", fontSize: 16, color: isRecording ? "white" : "#475569",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)", transition: "all 0.2s"
              }}
              title="Activer/Couper Micro"
            >
              🎙️
            </button>
            <button 
              onClick={onSave} 
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36,
                borderRadius: "50%", background: "#f1f5f9", border: "none", cursor: "pointer",
                fontSize: 16, color: "#475569", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#e2e8f0"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#f1f5f9"}
              title="Enregistrer dans l'historique"
            >
              💾
            </button>
            <button 
              onClick={onShare} 
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36,
                borderRadius: "50%", background: "#f1f5f9", border: "none", cursor: "pointer",
                fontSize: 16, color: "#475569", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#e2e8f0"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#f1f5f9"}
              title="Partager le cours"
            >
              📥
            </button>
          </div>

          {/* Main Title */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            {editingTitle ? (
              <input
                value={course.title}
                onChange={(e) => onUpdateTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => { if (e.key === "Enter") setEditingTitle(false); }}
                autoFocus
                style={{
                  color: "#15803d", fontFamily: "cursive, sans-serif", fontSize: 32,
                  textAlign: "center", border: "none", borderBottom: "2px solid #15803d",
                  outline: "none", width: "80%", background: "transparent"
                }}
              />
            ) : (
              <h1 
                onClick={() => setEditingTitle(true)}
                title="Cliquez pour renommer"
                style={{ 
                  color: "#15803d", fontFamily: "cursive, sans-serif", fontSize: 32, 
                  fontWeight: "normal", margin: 0, display: "inline-block", 
                  borderBottom: "2px solid #15803d", paddingBottom: 6, cursor: "pointer" 
                }}
              >
                {course.title}
              </h1>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "40px", pointerEvents: activeTab === "selectionner" ? "none" : "auto" }}>
            
            {/* Left Column: Visual Diagram Concept */}
            <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
              {/* Description */}
              <div style={{ position: "relative" }}>
                {editingDesc ? (
                  <textarea
                    value={tempDesc}
                    onChange={(e) => setTempDesc(e.target.value)}
                    onBlur={() => {
                      setEditingDesc(false);
                      const finalVal = tempDesc.trim() || "Commencer à écrire ou parlez au micro...";
                      onUpdateDesc(finalVal);
                      onPenColorSelect(selectedColor);
                    }}
                    autoFocus
                    style={{
                      width: "100%", height: 80, fontFamily: "cursive, sans-serif", fontSize: 16,
                      lineHeight: 1.6, padding: 8, border: "1px solid #cbd5e1", borderRadius: 8, outline: "none",
                      background: "#fafafa", color: selectedColor
                    }}
                  />
                ) : (
                  <p 
                    onClick={() => {
                      setEditingDesc(true);
                      setTempDesc(course.description === "Commencer à écrire ou parlez au micro..." ? "" : course.description);
                    }}
                    title="Cliquez pour éditer la description"
                    style={{ 
                      color: course.descColor || selectedColor || "#1e293b", 
                      fontFamily: "cursive, sans-serif", 
                      fontSize: 16, 
                      lineHeight: 1.6, 
                      margin: 0, 
                      cursor: "pointer" 
                    }}
                  >
                    {displayDescription}
                  </p>
                )}
              </div>

              {/* Hand-drawn style Plant Box Concept */}
              <div style={{ position: "relative", marginTop: 20, padding: 20, height: 320, border: "1px dashed #cbd5e1", borderRadius: 12 }}>
                {/* Sun */}
                <div style={{ position: "absolute", top: 10, left: 10, textAlign: "center" }}>
                  <span style={{ fontSize: 44 }}>☀️</span>
                  <div style={{ color: "#eab308", fontSize: 12, fontFamily: "cursive" }}>Lumière</div>
                </div>

                {/* CO2 */}
                <div style={{ position: "absolute", bottom: 120, left: 10, fontSize: 13, fontFamily: "cursive" }}>
                  CO₂ <br /> <span style={{ fontSize: 11, color: "#64748b" }}>(Dioxyde de carbone)</span> ➔
                </div>

                {/* Water */}
                <div style={{ position: "absolute", bottom: 20, left: 20, fontSize: 13, fontFamily: "cursive", color: "#2563eb" }}>
                  Eau (H₂O) ➔
                </div>

                {/* Central Plant Representation */}
                <div style={{ textAlign: "center", marginTop: 60 }}>
                  <span style={{ fontSize: 90 }}>🌱</span>
                </div>

                {/* Oxygen output */}
                <div style={{ position: "absolute", top: 40, right: 20, fontSize: 13, fontFamily: "cursive", color: "#2563eb" }}>
                  ➔ O₂ <br /> <span style={{ fontSize: 11, color: "#64748b" }}>(Oxygène)</span>
                </div>

                {/* Sugar output */}
                <div style={{ position: "absolute", bottom: 80, right: 20, fontSize: 13, fontFamily: "cursive", color: "#6d28d9" }}>
                  🪟 Sucre <br /> <span style={{ fontSize: 11, color: "#64748b" }}>(Glucose)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Key Points */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Key Points */}
              <div>
                <h3 style={{ color: "#2563eb", fontFamily: "cursive, sans-serif", fontSize: 20, fontWeight: "normal", marginBottom: 12, borderBottom: "1px solid #e2e8f0", paddingBottom: 4 }}>Points clés</h3>
                <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 14, fontFamily: "sans-serif", color: "#334155" }}>
                  {course.pointsCles.map((pt, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>•</span>
                      {editingPtIndex === idx ? (
                        <input
                          value={pt}
                          onChange={(e) => onUpdatePoint(idx, e.target.value)}
                          onBlur={() => setEditingPtIndex(null)}
                          onKeyDown={(e) => { if (e.key === "Enter") setEditingPtIndex(null); }}
                          autoFocus
                          style={{ border: "1px solid #cbd5e1", borderRadius: 4, padding: "2px 6px", fontSize: 13, width: "100%", outline: "none" }}
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingPtIndex(idx)}
                          style={{ cursor: "pointer", flex: 1 }}
                          title="Modifier"
                        >
                          {pt}
                        </span>
                      )}
                      
                      {activeTab === "effacer" ? (
                        <button 
                          onClick={() => onDeletePoint(idx)}
                          style={{ background: "none", border: "none", color: "#ef4444", fontSize: 14, cursor: "pointer", padding: "0 4px" }}
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      ) : (
                        <span 
                          onClick={() => setEditingPtIndex(idx)}
                          style={{ fontSize: 11, color: "#94a3b8", cursor: "pointer", opacity: 0 }}
                          className="edit-hint"
                        >
                          ✏️
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={onAddPoint}
                  style={{
                    marginTop: 12, background: "none", border: "1px dashed #3b82f6", color: "#3b82f6",
                    borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontWeight: 500,
                    transition: "all 0.2s"
                  }}
                >
                  + Ajouter un point clé
                </button>
              </div>
            </div>
          </div>

          {/* Draggable & Dynamic Post-its/Cards Layer */}
          {course.cards && course.cards.map(card => {
            const isDragging = draggingCard?.id === card.id;
            const isNote = card.type === "notes_cours" || card.type === "speech_note";
            const isQuestion = card.type === "question";
            
            // Choose card style based on type
            const cardBg = isQuestion ? "#f5f3ff" : (card.type === "speech_note" ? (card.color || "#fef08a") : "#f8fafc");
            const cardBorder = isQuestion ? "1px solid #ddd6fe" : "1px solid #e2e8f0";
            const titleColor = card.color || (isQuestion ? "#7c3aed" : (card.type === "speech_note" ? "#854d0e" : "#2563eb"));
            const textColor = isQuestion ? "#5b21b6" : (card.type === "speech_note" ? "#713f12" : "#334155");
            const borderDash = isNote ? "1px dashed #e2e8f0" : "1px dashed #ddd6fe";

            return (
              <div
                key={card.id}
                onPointerDown={(e) => onPointerDown(e, card)}
                style={{
                  position: "absolute",
                  left: card.x,
                  top: card.y,
                  width: 250,
                  cursor: activeTab === "selectionner" ? "move" : "default",
                  background: cardBg,
                  border: cardBorder,
                  borderRadius: 12,
                  padding: "16px",
                  boxShadow: isDragging 
                    ? "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                    : "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  userSelect: "none",
                  zIndex: isDragging ? 1000 : 10,
                  pointerEvents: "auto",
                  transition: isDragging ? "none" : "box-shadow 0.15s, transform 0.15s"
                }}
              >
                {/* Pin element if it's pinned/has a pin */}
                {(isQuestion || isNote || card.isPinned) && renderPin(card.color)}
                
                {/* Card Header with delete button */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, borderBottom: borderDash, paddingBottom: 6 }}>
                  <span style={{ 
                    fontWeight: "normal", 
                    fontSize: 16, 
                    color: titleColor,
                    fontFamily: "cursive, sans-serif"
                  }}>
                    {card.title}
                  </span>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteCard(card.id); }}
                    style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", fontSize: 14 }}
                  >
                    ✕
                  </button>
                </div>

                {/* Card Content */}
                <div>
                  {editingCardId === card.id ? (
                    <textarea
                      value={card.content}
                      onChange={(e) => onUpdateCardContent(card.id, e.target.value)}
                      onBlur={() => setEditingCardId(null)}
                      autoFocus
                      style={{
                        width: "100%", height: 80, border: "1px solid #cbd5e1", borderRadius: 6,
                        fontSize: 13, padding: 6, outline: "none", fontFamily: "cursive, sans-serif",
                        background: "#fafafa"
                      }}
                    />
                  ) : (
                    <p 
                      onClick={() => {
                        if (activeTab === "effacer") {
                          onDeleteCard(card.id);
                        } else {
                          setEditingCardId(card.id);
                        }
                      }}
                      style={{
                        margin: 0, fontSize: 14, 
                        color: textColor,
                        fontFamily: "cursive, sans-serif",
                        whiteSpace: "pre-wrap",
                        cursor: "pointer",
                        lineHeight: 1.5
                      }}
                      title={activeTab === "effacer" ? "Cliquer pour effacer" : "Cliquer pour modifier"}
                    >
                      {card.content || "Cliquez pour écrire..."}
                    </p>
                  )}
                  
                  {card.timestamp && (
                    <div style={{ fontSize: 9, color: "#a16207", textAlign: "right", marginTop: 6, opacity: 0.8 }}>
                      {card.timestamp}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Toolbar (second image style) */}
      {activeTab === "ecrire" && showToolbar && (
        <div style={{
          position: "absolute", bottom: 70, left: "50%", transform: "translateX(-50%)",
          background: "white", borderRadius: 20, padding: "8px 24px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          display: "flex", alignItems: "center", gap: 15, zIndex: 1000,
          border: "1px solid #e2e8f0"
        }}>
          {/* Marker Pens */}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 42 }}>
            {[
              { id: "black", color: "#0f172a" },
              { id: "blue", color: "#2563eb" },
              { id: "green", color: "#16a34a" },
              { id: "red", color: "#dc2626" },
              { id: "orange", color: "#ea580c" },
              { id: "purple", color: "#9333ea" },
              { id: "yellow", color: "#ca8a04" },
              { id: "pink", color: "#db2777" },
              { id: "white", color: "#cbd5e1" }
            ].map(pen => {
              const isSelected = selectedColor === pen.color;
              return (
                <button
                  key={pen.id}
                  onClick={() => onPenColorSelect(pen.color)}
                  style={{
                    width: 14,
                    height: isSelected ? 40 : 32,
                    background: pen.color,
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px 4px 2px 2px",
                    position: "relative",
                    cursor: "pointer",
                    padding: 0,
                    transition: "all 0.15s ease",
                    boxShadow: isSelected ? "0 4px 6px rgba(0,0,0,0.15)" : "none"
                  }}
                  title={`Couleur: ${pen.id}`}
                >
                  {/* Pen tip */}
                  <div style={{
                    position: "absolute", top: -8, left: 2, width: 8, height: 8,
                    background: pen.color, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)"
                  }} />
                </button>
              );
            })}
          </div>

          <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />

          {/* Shapes Buttons */}
          <div style={{ display: "flex", gap: 4, fontSize: 16, color: "#64748b" }}>
            {["⬜", "◯", "◇", "△", "╱"].map(shape => (
              <button 
                key={shape} 
                onClick={() => alert(`Forme "${shape}" sélectionnée`)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", fontSize: 16 }}
              >
                {shape}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />

          {/* Add Cards Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button 
              onClick={onAddNotesCard}
              style={{
                background: "none", border: "none", cursor: "pointer", fontSize: 20,
                padding: "4px 8px", borderRadius: 4, transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              title="Ajouter Notes de cours"
            >
              📌
            </button>
            <button 
              onClick={onAddQuestionCard}
              style={{
                background: "none", border: "none", cursor: "pointer", fontSize: 20,
                padding: "4px 8px", borderRadius: 4, transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              title="Ajouter Question Clé"
            >
              📝
            </button>
          </div>

          <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />

          {/* Mic Button */}
          <button
            onClick={toggleRecording}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 14px",
              background: isRecording ? "#ef4444" : "#f8fafc",
              color: isRecording ? "white" : "#0f172a",
              border: "1px solid #cbd5e1", borderRadius: 20, cursor: "pointer",
              fontWeight: 600, fontSize: 11, transition: "all 0.2s"
            }}
          >
            <span style={{ fontSize: 14 }}>{isRecording ? "🔴" : "🎙️"}</span>
            <span style={{ fontSize: 11, fontWeight: 500 }}>
              {isRecording ? "Enregistrement audio..." : "Enregistrement audio"}
            </span>
          </button>
        </div>
      )}

      {/* Canvas Sticky Footer Controls */}
      <div style={{ borderTop: "1px solid #e2e8f0", padding: "10px 24px", display: "flex", justifyContent: "center", alignItems: "center", gap: 16, background: "white" }}>
        <button onClick={() => setZoom(z => Math.max(50, z - 10))} style={{ border: "1px solid #cbd5e1", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16, background: "#fff" }}>🔍−</button>
        <span style={{ fontSize: 14, color: "#334155", minWidth: 44, textAlign: "center", fontWeight: 500 }}>{zoom}%</span>
        <button onClick={() => setZoom(z => Math.min(150, z + 10))} style={{ border: "1px solid #cbd5e1", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16, background: "#fff" }}>🔍+</button>
        
        <div style={{ width: 1, height: 20, background: "#cbd5e1" }}></div>
        
        <button 
          onClick={() => alert("Utilisez l'outil Sélectionner pour déplacer ou double-cliquez pour éditer les cartes.")}
          style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14, background: "#fff" }}
        >
          🖐️ Pan
        </button>

        {activeTab === "ecrire" && (
          <>
            <div style={{ width: 1, height: 20, background: "#cbd5e1" }}></div>
            <button 
              onClick={() => setShowToolbar(!showToolbar)}
              style={{ 
                border: "1px solid #2563eb", borderRadius: 8, padding: "6px 14px", cursor: "pointer", 
                fontSize: 13, background: showToolbar ? "#2563eb" : "white", 
                color: showToolbar ? "white" : "#2563eb", fontWeight: 600,
                transition: "all 0.15s"
              }}
            >
              🎨 Outils
            </button>
          </>
        )}
      </div>

      {/* Embedded CSS styles for animations */}
      <style>{`
        @keyframes pulse-anim {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .edit-hint {
          transition: opacity 0.2s;
        }
        li:hover .edit-hint {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}

// ── Shared Modal Backdrop ────────────────────────────────────────────────────
function ModalBackdrop({ children, onClose }) {
  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2000, animation: "fadeIn 0.2s ease-out"
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ animation: "scaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
        {children}
      </div>
    </div>
  );
}

// ── Share Modal ──────────────────────────────────────────────────────────────
function ShareModal({ course, onClose }) {
  const [copied, setCopied] = useState(false);
  const shareLink = `${window.location.origin}${window.location.pathname}#course=${encodeCourse(course)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div style={{
        background: "white", width: 500, maxWidth: "90%", borderRadius: 16,
        padding: 24, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Partager le cours</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>
        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.5, marginBottom: 16 }}>
          Ce lien contient l'intégralité du cours encodé en base64. Aucune base de données externe n'est requise. Toute personne ouvrant ce lien verra votre tableau blanc exactement tel qu'il est.
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input 
            readOnly 
            value={shareLink} 
            style={{
              flex: 1, padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8,
              background: "#f8fafc", fontSize: 13, color: "#64748b", outline: "none"
            }} 
          />
          <button 
            onClick={handleCopy}
            style={{
              background: copied ? "#22c55e" : "#3b82f6", color: "white", border: "none",
              borderRadius: 8, padding: "0 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "background 0.2s"
            }}
          >
            {copied ? "Copié !" : "Copier"}
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button 
            onClick={onClose}
            style={{
              padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: 8,
              background: "white", color: "#334155", fontSize: 13, fontWeight: 500, cursor: "pointer"
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ── Full-screen History View Component ─────────────────────────────────────────
function HistoryView({ courses, activeId, onLoad, onDelete }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");

  const filteredCourses = courses.filter(c => {
    const titleMatch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || descMatch;
  });

  return (
    <div style={{ flex: 1, background: "#f8fafc", padding: "40px 60px", overflowY: "auto" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#0f172a" }}>Historique</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "#64748b" }}>Retrouvez toutes vos pages</p>
          </div>
          
          <input 
            placeholder="Rechercher..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              padding: "10px 16px", borderRadius: 8, border: "1px solid #e2e8f0", 
              outline: "none", fontSize: 13, width: 240, background: "white",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
          />
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {["Tous", "Aujourd'hui", "Cette semaine", "Ce mois", "Personnalisé 📅"].map(tab => (
            <button
              key={tab}
              onClick={() => tab !== "Personnalisé 📅" && setActiveFilter(tab)}
              style={{
                padding: "8px 16px", borderRadius: 20, 
                border: activeFilter === tab ? "none" : "1px solid #cbd5e1",
                background: activeFilter === tab ? "#2563eb" : "white",
                color: activeFilter === tab ? "white" : "#64748b",
                fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Course cards list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredCourses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b", background: "white", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              Aucune page enregistrée dans l'historique de ce profil.
            </div>
          ) : (
            filteredCourses.map(c => {
              const isSwot = c.title.toLowerCase().includes("swot");
              const isPhotosynthese = c.title.toLowerCase().includes("photo");
              
              // Custom category badges based on content
              const categoryBadge = isSwot 
                ? { text: "Management stratégique", bg: "#f5f3ff", color: "#7c3aed" }
                : isPhotosynthese 
                  ? { text: "Biologie", bg: "#f0fdf4", color: "#16a34a" }
                  : { text: "Stratégie", bg: "#eff6ff", color: "#2563eb" };

              return (
                <div 
                  key={c.id}
                  onClick={() => onLoad(c.id)}
                  style={{
                    background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16,
                    display: "flex", gap: 20, alignItems: "center", cursor: "pointer", transition: "all 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.transform = "none"; }}
                >
                  {/* Miniature Thumbnail */}
                  <div style={{ 
                    width: 120, height: 80, borderRadius: 8, background: "#f8fafc", overflow: "hidden",
                    border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {isSwot ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, width: "100%", height: "100%", padding: 6 }}>
                        <div style={{ background: "#22c55e", borderRadius: 2 }} />
                        <div style={{ background: "#f97316", borderRadius: 2 }} />
                        <div style={{ background: "#3b82f6", borderRadius: 2 }} />
                        <div style={{ background: "#a855f7", borderRadius: 2 }} />
                      </div>
                    ) : isPhotosynthese ? (
                      <span style={{ fontSize: 32 }}>🌱</span>
                    ) : (
                      <span style={{ fontSize: 24 }}>📝</span>
                    )}
                  </div>

                  {/* Course info details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>{c.title}</h3>
                      <span style={{ fontSize: 11, background: categoryBadge.bg, color: categoryBadge.color, padding: "2px 8px", borderRadius: 12, fontWeight: 500 }}>
                        {categoryBadge.text}
                      </span>
                    </div>
                    <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 400 }}>
                      {c.description}
                    </p>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
                      1 page
                    </div>
                  </div>

                  {/* Options / Action button */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>10:45</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if (confirm("Supprimer ce cours définitivement ?")) onDelete(c.id); }}
                      style={{
                        border: "none", background: "none", cursor: "pointer", color: "#ef4444", fontSize: 16,
                        padding: 8, borderRadius: 6
                      }}
                      title="Supprimer de l'historique"
                    >
                      🗑️
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

// ── Full-screen Home View Component ────────────────────────────────────────────
function HomeView({ profiles, activeProfileId, onSelectProfile, onOpenNewUserModal }) {
  return (
    <div style={{ flex: 1, background: "#f8fafc", padding: "40px 60px", overflowY: "auto" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        
        {/* Welcome Banner */}
        <div style={{ textAlign: "center", marginBottom: 40, marginTop: 20 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Bienvenue sur <span style={{ color: "#3b82f6" }}>IdeaGrid</span>
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", marginTop: 10, maxWidth: 600, margin: "10px auto 0", lineHeight: 1.5 }}>
            Votre tableau intelligent pour organiser, analyser et comprendre vos idées.
          </p>
        </div>

        {/* Profiles Section */}
        <div style={{ background: "white", borderRadius: 16, padding: 30, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: 24, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 20 }}>👥</span>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: "#0f172a", margin: 0 }}>Choisir un profil</h2>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", margin: "-12px 0 24px 30px" }}>
            Sélectionnez un profil pour continuer ou utilisez le mode invité.
          </p>

          <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 10 }}>
            {profiles.map(p => {
              const isActive = activeProfileId === p.id;
              const initials = (p.firstName[0] || "") + (p.lastName[0] || "");
              return (
                <div 
                  key={p.id}
                  onClick={() => onSelectProfile(p.id)}
                  style={{
                    minWidth: 160, width: 160, background: "white", border: isActive ? `2px solid ${p.color}` : "1px solid #e2e8f0",
                    borderRadius: 12, padding: "24px 16px", textAlign: "center", cursor: "pointer",
                    boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                    transition: "all 0.2s", position: "relative"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = isActive ? "0 4px 12px rgba(0,0,0,0.05)" : "none"; }}
                >
                  {/* Status dot */}
                  <span style={{ position: "absolute", top: 15, right: 15, width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                  
                  {/* Avatar */}
                  <div style={{ 
                    width: 60, height: 60, borderRadius: "50%", background: p.color + "15", color: p.color,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700,
                    margin: "0 auto 12px"
                  }}>
                    {initials.toUpperCase()}
                  </div>

                  {/* Name */}
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.lastName.toUpperCase()} {p.firstName}
                  </div>

                  {/* Last Active */}
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8 }}>
                    Dernière session
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>
                    {p.lastActive}
                  </div>
                </div>
              );
            })}

            {/* Guest Profile Card */}
            <div 
              onClick={() => onSelectProfile("guest")}
              style={{
                minWidth: 160, width: 160, background: "white", border: activeProfileId === "guest" ? "2px solid #64748b" : "1px solid #e2e8f0",
                borderRadius: 12, padding: "24px 16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", position: "relative"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <span style={{ position: "absolute", top: 15, right: 15, width: 8, height: 8, borderRadius: "50%", background: "#64748b" }} />
              
              <div style={{ 
                width: 60, height: 60, borderRadius: "50%", background: "#f1f5f9", color: "#64748b",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700,
                margin: "0 auto 12px"
              }}>
                👤
              </div>

              <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>
                Mode invité
              </div>

              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8 }}>
                Continuer sans compte
              </div>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>
                Aucune sauvegarde
              </div>
            </div>
          </div>
        </div>

        {/* New User Banner */}
        <div 
          onClick={onOpenNewUserModal}
          style={{
            background: "white", borderRadius: 12, border: "1px solid #e2e8f0", padding: "16px 24px",
            display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
            transition: "all 0.2s", marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "#f8fafc"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "white"; }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 24, color: "#3b82f6" }}>➕</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>Nouvelle utilisateur</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Créez un nouveau profil pour commencer</div>
            </div>
          </div>
          <span style={{ fontSize: 18, color: "#94a3b8" }}>➔</span>
        </div>

        {/* Sync Banner */}
        <div style={{ 
          background: "#eff6ff", borderRadius: 12, border: "1px solid #bfdbfe", padding: "20px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 24 }}>☁️</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#1e3a8a" }}>Créer un compte IdeaGrid</div>
              <div style={{ fontSize: 12, color: "#1e40af", marginTop: 2 }}>Créez un compte pour synchroniser vos tableaux sur tous vos appareils et ne jamais perdre vos données.</div>
            </div>
          </div>
          <button style={{
            background: "#3b82f6", color: "white", border: "none", borderRadius: 8,
            padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>
            + Créer un compte
          </button>
        </div>

      </div>
    </div>
  );
}

// ── New User Modal ─────────────────────────────────────────────────────────────
function NewUserModal({ isOpen, onClose, onCreate }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", color: "#22c55e" });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    onCreate(form);
    setForm({ firstName: "", lastName: "", email: "", color: "#22c55e" });
    onClose();
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <form onSubmit={handleSubmit} style={{
        background: "white", width: 440, maxWidth: "90%", borderRadius: 16,
        padding: 24, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Nouveau profil utilisateur</h3>
          <button type="button" onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Prénom</label>
            <input 
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder="Ex: Aghiles"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8, outline: "none", fontSize: 13 }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Nom</label>
            <input 
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              placeholder="Ex: ALKAMA"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8, outline: "none", fontSize: 13 }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Adresse mail</label>
            <input 
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Ex: alkama@example.com"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8, outline: "none", fontSize: 13 }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Couleur du profil</label>
            <div style={{ display: "flex", gap: 10 }}>
              {["#22c55e", "#ea580c", "#3b82f6", "#a855f7", "#ec4899", "#ca8a04"].map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  style={{
                    width: 28, height: 28, borderRadius: "50%", background: c,
                    border: form.color === c ? "3px solid #94a3b8" : "none",
                    cursor: "pointer"
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button 
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: 8,
              background: "white", color: "#334155", fontSize: 13, fontWeight: 500, cursor: "pointer"
            }}
          >
            Annuler
          </button>
          <button 
            type="submit"
            style={{
              padding: "8px 16px", border: "none", borderRadius: 8,
              background: "#3b82f6", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer"
            }}
          >
            Créer
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

// ── App Container ─────────────────────────────────────────────────────────────
export default function App() {
  const [profiles, setProfiles] = useState(() => getProfiles());
  const [activeProfileId, setActiveProfileId] = useState(() => {
    return localStorage.getItem("ideagrid_active_profile") || "guest";
  });

  const [courses, setCourses] = useState([]);
  const [currentCourseId, setCurrentCourseId] = useState("");
  const [activeTab, setActiveTab] = useState("accueil"); // Default to welcome screen
  const [showAssistant, setShowAssistant] = useState(true);
  const [zoom, setZoom] = useState(100);

  // Modals visibility
  const [showShare, setShowShare] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);

  // Speech Recognition States
  const [isRecording, setIsRecording] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const recognitionRef = useRef(null);

  // Selected Drawing / Card color
  const [selectedColor, setSelectedColor] = useState("#2563eb");

  // Drag & drop card state
  const [draggingCard, setDraggingCard] = useState(null); // { id, offsetX, offsetY }

  const activeCourse = courses.find(c => c.id === currentCourseId) || courses[0] || defaultCourse;

  // Persist active profile ID changes
  useEffect(() => {
    localStorage.setItem("ideagrid_active_profile", activeProfileId);
  }, [activeProfileId]);

  // Load partitioned courses whenever the active profile changes
  useEffect(() => {
    const list = getCours(activeProfileId);
    setCourses(list);
    if (list.length > 0) {
      setCurrentCourseId(list[0].id);
    } else {
      // Seed with appropriate default templates
      const seedList = activeProfileId === "profile-2" ? [swotCourse] : (activeProfileId === "profile-3" ? [pestelCourse] : [defaultCourse]);
      saveCours(activeProfileId, seedList);
      setCourses(seedList);
      setCurrentCourseId(seedList[0].id);
    }
  }, [activeProfileId]);

  // Save courses list changes to localStorage (isolated by profile ID)
  const updateCurrentCourse = (callback) => {
    setCourses(prev => {
      const updated = prev.map(c => {
        if (c.id === currentCourseId) {
          const res = typeof callback === 'function' ? callback(c) : { ...c, ...callback };
          return res;
        }
        return c;
      });
      saveCours(activeProfileId, updated);
      return updated;
    });
  };

  // Decode shared link on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#course=")) {
      const base64Data = hash.substring("#course=".length);
      const decoded = decodeCourse(base64Data);
      if (decoded) {
        const importedCourse = {
          ...decoded,
          id: "imported-" + genId(),
          title: decoded.title + " (Partagé)"
        };
        
        setCourses(prev => {
          const exists = prev.some(c => c.title === importedCourse.title && c.description === importedCourse.description);
          if (exists) return prev;
          const newList = [importedCourse, ...prev];
          saveCours(activeProfileId, newList);
          return newList;
        });
        setCurrentCourseId(importedCourse.id);
        setActiveTab("ecrire"); // Open editor immediately
        alert(`Cours partagé "${decoded.title}" importé avec succès !`);
        window.location.hash = "";
      }
    }
  }, [activeProfileId]);

  // Web Speech API Voice recognition hook
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "fr-FR";

    rec.onstart = () => {
      setIsRecording(true);
      setSpeechText("");
    };

    rec.onerror = (e) => {
      console.error("Speech Recognition Error", e.error);
      setIsRecording(false);
    };

    rec.onend = () => {
      if (isRecording) {
        try {
          rec.start();
        } catch {
          setIsRecording(false);
        }
      }
    };

    rec.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      
      if (interim) {
        setSpeechText(interim);
      }
      if (final) {
        setSpeechText("");
        addSpokenTextToBoard(final.trim());
      }
    };

    recognitionRef.current = rec;

    return () => {
      try {
        rec.stop();
      } catch (e) {}
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Votre navigateur ne supporte pas la reconnaissance vocale. Veuillez essayer avec Google Chrome.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }
  };

  // Convert voice text and append to description block
  const addSpokenTextToBoard = (text) => {
    if (!text) return;
    updateCurrentCourse(prev => {
      const isPlaceholder = prev.description === "Commencer à écrire ou parlez au micro..." || !prev.description;
      const newDesc = isPlaceholder ? text : prev.description + " " + text;
      return {
        ...prev,
        description: newDesc,
        descColor: selectedColor,
        aiSummary: prev.aiSummary + " " + text
      };
    });
  };

  // Sidebar actions
  const handleTabChange = (id) => {
    if (id === "assistant") {
      setShowAssistant(!showAssistant);
    } else if (id === "nouvelle") {
      handleCreateNewCourse();
    } else if (id === "partager") {
      setShowShare(true);
    } else {
      setActiveTab(id);
    }
  };

  const handleCreateNewCourse = () => {
    const title = prompt("Entrez le titre du nouveau cours :", "Nouveau cours");
    if (!title) return;
    const newCourse = {
      id: "course-" + genId(),
      title: title,
      description: "Commencer à écrire ou parlez au micro...",
      descColor: selectedColor,
      pointsCles: ["Premier point clé..."],
      question: "Pourquoi ?",
      aiSummary: "L'assistant IA résumera le cours.",
      cards: []
    };
    setCourses(prev => {
      const list = [newCourse, ...prev];
      saveCours(activeProfileId, list);
      return list;
    });
    setCurrentCourseId(newCourse.id);
    setActiveTab("ecrire");
  };

  const handleDeleteCourse = (id) => {
    setCourses(prev => {
      const filtered = prev.filter(c => c.id !== id);
      saveCours(activeProfileId, filtered);
      
      if (id === currentCourseId) {
        if (filtered.length > 0) {
          setCurrentCourseId(filtered[0].id);
        } else {
          const defaultList = activeProfileId === "profile-2" ? [swotCourse] : (activeProfileId === "profile-3" ? [pestelCourse] : [defaultCourse]);
          saveCours(activeProfileId, defaultList);
          setCurrentCourseId(defaultList[0].id);
          return defaultList;
        }
      }
      return filtered;
    });
  };

  // Card dragging mouse/pointer event listeners
  const handlePointerDown = (e, card) => {
    if (activeTab !== "selectionner") return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggingCard({
      id: card.id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    });
  };

  const handlePointerMove = (e) => {
    if (!draggingCard) return;
    const board = document.getElementById("whiteboard-canvas-area");
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const x = (e.clientX - rect.left - draggingCard.offsetX) / (zoom / 100);
    const y = (e.clientY - rect.top - draggingCard.offsetY) / (zoom / 100);

    updateCurrentCourse(prev => ({
      ...prev,
      cards: prev.cards.map(c => c.id === draggingCard.id ? { ...c, x, y } : c)
    }));
  };

  const handlePointerUp = () => {
    setDraggingCard(null);
  };

  // Assistant chatbot submits
  const handleSendMessage = (message) => {
    const qCard = {
      id: genId(),
      type: "question",
      title: "Question Prof 💡",
      content: message,
      x: 100 + Math.random() * 100,
      y: 200 + Math.random() * 100
    };

    let responseText = "Réponse IA : ";
    const lMsg = message.toLowerCase();
    if (lMsg.includes("lumière") || lMsg.includes("soleil")) {
      responseText += "La lumière apporte l'énergie nécessaire à la chlorophylle pour casser les molécules d'eau, libérant de l'oxygène.";
    } else if (lMsg.includes("co2") || lMsg.includes("carbone")) {
      responseText += "Le carbone du CO₂ de l'air est capturé pour former le squelette carboné des molécules de glucose (sucre).";
    } else if (lMsg.includes("eau") || lMsg.includes("h2o")) {
      responseText += "L'eau est absorbée par les racines et est indispensable à la phase photochimique de la photosynthèse.";
    } else {
      responseText += `Concernant "${message}" : C'est une excellente question. La plante utilise les chloroplastes pour capter cette énergie.`;
    }

    const aCard = {
      id: genId(),
      type: "speech_note",
      title: "Réponse IA 🧬",
      content: responseText,
      color: "#eff6ff",
      x: 200 + Math.random() * 100,
      y: 300 + Math.random() * 100
    };

    updateCurrentCourse(prev => ({
      ...prev,
      cards: [...prev.cards, qCard, aCard]
    }));
  };

  const handleSuggestAction = (action) => {
    if (action === "summary") {
      const summaryCard = {
        id: genId(),
        type: "speech_note",
        title: "Résumé IA 📋",
        content: activeCourse.aiSummary || "Synthèse du cours : lumière, eau et CO₂ produisent des sucres et rejettent l'O₂.",
        color: "#f0fdf4",
        x: 150 + Math.random() * 100,
        y: 200 + Math.random() * 100
      };
      updateCurrentCourse(prev => ({
        ...prev,
        cards: [...prev.cards, summaryCard]
      }));
    } else if (action === "schema") {
      alert("Le schéma de la photosynthèse est déjà affiché au milieu du tableau.");
    } else if (action === "examples") {
      const examplesCard = {
        id: genId(),
        type: "speech_note",
        title: "Exemples 💡",
        content: "Organismes photosynthétiques :\n1. Plantes terrestres (arbres)\n2. Algues (kelp, algues brunes)\n3. Phytoplancton marins",
        color: "#fef08a",
        x: 100 + Math.random() * 150,
        y: 250 + Math.random() * 150
      };
      updateCurrentCourse(prev => ({
        ...prev,
        cards: [...prev.cards, examplesCard]
      }));
    }
  };

  // Create new profile handler
  const handleCreateNewUser = (formData) => {
    const newProfile = {
      id: "profile-" + genId(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      color: formData.color,
      lastActive: "Aujourd'hui à " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    };
    
    setProfiles(prev => {
      const newList = [...prev, newProfile];
      saveProfiles(newList);
      return newList;
    });
    
    setActiveProfileId(newProfile.id);
    setActiveTab("accueil");
    alert(`Profil ${newProfile.firstName} ${newProfile.lastName} créé et connecté avec succès !`);
  };

  return (
    <div 
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ display: "flex", height: "100vh", width: "100vw", fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden" }}
    >
      <Sidebar 
        activeTab={activeTab} 
        onTab={handleTabChange} 
      />

      {activeTab === "accueil" ? (
        <HomeView 
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelectProfile={(id) => {
            setActiveProfileId(id);
            const now = new Date();
            const timeStr = "Aujourd'hui à " + now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
            const updated = profiles.map(p => p.id === id ? { ...p, lastActive: timeStr } : p);
            setProfiles(updated);
            saveProfiles(updated);
            setActiveTab("ecrire"); // Open board automatically
          }}
          onOpenNewUserModal={() => setShowNewUserModal(true)}
        />
      ) : activeTab === "historique" ? (
        <HistoryView 
          courses={courses}
          activeId={currentCourseId}
          onLoad={(id) => {
            setCurrentCourseId(id);
            setActiveTab("ecrire");
          }}
          onDelete={handleDeleteCourse}
        />
      ) : (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <Whiteboard 
            course={activeCourse}
            activeTab={activeTab}
            zoom={zoom}
            setZoom={setZoom}
            isRecording={isRecording}
            speechText={speechText}
            toggleRecording={toggleRecording}
            selectedColor={selectedColor}
            onPenColorSelect={(color) => {
              setSelectedColor(color);
              updateCurrentCourse({ descColor: color });
            }}
            onAddNotesCard={() => {
              const newCard = {
                id: genId(),
                type: "notes_cours",
                title: "Notes de cours",
                content: "Notes complémentaires...",
                x: 520 + Math.random() * 30,
                y: 350 + Math.random() * 30,
                isPinned: true,
                color: selectedColor
              };
              updateCurrentCourse(prev => ({ ...prev, cards: [...prev.cards, newCard] }));
            }}
            onAddQuestionCard={() => {
              const newCard = {
                id: genId(),
                type: "question",
                title: "Question Clé",
                content: "Pourquoi la lumière est-elle essentielle à la photosynthèse ?",
                x: 520 + Math.random() * 30,
                y: 535 + Math.random() * 30,
                isPinned: true,
                color: selectedColor
              };
              updateCurrentCourse(prev => ({ ...prev, cards: [...prev.cards, newCard] }));
            }}
            onUpdateTitle={(title) => updateCurrentCourse({ title })}
            onUpdateDesc={(description) => updateCurrentCourse({ description })}
            onUpdatePoint={(idx, val) => updateCurrentCourse(prev => {
              const pts = [...prev.pointsCles];
              pts[idx] = val;
              return { ...prev, pointsCles: pts };
            })}
            onDeletePoint={(idx) => updateCurrentCourse(prev => ({
              ...prev,
              pointsCles: prev.pointsCles.filter((_, i) => i !== idx)
            }))}
            onAddPoint={() => updateCurrentCourse(prev => ({
              ...prev,
              pointsCles: [...prev.pointsCles, "Nouveau point clé..."]
            }))}
            onUpdateCardContent={(cardId, content) => updateCurrentCourse(prev => ({
              ...prev,
              cards: prev.cards.map(c => c.id === cardId ? { ...c, content } : c)
            }))}
            onDeleteCard={(cardId) => updateCurrentCourse(prev => ({
              ...prev,
              cards: prev.cards.filter(c => c.id !== cardId)
            }))}
            onPointerDown={handlePointerDown}
            draggingCard={draggingCard}
            onSave={() => alert(`Le cours "${activeCourse.title}" a été sauvegardé avec succès dans votre historique.`)}
            onShare={() => setShowShare(true)}
          />

          {showAssistant && (
            <AssistantPanel 
              onClose={() => setShowAssistant(false)} 
              aiSummary={activeCourse.aiSummary}
              onSuggestAction={handleSuggestAction}
              onSendMessage={handleSendMessage}
            />
          )}
        </div>
      )}

      {/* Share Modal Dialog */}
      {showShare && (
        <ShareModal 
          course={activeCourse} 
          onClose={() => setShowShare(false)} 
        />
      )}

      {/* New User Creation Dialog */}
      <NewUserModal 
        isOpen={showNewUserModal}
        onClose={() => setShowNewUserModal(false)}
        onCreate={handleCreateNewUser}
      />
    </div>
  );
}
