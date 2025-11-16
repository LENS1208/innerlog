import React, { useState } from 'react';

interface HelpIconProps {
  text: string;
}

export function HelpIcon({ text }: HelpIconProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block', marginLeft: 6, zIndex: 10 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: '1px solid var(--muted)',
          background: 'transparent',
          color: 'var(--muted)',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 'bold',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          verticalAlign: 'middle',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--chip)';
          e.currentTarget.style.borderColor = 'var(--ink)';
          e.currentTarget.style.color = 'var(--ink)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'var(--muted)';
          e.currentTarget.style.color = 'var(--muted)';
        }}
      >
        ?
      </button>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 8,
            padding: 12,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 10000,
            width: 320,
            maxWidth: '90vw',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--muted)',
            whiteSpace: 'normal',
            fontFamily: 'inherit',
            wordBreak: 'normal',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
