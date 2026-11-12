import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";

const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };

/** Open dialogs, innermost last: only the top one reacts to Escape/Tab. */
const stack: symbol[] = [];

/**
 * Accessible dialog: traps Tab focus, closes on Escape or backdrop click,
 * locks page scroll and returns focus to the opener when closed.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  size?: keyof typeof widths;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const self = Symbol("modal");
    stack.push(self);
    const opener = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const focusable = () =>
      Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]):not([type="file"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    // Focus the first form control, or the dialog itself
    const first = focusable().find((el) => el.matches("input,select,textarea")) ?? panel.current;
    first?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (stack[stack.length - 1] !== self) return;
      if (event.key === "Escape") {
        event.stopPropagation();
        close.current();
      } else if (event.key === "Tab") {
        const items = focusable();
        if (!items.length) return;
        const [head, tail] = [items[0], items[items.length - 1]];
        if (event.shiftKey && document.activeElement === head) {
          event.preventDefault();
          tail.focus();
        } else if (!event.shiftKey && document.activeElement === tail) {
          event.preventDefault();
          head.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      stack.splice(stack.indexOf(self), 1);
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade bg-ink/45 backdrop-blur-[2px] [animation-duration:150ms]" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-window outline-none sm:max-h-[88dvh] sm:rounded-2xl",
          "animate-rise [animation-duration:250ms]",
          widths[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-lg font-semibold text-ink">
              {title}
            </h2>
            {description && <div className="mt-0.5 text-sm text-muted-ink">{description}</div>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-1 rounded-lg p-1.5 text-muted hover:bg-paper hover:text-ink">
            <X className="size-5" />
          </button>
        </div>
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3.5 sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
