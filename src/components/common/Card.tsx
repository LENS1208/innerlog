import React from 'react';
import { HelpIcon } from './HelpIcon';

type CardProps = {
  title?: string;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function Card({ title, helpText, children, className = '', style }: CardProps) {
  return (
    <div className={`dash-card ${className}`.trim()} style={style}>
      {title && (
        <h3 style={{
          margin: '0 0 8px',
          fontSize: 15,
          fontWeight: 'bold',
          color: 'var(--muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          {title}
          {helpText && <HelpIcon text={helpText} />}
        </h3>
      )}
      {children}
    </div>
  );
}
