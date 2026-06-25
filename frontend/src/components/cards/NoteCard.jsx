import React from 'react';
import CardWrapper from './CardWrapper';

export default function NoteCard({ id, x, y, title, content, zoom, tool, onUpdateCoords, onDelete, onUpdateCardData }) {
  const handleTitleBlur = (e) => {
    onUpdateCardData(id, { title: e.target.innerText });
  };

  const handleContentBlur = (e) => {
    onUpdateCardData(id, { content: e.target.innerText });
  };

  return (
    <CardWrapper id={id} x={x} y={y} zoom={zoom} tool={tool} onUpdateCoords={onUpdateCoords} onDelete={onDelete}>
      <div className="wb-card-pinned wb-card-note" style={{ minWidth: '260px', borderColor: 'var(--color-border-light)' }}>
        <div className="pushpin pink"></div>
        <div
          className="wb-card-note-title"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleTitleBlur}
          style={{
            fontFamily: 'var(--font-handwriting)',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'var(--wb-blue)',
            marginBottom: '8px',
            outline: 'none',
            cursor: 'text'
          }}
        >
          {title || 'Notes de cours'}
        </div>
        <div
          className="wb-card-note-body"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleContentBlur}
          style={{
            fontFamily: 'var(--font-handwriting)',
            fontSize: '20px',
            lineHeight: '1.4',
            color: '#64748b',
            outline: 'none',
            minHeight: '40px',
            cursor: 'text'
          }}
        >
          {content}
        </div>
      </div>
    </CardWrapper>
  );
}
