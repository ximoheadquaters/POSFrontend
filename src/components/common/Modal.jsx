import { useEffect } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = "",
  contentClassName = "",
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain px-3 py-4 sm:px-4 sm:py-6">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div
        className={`relative z-10 my-auto flex max-h-[calc(100dvh-2rem)] min-w-0 w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#DCE7DE] bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.16)] sm:max-h-[calc(100dvh-3rem)] sm:p-5 ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
          {title ? (
            <h3
              id="modal-title"
              className="text-lg font-semibold tracking-[-0.025em] text-[#17241C] sm:text-xl"
            >
              {title}
            </h3>
          ) : (
            <span />
          )}
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl p-1 text-[#65736A] transition-colors hover:bg-[#F0F4F2] hover:text-[#25352B]"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div
          className={`min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain ${contentClassName}`}
        >
          {children}
        </div>
        {footer ? (
          <div className="mt-4 shrink-0 border-t border-[#E7ECE8] pt-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
