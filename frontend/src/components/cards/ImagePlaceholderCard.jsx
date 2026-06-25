import React from 'react';
import CardWrapper from './CardWrapper';

export default function ImagePlaceholderCard({ id, x, y, title, zoom, tool, onUpdateCoords, onDelete }) {
  return (
    <CardWrapper id={id} x={x} y={y} zoom={zoom} tool={tool} onUpdateCoords={onUpdateCoords} onDelete={onDelete}>
      <div
        className="image-placeholder-card-container"
        style={{
          width: '380px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1.5px solid var(--color-border-light)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 15px rgba(0,0,0,0.06)'
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-dark-muted)',
            letterSpacing: '0.5px',
            marginBottom: '12px'
          }}
        >
          {title || 'IMAGE DU COURS / SCHÉMA'}
        </div>
        <div
          style={{
            border: '2px dashed #cbd5e1',
            borderRadius: '8px',
            height: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc'
          }}
        >
          {/* Dash-bordered placeholder, matching the screenshot */}
        </div>
      </div>
    </CardWrapper>
  );
}
