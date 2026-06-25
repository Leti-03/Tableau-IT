import React, { useState, useEffect } from 'react';

export default function Header({ isRecording, subject, title, onUpdateTitle }) {
  const [time, setTime] = useState('22:58');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleTitleBlur = (e) => {
    onUpdateTitle(e.target.innerText.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  return (
    <header className="status-bar" style={{ backgroundColor: 'var(--bg-sidebar)', padding: '0 24px', borderBottom: '1px solid var(--color-border)' }}>
      <div className="status-left" style={{ width: 'auto', flex: 1 }}>
        <div className="course-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
          <span style={{ color: '#1b6df5', fontSize: '24px', lineHeight: 1, marginRight: '4px' }}>•</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>Cours :</span>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            style={{
              color: '#ffffff',
              fontWeight: 600,
              borderBottom: '1px dashed rgba(255, 255, 255, 0.3)',
              padding: '0 4px',
              outline: 'none',
              cursor: 'text'
            }}
          >
            {title}
          </span>
        </div>
      </div>
      
      <div className="status-right" style={{ width: 'auto', display: 'flex', gap: '16px', alignItems: 'center', color: '#ffffff' }}>
        <span className="status-time" style={{ color: '#ffffff', fontSize: '13px', fontWeight: 500, marginRight: '4px' }}>{time}</span>
        
        {/* Signal Strength Icon */}
        <svg width="18" height="14" viewBox="0 0 18 14" fill="currentColor" style={{ opacity: 0.8 }}>
          <rect x="1" y="10" width="2" height="4" rx="0.5" />
          <rect x="5" y="7" width="2" height="7" rx="0.5" />
          <rect x="9" y="4" width="2" height="10" rx="0.5" />
          <rect x="13" y="1" width="2" height="13" rx="0.5" />
          <rect x="17" y="0" width="2" height="14" rx="0.5" fill="rgba(255, 255, 255, 0.3)" />
        </svg>

        {/* Battery Icon */}
        <svg width="22" height="14" viewBox="0 0 22 14" fill="currentColor" style={{ opacity: 0.8 }}>
          <rect x="1" y="1" width="16" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="4" y="4" width="10" height="6" rx="0.5" />
          <path d="M19.5 4.5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Computer Screen Icon */}
        <svg width="18" height="14" viewBox="0 0 18 14" fill="currentColor" style={{ opacity: 0.8 }}>
          <rect x="1" y="1" width="16" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="9" y1="11" x2="9" y2="13" stroke="currentColor" strokeWidth="1.5" />
          <line x1="5" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    </header>
  );
}
