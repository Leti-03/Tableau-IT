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

  return (
    <CardWrapper id={id} x={x} y={y} zoom={zoom} tool={tool} onUpdateCoords={onUpdateCoords} onDelete={onDelete}>
      <div className="wb-card-key-points" style={{ color: color || 'var(--wb-blue)' }}>
        <div
          className="wb-key-points-title"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleTitleBlur}
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
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </CardWrapper>
  );
}
