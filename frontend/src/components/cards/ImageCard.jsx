import React from 'react';
import CardWrapper from './CardWrapper';

export default function ImageCard({ id, x, y, title, imageUrl, color, pinColor, zoom, tool, onUpdateCoords, onDelete }) {
  return (
    <CardWrapper id={id} x={x} y={y} zoom={zoom} tool={tool} onUpdateCoords={onUpdateCoords} onDelete={onDelete}>
      <div className="wb-card-pinned" style={{ borderColor: color || 'var(--color-border-light)', padding: '14px', width: '310px' }}>
        <div className={`pushpin ${pinColor || 'blue'}`}></div>
        <div className="wb-card-image-title" style={{ marginBottom: '8px' }}>{title || 'Image ajoutée'}</div>
        <img src={imageUrl} alt={title || 'Microscope detail'} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
    </CardWrapper>
  );
}
