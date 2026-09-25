/* Displays reusable dialog content above the current page. */
export default function Modal({
  title,
  children,
  close,
}) {
  /* Prevents clicks inside the dialog from closing the modal. */
  function handleModalClick(event) {
    event.stopPropagation();
  }

  return (
    <div className="overlay" onMouseDown={close}>
      <div
        className="modal"
        onMouseDown={handleModalClick}
      >
        <div className="modalHeader">
          <h2>{title}</h2>

          <button
            type="button"
            onClick={close}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}