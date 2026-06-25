import React, { useState, useEffect, useRef } from 'react';
import CardWrapper from './CardWrapper';

export default function TextCard({ id, x, y, content, color, zoom, tool, onUpdateCoords, onDelete, onUpdateContent }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(content);
  const textareaRef = useRef(null);

  useEffect(() => {
    setText(content);
  }, [content]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Set caret at the end
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
      // Auto resize height
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onUpdateContent(id, text);
  };

  return (
    <CardWrapper id={id} x={x} y={y} zoom={zoom} tool={tool} onUpdateCoords={onUpdateCoords} onDelete={onDelete}>
      <div 
        className="wb-card-text" 
        style={{ color: color || 'var(--wb-dark)', minWidth: '200px' }}
        onDoubleClick={() => {
          setIsEditing(true);
        }}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onBlur={handleBlur}
            placeholder="Écrivez ici..."
          />
        ) : (
          <div style={{ whiteSpace: 'pre-wrap', cursor: tool === 'select' ? 'text' : 'inherit' }}>
            {text || "Double-cliquez pour écrire"}
          </div>
        )}
      </div>
    </CardWrapper>
  );
}
