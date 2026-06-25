import React, { useState } from 'react';
import { Bot, X, List, Share2, Lightbulb, Send } from 'lucide-react';

export default function AIPanel({ isOpen, onClose, summary, onSuggestAction, onSendMessage }) {
  const [chatInput, setChatInput] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    const text = chatInput.trim();
    if (!text) return;
    onSendMessage(text);
    setChatInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <aside className="ai-panel">
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <Bot className="ai-robot-icon" />
          <h3>Assistant IA</h3>
        </div>
        <button type="button" className="close-btn" onClick={onClose} title="Fermer">
          <X size={18} />
        </button>
      </div>
      
      <div className="panel-content">
        {/* Summary Section */}
        <section className="ai-section">
          <h4 className="section-title">Résumé du contenu</h4>
          <div className="ai-summary-card">
            <p>{summary || "L'Assistant IA écoutera vos paroles pour générer des résumés."}</p>
          </div>
        </section>
        
        {/* Mini Diagram Preview */}
        <section className="ai-section">
          <h4 className="section-title">Schéma généré par l'IA</h4>
          <div className="ai-diagram-card">
            <svg viewBox="0 0 160 120" width="100%" height="100%">
              {/* Sun */}
              <circle cx="20" cy="20" r="8" fill="#fbc02d" opacity="0.8" />
              <path d="M 20 20 L 50 40" stroke="#f57f17" strokeWidth="1" strokeDasharray="2 2" />
              {/* Plant */}
              <line x1="80" y1="100" x2="80" y2="50" stroke="#2e7d32" strokeWidth="3" />
              <path d="M 80 80 Q 60 70 65 60 Q 80 75 80 80" fill="#4caf50" />
              <path d="M 80 70 Q 100 60 95 50 Q 80 65 80 70" fill="#4caf50" />
              <path d="M 80 100 Q 70 115 80 120 M 80 100 Q 90 115 85 120" stroke="#795548" strokeWidth="1.5" />
              {/* Labels */}
              <text x="5" y="40" fontSize="7" fill="#666">Lumière</text>
              <text x="35" y="80" fontSize="8" fill="#333">CO₂</text>
              <text x="35" y="110" fontSize="8" fill="#333">H₂O</text>
              <text x="120" y="65" fontSize="8" fill="#333">O₂</text>
              <text x="120" y="95" fontSize="8" fill="#333">Sucre</text>
              {/* Arrows */}
              <path d="M 50 80 H 70" stroke="#555" strokeWidth="0.8" markerEnd="url(#mini-arrow)" />
              <path d="M 50 105 Q 70 105 75 102" stroke="#555" strokeWidth="0.8" markerEnd="url(#mini-arrow)" />
              <path d="M 90 65 H 115" stroke="#555" strokeWidth="0.8" markerEnd="url(#mini-arrow)" />
              <path d="M 90 95 H 115" stroke="#555" strokeWidth="0.8" markerEnd="url(#mini-arrow)" />
              
              <defs>
                <marker id="mini-arrow" markerWidth="6" markerHeight="4" refX="4" refY="2" orient="auto">
                  <polygon points="0 0, 6 2, 0 4" fill="#555" />
                </marker>
              </defs>
            </svg>
          </div>
        </section>
        
        {/* Quick Suggestions */}
        <section class="ai-section">
          <h4 className="section-title">Suggestions</h4>
          <div className="ai-suggestions-list">
            <button
              type="button"
              className="suggestion-btn"
              onClick={() => onSuggestAction('summarize')}
            >
              <List className="btn-icon" size={16} />
              <span>Résumer le contenu</span>
            </button>
            <button
              type="button"
              className="suggestion-btn"
              onClick={() => onSuggestAction('schema')}
            >
              <Share2 className="btn-icon" size={16} />
              <span>Générer un schéma</span>
            </button>
            <button
              type="button"
              className="suggestion-btn"
              onClick={() => onSuggestAction('examples')}
            >
              <Lightbulb className="btn-icon" size={16} />
              <span>Donner des exemples</span>
            </button>
          </div>
        </section>
      </div>
      
      {/* Chat Input */}
      <div className="panel-footer">
        <div className="chat-input-wrapper">
          <input
            type="text"
            id="ai-chat-input"
            placeholder="Posez votre question..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          <button
            type="button"
            className="send-btn"
            onClick={handleSend}
            title="Envoyer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
