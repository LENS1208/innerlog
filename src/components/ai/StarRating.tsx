import React, { useState } from 'react';

type StarRatingProps = {
  rating: number | null;
  onChange: (rating: number) => void;
  readOnly?: boolean;
};

export default function StarRating({ rating, onChange, readOnly = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleClick = (star: number) => {
    if (!readOnly) {
      onChange(star);
    }
  };

  const handleMouseEnter = (star: number) => {
    if (!readOnly) {
      setHoverRating(star);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(null);
  };

  const displayRating = hoverRating || rating || 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginRight: 4 }}>
        あなたの評価
      </span>
      <div
        style={{ display: 'flex', gap: 2 }}
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            disabled={readOnly}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: readOnly ? 'default' : 'pointer',
              fontSize: 18,
              lineHeight: 1,
              color: star <= displayRating ? '#fbbf24' : '#d1d5db',
              transition: 'color 0.15s',
            }}
            aria-label={`${star}つ星`}
          >
            ★
          </button>
        ))}
      </div>
      {rating && (
        <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4 }}>
          {rating}/5
        </span>
      )}
    </div>
  );
}
