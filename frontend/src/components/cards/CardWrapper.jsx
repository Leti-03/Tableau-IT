import React, { useRef } from 'react';

export default function CardWrapper({ id, x, y, zoom, tool, onUpdateCoords, onDelete, children, style = {} }) {
  const cardRef = useRef(null);

  const handleMouseDown = (e) => {
    if (tool !== 'select') return;
    if (
      e.target.closest('input') ||
      e.target.closest('textarea') ||
      e.target.closest('[contenteditable="true"]') ||
      e.target.closest('.card-delete-btn')
    ) {
      return; // Permet la sélection du texte
    }

    e.preventDefault();
    let startX = e.clientX;
    let startY = e.clientY;

    const handleMouseMove = (moveEvent) => {
      // Ajustement des déplacements par rapport au zoom
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;

      onUpdateCoords(id, x + dx, y + dy);

      startX = moveEvent.clientX;
      startY = moveEvent.clientY;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e) => {
    if (tool !== 'select') return;
    if (
      e.target.closest('input') ||
      e.target.closest('textarea') ||
      e.target.closest('[contenteditable="true"]') ||
      e.target.closest('.card-delete-btn')
    ) {
      return;
    }

    const touch = e.touches[0];
    let startX = touch.clientX;
    let startY = touch.clientY;

    const handleTouchMove = (moveEvent) => {
      const currentTouch = moveEvent.touches[0];
      const dx = (currentTouch.clientX - startX) / zoom;
      const dy = (currentTouch.clientY - startY) / zoom;

      onUpdateCoords(id, x + dx, y + dy);

      startX = currentTouch.clientX;
      startY = currentTouch.clientY;
      moveEvent.preventDefault();
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div
      ref={cardRef}
      className="wb-card"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        position: 'absolute',
        pointerEvents: 'auto',
        ...style,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <button
        type="button"
        className="card-delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(id);
        }}
        title="Supprimer cette carte"
      >
        &times;
      </button>
      {children}
    </div>
  );
}
