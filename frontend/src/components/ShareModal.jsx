import React, { useRef } from 'react';

export default function ShareModal({ isOpen, onClose, courseId, courseTitle, onExportPNG, onExportJSON }) {
  const shareLinkInputRef = useRef(null);
  
  if (!isOpen) return null;

  const shareLink = `${window.location.origin}${window.location.pathname}?courseId=${courseId}`;

  const handleCopyLink = () => {
    if (shareLinkInputRef.current) {
      shareLinkInputRef.current.select();
      navigator.clipboard.writeText(shareLink);
      alert('Lien de partage copié dans le presse-papiers !');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card share-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Partager ce cours</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p className="share-desc">Partagez ce cours avec vos élèves ou vos collègues. Copiez le lien ci-dessous :</p>
          <div className="share-link-wrapper">
            <input
              type="text"
              ref={shareLinkInputRef}
              readOnly
              value={shareLink}
              id="share-link-url"
            />
            <button type="button" className="btn btn-primary" onClick={handleCopyLink}>
              Copier le lien
            </button>
          </div>
          
          <div className="export-options">
            <h3>Options d'exportation</h3>
            <div class="export-buttons">
              <button type="button" className="btn btn-secondary" onClick={onExportPNG}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="btn-icon">
                  <path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2V3zm1 9 2.5-3 2.5 3h7l-5-6-5 6h-2z"/>
                </svg>
                Exporter en Image (PNG)
              </button>
              <button type="button" className="btn btn-secondary" onClick={onExportJSON}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="btn-icon">
                  <path d="M4.5 1h7A1.5 1.5 0 0 1 13 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 13.5v-11A1.5 1.5 0 0 1 4.5 1zm0 1a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-7z"/>
                </svg>
                Télécharger les données (JSON)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
