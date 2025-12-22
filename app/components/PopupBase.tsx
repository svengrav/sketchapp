import { XMarkIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import type { ReactNode } from "react";

type PopupBaseProps = {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md";
  closeOnBackdrop?: boolean;
};

const maxWidthClasses = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
};

/**
 * Wiederverwendbare Popup-Base-Komponente
 * - Scrollable wenn Inhalt zu groß
 * - Optional schließbar (X-Button + Backdrop-Klick)
 * - Titel links oben
 */
export function PopupBase({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "sm",
  closeOnBackdrop = true,
}: PopupBaseProps) {
  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdrop && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-40"
        onClick={handleBackdropClick}
      />

      {/* Popup */}
      <div
        className={clsx(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "bg-zinc-900 rounded-xl shadow-xl z-50",
          "w-[90vw] max-h-[90vh] overflow-y-auto",
          maxWidthClasses[maxWidth]
        )}
      >
        {/* Header (nur wenn Titel oder onClose vorhanden) */}
        {(title || onClose) && (
          <div className="flex items-center justify-between p-4 pb-0 sticky top-0 bg-zinc-900">
            {title ? (
              <h2 className="text-white font-semibold">{title}</h2>
            ) : (
              <div />
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-white/60 hover:text-white p-1 cursor-pointer"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </>
  );
}
