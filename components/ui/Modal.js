"use client";

import { useEffect } from "react";

export default function Modal({ title, children, close }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;

      const overlays = document.querySelectorAll(".overlay");
      const topOverlay = overlays[overlays.length - 1];

      if (topOverlay === event.currentTarget.querySelector(".overlay")) {
        event.preventDefault();
        close();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  return (
    <div className="overlay" onMouseDown={close}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
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