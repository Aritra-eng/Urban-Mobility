import React from 'react';
import './Toast.css';

const ConfirmModal = ({ isOpen, icon, iconType = 'info', title, description, confirmText = 'Confirm', cancelText = 'Cancel', confirmStyle = 'primary', onConfirm, onCancel, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {icon && (
          <div className={`modal-icon-wrap ${iconType}`}>
            {icon}
          </div>
        )}
        <h3 className="modal-title">{title}</h3>
        <p className="modal-desc">{description}</p>
        {children}
        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`modal-btn ${confirmStyle}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
