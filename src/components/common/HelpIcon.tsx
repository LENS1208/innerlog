import React, { useState } from 'react';

interface HelpIconProps {
  text: string;
}

export function HelpIcon({ text }: HelpIconProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block', marginLeft: 6, zIndex: 9999 }}>
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
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: 8,
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 8,
            padding: 12,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            minWidth: 280,
            maxWidth: 400,
            width: 'max-content',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--muted)',
            whiteSpace: 'normal',
            fontFamily: 'inherit',
            wordBreak: 'keep-all',
            overflowWrap: 'break-word',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -6,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '6px solid var(--line)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -5,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: '5px solid var(--surface)',
            }}
          />
          {text}
        </div>
      )}
    </div>
  );
}
