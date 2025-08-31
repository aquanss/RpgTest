
import React from 'react';

interface ProgressBarProps {
  value: number;
  color?: string;
  className?: string;
  showGradient?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, color = 'bg-[var(--accent-green)]', className = 'h-4', showGradient = false }) => {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={`w-full bg-[var(--border-color)] rounded-full overflow-hidden ${className}`}>
      <div
        className={`${color} h-full rounded-full transition-all duration-500 ease-out relative`}
        style={{ width: `${clampedValue}%` }}
      >
        {showGradient && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-black/10 to-black/40"></div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;