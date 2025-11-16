import React from 'react';

interface CoachBubbleProps {
  message: string;
}

export function CoachBubble({ message }: CoachBubbleProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
      marginBottom: '20px',
    }}>
      <div style={{
        flexShrink: 0,
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        border: '3px solid var(--line)',
        background: 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="38" fill="var(--surface)" stroke="var(--line)" strokeWidth="2"/>
          <circle cx="40" cy="26" r="12" fill="#D2691E"/>
          <ellipse cx="40" cy="50" rx="20" ry="15" fill="#FFF5E1"/>
          <circle cx="35" cy="48" r="2" fill="#333"/>
          <circle cx="45" cy="48" r="2" fill="#333"/>
          <path d="M 35 54 Q 40 57 45 54" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M 20 22 Q 30 15 40 22" stroke="#D2691E" strokeWidth="4" fill="none" strokeLinecap="round"/>
        </svg>
      </div>

      <div style={{
        position: 'relative',
        flex: 1,
        background: 'var(--surface)',
        border: '2px solid var(--line)',
        borderRadius: '16px',
        padding: '20px 24px',
        fontSize: '16px',
        lineHeight: 1.8,
        color: 'var(--ink)',
        fontWeight: 500,
      }}>
        <div style={{
          position: 'absolute',
          left: '-10px',
          top: '20px',
          width: 0,
          height: 0,
          borderTop: '10px solid transparent',
          borderBottom: '10px solid transparent',
          borderRight: '10px solid var(--line)',
        }} />
        <div style={{
          position: 'absolute',
          left: '-7px',
          top: '22px',
          width: 0,
          height: 0,
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderRight: '8px solid var(--surface)',
        }} />
        {message}
      </div>
    </div>
  );
}
