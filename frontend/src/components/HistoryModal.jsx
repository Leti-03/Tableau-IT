import React, { useState, useEffect } from 'react';

export default function HistoryModal({ isOpen, onClose, onLoadCourse, backendUrl, activeCourseId, onResetCourse }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${backendUrl}/api/courses`);
      if (!res.ok) throw new Error('Impossible de charger les cours');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      setError('Erreur lors du chargement des cours. Vérifiez que le serveur backend est lancé.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen, backendUrl]);

  const handleDelete = async (e, id, title) => {
    e.stopPropagation();
    if (window.confirm(`Voulez-vous vraiment supprimer le cours "${title || 'Sans titre'}" ?`)) {
      try {
        const res = await fetch(`${backendUrl}/api/courses/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setCourses(courses.filter((c) => c.id !== id));
          if (activeCourseId === id) {
            onResetCourse(); // Reset active board if deleted
          }
        }
      } catch (err) {
        alert('Erreur lors de la suppression.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card history-card" onClick={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <h2>Historique des cours</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="history-list">
            {loading && <div className="history-placeholder">Chargement des cours...</div>}
            
            {error && <div className="history-placeholder error" style={{ color: '#ef5350' }}>{error}</div>}
            
            {!loading && !error && courses.length === 0 && (
              <div className="history-placeholder">Aucun cours sauvegardé pour le moment.</div>
            )}
            
            {!loading && !error && courses.map((course) => {
              const dateStr = new Date(course.updatedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });
              
              return (
                <div
                  key={course.id}
                  className="history-item"
                  onClick={() => {
                    onLoadCourse(course.id);
                    onClose();
                  }}
                >
                  <div className="history-info">
                    <div className="history-title">
                      {course.subject || 'Biologie'} : {course.title || 'Sans titre'}
                    </div>
                    <div className="history-meta">Modifié le {dateStr}</div>
                  </div>
                  <div className="history-actions">
                    <button
                      type="button"
                      className="history-btn-del"
                      onClick={(e) => handleDelete(e, course.id, course.title)}
                      title="Supprimer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
