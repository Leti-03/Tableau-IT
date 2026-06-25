import React, { useState, useEffect, useRef } from 'react';
import CardWrapper from './CardWrapper';

export default function TitleCard({ id, x, y, content, color, zoom, tool, onUpdateCoords, onDelete, onUpdateContent }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(content);
  const inputRef = useRef(null);

  useEffect(() => {
    setText(content);
  }, [content]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onUpdateContent(id, text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current.blur();
    }
  };

  return (
    <CardWrapper id={id} x={x} y={y} zoom={zoom} tool={tool} onUpdateCoords={onUpdateCoords} onDelete={onDelete}>
      <div 
        className="wb-card-title" 
        style={{ color: color || 'var(--wb-green)', cursor: tool === 'select' ? 'text' : 'inherit' }}
        onDoubleClick={() => {
          setIsEditing(true);
        }}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Titre..."
            style={{ width: `${Math.max(text.length * 18, 120)}px` }}
          />
        ) : (
          <div>{text || "Titre..."}</div>
        )}
        <div className="wb-card-title-underline"></div>
      </div>
    </CardWrapper>
  );
}
