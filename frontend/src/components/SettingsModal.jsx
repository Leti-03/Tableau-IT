import React, { useState, useEffect } from 'react';

export default function SettingsModal({ isOpen, onClose, settings, onSaveSettings }) {
  const [backendUrl, setBackendUrl] = useState('http://localhost:3000');
  const [lang, setLang] = useState('fr-FR');
  const [autoSave, setAutoSave] = useState(true);
  const [smartKeywords, setSmartKeywords] = useState(true);

  useEffect(() => {
    if (settings) {
      setBackendUrl(settings.backendUrl || 'http://localhost:3000');
      setLang(settings.lang || 'fr-FR');
      setAutoSave(settings.autoSave !== false);
      setSmartKeywords(settings.smartKeywords !== false);
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      backendUrl,
      lang,
      autoSave,
      smartKeywords,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card settings-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Paramètres de l'application</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="backend-url">Adresse du serveur Backend :</label>
              <input
                type="text"
                id="backend-url"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="http://localhost:3000"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="mic-language">Langue de la reconnaissance vocale :</label>
              <select
                id="mic-language"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                <option value="fr-FR">Français (France)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
                <option value="de-DE">Deutsch</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="auto-save"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
              />
              <label htmlFor="auto-save">Sauvegarde automatique toutes les 30 secondes</label>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="ai-smart-mode"
                checked={smartKeywords}
                onChange={(e) => setSmartKeywords(e.target.checked)}
              />
              <label htmlFor="ai-smart-mode">
                Détection intelligente de mots-clés (Crée automatiquement des schémas/points clés en parlant)
              </label>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Enregistrer les paramètres</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
