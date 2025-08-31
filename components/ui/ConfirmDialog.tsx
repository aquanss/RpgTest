import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm();
    onCancel(); // Eylemden sonra diyaloğu kapat
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      onClick={onCancel} // Dışarıya tıklandığında kapat
    >
      <div 
        className="bg-[var(--background-medium)] rounded-lg shadow-2xl w-full max-w-md border-2 border-[var(--accent-gold)]/50 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // İçeriğe tıklandığında kapanmasını engelle
      >
        <div className="p-6 border-b border-[var(--border-color)]">
          <h2 id="dialog-title" className="text-2xl font-bold text-[var(--accent-gold)]" style={{ fontFamily: 'var(--font-fantasy)' }}>
            {title}
          </h2>
        </div>
        <div className="p-6">
          <div className="text-[var(--text-primary)] leading-relaxed">{message}</div>
        </div>
        <div className="p-4 bg-[var(--background-dark)]/50 rounded-b-lg flex justify-end items-center gap-4">
          <button
            onClick={onCancel}
            className="font-semibold py-2 px-4 rounded transition-colors duration-300 bg-[var(--border-color)] hover:bg-gray-600 text-[var(--text-primary)]"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="font-bold py-2 px-4 rounded transition-colors duration-300 bg-[var(--accent-red)] hover:brightness-110 text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;