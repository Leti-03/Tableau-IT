import React from 'react';
import CardWrapper from './CardWrapper';

export default function DiagramCard({ id, x, y, title, imageUrl, zoom, tool, onUpdateCoords, onDelete }) {
  return (
    <CardWrapper id={id} x={x} y={y} zoom={zoom} tool={tool} onUpdateCoords={onUpdateCoords} onDelete={onDelete}>
      <div className="wb-card-diagram">
        {/* We use an image tag for simple SVG rendering */}
        <img
          src={imageUrl}
          alt={title || 'Schéma'}
          style={{ width: '100%', height: 'auto', pointerEvents: 'none' }}
        />
      </div>
    </CardWrapper>
  );
}
