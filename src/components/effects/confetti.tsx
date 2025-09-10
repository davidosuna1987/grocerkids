'use client';

import * as React from 'react';
import './confetti.css';

const CONFETTI_COUNT = 150;

const ConfettiPiece = ({ index }: { index: number }) => {
  const style: React.CSSProperties = {
    '--i': index,
    '--x': Math.random() * 2 - 1,
    '--y': Math.random() * 2 - 1,
    '--hue': Math.floor(Math.random() * 360),
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${Math.random() * 3 + 2}s`,
  };

  return <div className="confetti-piece" style={style} />;
};

export const Confetti = () => {
  return (
    <div className="confetti-container" aria-hidden="true">
      {Array.from({ length: CONFETTI_COUNT }).map((_, index) => (
        <ConfettiPiece key={index} index={index} />
      ))}
    </div>
  );
};
