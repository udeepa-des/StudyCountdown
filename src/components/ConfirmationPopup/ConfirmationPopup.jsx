import { useEffect, useRef } from "react";
import "./ConfirmationPopup.css";

const ConfirmationPopup = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "danger", // "danger" | "primary" | "warning"
  loading,
  loadingLabel,
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    const handleClickOutside = (e) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(e.target) &&
        isOpen
      ) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="confirmation-overlay">
      <div className="confirmation-dialog" ref={dialogRef}>
        <div className="confirmation-content">
          <p className="confirmation-message">{message}</p>
          <div className="confirmation-actions">
            <button
              onClick={onCancel}
              disabled={loading}
              className="confirmation-button cancel"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`confirmation-button confirm ${confirmVariant}`}
              disabled={loading}
            >
              {loading ? loadingLabel : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
