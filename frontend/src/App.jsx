import { useState, useRef, useEffect } from "react";

// ── Unique ID Generator ──────────────────────────────────────────────────────
function genId() { 
  return Date.now() + Math.random(); 
}

// ── Default Course Templates ─────────────────────────────────────────────────
const defaultCourse = {
  id: "course-default",
  title: "Nouveau cours",
  description: "Commencer à écrire ou parlez au micro...",
  descColor: "#3b82f6",
  pointsCles: ["Nouveau point clé..."],
  question: "Entrez votre question clé ici...",
  aiSummary: "L'assistant IA résumera le cours.",
  cards: [],
  dateLabel: "Aujourd'hui",
  timeLabel: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
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
  swotBullets: [
    { type: "force", label: "Force :", text: "Les forces sont les atouts internes qui donnent à l'organisation un avantage concurrentiel. Elles représentent ce que l'entreprise fait bien et qui la distingue de ses concurrents.", color: "#16a34a" },
    { type: "faiblesse", label: "Faiblesse :", text: "Les faiblesses sont les points internes à améliorer. Elles peuvent limiter la performance de l'organisation et doivent être identifiées pour être corrigées.", color: "#ea580c" },
    { type: "opportunite", label: "Opportunité :", text: "Les opportunités sont les éléments externes favorables à l'organisation. Elles proviennent de l'environnement et peuvent être exploitées pour favoriser la croissance et le succès.", color: "#2563eb" },
    { type: "menace", label: "Menace :", text: "Les menaces sont des éléments externes défavorables qui peuvent nuire à l'organisation. Les anticiper permet de réduire leur impact et de mieux s'y préparer.", color: "#9333ea" }
  ],
  aiSummary: "L'analyse SWOT structure les forces, faiblesses, opportunités et menaces pour orienter les décisions d'entreprise.",
  cards: [
    {
      id: "swot-ex-card",
      type: "notes_cours",
      title: "Exemple d'application",
      content: "L'analyse SWOT aide à élaborer une stratégie adaptée en s'appuyant sur les forces, en corrigeant les faiblesses, en saisissant les opportunités et en anticipant les menaces.",
      x: 520,
      y: 350,
      isPinned: true,
      color: "#3b82f6"
    },
    {
      id: "swot-q-card",
      type: "question",
      title: "Question",
      content: "Comment utiliser l'analyse SWOT pour améliorer la performance d'une entreprise ?",
      x: 520,
      y: 535,
      isPinned: true,
      color: "#a855f7"
    }
  ],
  dateLabel: "Aujourd'hui",
  timeLabel: "10:45"
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
  cards: [],
  dateLabel: "Hier",
  timeLabel: "16:30"
};

const porterCourse = {
  id: "porter-default",
  title: "Les 5 forces de Porter",
  description: "Le modèle des 5 forces de Porter permet d'analyser l'environnement concurrentiel d'une entreprise en identifiant les forces qui déterminent l'intensité de la concurrence et l'attractivité d'un marché.",
  descColor: "#ea580c",
  pointsCles: [
    "Analyse de la structure concurrentielle",
    "Identification des menaces du marché",
    "Définition d'un avantage concurrentiel"
  ],
  aiSummary: "Le modèle des 5 forces de Porter structure l'analyse de l'intensité concurrentielle selon 5 axes majeurs : clients, fournisseurs, entrants, substituts et rivaux.",
  cards: [],
  dateLabel: "Hier",
  timeLabel: "11:20"
};

const financeCourse = {
  id: "finance-default",
  title: "Analyse financière",
  description: "L'analyse financière permet d'évaluer la santé financière d'une entreprise, sa rentabilité et sa solvabilité à partir des documents comptables (bilan, compte de résultat).",
  descColor: "#ca8a04",
  pointsCles: [
    "Solvabilité et liquidité de l'entreprise",
    "Étude de la rentabilité d'exploitation",
    "Analyse de la structure financière"
  ],
  aiSummary: "L'analyse financière évalue la rentabilité, la solvabilité et la structure financière d'une entreprise pour orienter les décisions d'investissement.",
  cards: [],
  dateLabel: "Avant-hier",
  timeLabel: "10:15"
};

// ── Profile Local Storage Helpers ────────────────────────────────────────────
function getProfiles() {
  try {
    const data = localStorage.getItem("ideagrid_profiles");
    if (!data) {
      return [];
    }
    const list = JSON.parse(data);
    const filtered = list.filter(p => p.id !== "profile-1" && p.id !== "profile-2" && p.id !== "profile-3" && p.id !== "profile-4");
    if (filtered.length !== list.length) {
      localStorage.setItem("ideagrid_profiles", JSON.stringify(filtered));
    }
    return filtered;
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
      } else if (profileId === "profile-4") {
        return [porterCourse, financeCourse];
      }
      
      // Default for newly created users
      const userDefault = {
        id: "course-" + genId(),
        title: "Nouveau cours",
        description: "Commencer à écrire ou parlez au micro...",
        descColor: "#0f172a",
        pointsCles: ["Premier point clé..."],
        question: "Entrez votre question clé ici...",
        aiSummary: "L'assistant IA résumera le cours.",
        cards: [],
        dateLabel: "Aujourd'hui",
        timeLabel: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      };
      return [userDefault];
    }
    
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

const getApiUrl = (path) => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `http://localhost:3000${path}`;
  }
  return path;
};

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
function Sidebar({ activeTab, onTab, activeProfile }) {
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
      
      {/* Profile info badge at the bottom of the sidebar */}
      {activeProfile ? (
        <div style={{ 
          margin: "0 16px 16px", padding: "10px 12px", borderRadius: 8, 
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: 10
        }}>
          <ProfileAvatar profile={activeProfile} size={28} />
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {activeProfile.firstName} {activeProfile.lastName.toUpperCase()}
            </div>
            <div style={{ fontSize: 10, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {activeProfile.email}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ 
          margin: "0 16px 16px", padding: "10px 12px", borderRadius: 8, 
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: 10
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", background: "#1e293b", color: "#94a3b8",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0
          }}>👤</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>Mode Invité</div>
            <div style={{ fontSize: 10, color: "#475569" }}>Sans sauvegarde</div>
          </div>
        </div>
      )}

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

// ── Profile Avatar Vector SVG Renderer ───────────────────────────────────────
function ProfileAvatar({ profile, size = 60 }) {
  if (!profile) return null;
  const isGuest = profile.id === "guest";
  if (isGuest) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%", background: "#f1f5f9", color: "#64748b",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.45,
        border: "1.5px solid #cbd5e1", flexShrink: 0, fontWeight: 600
      }}>
        👤
      </div>
    );
  }

  const initials = ((profile.firstName?.[0] || "") + (profile.lastName?.[0] || "")).toUpperCase();
  const themeColor = profile.color || "#3b82f6";
  
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `${themeColor}12`,
      border: `2px solid ${themeColor}20`,
      color: themeColor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.4,
      fontWeight: 700,
      fontFamily: "'Inter', sans-serif",
      flexShrink: 0
    }}>
      {initials}
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
  onShare,
  activeProfile,
  onUpdateSwotBullet,
  // New props for collaboration
  sharedAccess,
  onRefresh,
  onExitCollaboration,
  onAddCommentCard
}) {
  const isReadOnly = sharedAccess && sharedAccess.permission === "Peut consulter";
  const isCommentOnly = sharedAccess && sharedAccess.permission === "Peut commenter";
  const isDisabled = isReadOnly || isCommentOnly;
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [editingPtIndex, setEditingPtIndex] = useState(null);
  const [editingCardId, setEditingCardId] = useState(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [tempDesc, setTempDesc] = useState("");
  
  const [editingSwotIdx, setEditingSwotIdx] = useState(null);
  const [tempSwotText, setTempSwotText] = useState("");

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
  const displayDescription = () => {
    const isPlaceholder = course.description === "Commencer à écrire ou parlez au micro...";
    
    if (isPlaceholder) {
      if (speechText) {
        return (
          <span style={{ fontStyle: "italic", opacity: 0.7, color: selectedColor }}>
            {speechText}
          </span>
        );
      }
      return (
        <span style={{ opacity: 0.5, color: "#64748b" }}>
          Commencer à écrire ou parlez au micro...
        </span>
      );
    }
    
    return (
      <>
        <span>{course.description}</span>
        {speechText && (
          <span style={{ fontStyle: "italic", opacity: 0.7, color: selectedColor }}>
            {" " + speechText}
          </span>
        )}
      </>
    );
  };

  // Diagram 1: Photosynthesis
  const renderPlantDiagram = () => (
    <div style={{ position: "relative", marginTop: 20, padding: 20, height: 320, border: "1px dashed #cbd5e1", borderRadius: 12, background: "#fcfdfa" }}>
      <div style={{ position: "absolute", top: 15, left: 20, textAlign: "center" }}>
        <span style={{ fontSize: 44, filter: "drop-shadow(0 2px 4px rgba(253,224,71,0.5))" }}>☀️</span>
        <div style={{ color: "#eab308", fontSize: 12, fontFamily: "cursive, sans-serif", fontWeight: 600 }}>Lumière</div>
      </div>
      <div style={{ position: "absolute", bottom: 120, left: 20, fontSize: 13, fontFamily: "cursive, sans-serif" }}>
        CO₂ <br /> <span style={{ fontSize: 11, color: "#64748b" }}>(Dioxyde de carbone)</span> ➔
      </div>
      <div style={{ position: "absolute", bottom: 30, left: 30, fontSize: 13, fontFamily: "cursive, sans-serif", color: "#2563eb" }}>
        Eau (H₂O) ➔
      </div>
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <span style={{ fontSize: 90, filter: "drop-shadow(0 4px 8px rgba(34,197,94,0.3))" }}>🌱</span>
      </div>
      <div style={{ position: "absolute", top: 40, right: 30, fontSize: 13, fontFamily: "cursive, sans-serif", color: "#16a34a" }}>
        ➔ O₂ <br /> <span style={{ fontSize: 11, color: "#64748b" }}>(Oxygène)</span>
      </div>
      <div style={{ position: "absolute", bottom: 80, right: 30, fontSize: 13, fontFamily: "cursive, sans-serif", color: "#9333ea" }}>
        🪟 Sucre <br /> <span style={{ fontSize: 11, color: "#64748b" }}>(Glucose)</span>
      </div>
    </div>
  );

  // Diagram 2: SWOT Bullets (editable inline)
  const renderSwotBullets = () => {
    const bullets = course.swotBullets || [
      { type: "force", label: "Force :", text: "Les forces sont les atouts internes qui donnent à l'organisation un avantage concurrentiel.", color: "#16a34a" },
      { type: "faiblesse", label: "Faiblesse :", text: "Les faiblesses sont les points internes à améliorer. Elles peuvent limiter la performance.", color: "#ea580c" },
      { type: "opportunite", label: "Opportunité :", text: "Les opportunités sont les éléments externes favorables.", color: "#2563eb" },
      { type: "menace", label: "Menace :", text: "Les menaces sont des éléments externes défavorables.", color: "#9333ea" }
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 15, fontFamily: "cursive, sans-serif" }}>
        {bullets.map((b, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ 
              display: "inline-block", width: 10, height: 10, borderRadius: "50%", 
              background: b.color, marginTop: 7, flexShrink: 0 
            }} />
            <div style={{ flex: 1, fontSize: 15, lineHeight: 1.5 }}>
              <span style={{ color: b.color, fontWeight: 700, marginRight: 6 }}>{b.label}</span>
              {editingSwotIdx === idx ? (
                <textarea
                  value={tempSwotText}
                  onChange={(e) => setTempSwotText(e.target.value)}
                  onBlur={() => {
                    setEditingSwotIdx(null);
                    if (onUpdateSwotBullet) {
                      onUpdateSwotBullet(idx, tempSwotText.trim());
                    }
                  }}
                  autoFocus
                  style={{
                    width: "100%", height: 60, fontFamily: "cursive, sans-serif", fontSize: 15,
                    border: "1px solid #cbd5e1", borderRadius: 6, outline: "none", background: "#f8fafc",
                    padding: 6
                  }}
                />
              ) : (
                <span 
                  onClick={() => {
                    setEditingSwotIdx(idx);
                    setTempSwotText(b.text);
                  }}
                  title="Double-cliquer pour modifier le texte"
                  style={{ cursor: "pointer" }}
                >
                  {b.text || "Double-cliquez pour écrire..."}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Diagram 3: PESTEL Layout
  const renderPestelDiagram = () => {
    const pillars = [
      { letter: "P", label: "Politique", color: "#3b82f6", text: "Stabilité gouvernementale, fiscalité" },
      { letter: "E", label: "Économique", color: "#3b82f6", text: "Croissance, taux d'intérêt, inflation" },
      { letter: "S", label: "Social", color: "#ea580c", text: "Démographie, modes de vie, éducation" },
      { letter: "T", label: "Technologique", color: "#ea580c", text: "Innovation, R&D, numérisation" },
      { letter: "E", label: "Écologique", color: "#22c55e", text: "Climat, environnement, recyclage" },
      { letter: "L", label: "Légal", color: "#a855f7", text: "Réglementations, droit du travail" }
    ];

    return (
      <div style={{
        marginTop: 20, padding: "20px 10px", border: "1px dashed #cbd5e1", borderRadius: 12,
        background: "#fcfdfa", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12
      }}>
        {pillars.map((p, idx) => (
          <div key={idx} style={{
            background: "white", border: `1px solid ${p.color}20`, borderRadius: 8, padding: 10,
            textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", alignItems: "center"
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", background: p.color, color: "white",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, marginBottom: 6
            }}>
              {p.letter}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: p.color, fontFamily: "cursive, sans-serif" }}>{p.label}</div>
            <div style={{ fontSize: 9, color: "#64748b", marginTop: 4, fontFamily: "sans-serif", lineHeight: 1.2 }}>{p.text}</div>
          </div>
        ))}
      </div>
    );
  };

  // Diagram 4: Porter's 5 Forces
  const renderPorterDiagram = () => (
    <div style={{
      marginTop: 20, height: 320, border: "1px dashed #cbd5e1", borderRadius: 12,
      background: "#fcfdfa", position: "relative", padding: 10
    }}>
      <div style={{
        position: "absolute", top: 15, left: "50%", transform: "translateX(-50%)",
        background: "white", border: "1px solid #ea580c", borderRadius: 8, padding: "6px 12px",
        textAlign: "center", fontSize: 11, width: 140, boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
      }}>
        <div style={{ fontWeight: 700, color: "#ea580c" }}>Nouveaux entrants</div>
        <div style={{ fontSize: 9, color: "#64748b" }}>Menace de pénétration ⬇️</div>
      </div>
      <div style={{
        position: "absolute", top: "50%", left: 15, transform: "translateY(-50%)",
        background: "white", border: "1px solid #3b82f6", borderRadius: 8, padding: "6px 12px",
        textAlign: "center", fontSize: 11, width: 110, boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
      }}>
        <div style={{ fontWeight: 700, color: "#3b82f6" }}>Fournisseurs</div>
        <div style={{ fontSize: 9, color: "#64748b" }}>Pouvoir de négoc. ➔</div>
      </div>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        background: "#eff6ff", border: "2px solid #2563eb", borderRadius: 8, padding: "8px 14px",
        textAlign: "center", fontSize: 12, width: 150, zIndex: 2, boxShadow: "0 4px 6px rgba(37,99,235,0.1)"
      }}>
        <div style={{ fontWeight: 700, color: "#1e3a8a" }}>Rivalité du secteur</div>
        <div style={{ fontSize: 9, color: "#1e40af" }}>Intensité concurrentielle</div>
      </div>
      <div style={{
        position: "absolute", top: "50%", right: 15, transform: "translateY(-50%)",
        background: "white", border: "1px solid #3b82f6", borderRadius: 8, padding: "6px 12px",
        textAlign: "center", fontSize: 11, width: 110, boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
      }}>
        <div style={{ fontWeight: 700, color: "#3b82f6" }}>Clients</div>
        <div style={{ fontSize: 9, color: "#64748b" }}>⬅️ Pouvoir de négoc.</div>
      </div>
      <div style={{
        position: "absolute", bottom: 15, left: "50%", transform: "translateX(-50%)",
        background: "white", border: "1px solid #a855f7", borderRadius: 8, padding: "6px 12px",
        textAlign: "center", fontSize: 11, width: 140, boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
      }}>
        <div style={{ fontWeight: 700, color: "#a855f7" }}>Substituts</div>
        <div style={{ fontSize: 9, color: "#64748b" }}>⬆️ Menace des produits</div>
      </div>
    </div>
  );

  // Diagram 5: Finance Dashboard
  const renderFinanceDashboard = () => (
    <div style={{
      marginTop: 20, border: "1px dashed #cbd5e1", borderRadius: 12,
      background: "#fcfdfa", padding: 16, display: "flex", flexDirection: "column", gap: 12
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        <div style={{ background: "white", padding: 8, borderRadius: 6, border: "1px solid #e2e8f0", textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "#64748b" }}>Chiffre d'Affaires</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>450 k€ (+8%)</div>
        </div>
        <div style={{ background: "white", padding: 8, borderRadius: 6, border: "1px solid #e2e8f0", textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "#64748b" }}>Marge brute</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>42.5%</div>
        </div>
        <div style={{ background: "white", padding: 8, borderRadius: 6, border: "1px solid #e2e8f0", textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "#64748b" }}>Marge EBITDA</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#ca8a04" }}>18.2%</div>
        </div>
      </div>
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", marginBottom: 6, fontFamily: "cursive, sans-serif" }}>Évolution du CA (k€)</div>
        <svg width="100%" height="90" viewBox="0 0 200 90">
          <line x1="20" y1="75" x2="190" y2="75" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="20" y1="10" x2="20" y2="75" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="20" y1="45" x2="190" y2="45" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="20" y1="20" x2="190" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M20 68 L 60 60 L 100 44 L 140 35 L 180 18" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="68" r="2.5" fill="#2563eb" />
          <circle cx="60" cy="60" r="2.5" fill="#2563eb" />
          <circle cx="100" cy="44" r="2.5" fill="#2563eb" />
          <circle cx="140" cy="35" r="2.5" fill="#2563eb" />
          <circle cx="180" cy="18" r="2.5" fill="#2563eb" />
          <text x="20" y="85" fontSize="7" fill="#94a3b8" textAnchor="middle">2020</text>
          <text x="60" y="85" fontSize="7" fill="#94a3b8" textAnchor="middle">2021</text>
          <text x="100" y="85" fontSize="7" fill="#94a3b8" textAnchor="middle">2022</text>
          <text x="140" y="85" fontSize="7" fill="#94a3b8" textAnchor="middle">2023</text>
          <text x="180" y="85" fontSize="7" fill="#94a3b8" textAnchor="middle">2024</text>
        </svg>
      </div>
    </div>
  );

  // Diagram Switcher based on course info
  const renderLeftDiagram = () => {
    const t = course.title.toLowerCase();
    const id = course.id.toLowerCase();
    if (t.includes("photosynthèse") || id.includes("photosynthesis")) {
      return renderPlantDiagram();
    } else if (t.includes("swot") || id.includes("swot")) {
      return renderSwotBullets();
    } else if (t.includes("pestel") || id.includes("pestel")) {
      return renderPestelDiagram();
    } else if (t.includes("porter") || id.includes("porter")) {
      return renderPorterDiagram();
    } else if (t.includes("finance") || id.includes("finance")) {
      return renderFinanceDashboard();
    }
    return null;
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f8fafc", overflow: "hidden", position: "relative" }}>
      {/* Top Banner */}
      <div style={{ background: "#0f172a", color: "#94a3b8", padding: "8px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>Cours : <strong>{course.title}</strong></span>
          <span style={{ color: "#334155" }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ProfileAvatar profile={activeProfile} size={18} />
            <span style={{ fontSize: 11, fontWeight: 600, color: activeProfile?.color || "#94a3b8" }}>
              {activeProfile ? `${activeProfile.lastName.toUpperCase()} ${activeProfile.firstName}` : "Invité"}
            </span>
          </div>
        </div>
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
          padding: "50px", minHeight: "850px", position: "relative", transform: `scale(${zoom / 100})`, transformOrigin: "top center", transition: "transform 0.15s ease",
          overflow: "hidden"
        }}>
          
          {/* Collaboration Mode Banner */}
          {sharedAccess && (
            <div style={{
              margin: "-50px -50px 40px -50px",
              padding: "14px 24px",
              background: sharedAccess.permission === "Peut modifier" ? "#def7ec" : (sharedAccess.permission === "Peut commenter" ? "#fef9c3" : "#f1f5f9"),
              borderBottom: sharedAccess.permission === "Peut modifier" ? "1px solid #bdecb6" : (sharedAccess.permission === "Peut commenter" ? "1px solid #fef08a" : "1px solid #cbd5e1"),
              borderRadius: "16px 16px 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 13,
              color: sharedAccess.permission === "Peut modifier" ? "#03543f" : (sharedAccess.permission === "Peut commenter" ? "#713f12" : "#334155"),
              fontWeight: 500
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: sharedAccess.permission === "Peut modifier" ? "#31c48d" : (sharedAccess.permission === "Peut commenter" ? "#eab308" : "#94a3b8"), animation: sharedAccess.permission === "Peut modifier" ? "pulse-anim 1s infinite" : "none" }}></span>
                <span>
                  {sharedAccess.permission === "Peut modifier" ? (
                    <><strong>Mode Édition</strong> : Vous collaborez en temps réel sur le tableau de <strong>{sharedAccess.ownerName}</strong>.</>
                  ) : sharedAccess.permission === "Peut commenter" ? (
                    <><strong>Mode Commentaire</strong> : Vous pouvez ajouter des commentaires sur le tableau de <strong>{sharedAccess.ownerName}</strong>.</>
                  ) : (
                    <><strong>Mode Lecture seule</strong> : Vous visualisez le tableau de <strong>{sharedAccess.ownerName}</strong>.</>
                  )}
                </span>
              </div>
              <span style={{ fontSize: 11, opacity: 0.8 }}>Session partagée</span>
            </div>
          )}

          {/* Top Right Header Circular Control Buttons (mic, save, share) or Collaboration controls */}
          <div style={{ position: "absolute", top: sharedAccess ? 62 : 20, right: 20, display: "flex", gap: 10, zIndex: 100 }}>
            {sharedAccess ? (
              <>
                <button 
                  onClick={onRefresh} 
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "0 14px", height: 36,
                    borderRadius: 18, background: "#eff6ff", border: "1px solid #bfdbfe", cursor: "pointer",
                    fontSize: 12, color: "#1e40af", fontWeight: 600, boxShadow: "0 2px 4px rgba(0,0,0,0.05)", transition: "all 0.2s"
                  }}
                  title="Actualiser le tableau"
                >
                  🔄 Actualiser
                </button>
                <button 
                  onClick={onExitCollaboration} 
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "0 14px", height: 36,
                    borderRadius: 18, background: "#fef2f2", border: "1px solid #fecaca", cursor: "pointer",
                    fontSize: 12, color: "#991b1b", fontWeight: 600, boxShadow: "0 2px 4px rgba(0,0,0,0.05)", transition: "all 0.2s"
                  }}
                  title="Quitter la collaboration"
                >
                  ✕ Quitter
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Main Title */}
          <div style={{ textAlign: "center", marginBottom: 40, marginTop: sharedAccess ? 20 : 0 }}>
            {editingTitle && !isDisabled ? (
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
                onClick={() => !isDisabled && setEditingTitle(true)}
                title={isDisabled ? "Lecture seule" : "Cliquez pour renommer"}
                style={{ 
                  color: "#15803d", fontFamily: "cursive, sans-serif", fontSize: 32, 
                  fontWeight: "normal", margin: 0, display: "inline-block", 
                  borderBottom: "2px solid #15803d", paddingBottom: 6, cursor: isDisabled ? "default" : "pointer" 
                }}
              >
                {course.title}
              </h1>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "40px", pointerEvents: activeTab === "selectionner" ? "none" : "auto" }}>
            
            {/* Left Column: Visual Diagram Concept */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Description */}
              <div style={{ position: "relative" }}>
                {editingDesc && !isDisabled ? (
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
                      width: "100%", height: 100, fontFamily: "cursive, sans-serif", fontSize: 16,
                      lineHeight: 1.6, padding: 8, border: "1px solid #cbd5e1", borderRadius: 8, outline: "none",
                      background: "#fafafa", color: selectedColor
                    }}
                  />
                ) : (
                  <p 
                    onClick={() => {
                      if (isDisabled) return;
                      setEditingDesc(true);
                      setTempDesc(course.description === "Commencer à écrire ou parlez au micro..." ? "" : course.description);
                    }}
                    title={isDisabled ? "Lecture seule" : "Cliquez pour éditer la description"}
                    style={{ 
                      color: course.descColor || selectedColor || "#1e293b", 
                      fontFamily: "cursive, sans-serif", 
                      fontSize: 16, 
                      lineHeight: 1.6, 
                      margin: 0, 
                      cursor: isDisabled ? "default" : "pointer" 
                    }}
                  >
                    {displayDescription()}
                  </p>
                )}
              </div>

              {/* Course-specific Diagram Render */}
              {renderLeftDiagram()}
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
                      {editingPtIndex === idx && !isDisabled ? (
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
                          onClick={() => !isDisabled && setEditingPtIndex(idx)}
                          style={{ cursor: isDisabled ? "default" : "pointer", flex: 1 }}
                          title={isDisabled ? "Lecture seule" : "Modifier"}
                        >
                          {pt}
                        </span>
                      )}
                      
                      {activeTab === "effacer" && !isDisabled ? (
                        <button 
                          onClick={() => onDeletePoint(idx)}
                          style={{ background: "none", border: "none", color: "#ef4444", fontSize: 14, cursor: "pointer", padding: "0 4px" }}
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      ) : (
                        !isDisabled && (
                          <span 
                            onClick={() => setEditingPtIndex(idx)}
                            style={{ fontSize: 11, color: "#94a3b8", cursor: "pointer", opacity: 0 }}
                            className="edit-hint"
                          >
                            ✏️
                          </span>
                        )
                      )}
                    </li>
                  ))}
                </ul>
                {!isDisabled && (
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
                )}
              </div>
            </div>
          </div>

          {/* Draggable & Dynamic Post-its/Cards Layer */}
          {course.cards && course.cards.map(card => {
            const isDragging = draggingCard?.id === card.id;
            const isNote = card.type === "notes_cours" || card.type === "speech_note";
            const isQuestion = card.type === "question";
            const isComment = card.type === "comment";
            
            const cardBg = isQuestion ? "#f5f3ff" : (isComment ? "#fef9c3" : (card.type === "speech_note" ? (card.color || "#fef08a") : "#f8fafc"));
            const cardBorder = isQuestion ? "1px solid #ddd6fe" : (isComment ? "1px solid #fef08a" : "1px solid #e2e8f0");
            const titleColor = card.color || (isQuestion ? "#7c3aed" : (isComment ? "#a16207" : (card.type === "speech_note" ? "#854d0e" : "#2563eb")));
            const textColor = isQuestion ? "#5b21b6" : (isComment ? "#713f12" : (card.type === "speech_note" ? "#713f12" : "#334155"));
            const borderDash = (isNote || isComment) ? "1px dashed #cbd5e1" : "1px dashed #ddd6fe";

            const canDeleteCard = !sharedAccess || 
                                  sharedAccess.permission === "Peut modifier" || 
                                  (sharedAccess.permission === "Peut commenter" && card.createdBy === (activeProfile?.email || "guest@ideagrid.com"));

            const canEditCard = !sharedAccess || 
                                sharedAccess.permission === "Peut modifier" || 
                                (sharedAccess.permission === "Peut commenter" && card.createdBy === (activeProfile?.email || "guest@ideagrid.com"));

            return (
              <div
                key={card.id}
                onPointerDown={(e) => onPointerDown(e, card)}
                style={{
                  position: "absolute",
                  left: card.x,
                  top: card.y,
                  width: 250,
                  cursor: activeTab === "selectionner" && canEditCard ? "move" : "default",
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
                {(isQuestion || isNote || isComment || card.isPinned) && renderPin(card.color)}
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, borderBottom: borderDash, paddingBottom: 6 }}>
                  <span style={{ 
                    fontWeight: "normal", 
                    fontSize: 16, 
                    color: titleColor,
                    fontFamily: "cursive, sans-serif"
                  }}>
                    {card.title}
                  </span>
                  
                  {canDeleteCard && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteCard(card.id); }}
                      style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", fontSize: 14 }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div>
                  {editingCardId === card.id && canEditCard ? (
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
                        if (!canEditCard) return;
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
                        cursor: canEditCard ? "pointer" : "default",
                        lineHeight: 1.5
                      }}
                      title={!canEditCard ? "Lecture seule" : (activeTab === "effacer" ? "Cliquer pour effacer" : "Cliquer pour modifier")}
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

        {activeTab === "ecrire" && !isReadOnly && (
          <>
            <div style={{ width: 1, height: 20, background: "#cbd5e1" }}></div>
            {isCommentOnly ? (
              <button 
                onClick={onAddCommentCard}
                style={{ 
                  border: "1px solid #ca8a04", borderRadius: 8, padding: "6px 14px", cursor: "pointer", 
                  fontSize: 13, background: "#fef9c3", 
                  color: "#854d0e", fontWeight: 600,
                  transition: "all 0.15s"
                }}
              >
                💬 Ajouter un commentaire
              </button>
            ) : (
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
            )}
          </>
        )}
      </div>

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
        @keyframes toastSlideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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

// ── Export Modal ──────────────────────────────────────────────────────────────
function ExportModal({ isOpen, onClose, courses, activeCourseId, selectedFormatDefault, onExport }) {
  const [selectedCourseId, setSelectedCourseId] = useState(activeCourseId);
  const [selectedFormat, setSelectedFormat] = useState(selectedFormatDefault || "pdf");

  if (!isOpen) return null;

  const handleExportClick = () => {
    const course = courses.find(c => c.id === selectedCourseId);
    if (course) {
      onClose();
      setTimeout(() => {
        onExport(course, selectedFormat);
      }, 150);
    }
  };

  const formats = [
    { id: "pdf", title: "Exporter en PDF", desc: "Idéal pour l'impression ou le partage", icon: "📄", bg: "#fef2f2", color: "#ef4444" },
    { id: "png", title: "Exporter en image (PNG)", desc: "Image de haute qualité", icon: "🖼️", bg: "#ecfdf5", color: "#10b981" },
    { id: "svg", title: "Exporter en SVG", desc: "Idéal pour une utilisation dans des présentations", icon: "📐", bg: "#eff6ff", color: "#3b82f6" },
    { id: "json", title: "Exporter en fichier IdeaGrid", desc: "Conserve toutes les fonctionnalités", icon: "💾", bg: "#faf5ff", color: "#a855f7" }
  ];

  return (
    <ModalBackdrop onClose={onClose}>
      <div style={{
        background: "white", width: 520, maxWidth: "95%", borderRadius: 20,
        padding: 28, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Exporter</h3>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>Téléchargez votre tableau dans différents formats.</p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#475569"} onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}>✕</button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 8 }}>Sélectionner le cours à exporter</label>
          <select 
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #cbd5e1",
              background: "#f8fafc", fontSize: 14, color: "#0f172a", outline: "none", cursor: "pointer"
            }}
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Format d'exportation</label>
          {formats.map(f => {
            const isSelected = selectedFormat === f.id;
            return (
              <div 
                key={f.id}
                onClick={() => setSelectedFormat(f.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "14px 18px",
                  borderRadius: 12, border: isSelected ? `2px solid ${f.color}` : "1px solid #e2e8f0",
                  background: isSelected ? `${f.bg}40` : "white", cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 8, background: f.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
                }}>
                  {f.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{f.title}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{f.desc}</div>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", border: isSelected ? `6px solid ${f.color}` : "2px solid #cbd5e1",
                  boxSizing: "border-box", transition: "all 0.15s"
                }} />
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button 
            onClick={onClose}
            style={{
              padding: "10px 20px", border: "1px solid #cbd5e1", borderRadius: 10,
              background: "white", color: "#334155", fontSize: 14, fontWeight: 500, cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
            onMouseLeave={(e) => e.currentTarget.style.background = "white"}
          >
            Annuler
          </button>
          <button 
            onClick={handleExportClick}
            style={{
              padding: "10px 24px", border: "none", borderRadius: 10,
              background: "#2563eb", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)", transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#1d4ed8"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#2563eb"}
          >
            Exporter
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ── Course Thumbnail Component ───────────────────────────────────────────────
function CourseThumbnail({ course }) {
  const t = course.title.toLowerCase();
  const id = course.id.toLowerCase();

  // SWOT Thumbnail (grid panel style matching image)
  if (t.includes("swot") || id.includes("swot")) {
    return (
      <div style={{
        width: 120, height: 80, background: "white", border: "1px solid #cbd5e1", borderRadius: 6,
        padding: "4px 8px", display: "flex", flexDirection: "column", gap: 2, fontSize: 6, overflow: "hidden", userSelect: "none"
      }}>
        <div style={{ textAlign: "center", fontSize: 6, fontWeight: 700, color: "#1e293b", letterSpacing: "0.2px", marginBottom: 2 }}>ANALYSE SWOT</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, flex: 1 }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #dcfce7", borderRadius: 2, padding: "2px 3px", color: "#16a34a", fontWeight: "bold" }}>
            Forces
            <div style={{ height: 1, background: "#cbd5e1", width: "80%", marginTop: 2 }} />
            <div style={{ height: 1, background: "#cbd5e1", width: "60%", marginTop: 1 }} />
          </div>
          <div style={{ background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: 2, padding: "2px 3px", color: "#ea580c", fontWeight: "bold" }}>
            Faiblesses
            <div style={{ height: 1, background: "#cbd5e1", width: "70%", marginTop: 2 }} />
            <div style={{ height: 1, background: "#cbd5e1", width: "50%", marginTop: 1 }} />
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #dbeafe", borderRadius: 2, padding: "2px 3px", color: "#2563eb", fontWeight: "bold" }}>
            Opportunités
          </div>
          <div style={{ background: "#fbf7ff", border: "1px solid #f3e8ff", borderRadius: 2, padding: "2px 3px", color: "#9333ea", fontWeight: "bold" }}>
            Menaces
          </div>
        </div>
      </div>
    );
  }

  // PESTEL Thumbnail
  if (t.includes("pestel") || id.includes("pestel")) {
    return (
      <div style={{
        width: 120, height: 80, background: "white", border: "1px solid #cbd5e1", borderRadius: 6,
        padding: "4px 8px", display: "flex", flexDirection: "column", gap: 3, fontSize: 6, overflow: "hidden", userSelect: "none"
      }}>
        <div style={{ textAlign: "center", fontSize: 6, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>ANALYSE PESTEL</div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 1, marginTop: 2 }}>
          {["P", "E", "S", "T", "E", "L"].map((l, i) => {
            const colors = ["#3b82f6", "#3b82f6", "#ea580c", "#ea580c", "#22c55e", "#a855f7"];
            return (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: "50%", background: colors[i], color: "white",
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 6
              }}>{l}</div>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 4, padding: "0 2px" }}>
          <div style={{ height: 2, background: "#cbd5e1", width: "90%" }} />
          <div style={{ height: 2, background: "#e2e8f0", width: "70%" }} />
        </div>
      </div>
    );
  }

  // Porter Thumbnail
  if (t.includes("porter") || id.includes("porter")) {
    return (
      <div style={{
        width: 120, height: 80, background: "white", border: "1px solid #cbd5e1", borderRadius: 6,
        padding: "4px 8px", display: "flex", flexDirection: "column", gap: 2, fontSize: 5, overflow: "hidden", position: "relative", userSelect: "none"
      }}>
        <div style={{ textAlign: "center", fontSize: 6, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>LES 5 FORCES DE PORTER</div>
        <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", width: 28, height: 8, background: "#fff7ed", border: "1px solid #f97316", borderRadius: 1 }} />
        <div style={{ position: "absolute", top: 30, left: 6, width: 24, height: 8, background: "#eff6ff", border: "1px solid #3b82f6", borderRadius: 1 }} />
        <div style={{ position: "absolute", top: 28, left: "50%", transform: "translateX(-50%)", width: 34, height: 12, background: "#f0fdf4", border: "1px solid #16a34a", borderRadius: 1 }} />
        <div style={{ position: "absolute", top: 30, right: 6, width: 24, height: 8, background: "#eff6ff", border: "1px solid #3b82f6", borderRadius: 1 }} />
        <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", width: 28, height: 8, background: "#fbf7ff", border: "1px solid #a855f7", borderRadius: 1 }} />
      </div>
    );
  }

  // Finance Thumbnail
  if (t.includes("finance") || id.includes("finance")) {
    return (
      <div style={{
        width: 120, height: 80, background: "white", border: "1px solid #cbd5e1", borderRadius: 6,
        padding: "4px 8px", display: "flex", flexDirection: "column", gap: 2, fontSize: 6, overflow: "hidden", userSelect: "none"
      }}>
        <div style={{ textAlign: "center", fontSize: 6, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>ANALYSE FINANCIÈRE</div>
        <div style={{ display: "flex", gap: 4, marginTop: 2, height: 16 }}>
          <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 2, display: "flex", alignItems: "flex-end", padding: 1, gap: 1 }}>
            <div style={{ height: "40%", width: 2, background: "#94a3b8" }} />
            <div style={{ height: "60%", width: 2, background: "#94a3b8" }} />
            <div style={{ height: "80%", width: 2, background: "#2563eb" }} />
          </div>
          <div style={{ flex: 1.5, border: "1px solid #e2e8f0", borderRadius: 2, padding: "1px 2px", display: "flex", flexDirection: "column", gap: 1 }}>
            <div style={{ height: 1, background: "#cbd5e1", width: "95%" }} />
            <div style={{ height: 1, background: "#cbd5e1", width: "70%" }} />
            <div style={{ height: 1, background: "#e2e8f0", width: "50%" }} />
          </div>
        </div>
        <svg width="100%" height="20" style={{ marginTop: 2 }}>
          <path d="M5 16 L 25 15 L 50 8 L 75 10 L 105 3" fill="none" stroke="#2563eb" strokeWidth="1" />
          <circle cx="105" cy="3" r="1.2" fill="#2563eb" />
        </svg>
      </div>
    );
  }

  // Photosynthèse / Default Thumbnail
  return (
    <div style={{
      width: 120, height: 80, background: "white", border: "1px solid #cbd5e1", borderRadius: 6,
      padding: "4px 8px", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden", position: "relative", userSelect: "none"
    }}>
      <div style={{ textAlign: "center", fontSize: 6, fontWeight: 700, color: "#16a34a", fontFamily: "cursive, sans-serif" }}>La photosynthèse</div>
      <div style={{ position: "absolute", top: 15, left: 10, fontSize: 8 }}>☀️</div>
      <div style={{ textAlign: "center", fontSize: 24, marginTop: 2 }}>🌱</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 5, color: "#64748b" }}>
        <span>CO₂ ➔</span>
        <span>➔ O₂</span>
      </div>
    </div>
  );
}

// ── Full-screen History View Component ─────────────────────────────────────────
function HistoryView({ courses, activeId, onLoad, onDelete, onRename }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    const handleCloseMenu = () => setActiveMenuId(null);
    window.addEventListener("click", handleCloseMenu);
    return () => window.removeEventListener("click", handleCloseMenu);
  }, []);

  const filteredCourses = courses.filter(c => {
    const titleMatch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = c.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "Tous") return titleMatch || descMatch;
    if (activeFilter === "Aujourd'hui") return (c.dateLabel === "Aujourd'hui" && (titleMatch || descMatch));
    if (activeFilter === "Cette semaine") return ((c.dateLabel === "Aujourd'hui" || c.dateLabel === "Hier") && (titleMatch || descMatch));
    if (activeFilter === "Ce mois") return titleMatch || descMatch;
    return titleMatch || descMatch;
  });

  const groups = {};
  filteredCourses.forEach(c => {
    const label = c.dateLabel || "Aujourd'hui";
    if (!groups[label]) groups[label] = [];
    groups[label].push(c);
  });

  const orderedGroups = ["Aujourd'hui", "Hier", "Avant-hier", "Plus ancien"].filter(g => groups[g] && groups[g].length > 0);

  return (
    <div style={{ flex: 1, background: "#f8fafc", padding: "40px 60px", overflowY: "auto", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ maxWidth: 900, width: "100%", margin: "0 auto", flex: 1 }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#0f172a" }}>Historique</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>Retrouvez toutes vos pages</p>
          </div>
          
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <span style={{ position: "absolute", left: 12, color: "#94a3b8", fontSize: 14 }}>🔍</span>
              <input 
                placeholder="Rechercher..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  padding: "10px 16px 10px 32px", borderRadius: 8, border: "1px solid #cbd5e1", 
                  outline: "none", fontSize: 13, width: 220, background: "white",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)", color: "#1e293b"
                }}
              />
            </div>
            <button style={{
              background: "white", border: "1px solid #cbd5e1", borderRadius: 8, width: 38, height: 38,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b"
            }}>
              🎛️
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["Tous", "Aujourd'hui", "Cette semaine", "Ce mois", "Personnalisé 📅"].map(tab => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => tab !== "Personnalisé 📅" && setActiveFilter(tab)}
                style={{
                  padding: "6px 16px", borderRadius: 20, 
                  border: isActive ? "none" : "1px solid #cbd5e1",
                  background: isActive ? "#2563eb" : "white",
                  color: isActive ? "white" : "#64748b",
                  fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s"
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Grouped courses list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 40 }}>
          {orderedGroups.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b", background: "white", borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 13 }}>
              Aucune page enregistrée dans l'historique de ce profil.
            </div>
          ) : (
            orderedGroups.map(groupLabel => (
              <div key={groupLabel} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", paddingLeft: 4 }}>
                  {groupLabel}
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {groups[groupLabel].map(c => {
                    const tLower = c.title.toLowerCase();
                    const isSwot = tLower.includes("swot");
                    const isPhotosynthese = tLower.includes("photo");
                    const isPestel = tLower.includes("pestel");
                    const isPorter = tLower.includes("porter");
                    const isFinance = tLower.includes("finance");
                    
                    let badge = { text: "Général", bg: "#f1f5f9", color: "#475569" };
                    if (isSwot) badge = { text: "Management stratégique", bg: "#f0fdf4", color: "#16a34a" };
                    else if (isPhotosynthese) badge = { text: "Biologie", bg: "#f0fdf4", color: "#16a34a" };
                    else if (isPestel) badge = { text: "Stratégie", bg: "#eff6ff", color: "#2563eb" };
                    else if (isPorter) badge = { text: "Marketing stratégique", bg: "#fbf7ff", color: "#9333ea" };
                    else if (isFinance) badge = { text: "Finance", bg: "#fff7ed", color: "#ea580c" };

                    const isSelected = activeId === c.id;

                    return (
                      <div 
                        key={c.id}
                        onClick={() => onLoad(c.id)}
                        style={{
                          background: "white", border: isSelected ? "1.5px solid #2563eb" : "1px solid #cbd5e1", borderRadius: 12, padding: 16,
                          display: "flex", gap: 20, alignItems: "center", cursor: "pointer", transition: "all 0.15s",
                          boxShadow: "0 1px 3px rgba(15,23,42,0.02)"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = isSelected ? "#2563eb" : "#94a3b8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = isSelected ? "#2563eb" : "#cbd5e1"; e.currentTarget.style.transform = "none"; }}
                      >
                        <CourseThumbnail course={c} />

                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>{c.title}</h3>
                            <span style={{ fontSize: 11, background: badge.bg, color: badge.color, padding: "2px 8px", borderRadius: 12, fontWeight: 500 }}>
                              {badge.text}
                            </span>
                          </div>
                          <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 450 }}>
                            {c.description === "Commencer à écrire ou parlez au micro..." ? "Aucun contenu enregistré..." : c.description}
                          </p>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
                            1 page
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0, position: "relative" }}>
                          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{c.timeLabel || "10:45"}</span>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === c.id ? null : c.id);
                            }}
                            style={{
                              border: "none", background: "none", cursor: "pointer", color: "#64748b", fontSize: 18,
                              padding: 6, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "background 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                            title="Menu actions"
                          >
                            •••
                          </button>

                          {activeMenuId === c.id && (
                            <div style={{
                              position: "absolute", right: 0, top: 32, background: "white", borderRadius: 8,
                              border: "1px solid #cbd5e1", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                              zIndex: 100, width: 140, display: "flex", flexDirection: "column", padding: 4
                            }}>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onLoad(c.id); }}
                                style={{
                                  background: "none", border: "none", padding: "8px 12px", fontSize: 12, cursor: "pointer",
                                  textAlign: "left", color: "#334155", borderRadius: 4, width: "100%", fontWeight: 500
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                              >
                                📖 Ouvrir le cours
                              </button>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  const name = prompt("Renommer le cours :", c.title);
                                  if (name && name.trim()) onRename(c.id, name.trim());
                                }}
                                style={{
                                  background: "none", border: "none", padding: "8px 12px", fontSize: 12, cursor: "pointer",
                                  textAlign: "left", color: "#334155", borderRadius: 4, width: "100%", fontWeight: 500
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                              >
                                ✏️ Renommer
                              </button>
                              <div style={{ height: 1, background: "#e2e8f0", margin: "4px 0" }} />
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if (confirm(`Supprimer le cours "${c.title}" ?`)) onDelete(c.id); 
                                }}
                                style={{
                                  background: "none", border: "none", padding: "8px 12px", fontSize: 12, cursor: "pointer",
                                  textAlign: "left", color: "#ef4444", borderRadius: 4, width: "100%", fontWeight: 600
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                              >
                                🗑️ Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ 
        borderTop: "1px solid #e2e8f0", padding: "12px 24px", display: "flex", 
        justifyContent: "space-between", alignItems: "center", background: "white" 
      }}>
        <div style={{ fontSize: 13, color: "#64748b" }}>
          {filteredCourses.length} éléments au total
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button style={{ border: "1px solid #cbd5e1", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>🔍</button>
          <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>100%</span>
          <button style={{ border: "1px solid #cbd5e1", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          <button style={{ border: "1px solid #cbd5e1", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
          <div style={{ width: 1, height: 16, background: "#cbd5e1" }}></div>
          <button style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 13, background: "#fff", display: "flex", alignItems: "center", gap: 4 }}>
            🖐️
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Share View Component ────────────────────────────────────────────────────────
function ShareView({ activeProfile, courses, activeCourse, setToastMessage, setCurrentCourseId }) {
  const [inviteInput, setInviteInput] = useState("");
  const [inviteRole, setInviteRole] = useState("Peut modifier");
  const [showExportModal, setShowExportModal] = useState(false);
  const [defaultExportFormat, setDefaultExportFormat] = useState("pdf");
  
  const [collaborators, setCollaborators] = useState(() => {
    const key = `ideagrid_collaborators_${activeProfile?.id || "guest"}`;
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    return [
      { id: "collab-1", name: "Marie Dupont", email: "marie.dupont@ecole.fr", role: "Peut modifier", color: "#a855f7" },
      { id: "collab-2", name: "Lucas Martin", email: "lucas.martin@ecole.fr", role: "Peut commenter", color: "#22c55e" },
      { id: "collab-3", name: "Classe 2nde 3", email: "classe2nde3@ecole.fr", role: "Peut consulter", color: "#ea580c" }
    ];
  });

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;

    const text = inviteInput.trim();
    const isEmail = text.includes("@");
    const email = isEmail ? text : `${text.toLowerCase().replace(/\s+/g, ".")}@ecole.fr`;
    const name = isEmail ? text.split("@")[0].split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ") : text;
    
    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newCollab = {
      id: "collab-" + Date.now(),
      name,
      email,
      role: inviteRole,
      color: randomColor
    };

    const updated = [...collaborators, newCollab];
    setCollaborators(updated);
    const key = `ideagrid_collaborators_${activeProfile?.id || "guest"}`;
    localStorage.setItem(key, JSON.stringify(updated));
    setInviteInput("");

    // 1. Sync profile and courses to the backend first
    try {
      await fetch(getApiUrl('/api/sync-profile'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: activeProfile?.id || "guest",
          profile: activeProfile || { id: "guest", firstName: "Invité", lastName: "IdeaGrid", email: "guest@ideagrid.com", color: "#3b82f6" },
          courses: courses
        })
      });
    } catch (err) {
      console.error("Failed to sync profile to backend before sharing", err);
    }

    // 2. Send invitation email
    try {
      const ownerId = activeProfile?.id || "guest";
      const ownerName = activeProfile ? `${activeProfile.firstName} ${activeProfile.lastName}` : "Invité";
      const courseLink = `${window.location.origin}/#shared-profile?ownerId=${ownerId}&permission=${encodeURIComponent(inviteRole)}&ownerName=${encodeURIComponent(ownerName)}`;
      
      const response = await fetch(getApiUrl('/api/share-course'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          courseTitle: activeCourse.title,
          role: inviteRole,
          courseLink,
          senderName: ownerName
        })
      });
      const result = await response.json();
      if (result.success) {
        setToastMessage(`Invitation envoyée par email à ${email} !`);
        setTimeout(() => setToastMessage(""), 4000);
      } else {
        console.error("API error sharing course", result);
        setToastMessage(`Erreur d'envoi. Collaborateur ajouté localement.`);
        setTimeout(() => setToastMessage(""), 3000);
      }
    } catch (err) {
      console.error("Network error sharing course", err);
      setToastMessage(`Collaborateur ${name} ajouté localement.`);
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const handleRemoveCollaborator = (id) => {
    const updated = collaborators.filter(c => c.id !== id);
    setCollaborators(updated);
    const key = `ideagrid_collaborators_${activeProfile?.id || "guest"}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const handleRoleChange = (id, newRole) => {
    const updated = collaborators.map(c => c.id === id ? { ...c, role: newRole } : c);
    setCollaborators(updated);
    const key = `ideagrid_collaborators_${activeProfile?.id || "guest"}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const handleCopyLink = () => {
    const ownerId = activeProfile?.id || "guest";
    const ownerName = activeProfile ? `${activeProfile.firstName} ${activeProfile.lastName}` : "Invité";
    const shareLink = `${window.location.origin}/#shared-profile?ownerId=${ownerId}&permission=${encodeURIComponent("Peut consulter")}&ownerName=${encodeURIComponent(ownerName)}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setToastMessage("Lien de partage copié dans le presse-papiers !");
      setTimeout(() => setToastMessage(""), 3000);
    }).catch(err => {
      console.error("Failed to copy link", err);
    });
  };

  const handleExportPDF = (course = activeCourse) => {
    const originalTab = activeTab;
    setCurrentCourseId(course.id);
    setActiveTab("ecrire");
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setActiveTab(originalTab);
      }, 100);
    }, 450);
  };

  const handleExportJSON = (course = activeCourse) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(course, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${course.title.toLowerCase().replace(/\s+/g, "_")}_ideagrid.json`);
    dlAnchorElem.click();
    setToastMessage("Fichier IdeaGrid JSON téléchargé !");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleExportSVG = (course = activeCourse) => {
    let cardG = '';
    (course.cards || []).forEach((c) => {
      cardG += `
      <g transform="translate(${c.x || 100}, ${c.y || 100})">
        <rect width="220" height="130" rx="8" fill="${c.color || '#eff6ff'}" stroke="#cbd5e1" stroke-width="1.5" />
        <circle cx="200" cy="15" r="5" fill="#ef4444" />
        <text x="15" y="30" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a">${c.title || 'Notes'}</text>
        <text x="15" y="55" font-family="sans-serif" font-size="12" fill="#334155">${c.content || ''}</text>
      </g>`;
    });

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1000" width="1000" height="830" style="background:#f8fafc; font-family: sans-serif;">
      <rect width="1200" height="1000" fill="#f8fafc"/>
      <rect width="1200" height="80" fill="#0f172a" />
      <text x="40" y="48" font-family="sans-serif" font-size="20" font-weight="bold" fill="#ffffff">IdeaGrid Smart Whiteboard</text>
      
      <text x="60" y="150" font-family="sans-serif" font-size="32" font-weight="bold" fill="#1e293b">${course.title}</text>
      <text x="60" y="210" font-family="sans-serif" font-size="16" fill="#2563eb" font-weight="bold">Description du cours :</text>
      <text x="60" y="240" font-family="cursive, sans-serif" font-size="18" fill="#334155">${course.description || ''}</text>
      
      <text x="650" y="150" font-family="sans-serif" font-size="22" font-weight="bold" fill="#2563eb">Points clés</text>
      ${(course.pointsCles || []).map((pt, idx) => `<text x="650" y="${190 + idx * 30}" font-family="sans-serif" font-size="14" fill="#475569">• ${pt}</text>`).join('')}
      
      <text x="650" y="${190 + (course.pointsCles || []).length * 30 + 30}" font-family="sans-serif" font-size="22" font-weight="bold" fill="#9333ea">Question Clé</text>
      <text x="650" y="${190 + (course.pointsCles || []).length * 30 + 60}" font-family="sans-serif" font-size="14" fill="#475569">${course.question || ''}</text>
      
      ${cardG}
    </svg>`;

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${course.title.toLowerCase().replace(/\s+/g, "_")}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    setToastMessage("Tableau exporté en SVG !");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleExportPNG = (course = activeCourse) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('IdeaGrid Smart Whiteboard', 40, 48);
    
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(course.title, 60, 150);
    
    ctx.fillStyle = '#2563eb';
    ctx.font = '16px sans-serif';
    ctx.fillText('Description du cours :', 60, 210);
    
    ctx.fillStyle = '#334155';
    ctx.font = 'italic 18px cursive, sans-serif';
    
    const descText = course.description || "Aucune description...";
    const words = descText.split(' ');
    let line = '';
    let y = 245;
    const maxWidth = 550;
    const lineHeight = 28;
    
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, 60, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 60, y);
    
    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('Points clés', 650, 150);
    
    ctx.fillStyle = '#475569';
    ctx.font = '16px sans-serif';
    let py = 195;
    (course.pointsCles || []).forEach((pt) => {
      ctx.fillText(`•  ${pt}`, 650, py);
      py += 32;
    });
    
    ctx.fillStyle = '#9333ea';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('Question Clé', 650, py + 20);
    
    ctx.fillStyle = '#475569';
    ctx.font = '16px sans-serif';
    ctx.fillText(course.question || 'Pourquoi ?', 650, py + 55);
    
    (course.cards || []).forEach(card => {
      const cx = card.x || 100;
      const cy = card.y || 100;
      
      ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      
      ctx.fillStyle = card.color || '#eff6ff';
      ctx.fillRect(cx, cy, 220, 130);
      
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx, cy, 220, 130);
      
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx + 200, cy + 15, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(card.title || 'Notes', cx + 15, cy + 30);
      
      ctx.fillStyle = '#334155';
      ctx.font = '12px sans-serif';
      
      const contentText = card.content || '';
      const cWords = contentText.split(' ');
      let cLine = '';
      let cyOffset = cy + 55;
      for (let n = 0; n < cWords.length; n++) {
        let testLine = cLine + cWords[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > 190 && n > 0) {
          ctx.fillText(cLine, cx + 15, cyOffset);
          cLine = cWords[n] + ' ';
          cyOffset += 18;
        } else {
          cLine = testLine;
        }
      }
      ctx.fillText(cLine, cx + 15, cyOffset);
    });
    
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${course.title.toLowerCase().replace(/\s+/g, '_')}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setToastMessage("Tableau exporté en PNG !");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const getInitials = (fullName) => {
    return fullName.split(" ").map(s => s.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div style={{ flex: 1, background: "#f8fafc", padding: "40px 60px", overflowY: "auto", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ maxWidth: 900, width: "100%", margin: "0 auto", flex: 1 }}>
        
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#0f172a" }}>Partager</h2>
          <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>Partagez votre tableau avec d'autres personnes ou exportez-le.</p>
        </div>

        <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
          
          <div style={{ flex: 1.5, display: "flex", flexDirection: "column", gap: 24 }}>
            
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #cbd5e1", padding: 24, boxShadow: "0 1px 3px rgba(15,23,42,0.02)" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15, fontWeight: 600, color: "#0f172a" }}>Partager avec des personnes</h3>
              
              <form onSubmit={handleAddCollaborator} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
                  <span style={{ position: "absolute", left: 12, color: "#94a3b8", fontSize: 14 }}>👤</span>
                  <input 
                    placeholder="Ajouter un nom, un e-mail ou un groupe..." 
                    value={inviteInput}
                    onChange={(e) => setInviteInput(e.target.value)}
                    style={{ 
                      padding: "10px 16px 10px 36px", borderRadius: 8, border: "1px solid #cbd5e1", 
                      outline: "none", fontSize: 13, width: "100%", background: "white", color: "#1e293b"
                    }}
                  />
                </div>
                
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{
                    padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1",
                    background: "white", outline: "none", fontSize: 13, color: "#334155", cursor: "pointer"
                  }}
                >
                  <option value="Peut modifier">Peut modifier</option>
                  <option value="Peut commenter">Peut commenter</option>
                  <option value="Peut consulter">Peut consulter</option>
                </select>

                <button 
                  type="submit"
                  style={{
                    background: "#2563eb", border: "none", borderRadius: 8, color: "white",
                    padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    boxShadow: "0 2px 4px rgba(37,99,235,0.15)", transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#1d4ed8"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#2563eb"}
                >
                  Inviter
                </button>
              </form>

              <h4 style={{ margin: "24px 0 12px 0", fontSize: 13, fontWeight: 600, color: "#475569" }}>Personnes ayant accès</h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", background: "#eff6ff", color: "#3b82f6",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, border: "1.5px solid #3b82f6"
                    }}>
                      {activeProfile ? getInitials(`${activeProfile.firstName} ${activeProfile.lastName}`) : "VI"}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                        {activeProfile ? `${activeProfile.firstName} ${activeProfile.lastName.toUpperCase()}` : "Vous"} <span style={{ fontSize: 11, color: "#64748b", fontWeight: "normal" }}>(propriétaire)</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{activeProfile?.email || "vous@ideagrid.com"}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Propriétaire</span>
                </div>

                {collaborators.map(c => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%", background: `${c.color}15`, color: c.color,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, border: `1.5px solid ${c.color}`
                      }}>
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{c.email}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <select 
                        value={c.role}
                        onChange={(e) => handleRoleChange(c.id, e.target.value)}
                        style={{
                          border: "none", background: "transparent", fontSize: 12, color: "#64748b",
                          fontWeight: 500, cursor: "pointer", outline: "none"
                        }}
                      >
                        <option value="Peut modifier">Peut modifier</option>
                        <option value="Peut commenter">Peut commenter</option>
                        <option value="Peut consulter">Peut consulter</option>
                      </select>

                      <button 
                        onClick={() => handleRemoveCollaborator(c.id)}
                        style={{
                          border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8",
                          fontSize: 14, padding: "2px 6px", display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "color 0.15s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "white", borderRadius: 12, border: "1px solid #cbd5e1", padding: 24, boxShadow: "0 1px 3px rgba(15,23,42,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20, color: "#10b981" }}>🔗</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Lien de partage</h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#64748b" }}>Toute personne disposant du lien peut consulter. <span style={{ color: "#2563eb", cursor: "pointer" }}>Changer les permissions</span></p>
                </div>
              </div>
              
              <button 
                onClick={handleCopyLink}
                style={{
                  background: "white", border: "1px solid #cbd5e1", borderRadius: 8, color: "#334155",
                  padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.15s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "white"; }}
              >
                Copier le lien
              </button>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
            
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #cbd5e1", padding: 24, boxShadow: "0 1px 3px rgba(15,23,42,0.02)" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#0f172a" }}>Exporter</h3>
              <p style={{ margin: "4px 0 16px 0", fontSize: 11, color: "#64748b" }}>Téléchargez votre tableau dans différents formats.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                
                <button 
                  onClick={() => { setDefaultExportFormat("pdf"); setShowExportModal(true); }}
                  style={{
                    display: "flex", gap: 12, alignItems: "center", padding: 12, border: "1px solid #e2e8f0",
                    borderRadius: 8, background: "white", width: "100%", cursor: "pointer", textAlign: "left", transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "white"; }}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, background: "#fef2f2", color: "#ef4444", borderRadius: 6, fontSize: 14 }}>📄</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>Exporter en PDF</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Idéal pour l'impression ou le partage</div>
                  </div>
                </button>

                <button 
                  onClick={() => { setDefaultExportFormat("png"); setShowExportModal(true); }}
                  style={{
                    display: "flex", gap: 12, alignItems: "center", padding: 12, border: "1px solid #e2e8f0",
                    borderRadius: 8, background: "white", width: "100%", cursor: "pointer", textAlign: "left", transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "white"; }}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, background: "#fdf4ff", color: "#d946ef", borderRadius: 6, fontSize: 14 }}>🖼️</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>Exporter en image (PNG)</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Image de haute qualité</div>
                  </div>
                </button>

                <button 
                  onClick={() => { setDefaultExportFormat("svg"); setShowExportModal(true); }}
                  style={{
                    display: "flex", gap: 12, alignItems: "center", padding: 12, border: "1px solid #e2e8f0",
                    borderRadius: 8, background: "white", width: "100%", cursor: "pointer", textAlign: "left", transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "white"; }}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, background: "#eff6ff", color: "#3b82f6", borderRadius: 6, fontSize: 14 }}>📐</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>Exporter en SVG</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Idéal pour une utilisation dans des présentations</div>
                  </div>
                </button>

                <button 
                  onClick={() => { setDefaultExportFormat("json"); setShowExportModal(true); }}
                  style={{
                    display: "flex", gap: 12, alignItems: "center", padding: 12, border: "1px solid #e2e8f0",
                    borderRadius: 8, background: "white", width: "100%", cursor: "pointer", textAlign: "left", transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "white"; }}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, background: "#fffbeb", color: "#f59e0b", borderRadius: 6, fontSize: 14 }}>💾</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>Exporter en fichier IdeaGrid</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Conserve toutes les fonctionnalités</div>
                  </div>
                </button>
              </div>
            </div>

            <div style={{ background: "white", borderRadius: 12, border: "1px solid #cbd5e1", padding: 24, boxShadow: "0 1px 3px rgba(15,23,42,0.02)" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Partager sur</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                
                <a 
                  href={`https://classroom.google.com/share?url=${encodeURIComponent(window.location.origin + '/#course=' + encodeCourse(activeCourse))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", border: "1px solid #e2e8f0",
                    borderRadius: 8, background: "white", color: "#334155", textDecoration: "none", fontSize: 12, fontWeight: 500, transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "white"; }}
                >
                  <span style={{ fontSize: 16 }}>🟢</span> Google Classroom
                </a>

                <a 
                  href={`https://teams.microsoft.com/l/share?url=${encodeURIComponent(window.location.origin + '/#course=' + encodeCourse(activeCourse))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", border: "1px solid #e2e8f0",
                    borderRadius: 8, background: "white", color: "#334155", textDecoration: "none", fontSize: 12, fontWeight: 500, transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "white"; }}
                >
                  <span style={{ fontSize: 16 }}>🟣</span> Microsoft Teams
                </a>

                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: activeCourse.title,
                        text: `Découvrez mon tableau IdeaGrid: ${activeCourse.title}`,
                        url: window.location.origin + '/#course=' + encodeCourse(activeCourse)
                      });
                    } else {
                      handleCopyLink();
                    }
                  }}
                  style={{
                    display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", border: "1px solid #e2e8f0",
                    borderRadius: 8, background: "white", width: "100%", cursor: "pointer", textAlign: "left", color: "#334155", fontSize: 12, fontWeight: 500, transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "white"; }}
                >
                  <span style={{ fontSize: 16 }}>💬</span> Autres applications
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showExportModal && (
        <ExportModal 
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          courses={courses}
          activeCourseId={activeCourse.id}
          selectedFormatDefault={defaultExportFormat}
          onExport={(selectedCourse, format) => {
            if (format === 'pdf') handleExportPDF(selectedCourse);
            else if (format === 'png') handleExportPNG(selectedCourse);
            else if (format === 'svg') handleExportSVG(selectedCourse);
            else if (format === 'json') handleExportJSON(selectedCourse);
          }}
        />
      )}
    </div>
  );
}

// ── Full-screen Home View Component ────────────────────────────────────────────
function HomeView({ profiles, activeProfileId, onSelectProfile, onOpenNewUserModal }) {
  return (
    <div style={{ flex: 1, background: "#f8fafc", padding: "40px 60px", overflowY: "auto", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ maxWidth: 900, width: "100%", margin: "0 auto", flex: 1 }}>
        
        {/* Welcome Banner */}
        <div style={{ textAlign: "center", marginBottom: 36, marginTop: 10 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#0f172a", margin: 0, fontFamily: "sans-serif" }}>
            Bienvenue sur <span style={{ color: "#3b82f6" }}>IdeaGrid</span>
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", marginTop: 10, maxWidth: 600, margin: "10px auto 0", lineHeight: 1.5 }}>
            Votre tableau intelligent pour organiser, analyser et comprendre vos idées.
          </p>
        </div>

        {/* Profiles Grid Container */}
        <div style={{ background: "white", borderRadius: 16, padding: 30, boxShadow: "0 1px 3px rgba(15,23,42,0.05)", marginBottom: 24, border: "1px solid #cbd5e1" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>👤</span>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: 0 }}>Choisir un profil</h2>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 24px 28px" }}>
            Sélectionnez un profil pour continuer ou utilisez le mode invité.
          </p>

          <div style={{ display: "flex", gap: 16, alignItems: "center", overflowX: "auto", paddingBottom: 10 }}>
            {profiles.length === 0 ? (
              <div style={{ 
                padding: "24px", color: "#64748b", background: "#f8fafc", 
                borderRadius: 12, border: "1.5px dashed #cbd5e1", textAlign: "center",
                fontSize: 13, flex: 1, minHeight: 142, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 10
              }}>
                <span style={{ fontSize: 28 }}>👥</span>
                <span style={{ fontWeight: 600, color: "#475569" }}>Aucun profil créé</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Créez un nouveau profil pour commencer à sauvegarder vos cours.</span>
              </div>
            ) : (
              profiles.map(p => {
                const isActive = activeProfileId === p.id;
                return (
                  <div 
                    key={p.id}
                    onClick={() => onSelectProfile(p.id)}
                    style={{
                      minWidth: 150, width: 150, background: "white", border: isActive ? `2px solid ${p.color}` : "1.5px solid #e2e8f0",
                      borderRadius: 12, padding: "20px 12px", textAlign: "center", cursor: "pointer",
                      boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                      transition: "all 0.2s", position: "relative"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = isActive ? "0 4px 12px rgba(0,0,0,0.05)" : "none"; }}
                  >
                    <span style={{ position: "absolute", top: 12, right: 12, width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                    
                    <div style={{ margin: "0 auto 12px", width: 60, height: 60 }}>
                      <ProfileAvatar profile={p} size={60} />
                    </div>

                    <div style={{ fontWeight: 700, fontSize: 13, color: p.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.lastName.toUpperCase()} {p.firstName}
                    </div>

                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8 }}>
                      Dernière session
                    </div>
                    <div style={{ fontSize: 10, color: "#475569", fontWeight: 600, marginTop: 2 }}>
                      {p.lastActive}
                    </div>
                  </div>
                );
              })
            )}

            {/* Guest Profile Card */}
            <div 
              onClick={() => onSelectProfile("guest")}
              style={{
                minWidth: 150, width: 150, background: "white", border: activeProfileId === "guest" ? "2px solid #64748b" : "1.5px solid #e2e8f0",
                borderRadius: 12, padding: "20px 12px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", position: "relative"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <span style={{ position: "absolute", top: 12, right: 12, width: 8, height: 8, borderRadius: "50%", background: "#64748b" }} />
              
              <div style={{ margin: "0 auto 12px", width: 60, height: 60 }}>
                <ProfileAvatar profile={{ id: "guest" }} size={60} />
              </div>

              <div style={{ fontWeight: 700, fontSize: 13, color: "#475569" }}>
                Mode invité
              </div>

              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8 }}>
                Continuer sans compte
              </div>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, marginTop: 2 }}>
                Aucune sauvegarde
              </div>
            </div>
          </div>
        </div>

        {/* Nouvelle utilisateur Panel Button */}
        <div 
          onClick={onOpenNewUserModal}
          style={{
            background: "white", borderRadius: 12, border: "1.5px solid #e2e8f0", padding: "16px 24px",
            display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
            transition: "all 0.15s", marginBottom: 24, boxShadow: "0 1px 2px rgba(15,23,42,0.02)"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "#f8fafc"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "white"; }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>Nouvelle utilisateur</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Créez un nouveau profil pour commencer</div>
            </div>
          </div>
          <span style={{ fontSize: 16, color: "#94a3b8", fontWeight: "bold" }}>➔</span>
        </div>

        {/* Sync Blue Banner */}
        <div style={{ 
          background: "#eff6ff", borderRadius: 12, border: "1.5px solid #bfdbfe", padding: "20px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 24 }}>☁️</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1e3a8a" }}>Créer un compte IdeaGrid</div>
              <div style={{ fontSize: 12, color: "#2563eb", marginTop: 4, lineHeight: 1.4 }}>Créez un compte pour synchroniser vos tableaux sur tous vos appareils et ne jamais perdre vos données.</div>
            </div>
          </div>
          <button style={{
            background: "#3b82f6", color: "white", border: "none", borderRadius: 8,
            padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0,
            boxShadow: "0 2px 4px rgba(59,130,246,0.2)"
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
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
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
        padding: 26, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", border: "1px solid #cbd5e1"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Nouveau profil utilisateur</h3>
          <button type="button" onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>Prénom</label>
            <input 
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder="Ex: Leticia"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8, outline: "none", fontSize: 13, color: "#0f172a" }}
              autoFocus
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>Nom</label>
            <input 
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              placeholder="Ex: LET"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8, outline: "none", fontSize: 13, color: "#0f172a" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>Adresse mail</label>
            <input 
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Ex: leticia.let@example.com"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8, outline: "none", fontSize: 13, color: "#0f172a" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>Couleur du profil</label>
            <div style={{ display: "flex", gap: 10 }}>
              {["#22c55e", "#ea580c", "#3b82f6", "#a855f7", "#ec4899", "#ca8a04"].map(c => {
                const isSelected = form.color === c;
                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    style={{
                      width: 28, height: 28, borderRadius: "50%", background: c,
                      border: isSelected ? "3px solid #64748b" : "1px solid rgba(0,0,0,0.1)",
                      cursor: "pointer", transition: "transform 0.1s",
                      transform: isSelected ? "scale(1.1)" : "none"
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button 
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: 8,
              background: "white", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer"
            }}
          >
            Annuler
          </button>
          <button 
            type="submit"
            style={{
              padding: "8px 18px", border: "none", borderRadius: 8,
              background: "#3b82f6", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 2px 4px rgba(59,130,246,0.15)"
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
  const [showAssistant, setShowAssistant] = useState(false);
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

  // Save courses list changes to localStorage or sync to backend if collaborating
  const updateCurrentCourse = (callback) => {
    setCourses(prev => {
      const updated = prev.map(c => {
        if (c.id === currentCourseId) {
          const res = typeof callback === 'function' ? callback(c) : { ...c, ...callback };
          return res;
        }
        return c;
      });
      
      if (sharedAccess) {
        if (sharedAccess.permission === "Peut modifier" || sharedAccess.permission === "Peut commenter") {
          fetch(getApiUrl(`/api/shared-profile/${sharedAccess.ownerId}/update-courses`), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courses: updated })
          }).catch(err => console.error("Failed to sync updates to backend", err));
        }
      } else {
        saveCours(activeProfileId, updated);
      }
      return updated;
    });
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;
  const [toastMessage, setToastMessage] = useState("");

  const handleUpdateSwotBullet = (idx, newText) => {
    updateCurrentCourse(prev => {
      const bullets = prev.swotBullets ? [...prev.swotBullets] : [
        { type: "force", label: "Force :", text: "", color: "#16a34a" },
        { type: "faiblesse", label: "Faiblesse :", text: "", color: "#ea580c" },
        { type: "opportunite", label: "Opportunité :", text: "", color: "#2563eb" },
        { type: "menace", label: "Menace :", text: "", color: "#9333ea" }
      ];
      bullets[idx] = { ...bullets[idx], text: newText };
      return { ...prev, swotBullets: bullets };
    });
  };

  const handleSaveCourse = () => {
    const updated = courses.map(c => c.id === currentCourseId ? activeCourse : c);
    saveCours(activeProfileId, updated);
    setToastMessage(`Le cours "${activeCourse.title}" a été sauvegardé.`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleRenameCourse = (id, newTitle) => {
    setCourses(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, title: newTitle } : c);
      saveCours(activeProfileId, updated);
      return updated;
    });
  };

  // Decode shared link or load shared profile on mount and hashchange
  const [sharedAccess, setSharedAccess] = useState(null);

  const handleExitCollaboration = () => {
    setSharedAccess(null);
    const list = getCours(activeProfileId);
    setCourses(list);
    if (list.length > 0) {
      setCurrentCourseId(list[0].id);
    }
    setActiveTab("accueil");
  };

  const handleRefreshSharedProfile = () => {
    const profileId = sharedAccess ? sharedAccess.ownerId : activeProfileId;
    fetch(getApiUrl(`/api/shared-profile/${profileId}`))
      .then(res => res.json())
      .then(data => {
        if (data && data.courses) {
          setCourses(data.courses);
          if (sharedAccess) {
            const exists = data.courses.some(c => c.id === currentCourseId);
            if (!exists && data.courses.length > 0) {
              setCurrentCourseId(data.courses[0].id);
            }
          } else {
            saveCours(activeProfileId, data.courses);
          }
          setToastMessage("Espace de travail synchronisé !");
          setTimeout(() => setToastMessage(""), 3000);
        }
      })
      .catch(err => console.error("Failed to sync shared profile", err));
  };

  const handleAddCommentCard = () => {
    const userEmail = activeProfile?.email || "guest@ideagrid.com";
    const userName = activeProfile ? `${activeProfile.firstName} ${activeProfile.lastName}` : "Collaborateur";
    const newCard = {
      id: genId(),
      type: "comment",
      title: `Commentaire de ${userName}`,
      content: "Écrire un commentaire...",
      x: 150 + Math.random() * 100,
      y: 180 + Math.random() * 100,
      isPinned: true,
      color: "#fef08a",
      createdBy: userEmail,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    };
    updateCurrentCourse(prev => ({
      ...prev,
      cards: [...prev.cards, newCard]
    }));
  };

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith("#shared-profile")) {
        const paramStr = hash.substring("#shared-profile?".length);
        const params = new URLSearchParams(paramStr);
        const ownerId = params.get("ownerId");
        const permission = params.get("permission");
        const ownerName = params.get("ownerName");

        if (ownerId && permission && ownerName) {
          fetch(getApiUrl(`/api/shared-profile/${ownerId}`))
            .then(res => res.json())
            .then(data => {
              if (data && data.courses) {
                setCourses(data.courses);
                setSharedAccess({ ownerId, permission, ownerName });
                if (data.courses.length > 0) {
                  setCurrentCourseId(data.courses[0].id);
                }
                setActiveTab("ecrire");
                alert(`Vous collaborez avec ${ownerName} en mode "${permission}".`);
              }
            })
            .catch(err => {
              console.error("Failed to load shared profile", err);
              alert("Impossible de charger l'espace partagé.");
            });
        }
        window.location.hash = "";
      } else if (hash && hash.startsWith("#course=")) {
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
          setActiveTab("ecrire");
          alert(`Cours partagé "${decoded.title}" importé avec succès !`);
          window.location.hash = "";
        }
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [activeProfileId]);

  // Web Speech API Voice recognition hook with ref closure fixes
  const isRecordingRef = useRef(false);
  const selectedColorRef = useRef(selectedColor);
  useEffect(() => {
    selectedColorRef.current = selectedColor;
  }, [selectedColor]);

  const addSpokenTextToBoardRef = useRef(null);
  useEffect(() => {
    addSpokenTextToBoardRef.current = addSpokenTextToBoard;
  });

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "fr-FR";

    rec.onstart = () => {
      setIsRecording(true);
      isRecordingRef.current = true;
      setSpeechText("");
    };

    rec.onerror = (e) => {
      console.error("Speech Recognition Error", e.error);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setIsRecording(false);
        isRecordingRef.current = false;
      }
    };

    rec.onend = () => {
      if (isRecordingRef.current) {
        try {
          rec.start();
        } catch (err) {
          console.error("Failed to restart speech recognition", err);
          setIsRecording(false);
          isRecordingRef.current = false;
        }
      } else {
        setIsRecording(false);
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
        if (addSpokenTextToBoardRef.current) {
          addSpokenTextToBoardRef.current(final.trim());
        }
      }
    };

    recognitionRef.current = rec;

    return () => {
      isRecordingRef.current = false;
      try {
        rec.stop();
      } catch (e) {}
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Votre navigateur ne supporte pas la reconnaissance vocale. Veuillez essayer avec Google Chrome.");
      return;
    }

    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      setIsRecording(false);
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    } else {
      isRecordingRef.current = true;
      setIsRecording(true);
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
        descColor: selectedColorRef.current || selectedColor,
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
    if (sharedAccess) {
      if (sharedAccess.permission === "Peut consulter") return;
      if (sharedAccess.permission === "Peut commenter" && card.createdBy !== (activeProfile?.email || "guest@ideagrid.com")) return;
    }
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
      className="app-container"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ display: "flex", height: "100vh", width: "100vw", fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden" }}
    >
      <Sidebar 
        activeTab={activeTab} 
        onTab={handleTabChange} 
        activeProfile={activeProfile}
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
          onRename={handleRenameCourse}
        />
      ) : activeTab === "partager" ? (
        <ShareView 
          activeProfile={activeProfile}
          courses={courses}
          activeCourse={activeCourse}
          setToastMessage={setToastMessage}
          setCurrentCourseId={setCurrentCourseId}
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
            onUpdateCardContent={(cardId, content) => updateCurrentCourse(prev => {
              if (sharedAccess && sharedAccess.permission === "Peut commenter") {
                const card = prev.cards.find(c => c.id === cardId);
                if (card && card.createdBy !== (activeProfile?.email || "guest@ideagrid.com")) {
                  return prev;
                }
              }
              return {
                ...prev,
                cards: prev.cards.map(c => c.id === cardId ? { ...c, content } : c)
              };
            })}
            onDeleteCard={(cardId) => updateCurrentCourse(prev => {
              if (sharedAccess && sharedAccess.permission === "Peut commenter") {
                const card = prev.cards.find(c => c.id === cardId);
                if (card && card.createdBy !== (activeProfile?.email || "guest@ideagrid.com")) {
                  return prev;
                }
              }
              return {
                ...prev,
                cards: prev.cards.filter(c => c.id !== cardId)
              };
            })}
            onPointerDown={handlePointerDown}
            draggingCard={draggingCard}
            onSave={handleSaveCourse}
            onShare={() => setActiveTab("partager")}
            activeProfile={activeProfile}
            onUpdateSwotBullet={handleUpdateSwotBullet}
            // Collaboration properties
            sharedAccess={sharedAccess}
            onRefresh={handleRefreshSharedProfile}
            onExitCollaboration={handleExitCollaboration}
            onAddCommentCard={handleAddCommentCard}
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

      {/* New User Creation Dialog */}
      <NewUserModal 
        isOpen={showNewUserModal}
        onClose={() => setShowNewUserModal(false)}
        onCreate={handleCreateNewUser}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, background: "#0f172a", color: "white",
          padding: "12px 24px", borderRadius: 8, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
          zIndex: 9999, display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 500,
          border: "1px solid #1e293b", animation: "toastSlideIn 0.2s ease-out"
        }}>
          <span style={{ fontSize: 16 }}>💾</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
