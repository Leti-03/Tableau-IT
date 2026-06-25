import React from 'react';
import { 
  Pencil, 
  MousePointerSquareDashed, 
  Trash2, 
  Bot, 
  Clock, 
  FilePlus2, 
  Share2, 
  Home, 
  Settings 
} from 'lucide-react';

export default function Sidebar({ 
  tool, 
  setTool, 
  isAIPanelOpen, 
  toggleAIPanel, 
  onOpenHistory, 
  onNewPage, 
  onOpenShare, 
  onHome, 
  onOpenSettings 
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo-ig">IG</div>
        <span className="brand-text">IdeaGrid</span>
      </div>
      
      <nav className="sidebar-nav">
        {/* Tools Section */}
        <button 
          type="button" 
          className={`nav-item ${tool === 'pencil' ? 'active' : ''}`} 
          onClick={() => setTool('pencil')}
          title="Crayon pour dessiner"
        >
          <Pencil className="nav-icon" />
          <span className="nav-label">Écrire</span>
        </button>
        
        <button 
          type="button" 
          className={`nav-item ${tool === 'select' ? 'active' : ''}`} 
          onClick={() => setTool('select')}
          title="Sélectionner et déplacer les cartes"
        >
          <MousePointerSquareDashed className="nav-icon" />
          <span className="nav-label">Sélectionner</span>
        </button>
        
        <button 
          type="button" 
          className={`nav-item ${tool === 'eraser' ? 'active' : ''}`} 
          onClick={() => setTool('eraser')}
          title="Gomme"
        >
          <Trash2 className="nav-icon" />
          <span className="nav-label">Effacer</span>
        </button>
        
        <hr className="nav-separator" />
        
        {/* Smart Actions */}
        <button 
          type="button" 
          className={`nav-item ${isAIPanelOpen ? 'active' : ''}`} 
          onClick={toggleAIPanel}
          title="Activer l'assistant IA"
        >
          <div className="ai-nav-icon-container">
            <Bot className="nav-icon" style={{ strokeWidth: 2.2 }} />
          </div>
          <span className="nav-label">Assistant IA</span>
        </button>
        
        <button 
          type="button" 
          className="nav-item" 
          onClick={onOpenHistory}
          title="Historique des cours"
        >
          <Clock className="nav-icon" />
          <span className="nav-label">Historique</span>
        </button>
        
        <button 
          type="button" 
          className="nav-item" 
          onClick={onNewPage}
          title="Nouveau cours"
        >
          <FilePlus2 className="nav-icon" />
          <span className="nav-label">Nouvelle page</span>
        </button>
        
        <button 
          type="button" 
          className="nav-item" 
          onClick={onOpenShare}
          title="Partager le cours"
        >
          <Share2 className="nav-icon" />
          <span className="nav-label">Partager</span>
        </button>
      </nav>
      
      {/* Footer Nav */}
      <div className="sidebar-footer">
        <button 
          type="button" 
          className="nav-item" 
          onClick={onHome}
          title="Accueil Dashboard"
        >
          <Home className="nav-icon" />
          <span className="nav-label">Accueil</span>
        </button>
        
        <button 
          type="button" 
          className="nav-item" 
          onClick={onOpenSettings}
          title="Paramètres"
        >
          <Settings className="nav-icon" />
          <span className="nav-label">Paramètres</span>
        </button>
      </div>
    </aside>
  );
}
