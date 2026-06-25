/**
 * IdeaGrid - Intelligent Whiteboard
 * Main Application Script (Frontend)
 */

// Global Application State
const state = {
  zoom: 1.0,
  panX: 0,
  panY: 0,
  tool: 'pencil', // 'pencil' | 'select' | 'eraser'
  isDrawing: false,
  isPanning: false,
  strokes: [], // [{ points: [{x, y}], color, width }]
  currentStroke: null,
  cards: [], // [{ id, type, content, x, y, color, isPinned, pinColor, title, imageUrl, labels }]
  courseId: 'biology-photosynthesis',
  courseTitle: 'Photosynthèse',
  courseSubject: 'Biologie',
  isRecording: false,
  backendUrl: 'http://localhost:3000',
  autoSaveInterval: null,
  recognition: null,
  speechKeywordsEnabled: true,
  lastSpeechPosition: { x: 150, y: 180 } // track where to drop speech cards
};

// DOM Elements
const canvas = document.getElementById('whiteboard-canvas');
const ctx = canvas.getContext('2d');
const viewport = document.getElementById('board-viewport');
const cardsLayer = document.getElementById('cards-layer');
const zoomLevelText = document.getElementById('zoom-level');
const speechOverlay = document.getElementById('speech-overlay');
const speechLiveText = document.getElementById('speech-live-text');
const recordingIndicator = document.getElementById('status-recording-indicator');
const courseTitleDisplay = document.getElementById('course-title');
const courseSubjectDisplay = document.getElementById('course-subject');
const currentTimeDisplay = document.getElementById('current-time');

// Left Nav Buttons
const btnWrite = document.getElementById('tool-write');
const btnSelect = document.getElementById('tool-select');
const btnErase = document.getElementById('tool-erase');
const btnSpeech = document.getElementById('action-speech');
const btnAI = document.getElementById('action-ai');
const btnHistory = document.getElementById('action-history');
const btnNew = document.getElementById('action-new');
const btnShare = document.getElementById('action-share');
const btnHome = document.getElementById('nav-home');
const btnSettings = document.getElementById('nav-settings');

// AI Panel Elements
const aiPanel = document.getElementById('ai-panel');
const btnCloseAIPanel = document.getElementById('close-ai-panel');
const aiSummaryText = document.getElementById('ai-summary-text');
const aiChatInput = document.getElementById('ai-chat-input');
const btnSendAIChat = document.getElementById('send-ai-chat');
const btnSuggestSummarize = document.getElementById('suggest-summarize');
const btnSuggestSchema = document.getElementById('suggest-schema');
const btnSuggestExamples = document.getElementById('suggest-examples');

// Zoom & Pan Buttons
const btnZoomIn = document.getElementById('zoom-in');
const btnZoomOut = document.getElementById('zoom-out');
const btnPanMode = document.getElementById('pan-mode');

// Modal overlays
const historyOverlay = document.getElementById('history-overlay');
const shareOverlay = document.getElementById('share-overlay');
const settingsOverlay = document.getElementById('settings-overlay');
const btnCloseHistory = document.getElementById('close-history');
const btnCloseShare = document.getElementById('close-share');
const btnCloseSettings = document.getElementById('close-settings');
const historyList = document.getElementById('history-list');
const shareLinkInput = document.getElementById('share-link-url');
const btnCopyShareLink = document.getElementById('copy-share-link');
const btnExportPNG = document.getElementById('export-png');
const btnExportJSON = document.getElementById('export-json');
const settingsForm = document.getElementById('settings-form');

// Initialize App
function init() {
  updateTime();
  setInterval(updateTime, 60000);
  
  // Set larger internal canvas resolution
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Load settings from localStorage if available
  loadAppSettings();
  
  // Check URL parameters for shared course
  const urlParams = new URLSearchParams(window.location.search);
  const sharedCourseId = urlParams.get('courseId');
  if (sharedCourseId) {
    state.courseId = sharedCourseId;
  }
  
  // Load active course data
  loadCourse(state.courseId);
  
  // Event listeners setup
  setupCanvasEvents();
  setupNavEvents();
  setupAIPanelEvents();
  setupModalEvents();
  setupSpeechRecognition();
  
  // Set default tool
  setTool('pencil');
  
  // Setup auto-save
  setupAutoSave();
}

// ----------------------------------------------------
// UI TIME UPDATE
// ----------------------------------------------------
function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  currentTimeDisplay.textContent = `${hours}:${minutes}`;
}

// ----------------------------------------------------
// CANVAS & VIEWPORT MANAGEMENT
// ----------------------------------------------------
function resizeCanvas() {
  // We make the canvas large to allow panning/zooming over a large blackboard area
  canvas.width = 3000;
  canvas.height = 2000;
  drawStrokes();
}

function updateViewportTransform() {
  // Apply translation and scale to the elements viewport
  viewport.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
}

function drawStrokes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw saved strokes
  state.strokes.forEach(stroke => {
    if (stroke.points.length < 2) return;
    
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  });
  
  // Draw current active stroke
  if (state.currentStroke && state.currentStroke.points.length >= 2) {
    ctx.beginPath();
    ctx.strokeStyle = state.currentStroke.color;
    ctx.lineWidth = state.currentStroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.moveTo(state.currentStroke.points[0].x, state.currentStroke.points[0].y);
    for (let i = 1; i < state.currentStroke.points.length; i++) {
      ctx.lineTo(state.currentStroke.points[i].x, state.currentStroke.points[i].y);
    }
    ctx.stroke();
  }
}

// Coordinate converters taking zoom/pan into account
function getCanvasCoords(clientX, clientY) {
  const rect = viewport.getBoundingClientRect();
  const x = (clientX - rect.left) / state.zoom;
  const y = (clientY - rect.top) / state.zoom;
  return { x, y };
}

// Canvas Drawings Event Handler
let dragStartCoords = { x: 0, y: 0 };

function setupCanvasEvents() {
  const handleStart = (clientX, clientY) => {
    const coords = getCanvasCoords(clientX, clientY);
    
    if (state.tool === 'pencil') {
      state.isDrawing = true;
      state.currentStroke = {
        points: [coords],
        color: '#2b2b2b',
        width: 3
      };
    } else if (state.tool === 'eraser') {
      state.isDrawing = true;
      eraseAt(coords.x, coords.y);
    } else if (state.tool === 'pan') {
      state.isPanning = true;
      dragStartCoords = { x: clientX - state.panX, y: clientY - state.panY };
      viewport.style.cursor = 'grabbing';
    }
  };

  const handleMove = (clientX, clientY) => {
    const coords = getCanvasCoords(clientX, clientY);
    
    if (state.isDrawing && state.tool === 'pencil' && state.currentStroke) {
      state.currentStroke.points.push(coords);
      drawStrokes();
    } else if (state.isDrawing && state.tool === 'eraser') {
      eraseAt(coords.x, coords.y);
    } else if (state.isPanning && state.tool === 'pan') {
      state.panX = clientX - dragStartCoords.x;
      state.panY = clientY - dragStartCoords.y;
      updateViewportTransform();
    }
  };

  const handleEnd = () => {
    if (state.isDrawing && state.tool === 'pencil' && state.currentStroke) {
      state.strokes.push(state.currentStroke);
      state.currentStroke = null;
      drawStrokes();
    }
    state.isDrawing = false;
    state.isPanning = false;
    if (state.tool === 'pan') {
      viewport.style.cursor = 'grab';
    }
  };

  // Mouse listeners
  viewport.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Only left click
    // Don't draw if clicking a card or button
    if (e.target.closest('.wb-card') || e.target.closest('.whiteboard-controls') || e.target.closest('.card-delete-btn')) {
      return;
    }
    handleStart(e.clientX, e.clientY);
  });
  
  window.addEventListener('mousemove', (e) => {
    handleMove(e.clientX, e.clientY);
  });
  
  window.addEventListener('mouseup', () => {
    handleEnd();
  });

  // Touch support for tablets
  viewport.addEventListener('touchstart', (e) => {
    if (e.target.closest('.wb-card') || e.target.closest('.whiteboard-controls') || e.target.closest('.card-delete-btn')) {
      return;
    }
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
    e.preventDefault();
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (state.isDrawing || state.isPanning) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('touchend', () => {
    handleEnd();
  });
}

// Eraser logic
function eraseAt(x, y) {
  const eraseRadius = 15;
  let changed = false;
  
  state.strokes = state.strokes.filter(stroke => {
    // Keep stroke if no point is within eraser radius
    const intersects = stroke.points.some(p => {
      const dist = Math.hypot(p.x - x, p.y - y);
      return dist <= eraseRadius;
    });
    
    if (intersects) changed = true;
    return !intersects; // discard if intersects
  });
  
  if (changed) {
    drawStrokes();
  }
}

// ----------------------------------------------------
// CARD (DOM ELEMENTS) MANAGEMENT
// ----------------------------------------------------
function createCard(cardData) {
  const card = document.createElement('div');
  card.id = cardData.id;
  card.className = `wb-card`;
  card.style.left = `${cardData.x}px`;
  card.style.top = `${cardData.y}px`;
  
  // Custom Styling by Type
  if (cardData.type === 'title') {
    card.className += ' wb-card-title';
    card.style.color = cardData.color || 'var(--wb-green)';
    card.innerHTML = `
      <input type="text" value="${cardData.content}" placeholder="Titre...">
      <div class="wb-card-title-underline"></div>
    `;
    const input = card.querySelector('input');
    input.addEventListener('change', (e) => {
      cardData.content = e.target.value;
      updateCourseTitleFromDOM(e.target.value);
    });
    // Auto-adjust title card width based on text
    input.style.width = `${Math.max(input.value.length * 15, 120)}px`;
    input.addEventListener('input', (e) => {
      input.style.width = `${Math.max(e.target.value.length * 15, 120)}px`;
    });
  } 
  
  else if (cardData.type === 'text') {
    card.className += ' wb-card-text';
    card.style.color = cardData.color || 'var(--wb-dark)';
    card.innerHTML = `
      <textarea placeholder="Écrivez ici...">${cardData.content}</textarea>
    `;
    const textarea = card.querySelector('textarea');
    
    // Auto resize textarea
    const autoResize = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };
    
    textarea.addEventListener('input', autoResize);
    textarea.addEventListener('change', (e) => {
      cardData.content = e.target.value;
    });
    
    // Trigger resize after adding to DOM
    setTimeout(autoResize, 10);
  } 
  
  else if (cardData.type === 'key-points') {
    card.className += ' wb-card-key-points';
    card.style.color = cardData.color || 'var(--wb-blue)';
    
    let listItemsHTML = '';
    cardData.content.forEach((pt, idx) => {
      listItemsHTML += `<li contenteditable="true" data-index="${idx}">${pt}</li>`;
    });
    
    card.innerHTML = `
      <div class="wb-key-points-title" contenteditable="true">${cardData.title || 'Points clés'}</div>
      <ul class="wb-key-points-list">
        ${listItemsHTML}
      </ul>
    `;
    
    // Listeners for updates
    const titleEl = card.querySelector('.wb-key-points-title');
    titleEl.addEventListener('blur', (e) => {
      cardData.title = e.target.innerText;
    });
    
    const items = card.querySelectorAll('.wb-key-points-list li');
    items.forEach(li => {
      li.addEventListener('blur', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        cardData.content[idx] = e.target.innerText;
      });
    });
  } 
  
  else if (cardData.type === 'image') {
    card.className += ' wb-card-pinned';
    card.style.borderColor = cardData.color || 'var(--color-border-light)';
    
    let labelsHTML = '';
    if (cardData.labels) {
      cardData.labels.forEach(lbl => {
        labelsHTML += `<div class="image-label-pin" style="left:${lbl.x}; top:${lbl.y};">${lbl.text}</div>`;
      });
    }
    
    card.innerHTML = `
      <div class="pushpin ${cardData.pinColor || 'blue'}"></div>
      <div class="wb-card-image-title">${cardData.title || 'Image'}</div>
      <div class="wb-card-image-container">
        <img src="${cardData.imageUrl}" alt="Microscope Detail">
        ${labelsHTML}
      </div>
    `;
  } 
  
  else if (cardData.type === 'question') {
    card.className += ' wb-card-pinned wb-card-question';
    
    card.innerHTML = `
      <div class="pushpin ${cardData.pinColor || 'purple'}"></div>
      <div class="wb-card-question-title" contenteditable="true">${cardData.title || 'Question'}</div>
      <div class="wb-card-question-body" contenteditable="true">${cardData.content}</div>
    `;
    
    const titleEl = card.querySelector('.wb-card-question-title');
    titleEl.addEventListener('blur', (e) => {
      cardData.title = e.target.innerText;
    });
    
    const bodyEl = card.querySelector('.wb-card-question-body');
    bodyEl.addEventListener('blur', (e) => {
      cardData.content = e.target.innerText;
    });
  }
  
  else if (cardData.type === 'diagram') {
    card.className += ' wb-card-diagram';
    
    // We fetch the SVG code or put an image
    card.innerHTML = `
      <object type="image/svg+xml" data="${cardData.imageUrl}" style="pointer-events:none; width:100%"></object>
    `;
  }

  // Add common delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'card-delete-btn';
  deleteBtn.innerHTML = '&times;';
  deleteBtn.title = 'Supprimer cette carte';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteCard(cardData.id);
  });
  card.appendChild(deleteBtn);

  // Drag and Drop implementation
  makeCardDraggable(card, cardData);

  cardsLayer.appendChild(card);
}

function makeCardDraggable(cardElement, cardData) {
  let startX, startY;
  
  const onMouseDown = (e) => {
    if (state.tool !== 'select') return; // Can only drag in select tool
    if (e.target.closest('input') || e.target.closest('textarea') || e.target.closest('[contenteditable="true"]') || e.target.closest('.card-delete-btn')) {
      return; // allow text selection
    }
    
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    // Math adjusted for zoom scale
    const dx = (e.clientX - startX) / state.zoom;
    const dy = (e.clientY - startY) / state.zoom;
    
    cardData.x += dx;
    cardData.y += dy;
    
    cardElement.style.left = `${cardData.x}px`;
    cardElement.style.top = `${cardData.y}px`;
    
    startX = e.clientX;
    startY = e.clientY;
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  // Touch dragging
  const onTouchStart = (e) => {
    if (state.tool !== 'select') return;
    if (e.target.closest('input') || e.target.closest('textarea') || e.target.closest('[contenteditable="true"]') || e.target.closest('.card-delete-btn')) {
      return;
    }
    
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  };

  const onTouchMove = (e) => {
    const touch = e.touches[0];
    const dx = (touch.clientX - startX) / state.zoom;
    const dy = (touch.clientY - startY) / state.zoom;
    
    cardData.x += dx;
    cardData.y += dy;
    
    cardElement.style.left = `${cardData.x}px`;
    cardElement.style.top = `${cardData.y}px`;
    
    startX = touch.clientX;
    startY = touch.clientY;
    e.preventDefault();
  };

  const onTouchEnd = () => {
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
  };

  cardElement.addEventListener('mousedown', onMouseDown);
  cardElement.addEventListener('touchstart', onTouchStart);
}

function renderAllCards() {
  cardsLayer.innerHTML = '';
  state.cards.forEach(cardData => {
    createCard(cardData);
  });
}

function deleteCard(cardId) {
  state.cards = state.cards.filter(c => c.id !== cardId);
  const cardEl = document.getElementById(cardId);
  if (cardEl) cardEl.remove();
}

function updateCourseTitleFromDOM(newTitle) {
  state.courseTitle = newTitle || 'Nouveau cours';
  courseTitleDisplay.textContent = state.courseTitle;
}

// ----------------------------------------------------
// NAVIGATION & TOOL BUTTON EVENTS
// ----------------------------------------------------
function setTool(toolName) {
  state.tool = toolName;
  
  // UI states
  btnWrite.classList.remove('active');
  btnSelect.classList.remove('active');
  btnErase.classList.remove('active');
  btnPanMode.classList.remove('active');
  
  if (toolName === 'pencil') {
    btnWrite.classList.add('active');
    viewport.style.cursor = 'crosshair';
  } else if (toolName === 'select') {
    btnSelect.classList.add('active');
    viewport.style.cursor = 'default';
  } else if (toolName === 'eraser') {
    btnErase.classList.add('active');
    viewport.style.cursor = 'cell';
  } else if (toolName === 'pan') {
    btnPanMode.classList.add('active');
    viewport.style.cursor = 'grab';
  }
}

function setupNavEvents() {
  btnWrite.addEventListener('click', () => setTool('pencil'));
  btnSelect.addEventListener('click', () => setTool('select'));
  btnErase.addEventListener('click', () => setTool('eraser'));
  btnPanMode.addEventListener('click', () => setTool('pan'));
  
  // AI Panel toggle
  btnAI.addEventListener('click', () => {
    aiPanel.classList.toggle('collapsed');
    btnAI.classList.toggle('active-panel');
  });

  // History button
  btnHistory.addEventListener('click', () => {
    openHistoryModal();
  });

  // New course page
  btnNew.addEventListener('click', () => {
    if (confirm('Voulez-vous créer une nouvelle page ? Le cours actuel sera sauvegardé.')) {
      saveCourse(true); // Save current first
      startNewCourse();
    }
  });

  // Share course
  btnShare.addEventListener('click', () => {
    openShareModal();
  });

  // Home dashboard redirection (or save and display home alert)
  btnHome.addEventListener('click', () => {
    saveCourse(false);
    alert('Retour à l\'accueil. Tous vos cours ont été sauvegardés.');
  });

  // Settings
  btnSettings.addEventListener('click', () => {
    openSettingsModal();
  });
  
  // Zoom actions
  btnZoomIn.addEventListener('click', () => {
    state.zoom = Math.min(state.zoom + 0.1, 2.5);
    updateZoomUI();
  });
  
  btnZoomOut.addEventListener('click', () => {
    state.zoom = Math.max(state.zoom - 0.1, 0.4);
    updateZoomUI();
  });
}

function updateZoomUI() {
  zoomLevelText.textContent = `${Math.round(state.zoom * 100)}%`;
  updateViewportTransform();
}

function startNewCourse() {
  state.courseId = 'course-' + Date.now();
  state.courseTitle = 'Cours de Biologie';
  state.courseSubject = 'Biologie';
  state.strokes = [];
  state.cards = [];
  state.lastSpeechPosition = { x: 100, y: 150 };
  
  courseTitleDisplay.textContent = state.courseTitle;
  courseSubjectDisplay.textContent = state.courseSubject;
  
  // Add a default header title card
  const newTitleCard = {
    id: 'card-' + Date.now(),
    type: 'title',
    content: state.courseTitle,
    x: 150,
    y: 80,
    color: 'var(--wb-green)',
    isPinned: false
  };
  state.cards.push(newTitleCard);
  
  drawStrokes();
  renderAllCards();
  
  // Reset AI summary
  aiSummaryText.textContent = "L'Assistant IA écoutera vos paroles pour générer des résumés.";
  
  saveCourse(false);
}

// ----------------------------------------------------
// VOICE TRANSCRIPTION (WEB SPEECH API)
// ----------------------------------------------------
function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn("La reconnaissance vocale n'est pas prise en charge par ce navigateur.");
    btnSpeech.style.opacity = 0.5;
    btnSpeech.title = "Dictée vocale non disponible sur ce navigateur";
    return;
  }
  
  const rec = new SpeechRecognition();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = 'fr-FR';
  
  rec.onstart = () => {
    state.isRecording = true;
    btnSpeech.classList.add('active');
    recordingIndicator.classList.remove('hidden');
    speechOverlay.classList.remove('hidden');
    speechLiveText.textContent = "Microphone branché... Parlez maintenant";
  };
  
  rec.onerror = (e) => {
    console.error('Speech recognition error:', e.error);
    stopRecording();
  };
  
  rec.onend = () => {
    if (state.isRecording) {
      // Auto-restart if it cuts out unexpectedly (e.g. timeout)
      try {
        rec.start();
      } catch (err) {
        stopRecording();
      }
    } else {
      stopRecording();
    }
  };
  
  rec.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    
    // Live update interim text in bottom overlay
    if (interimTranscript) {
      speechLiveText.textContent = interimTranscript;
    }
    
    if (finalTranscript) {
      handleFinalizedSpeech(finalTranscript.trim());
    }
  };
  
  state.recognition = rec;
  
  btnSpeech.addEventListener('click', () => {
    if (state.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  });
}

function startRecording() {
  if (state.recognition) {
    try {
      state.recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
    }
  }
}

function stopRecording() {
  state.isRecording = false;
  btnSpeech.classList.remove('active');
  recordingIndicator.classList.add('hidden');
  speechOverlay.classList.add('hidden');
  if (state.recognition) {
    try {
      state.recognition.stop();
    } catch (err) {}
  }
}

// Processing finalized voice lines
function handleFinalizedSpeech(text) {
  if (!text) return;
  
  console.log("Speech Finalized:", text);
  speechLiveText.textContent = text;
  
  // Auto-generate content on board using intelligent keywords
  if (state.speechKeywordsEnabled) {
    const textLower = text.toLowerCase();
    
    // 1. Title Change Keyword: e.g. "commencer le cours sur la photosynthèse" or "leçon biologie..."
    if (textLower.includes('commencer le cours sur') || textLower.includes('titre du cours')) {
      const match = text.match(/(?:commencer le cours sur|titre du cours)\s+(.*)/i);
      if (match && match[1]) {
        const titleText = capitalizeFirstLetter(match[1].trim());
        updateCourseTitleFromDOM(titleText);
        
        // Update or spawn title card
        let titleCard = state.cards.find(c => c.type === 'title');
        if (titleCard) {
          titleCard.content = titleText;
          const input = document.getElementById(titleCard.id)?.querySelector('input');
          if (input) {
            input.value = titleText;
            input.style.width = `${Math.max(titleText.length * 15, 120)}px`;
          }
        }
        updateAISummary("Nouveau sujet de cours détecté : " + titleText);
        return;
      }
    }
    
    // 2. Points Clés Keyword: "points clés" or "points importants"
    if (textLower.includes('points clés') || textLower.includes('points importants')) {
      const kpCard = {
        id: 'card-' + Date.now(),
        type: 'key-points',
        title: 'Points clés',
        content: [
          'Les plantes absorbent la lumière',
          'Elles consomment du CO₂ et de l\'eau',
          'Elles fabriquent du glucose',
          'Elles rejettent de l\'oxygène'
        ],
        x: state.lastSpeechPosition.x + 350,
        y: state.lastSpeechPosition.y - 50,
        color: 'var(--wb-blue)',
        isPinned: false
      };
      state.cards.push(kpCard);
      createCard(kpCard);
      updateAISummary("Ajout de la section des points clés sur le tableau.");
      return;
    }
    
    // 3. Question Keyword: "question pourquoi..." or "question comment..." or "pourquoi..."
    if (textLower.startsWith('question') || textLower.includes('pourquoi la lumière est-elle essentielle')) {
      const cleanText = text.replace(/^question:?\s*/i, '');
      const qCard = {
        id: 'card-' + Date.now(),
        type: 'question',
        title: 'Question',
        content: cleanText.includes('essentielle') ? 'Pourquoi la lumière est-elle essentielle à la photosynthèse ?' : cleanText,
        x: state.lastSpeechPosition.x + 350,
        y: state.lastSpeechPosition.y + 400,
        color: 'var(--wb-purple)',
        isPinned: true,
        pinColor: 'purple'
      };
      state.cards.push(qCard);
      createCard(qCard);
      updateAISummary("Question importante épinglée sur le tableau.");
      return;
    }

    // 4. Diagram Keyword: "schéma" or "schéma de la photosynthèse"
    if (textLower.includes('générer un schéma') || textLower.includes('dessiner le schéma') || textLower.includes('schéma de la photosynthèse')) {
      // Check if schema already exists to prevent duplicate
      if (!state.cards.some(c => c.type === 'diagram')) {
        const diagCard = {
          id: 'card-' + Date.now(),
          type: 'diagram',
          title: 'Schéma',
          imageUrl: 'assets/plant.svg',
          x: state.lastSpeechPosition.x - 20,
          y: state.lastSpeechPosition.y + 100
        };
        state.cards.push(diagCard);
        createCard(diagCard);
        updateAISummary("Le schéma de la photosynthèse a été généré sur le tableau blanc.");
        return;
      }
    }
    
    // 5. Image cell Keyword: "image de la feuille" or "cellules de feuille"
    if (textLower.includes('image ajoutée') || textLower.includes('image de la feuille') || textLower.includes('structure de la feuille')) {
      if (!state.cards.some(c => c.type === 'image')) {
        const imgCard = {
          id: 'card-' + Date.now(),
          type: 'image',
          title: 'Image ajoutée',
          imageUrl: 'assets/leaf.svg',
          labels: [
            { text: 'Stomate', x: '80%', y: '30%' },
            { text: 'Chloroplaste', x: '80%', y: '70%' }
          ],
          x: state.lastSpeechPosition.x + 350,
          y: state.lastSpeechPosition.y + 150,
          color: 'var(--wb-green)',
          isPinned: true,
          pinColor: 'blue'
        };
        state.cards.push(imgCard);
        createCard(imgCard);
        updateAISummary("Image au microscope de la feuille ajoutée au tableau.");
        return;
      }
    }
  }
  
  // Standard text card fallback for normal voice comments
  // Clean text and create a handwritten card on the board
  const newTextCard = {
    id: 'card-' + Date.now(),
    type: 'text',
    content: text,
    x: state.lastSpeechPosition.x,
    y: state.lastSpeechPosition.y,
    color: 'var(--wb-dark)',
    isPinned: false
  };
  
  state.cards.push(newTextCard);
  createCard(newTextCard);
  
  // Advance vertical placement position so cards don't overlap too much
  state.lastSpeechPosition.y += 120;
  if (state.lastSpeechPosition.y > 600) {
    state.lastSpeechPosition.y = 180;
    state.lastSpeechPosition.x += 100; // shift right
  }
  
  // Update AI Panel automatic summary
  triggerAISummaryGeneration();
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// ----------------------------------------------------
// AI ASSISTANT PANEL LOGIC
// ----------------------------------------------------
function updateAISummary(text) {
  aiSummaryText.textContent = text;
}

function triggerAISummaryGeneration() {
  // Aggregate all text on the board to form a coherent simulated AI summary
  const textCards = state.cards.filter(c => c.type === 'text' || c.type === 'question');
  
  if (textCards.length === 0) return;
  
  // Simple summary generation logic simulation based on transcription text
  let summary = "";
  const keywords = {
    photosynthese: "La photosynthèse est étudiée pour comprendre comment la plante produit de l'énergie.",
    lumiere: "La lumière du soleil sert de catalyseur principal pour diviser l'eau et le CO₂.",
    eau: "L'eau (H₂O) est puisée dans les racines et fournit des électrons.",
    carbon: "Le CO₂ est capté par les stomates pour synthétiser des glucides.",
    oxygene: "L'oxygène (O₂) est produit en tant que déchet métabolique libéré dans l'atmosphère."
  };
  
  let detected = [];
  const fullText = textCards.map(c => c.content).join(" ").toLowerCase();
  
  for (let kw in keywords) {
    if (fullText.includes(kw)) {
      detected.push(keywords[kw]);
    }
  }
  
  if (detected.length > 0) {
    summary = detected.join(" ") + " Le cours actuel détaille cette chaîne biochimique essentielle.";
  } else {
    // general fallback
    summary = "L'enseignant aborde les notions de biologie végétale. Le tableau se structure au fur et à mesure de l'explication.";
  }
  
  updateAISummary(summary);
}

function setupAIPanelEvents() {
  btnCloseAIPanel.addEventListener('click', () => {
    aiPanel.classList.add('collapsed');
    btnAI.classList.remove('active-panel');
  });
  
  btnSendAIChat.addEventListener('click', handleAIChatSubmit);
  aiChatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAIChatSubmit();
  });
  
  // Suggestions
  btnSuggestSummarize.addEventListener('click', () => {
    // Add a summary card directly onto the whiteboard
    const summaryCard = {
      id: 'card-summary-' + Date.now(),
      type: 'text',
      content: "Résumé de l'IA : " + aiSummaryText.textContent,
      x: 150,
      y: state.lastSpeechPosition.y,
      color: '#0d47a1', // deep dark blue
      isPinned: false
    };
    state.cards.push(summaryCard);
    createCard(summaryCard);
    state.lastSpeechPosition.y += 150;
  });
  
  btnSuggestSchema.addEventListener('click', () => {
    // Add diagram manually
    if (!state.cards.some(c => c.type === 'diagram')) {
      const diagCard = {
        id: 'card-' + Date.now(),
        type: 'diagram',
        title: 'Schéma',
        imageUrl: 'assets/plant.svg',
        x: 130,
        y: 280
      };
      state.cards.push(diagCard);
      createCard(diagCard);
    } else {
      alert("Le schéma de la photosynthèse est déjà présent sur le tableau !");
    }
  });
  
  btnSuggestExamples.addEventListener('click', () => {
    // Add Examples Card
    const exCard = {
      id: 'card-examples-' + Date.now(),
      type: 'key-points',
      title: 'Organismes réalisant la photosynthèse',
      content: [
        'Plantes terrestres (arbres, herbe)',
        'Algues aquatiques (vertes, rouges, brunes)',
        'Cyanobactéries (phytoplancton)'
      ],
      x: 520,
      y: state.lastSpeechPosition.y,
      color: '#2e7d32',
      isPinned: false
    };
    state.cards.push(exCard);
    createCard(exCard);
  });
}

function handleAIChatSubmit() {
  const query = aiChatInput.value.trim();
  if (!query) return;
  
  aiChatInput.value = '';
  
  // Add question card to whiteboard to show active participation
  const userQCard = {
    id: 'card-chat-' + Date.now(),
    type: 'question',
    title: 'Question élève',
    content: query,
    x: 300,
    y: 350,
    color: '#6a1b9a',
    isPinned: true,
    pinColor: 'purple'
  };
  state.cards.push(userQCard);
  createCard(userQCard);
  
  // Simple automatic intelligent answers simulator
  let response = "D'après notre cours sur la photosynthèse : ";
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('pourquoi') && queryLower.includes('lumière')) {
    response += "La lumière apporte l'énergie lumineuse nécessaire pour casser les molécules d'eau (H₂O) au niveau des thylakoïdes dans les chloroplastes, ce qui initie la phase photo-chimique.";
  } else if (queryLower.includes('co2') || queryLower.includes('carbone')) {
    response += "Le CO₂ est capté par les stomates et est incorporé lors du cycle de Calvin pour former des sucres (comme le glucose). C'est la phase sombre.";
  } else if (queryLower.includes('oxygene') || queryLower.includes('o2')) {
    response += "L'oxygène (O₂) provient de la photolyse de l'eau. Il est rejeté à l'extérieur de la feuille via les stomates.";
  } else {
    response += "Les stomates de la feuille régulent les échanges gazeux (absorption de CO₂, émission d'O₂ et de vapeur d'eau). Les chloroplastes captent la lumière grâce à la chlorophylle.";
  }
  
  // Trigger AI text to summary/chat display
  alert(`Réponse de l'Assistant IA :\n\n${response}`);
  
  // Add response card
  const responseCard = {
    id: 'card-response-' + Date.now(),
    type: 'text',
    content: response,
    x: 350,
    y: 450,
    color: '#1b5e20',
    isPinned: false
  };
  state.cards.push(responseCard);
  createCard(responseCard);
}

// ----------------------------------------------------
// DATABASE & HISTORY PERSISTENCE (BACKEND API CALLS)
// ----------------------------------------------------
async function loadCourse(id) {
  try {
    const res = await fetch(`${state.backendUrl}/api/courses/${id}`);
    if (!res.ok) throw new Error('Course not found in backend');
    const data = await res.json();
    
    // Load state
    state.courseId = data.id;
    state.courseTitle = data.title;
    state.courseSubject = data.subject || 'Biologie';
    
    courseTitleDisplay.textContent = state.courseTitle;
    courseSubjectDisplay.textContent = state.courseSubject;
    
    // Load strokes
    if (data.canvasData) {
      try {
        const canvasObj = JSON.parse(data.canvasData);
        state.strokes = canvasObj.strokes || [];
      } catch (err) {
        state.strokes = [];
      }
    } else {
      state.strokes = [];
    }
    
    // Load cards
    state.cards = data.cardsData || [];
    
    // Load AI panel summary
    if (data.summary) {
      aiSummaryText.textContent = data.summary;
    }
    
    drawStrokes();
    renderAllCards();
    
    // Reset view pan/zoom
    state.zoom = 1.0;
    state.panX = 0;
    state.panY = 0;
    updateViewportTransform();
    updateZoomUI();
    
    console.log('Course loaded successfully:', id);
  } catch (err) {
    console.error('Error loading course from server, falling back to local simulation:', err);
    if (id === 'biology-photosynthesis') {
      // Local fallback template matching the exact screenshot design
      state.courseId = 'biology-photosynthesis';
      state.courseTitle = 'Photosynthèse';
      state.courseSubject = 'Biologie';
      
      courseTitleDisplay.textContent = state.courseTitle;
      courseSubjectDisplay.textContent = state.courseSubject;
      
      state.strokes = [];
      state.cards = [
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
      ];
      
      aiSummaryText.textContent = 'La photosynthèse est le processus par lequel les plantes utilisent la lumière, le CO₂ et l\'eau pour produire du sucre et libérer de l\'oxygène.';
      
      drawStrokes();
      renderAllCards();
      
      state.zoom = 1.0;
      state.panX = 0;
      state.panY = 0;
      updateViewportTransform();
      updateZoomUI();
    } else {
      startNewCourse();
    }
  }
}

async function saveCourse(showToast = false) {
  try {
    const payload = {
      id: state.courseId,
      title: state.courseTitle,
      subject: state.courseSubject,
      canvasData: JSON.stringify({ strokes: state.strokes }),
      cardsData: state.cards,
      summary: aiSummaryText.textContent
    };
    
    const res = await fetch(`${state.backendUrl}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error('API saving failed');
    const data = await res.json();
    
    state.courseId = data.id;
    
    if (showToast) {
      alert(`Cours "${state.courseTitle}" sauvegardé avec succès !`);
    }
  } catch (err) {
    console.error('Failed to auto-save course to backend:', err);
  }
}

// ----------------------------------------------------
// MODAL DIALOGS (HISTORY, SHARE, SETTINGS)
// ----------------------------------------------------
function setupModalEvents() {
  btnCloseHistory.addEventListener('click', () => historyOverlay.classList.add('hidden'));
  btnCloseShare.addEventListener('click', () => shareOverlay.classList.add('hidden'));
  btnCloseSettings.addEventListener('click', () => settingsOverlay.classList.add('hidden'));
  
  // Close on backdrop click
  [historyOverlay, shareOverlay, settingsOverlay].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  });
  
  // Share Copy Link
  btnCopyShareLink.addEventListener('click', () => {
    shareLinkInput.select();
    document.execCommand('copy');
    alert('Lien de partage copié dans le presse-papiers !');
  });

  // Settings Save
  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.backendUrl = document.getElementById('backend-url').value;
    const lang = document.getElementById('mic-language').value;
    if (state.recognition) {
      state.recognition.lang = lang;
    }
    state.speechKeywordsEnabled = document.getElementById('ai-smart-mode').checked;
    
    // Save to localStorage
    localStorage.setItem('ideagrid_settings', JSON.stringify({
      backendUrl: state.backendUrl,
      lang: lang,
      smartKeywords: state.speechKeywordsEnabled,
      autoSave: document.getElementById('auto-save').checked
    }));
    
    setupAutoSave(); // reset auto-save timer if changed
    
    settingsOverlay.classList.add('hidden');
    alert('Paramètres enregistrés !');
  });

  // Export JSON
  btnExportJSON.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      title: state.courseTitle,
      subject: state.courseSubject,
      strokes: state.strokes,
      cards: state.cards,
      summary: aiSummaryText.textContent
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${state.courseTitle.replace(/\s+/g, '_')}_ideagrid.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  // Export PNG (canvas drawings only)
  btnExportPNG.addEventListener('click', () => {
    // Generate image from drawing canvas
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.download = `${state.courseTitle.replace(/\s+/g, '_')}_dessins.png`;
    link.href = dataURL;
    link.click();
  });
}

async function openHistoryModal() {
  historyOverlay.classList.remove('hidden');
  historyList.innerHTML = '<div class="history-placeholder">Chargement...</div>';
  
  try {
    const res = await fetch(`${state.backendUrl}/api/courses`);
    if (!res.ok) throw new Error();
    const courses = await res.json();
    
    if (courses.length === 0) {
      historyList.innerHTML = '<div class="history-placeholder">Aucun cours sauvegardé pour le moment.</div>';
      return;
    }
    
    historyList.innerHTML = '';
    courses.forEach(c => {
      const item = document.createElement('div');
      item.className = 'history-item';
      
      const date = new Date(c.updatedAt).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      });
      
      item.innerHTML = `
        <div class="history-info">
          <div class="history-title">${c.subject || 'Biologie'} : ${c.title || 'Sans titre'}</div>
          <div class="history-meta">Modifié le ${date}</div>
        </div>
        <div class="history-actions">
          <button class="history-btn-del" title="Supprimer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;
      
      // Load course on click (except if clicking delete button)
      item.addEventListener('click', (e) => {
        if (e.target.closest('.history-btn-del')) return;
        loadCourse(c.id);
        historyOverlay.classList.add('hidden');
      });
      
      // Delete event
      const delBtn = item.querySelector('.history-btn-del');
      delBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`Voulez-vous vraiment supprimer le cours "${c.title}" ?`)) {
          try {
            const delRes = await fetch(`${state.backendUrl}/api/courses/${c.id}`, { method: 'DELETE' });
            if (delRes.ok) {
              item.remove();
              if (state.courseId === c.id) {
                startNewCourse(); // Reset active view if deleted
              }
            }
          } catch (err) {
            alert('Erreur lors de la suppression.');
          }
        }
      });
      
      historyList.appendChild(item);
    });
  } catch (err) {
    historyList.innerHTML = '<div class="history-placeholder error">Impossible de contacter le serveur backend.</div>';
  }
}

function openShareModal() {
  shareOverlay.classList.remove('hidden');
  
  // Set shareable link containing course ID
  const shareLink = `${window.location.origin}${window.location.pathname}?courseId=${state.courseId}`;
  shareLinkInput.value = shareLink;
}

function openSettingsModal() {
  settingsOverlay.classList.remove('hidden');
  document.getElementById('backend-url').value = state.backendUrl;
  if (state.recognition) {
    document.getElementById('mic-language').value = state.recognition.lang;
  }
  document.getElementById('ai-smart-mode').checked = state.speechKeywordsEnabled;
}

function loadAppSettings() {
  const local = localStorage.getItem('ideagrid_settings');
  if (local) {
    try {
      const data = JSON.parse(local);
      state.backendUrl = data.backendUrl || 'http://localhost:3000';
      state.speechKeywordsEnabled = data.smartKeywords !== undefined ? data.smartKeywords : true;
    } catch (e) {}
  }
}

function setupAutoSave() {
  if (state.autoSaveInterval) {
    clearInterval(state.autoSaveInterval);
  }
  
  const local = localStorage.getItem('ideagrid_settings');
  let autoSaveEnabled = true;
  if (local) {
    try {
      autoSaveEnabled = JSON.parse(local).autoSave !== false;
    } catch (e) {}
  }
  
  if (autoSaveEnabled) {
    state.autoSaveInterval = setInterval(() => {
      saveCourse(false); // Silent save
    }, 30000); // 30 seconds
  }
}

// Start
document.addEventListener('DOMContentLoaded', init);
