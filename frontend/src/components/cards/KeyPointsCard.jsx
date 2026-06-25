import React from 'react';
import CardWrapper from './CardWrapper';

export default function KeyPointsCard({ id, x, y, title, content, color, zoom, tool, onUpdateCoords, onDelete, onUpdateCardData }) {
  const handleTitleBlur = (e) => {
    onUpdateCardData(id, { title: e.target.innerText });
  };

  const handleItemBlur = (index, newText) => {
    const updatedContent = [...content];
    updatedContent[index] = newText;
    onUpdateCardData(id, { content: updatedContent });
  };

  const handleAddPoint = () => {
    const updatedContent = [...content, 'Double-cliquez pour éditer'];
    onUpdateCardData(id, { content: updatedContent });
  };

  return (
    <CardWrapper id={id} x={x} y={y} zoom={zoom} tool={tool} onUpdateCoords={onUpdateCoords} onDelete={onDelete}>
      <div className="wb-card-key-points" style={{ color: color || 'var(--wb-blue)' }}>
        <div
          className="wb-key-points-title"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleTitleBlur}
          style={{ cursor: 'text' }}
        >
          {title || 'Points clés'}
        </div>
        <ul className="wb-key-points-list">
          {content.map((item, idx) => (
            <li
              key={idx}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleItemBlur(idx, e.target.innerText)}
              style={{ cursor: 'text' }}
            >
              {item}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handleAddPoint}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-handwriting)',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px 0 0 20px',
            marginTop: '8px',
            textAlign: 'left',
            display: 'block',
            width: '100%',
            outline: 'none'
          }}
        >
          + Ajouter un point clé
        </button>
      </div>
    </CardWrapper>
  );
}
