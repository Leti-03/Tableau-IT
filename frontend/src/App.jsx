import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Whiteboard from './components/Whiteboard';
import AIPanel from './components/AIPanel';
import HistoryModal from './components/HistoryModal';
import ShareModal from './components/ShareModal';
import SettingsModal from './components/SettingsModal';

const DEFAULT_COURSE_ID = 'biology-photosynthesis';

export default function App() {
  // Global Workspace states
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState('pencil'); // 'pencil' | 'select' | 'eraser' | 'pan'
  
  const [strokes, setStrokes] = useState([]);
  const [cards, setCards] = useState([]);
  
  // Metadata
  const [courseId, setCourseId] = useState(DEFAULT_COURSE_ID);
  const [courseTitle, setCourseTitle] = useState('Photosynthèse');
  const [courseSubject, setCourseSubject] = useState('Biologie');

  // Side panels / overlays
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings
  const [backendUrl, setBackendUrl] = useState('http://localhost:3000');
  const [speechKeywordsEnabled, setSpeechKeywordsEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [speechLanguage, setSpeechLanguage] = useState('fr-FR');

  // Speech Recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const recognitionRef = useRef(null);

  // AI Panel states
  const [aiSummary, setAiSummary] = useState(
    "La photosynthèse est le processus par lequel les plantes utilisent la lumière, le CO₂ et l'eau pour produire du sucre et libérer de l'oxygène."
  );

  // Refs for speech callback closure issue
  const lastSpeechPosition = useRef({ x: 150, y: 180 });
  const cardsRef = useRef([]);
  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  // Initial load
  useEffect(() => {
    // Load local storage settings
    const savedSettings = localStorage.getItem('ideagrid_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.backendUrl) setBackendUrl(parsed.backendUrl);
        if (parsed.lang) setSpeechLanguage(parsed.lang);
        if (parsed.smartKeywords !== undefined) setSpeechKeywordsEnabled(parsed.smartKeywords);
        if (parsed.autoSave !== undefined) setAutoSaveEnabled(parsed.autoSave);
      } catch (e) {}
    }

    // Check URL parameters for shared course
    const urlParams = new URLSearchParams(window.location.search);
    const sharedId = urlParams.get('courseId');
    const idToLoad = sharedId || DEFAULT_COURSE_ID;
    
    loadCourse(idToLoad);
  }, []);

  // Auto save effect
  useEffect(() => {
    if (!autoSaveEnabled) return;
    const interval = setInterval(() => {
      saveCourse(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoSaveEnabled, courseId, courseTitle, courseSubject, strokes, cards, aiSummary]);

  // API Methods
  const loadCourse = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/api/courses/${id}`);
      if (!res.ok) throw new Error('Backend unreachable');
      const data = await res.json();
      
      setCourseId(data.id);
      setCourseTitle(data.title);
      setCourseSubject(data.subject || 'Biologie');
      
      if (data.canvasData) {
        try {
          const parsed = JSON.parse(data.canvasData);
          setStrokes(parsed.strokes || []);
        } catch (e) {
          setStrokes([]);
        }
      } else {
        setStrokes([]);
      }
      setCards(data.cardsData || []);
      if (data.summary) setAiSummary(data.summary);
      
      // Reset transform
      setZoom(1.0);
      setPan({ x: 0, y: 0 });
      console.log('Course loaded successfully from server:', id);
    } catch (err) {
      console.warn('Falling back to local template or empty page:', err.message);
      loadLocalFallback(id);
    }
  };

  const loadLocalFallback = (id) => {
    if (id === DEFAULT_COURSE_ID) {
      setCourseId(DEFAULT_COURSE_ID);
      setCourseTitle('Photosynthèse');
      setCourseSubject('Biologie');
      setStrokes([]);
      setCards([
        {
          id: 'card-1',
          type: 'title',
          content: 'La photosynthèse',
          x: 200,
          y: 70,
          color: '#2e7d32',
          isPinned: false
        },
        {
          id: 'card-2',
          type: 'text',
          content: 'La photosynthèse est le processus utilisé par les plantes pour fabriquer leur propre nourriture à partir de la lumière.',
          x: 150,
          y: 180,
          color: '#212121',
          isPinned: false
        },
        {
          id: 'card-3',
          type: 'key-points',
          title: 'Points clés',
          content: [
            'Les plantes absorbent la lumière',
            'Elles utilisent le CO₂ et l\'eau',
            'Elles produisent du sucre',
            'L\'oxygène est rejeté dans l\'air'
          ],
          x: 520,
          y: 130,
          color: '#1565c0',
          isPinned: false
        },
        {
          id: 'card-4',
          type: 'image',
          title: 'Image ajoutée',
          imageUrl: 'assets/leaf.svg',
          labels: [
            { text: 'Stomate', x: '80%', y: '30%' },
            { text: 'Chloroplaste', x: '80%', y: '70%' }
          ],
          x: 520,
          y: 330,
          color: '#2e7d32',
          isPinned: true,
          pinColor: 'blue'
        },
        {
          id: 'card-5',
          type: 'question',
          title: 'Question',
          content: 'Pourquoi la lumière est-elle essentielle à la photosynthèse ?',
          x: 520,
          y: 580,
          color: '#6a1b9a',
          isPinned: true,
          pinColor: 'purple'
        },
        {
          id: 'card-6',
          type: 'diagram',
          title: 'Schéma',
          imageUrl: 'assets/plant.svg',
          x: 130,
          y: 280,
          isPinned: false
        }
      ]);
      setAiSummary(
        "La photosynthèse est le processus par lequel les plantes utilisent la lumière, le CO₂ et l'eau pour produire du sucre et libérer de l'oxygène."
      );
    } else {
      resetCourse();
    }
  };

  const saveCourse = async (showNotification = false) => {
    try {
      const payload = {
        id: courseId,
        title: courseTitle,
        subject: courseSubject,
        canvasData: JSON.stringify({ strokes }),
        cardsData: cards,
        summary: aiSummary
      };
      
      const res = await fetch(`${backendUrl}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('API save error');
      const data = await res.json();
      setCourseId(data.id);
      
      if (showNotification) {
        alert(`Le cours "${courseTitle}" a été enregistré.`);
      }
    } catch (e) {
      console.warn('Failed to save to server, saved locally in RAM:', e.message);
    }
  };

  const resetCourse = () => {
    const newId = 'course-' + Date.now();
    setCourseId(newId);
    setCourseTitle('Nouveau cours');
    setCourseSubject('Biologie');
    setStrokes([]);
    setCards([
      {
        id: 'card-title-' + Date.now(),
        type: 'title',
        content: 'Nouveau cours',
        x: 150,
        y: 80,
        color: 'var(--wb-green)',
        isPinned: false
      }
    ]);
    setAiSummary("L'Assistant IA écoutera vos paroles pour générer des résumés.");
    lastSpeechPosition.current = { x: 150, y: 180 };
  };

  // Canvas Actions
  const handleAddStroke = (newStroke) => {
    setStrokes(prev => [...prev, newStroke]);
  };

  const handleEraseStroke = (strokeToErase) => {
    setStrokes(prev => prev.filter(s => s !== strokeToErase));
  };

  // Card Actions
  const handleUpdateCoords = (id, newX, newY) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, x: newX, y: newY } : c));
  };

  const handleDeleteCard = (id) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateCardContent = (id, newContent) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, content: newContent } : c));
  };

  const handleUpdateCardData = (id, newData) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...newData } : c));
  };

  // Web Speech API Recording Effect
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = speechLanguage;

    rec.onstart = () => {
      setIsRecording(true);
      setSpeechText('En écoute...');
    };

    rec.onerror = (e) => {
      console.error('Speech error:', e.error);
      setIsRecording(false);
    };

    rec.onend = () => {
      // If still toggled on by user, restart
      if (isRecording) {
        try {
          rec.start();
        } catch (err) {
          setIsRecording(false);
        }
      }
    };

    rec.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) setSpeechText(interim);
      if (final) {
        handleSpeechFinalized(final.trim());
      }
    };

    recognitionRef.current = rec;

    // Cleanup
    return () => {
      try {
        rec.stop();
      } catch (e) {}
    };
  }, [speechLanguage, isRecording]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
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

  const handleSpeechFinalized = (text) => {
    if (!text) return;
    setSpeechText(text);

    // Smart Keyword Detection (WOW factor matching design)
    if (speechKeywordsEnabled) {
      const textLower = text.toLowerCase();

      // Title keyword
      if (textLower.includes('commencer le cours sur') || textLower.includes('titre du cours')) {
        const match = text.match(/(?:commencer le cours sur|titre du cours)\s+(.*)/i);
        if (match && match[1]) {
          const titleVal = match[1].trim();
          setCourseTitle(titleVal);
          
          setCards(prev => {
            const hasTitle = prev.some(c => c.type === 'title');
            if (hasTitle) {
              return prev.map(c => c.type === 'title' ? { ...c, content: titleVal } : c);
            } else {
              return [
                {
                  id: 'card-title-' + Date.now(),
                  type: 'title',
                  content: titleVal,
                  x: 200,
                  y: 70,
                  color: '#2e7d32',
                  isPinned: false
                },
                ...prev
              ];
            }
          });
          return;
        }
      }

      // Keypoints keyword
      if (textLower.includes('points clés') || textLower.includes('points importants')) {
        const newCard = {
          id: 'card-kp-' + Date.now(),
          type: 'key-points',
          title: 'Points clés',
          content: [
            'Les plantes absorbent la lumière',
            'Elles utilisent le CO₂ et l\'eau',
            'Elles produisent du sucre',
            'L\'oxygène est rejeté dans l\'air'
          ],
          x: lastSpeechPosition.current.x + 350,
          y: lastSpeechPosition.current.y - 50,
          color: '#1565c0',
          isPinned: false
        };
        setCards(prev => [...prev, newCard]);
        return;
      }

      // Question keyword
      if (textLower.startsWith('question') || textLower.includes('pourquoi la lumière est-elle essentielle')) {
        const cleanText = text.replace(/^question:?\s*/i, '');
        const newCard = {
          id: 'card-q-' + Date.now(),
          type: 'question',
          title: 'Question',
          content: cleanText.includes('essentielle') ? 'Pourquoi la lumière est-elle essentielle à la photosynthèse ?' : cleanText,
          x: lastSpeechPosition.current.x + 350,
          y: lastSpeechPosition.current.y + 400,
          isPinned: true,
          pinColor: 'purple'
        };
        setCards(prev => [...prev, newCard]);
        return;
      }

      // Diagram keyword
      if (textLower.includes('schéma de la photosynthèse') || textLower.includes('générer un schéma')) {
        if (!cardsRef.current.some(c => c.type === 'diagram')) {
          const newCard = {
            id: 'card-diag-' + Date.now(),
            type: 'diagram',
            title: 'Schéma',
            imageUrl: 'assets/plant.svg',
            x: lastSpeechPosition.current.x - 20,
            y: lastSpeechPosition.current.y + 100
          };
          setCards(prev => [...prev, newCard]);
          return;
        }
      }

      // Image keyword
      if (textLower.includes('image de la feuille') || textLower.includes('image ajoutée')) {
        if (!cardsRef.current.some(c => c.type === 'image')) {
          const newCard = {
            id: 'card-img-' + Date.now(),
            type: 'image',
            title: 'Image ajoutée',
            imageUrl: 'assets/leaf.svg',
            labels: [
              { text: 'Stomate', x: '80%', y: '30%' },
              { text: 'Chloroplaste', x: '80%', y: '70%' }
            ],
            x: lastSpeechPosition.current.x + 350,
            y: lastSpeechPosition.current.y + 150,
            color: '#2e7d32',
            isPinned: true,
            pinColor: 'blue'
          };
          setCards(prev => [...prev, newCard]);
          return;
        }
      }
    }

    // Default note card fallback
    const newCard = {
      id: 'card-text-' + Date.now(),
      type: 'text',
      content: text,
      x: lastSpeechPosition.current.x,
      y: lastSpeechPosition.current.y,
      color: '#212121',
      isPinned: false
    };

    setCards(prev => [...prev, newCard]);

    // Offset position for next note
    lastSpeechPosition.current.y += 130;
    if (lastSpeechPosition.current.y > 600) {
      lastSpeechPosition.current.y = 180;
      lastSpeechPosition.current.x += 100;
    }

    // Auto update AI summary based on additions
    triggerAiSummaryUpdate(text);
  };

  const triggerAiSummaryUpdate = (newText) => {
    // Simulates an AI summary combining key concepts
    const concepts = {
      lumiere: "La lumière est essentielle pour alimenter la réaction.",
      eau: "L'eau est décomposée pour fournir de l'hydrogène et libérer l'oxygène.",
      co2: "Le CO₂ est combiné pour synthétiser du glucose (sucre)."
    };
    
    let sum = "Le cours étudie les mécanismes de capture d'énergie par les organismes végétaux. ";
    const lText = newText.toLowerCase();
    if (lText.includes('lumière')) sum += concepts.lumiere + " ";
    if (lText.includes('eau') || lText.includes('h2o')) sum += concepts.eau + " ";
    if (lText.includes('co2')) sum += concepts.co2 + " ";

    setAiSummary(prev => sum || prev);
  };

  // AI Panel Chat Submission Simulation
  const handleSendMessage = (query) => {
    // Add question card to board
    const qCard = {
      id: 'card-chat-q-' + Date.now(),
      type: 'question',
      title: 'Question élève',
      content: query,
      x: 320,
      y: 350,
      pinColor: 'purple',
      isPinned: true
    };
    setCards(prev => [...prev, qCard]);

    // Simulated responses
    let answerText = "D'après les observations du cours : ";
    const queryLower = query.toLowerCase();
    if (queryLower.includes('lumière') || queryLower.includes('soleil')) {
      answerText += "La lumière excite la chlorophylle présente dans les chloroplastes, permettant la photolyse de l'eau (H₂O) lors de la phase claire.";
    } else if (queryLower.includes('stomate') || queryLower.includes('feuille')) {
      answerText += "Les stomates sont des orifices microscopiques situés sous les feuilles qui régulent les échanges gazeux (CO₂, O₂, H₂O) avec l'extérieur.";
    } else {
      answerText += "La photosynthèse combine le CO₂ et l'eau en présence de lumière pour produire des glucides (glucose) et rejeter du dioxygène.";
    }

    alert(`Assistant IA :\n\n${answerText}`);

    // Add answer card to board
    const aCard = {
      id: 'card-chat-a-' + Date.now(),
      type: 'text',
      content: answerText,
      x: 350,
      y: 460,
      color: '#1b5e20',
      isPinned: false
    };
    setCards(prev => [...prev, aCard]);
  };

  const handleSuggestAction = (actionType) => {
    if (actionType === 'summarize') {
      const summaryCard = {
        id: 'card-sum-c-' + Date.now(),
        type: 'text',
        content: "Résumé IA : " + aiSummary,
        x: 150,
        y: lastSpeechPosition.current.y,
        color: '#0d47a1',
        isPinned: false
      };
      setCards(prev => [...prev, summaryCard]);
      lastSpeechPosition.current.y += 120;
    } 
    
    else if (actionType === 'schema') {
      if (!cards.some(c => c.type === 'diagram')) {
        const diagCard = {
          id: 'card-diag-m-' + Date.now(),
          type: 'diagram',
          title: 'Schéma',
          imageUrl: 'assets/plant.svg',
          x: 130,
          y: 280
        };
        setCards(prev => [...prev, diagCard]);
      } else {
        alert("Le schéma de la photosynthèse est déjà sur le tableau.");
      }
    } 
    
    else if (actionType === 'examples') {
      const exCard = {
        id: 'card-ex-m-' + Date.now(),
        type: 'key-points',
        title: 'Organismes photosynthétiques',
        content: [
          'Plantes (chênes, sapins, fougères)',
          'Algues (kelp, algues vertes)',
          'Cyanobactéries (phytoplancton)'
        ],
        x: 520,
        y: lastSpeechPosition.current.y,
        color: '#2e7d32'
      };
      setCards(prev => [...prev, exCard]);
    }
  };

  // Exporters
  const handleExportPNG = () => {
    // Drawing canvas download
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.download = `${courseTitle.replace(/\s+/g, '_')}_dessins.png`;
      link.href = dataURL;
      link.click();
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      title: courseTitle,
      subject: courseSubject,
      strokes,
      cards,
      summary: aiSummary
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${courseTitle.replace(/\s+/g, '_')}_ideagrid.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSaveSettings = (newSettings) => {
    setBackendUrl(newSettings.backendUrl);
    setSpeechLanguage(newSettings.lang);
    setSpeechKeywordsEnabled(newSettings.smartKeywords);
    setAutoSaveEnabled(newSettings.autoSave);
    
    // Save to local storage
    localStorage.setItem('ideagrid_settings', JSON.stringify({
      backendUrl: newSettings.backendUrl,
      lang: newSettings.lang,
      smartKeywords: newSettings.smartKeywords,
      autoSave: newSettings.autoSave
    }));
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <Sidebar
        tool={tool}
        setTool={setTool}
        isAIPanelOpen={isAIPanelOpen}
        toggleAIPanel={() => setIsAIPanelOpen(!isAIPanelOpen)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewPage={() => {
          if (window.confirm('Créer un nouveau cours ?')) resetCourse();
        }}
        onOpenShare={() => setIsShareOpen(true)}
        onHome={() => {
          saveCourse(false);
          alert('Sauvegarde effectuée. Retour au tableau de bord.');
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Board view area */}
      <main className="main-content">
        <Header
          isRecording={isRecording}
          subject={courseSubject}
          title={courseTitle}
          onUpdateTitle={setCourseTitle}
        />

        <div className="content-body">
          <Whiteboard
            zoom={zoom}
            setZoom={setZoom}
            pan={pan}
            setPan={setPan}
            tool={tool}
            setTool={setTool}
            strokes={strokes}
            onAddStroke={handleAddStroke}
            onEraseStroke={handleEraseStroke}
            cards={cards}
            onUpdateCoords={handleUpdateCoords}
            onDeleteCard={handleDeleteCard}
            onUpdateCardContent={handleUpdateCardContent}
            onUpdateCardData={handleUpdateCardData}
            speechText={speechText}
            isRecording={isRecording}
            toggleRecording={toggleRecording}
          />

          <AIPanel
            isOpen={isAIPanelOpen}
            onClose={() => setIsAIPanelOpen(false)}
            summary={aiSummary}
            onSuggestAction={handleSuggestAction}
            onSendMessage={handleSendMessage}
          />
        </div>
      </main>

      {/* Overlays / Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadCourse={loadCourse}
        backendUrl={backendUrl}
        activeCourseId={courseId}
        onResetCourse={resetCourse}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        courseId={courseId}
        courseTitle={courseTitle}
        onExportPNG={handleExportPNG}
        onExportJSON={handleExportJSON}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={{
          backendUrl,
          lang: speechLanguage,
          autoSave: autoSaveEnabled,
          smartKeywords: speechKeywordsEnabled
        }}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}
