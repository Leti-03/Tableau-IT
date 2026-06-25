import React, { useState } from 'react';
import CardWrapper from './CardWrapper';

export default function TranscriptionCard({ id, x, y, title, content, zoom, tool, onUpdateCoords, onDelete, onUpdateContent }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTextChange = (e) => {
    onUpdateContent(id, e.target.value);
  };

  return (
    <CardWrapper id={id} x={x} y={y} zoom={zoom} tool={tool} onUpdateCoords={onUpdateCoords} onDelete={onDelete}>
      <div
        className="transcription-card-container"
        style={{
          width: isExpanded ? '650px' : '380px',
          height: isExpanded ? '480px' : '320px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1.5px solid var(--color-border-light)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
          transition: 'width 0.3s ease, height 0.3s ease',
          pointerEvents: 'auto'
        }}
      >
        <div
          className="transcription-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-dark-muted)',
              letterSpacing: '0.5px'
            }}
          >
            {title || 'TRANSCRIPTION DU COURS'}
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              outline: 'none'
            }}
          >
            {isExpanded ? 'Réduire ↳' : 'Agrandir ↳'}
          </button>
        </div>
        <textarea
          value={content}
          onChange={handleTextChange}
          placeholder="Commencez à parler avec le micro ou tapez vos notes de cours ici..."
          style={{
            flex: 1,
            width: '100%',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            color: 'var(--text-dark)',
            fontFamily: 'var(--font-ui)',
            resize: 'none',
            outline: 'none',
            backgroundColor: '#f8fafc',
            lineHeight: '1.5'
          }}
        />
      </div>
    </CardWrapper>
  );
}
