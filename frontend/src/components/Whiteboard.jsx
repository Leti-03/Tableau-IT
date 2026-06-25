import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, Hand, Mic } from 'lucide-react';
import TitleCard from './cards/TitleCard';
import TextCard from './cards/TextCard';
import KeyPointsCard from './cards/KeyPointsCard';
import ImageCard from './cards/ImageCard';
import QuestionCard from './cards/QuestionCard';
import DiagramCard from './cards/DiagramCard';

export default function Whiteboard({
  zoom,
  setZoom,
  pan,
  setPan,
  tool,
  setTool,
  strokes,
  onAddStroke,
  onEraseStroke,
  cards,
  onUpdateCoords,
  onDeleteCard,
  onUpdateCardContent,
  onUpdateCardData,
  speechText,
  isRecording,
  toggleRecording
}) {
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [currentPoints, setCurrentPoints] = useState([]);
  const dragStartCoords = useRef({ x: 0, y: 0 });
  // Size the canvas once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 3000;
      canvas.height = 2000;
    }
  }, []);

  // Listen to wheel events on the viewport for scrolling/panning and ctrl+wheel for zooming
  useEffect(() => {
    const viewportEl = viewportRef.current;
    if (!viewportEl) return;

    const handleWheel = (e) => {
      e.preventDefault();
      if (e.ctrlKey) {
        // Zoom on Ctrl + Scroll
        const zoomFactor = 0.05;
        if (e.deltaY < 0) {
          setZoom(prev => Math.min(prev + zoomFactor, 2.5));
        } else {
          setZoom(prev => Math.max(prev - zoomFactor, 0.4));
        }
      } else {
        // Pan on Scroll
        setPan(prev => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY
        }));
      }
    };

    viewportEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      viewportEl.removeEventListener('wheel', handleWheel);
    };
  }, [setZoom, setPan]);

  // Redraw strokes whenever strokes or currentPoints change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color || '#2b2b2b';
      ctx.lineWidth = stroke.width || 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    // Draw active stroke
    if (currentPoints.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = '#2b2b2b';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
      }
      ctx.stroke();
    }
  }, [strokes, currentPoints]);

  const getCanvasCoords = (clientX, clientY) => {
    const rect = viewportRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) / zoom;
    const y = (clientY - rect.top) / zoom;
    return { x, y };
  };

  const handleStart = (clientX, clientY) => {
    const coords = getCanvasCoords(clientX, clientY);

    if (tool === 'pencil') {
      setIsDrawing(true);
      setCurrentPoints([coords]);
    } else if (tool === 'eraser') {
      setIsDrawing(true);
      eraseAt(coords.x, coords.y);
    } else if (tool === 'pan') {
      setIsPanning(true);
      dragStartCoords.current = { x: clientX - pan.x, y: clientY - pan.y };
    }
  };

  const handleMove = (clientX, clientY) => {
    const coords = getCanvasCoords(clientX, clientY);

    if (isDrawing && tool === 'pencil') {
      setCurrentPoints(prev => [...prev, coords]);
    } else if (isDrawing && tool === 'eraser') {
      eraseAt(coords.x, coords.y);
    } else if (isPanning && tool === 'pan') {
      setPan({
        x: clientX - dragStartCoords.current.x,
        y: clientY - dragStartCoords.current.y
      });
    }
  };

  const handleEnd = () => {
    if (isDrawing && tool === 'pencil' && currentPoints.length >= 2) {
      onAddStroke({
        points: currentPoints,
        color: '#2b2b2b',
        width: 3
      });
    }
    setIsDrawing(false);
    setIsPanning(false);
    setCurrentPoints([]);
  };

  const eraseAt = (x, y) => {
    const eraseRadius = 15;
    strokes.forEach(stroke => {
      const intersects = stroke.points.some(p => Math.hypot(p.x - x, p.y - y) <= eraseRadius);
      if (intersects) {
        onEraseStroke(stroke);
      }
    });
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2.5));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.4));

  return (
    <div className="whiteboard-container">
      <button
        type="button"
        className={`floating-mic-btn ${isRecording ? 'recording' : ''}`}
        onClick={toggleRecording}
        title={isRecording ? "Arrêter la dictée vocale" : "Démarrer la dictée vocale"}
      >
        <Mic size={20} />
      </button>
      <div
        ref={viewportRef}
        className="whiteboard-viewport"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          cursor: tool === 'pencil' ? 'crosshair' : tool === 'eraser' ? 'cell' : tool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 'default'
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          if (e.target.closest('.wb-card') || e.target.closest('.whiteboard-controls') || e.target.closest('.card-delete-btn')) {
            return;
          }
          handleStart(e.clientX, e.clientY);
        }}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onTouchStart={(e) => {
          if (e.target.closest('.wb-card') || e.target.closest('.whiteboard-controls') || e.target.closest('.card-delete-btn')) {
            return;
          }
          const touch = e.touches[0];
          handleStart(touch.clientX, touch.clientY);
        }}
        onTouchMove={(e) => {
          if (isDrawing || isPanning) {
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
          }
        }}
        onTouchEnd={handleEnd}
      >
        {/* Vector drawing canvas */}
        <canvas ref={canvasRef} />

        {/* DOM Cards Layer */}
        <div className="cards-layer">
          {cards.map(card => {
            const commonProps = {
              key: card.id,
              id: card.id,
              x: card.x,
              y: card.y,
              zoom,
              tool,
              onUpdateCoords,
              onDelete: onDeleteCard,
              onUpdateContent: onUpdateCardContent,
              onUpdateCardData
            };

            switch (card.type) {
              case 'title':
                return <TitleCard {...commonProps} content={card.content} color={card.color} />;
              case 'text':
                return <TextCard {...commonProps} content={card.content} color={card.color} />;
              case 'key-points':
                return (
                  <KeyPointsCard
                    {...commonProps}
                    title={card.title}
                    content={card.content}
                    color={card.color}
                  />
                );
              case 'image':
                return (
                  <ImageCard
                    {...commonProps}
                    title={card.title}
                    imageUrl={card.imageUrl}
                    labels={card.labels}
                    color={card.color}
                    pinColor={card.pinColor}
                  />
                );
              case 'question':
                return (
                  <QuestionCard
                    {...commonProps}
                    title={card.title}
                    content={card.content}
                    pinColor={card.pinColor}
                  />
                );
              case 'diagram':
                return <DiagramCard {...commonProps} title={card.title} imageUrl={card.imageUrl} />;
              default:
                return null;
            }
          })}
        </div>
      </div>

      {/* Floating Transcribe text overlay */}
      {isRecording && speechText && (
        <div className="speech-overlay">
          <span className="speech-pulse"></span>
          <span className="speech-text">{speechText}</span>
        </div>
      )}

      <div className="whiteboard-controls">
        <button type="button" className="control-btn" onClick={zoomOut} title="Zoom arrière">
          <ZoomOut size={18} strokeWidth={2} />
        </button>
        <span className="zoom-text">{Math.round(zoom * 100)}%</span>
        <button type="button" className="control-btn" onClick={zoomIn} title="Zoom avant">
          <ZoomIn size={18} strokeWidth={2} />
        </button>
        <button
          type="button"
          className={`control-btn ${tool === 'pan' ? 'active' : ''}`}
          onClick={() => setTool(tool === 'pan' ? 'select' : 'pan')}
          title="Activer le déplacement (Pan)"
        >
          <Hand size={18} />
        </button>
      </div>
    </div>
  );
}
