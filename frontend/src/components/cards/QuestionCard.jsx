import React from 'react';
import CardWrapper from './CardWrapper';

export default function QuestionCard({ id, x, y, title, content, pinColor, zoom, tool, onUpdateCoords, onDelete, onUpdateCardData }) {
  const handleTitleBlur = (e) => {
    onUpdateCardData(id, { title: e.target.innerText });
  };

  const handleContentBlur = (e) => {
    onUpdateCardData(id, { content: e.target.innerText });
  };

  return (
    <CardWrapper id={id} x={x} y={y} zoom={zoom} tool={tool} onUpdateCoords={onUpdateCoords} onDelete={onDelete}>
      <div className="wb-card-pinned wb-card-question">
        <div className={`pushpin ${pinColor || 'purple'}`}></div>
        <div
          className="wb-card-question-title"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleTitleBlur}
        >
          {title || 'Question'}
        </div>
        <div
          className="wb-card-question-body"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleContentBlur}
        >
          {content}
        </div>
      </div>
    </CardWrapper>
  );
}
