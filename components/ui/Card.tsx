import React from 'react';

interface CardProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-[var(--background-medium)]/70 backdrop-blur-sm rounded-lg shadow-xl border border-[var(--border-color)] ${className}`}>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] border-b-2 border-[var(--accent-gold)] p-4" style={{ fontFamily: 'var(--font-fantasy)'}}>{title}</h2>
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;