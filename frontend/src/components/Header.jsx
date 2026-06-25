import React, { useState, useEffect } from 'react';

export default function Header({ isRecording, subject, title, onUpdateTitle }) {
  const [time, setTime] = useState('10:45');

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
    <header className="status-bar">
      <div className="status-left">
        {isRecording && (
          <div className="recording-badge">
            <span className="red-dot"></span>
            <span className="recording-text">Microphone actif...</span>
          </div>
        )}
      </div>
      
      <div className="status-center">
        <div className="course-meta">
          Cours : <span>{subject}</span> – <span
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
          >
            {title}
          </span>
        </div>
      </div>
      
      <div className="status-right">
        <span className="status-time">{time}</span>
        {/* State icons (Wifi, Cellular, Battery) */}
        <svg className="status-sys-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M15.384 6.115a.485.485 0 0 0-.047-.736A12.444 12.444 0 0 0 8 3 12.44 12.44 0 0 0 .663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c2.507 0 4.827.802 6.716 2.164.205.148.49.13.668-.049z"/>
          <path d="M13.229 8.271a.482.482 0 0 0-.063-.745A9.455 9.455 0 0 0 8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065A8.46 8.46 0 0 1 8 7a8.46 8.46 0 0 1 4.577 1.336c.205.132.48.108.652-.065zm-2.183 2.183c.226-.226.185-.605-.1-.75A6.473 6.473 0 0 0 8 9c-1.187 0-2.302.318-3.267.872-.29.15-.331.528-.105.754a.53.53 0 0 0 .69.043A5.479 5.479 0 0 1 8 10c1.07 0 2.059.307 2.894.84a.53.53 0 0 0 .68-.043zM8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
        </svg>
        <svg className="status-sys-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2zm0 1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
          <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3zm3-3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7zm3-2a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V5zm3-2a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3z"/>
        </svg>
        <svg className="status-sys-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <rect width="12" height="7" x="1" y="4.5" rx="1.5" fill="currentColor"/>
          <path d="M14 6v4"/>
        </svg>
      </div>
    </header>
  );
}
