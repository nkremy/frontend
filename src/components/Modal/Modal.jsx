import "./Modal.css";

export function Modal({ title, onClose, children, size = "md" }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ message, onConfirm, onCancel, danger = true }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Confirmation</h2>
          <button className="modal__close" onClick={onCancel}>✕</button>
        </div>
        <div className="modal__body">
          <p className="modal__confirm-msg">{message}</p>
          <div className="modal__actions">
            <button className="btn btn--outline" onClick={onCancel}>Annuler</button>
            <button
              className={`btn ${danger ? "btn--danger" : "btn--primary"}`}
              onClick={onConfirm}
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
