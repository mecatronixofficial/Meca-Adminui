import { CircleCheck, CircleX, X } from "lucide-react";
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { FeedbackContext, type ConfirmOptions, type FeedbackContextValue } from "./feedback-context";
import { Modal } from "./Modal";
import { Button } from "./ui";

interface Toast {
  id: number;
  tone: "success" | "error";
  message: string;
}

/** Toasts and confirm dialogs for the whole app. */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (tone: Toast["tone"], message: string) => {
      const id = ++nextId.current;
      // Drop an identical toast that's still on screen
      setToasts((list) => [...list.filter((t) => t.message !== message).slice(-3), { id, tone, message }]);
      setTimeout(() => dismiss(id), tone === "error" ? 7000 : 4000);
    },
    [dismiss],
  );

  const value = useMemo<FeedbackContextValue>(
    () => ({
      toast: { success: (m) => push("success", m), error: (m) => push("error", m) },
      confirm: (options) => new Promise<boolean>((resolve) => setDialog({ ...options, resolve })),
    }),
    [push],
  );

  const settle = (ok: boolean) => {
    dialog?.resolve(ok);
    setDialog(null);
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 left-4 z-[100] flex flex-col items-end gap-2 sm:left-auto print:hidden">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex w-full max-w-sm animate-rise items-start gap-3 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-lift [animation-duration:250ms]"
          >
            {t.tone === "success" ? (
              <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-[#47cd89]" />
            ) : (
              <CircleX aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-glow" />
            )}
            <span className="min-w-0 flex-1">{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-white/60 hover:text-white">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <Modal
        open={!!dialog}
        onClose={() => settle(false)}
        title={dialog?.title ?? ""}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => settle(false)}>
              Cancel
            </Button>
            <Button variant={dialog?.tone === "primary" ? "primary" : "danger"} onClick={() => settle(true)}>
              {dialog?.confirmLabel ?? "Delete"}
            </Button>
          </>
        }
      >
        <div className="text-sm leading-relaxed text-muted-ink">{dialog?.message}</div>
      </Modal>
    </FeedbackContext.Provider>
  );
}
