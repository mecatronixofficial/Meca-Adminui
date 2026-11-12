
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../../../lib/cn";

/**
 * Renders children at a fixed "desktop" width and scales them down to fit the
 * available space — a live thumbnail of a full page, inside a browser window.
 */
export function ScaledFrame({ children, width = 1280, url, className, maxHeight }: { children: ReactNode; width?: number; url?: string; className?: string; maxHeight?: number }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const measure = () => {
      setScale(o.clientWidth / width);
      setHeight(i.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(o);
    observer.observe(i);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-line bg-white shadow-window", className)}>
      <div className="flex items-center gap-3 border-b border-line bg-paper px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        {url && <span className="min-w-0 flex-1 truncate rounded-md bg-white px-3 py-1 text-center font-mono text-[11.5px] text-muted-ink">{url}</span>}
      </div>
      <div ref={outer} className="overflow-y-auto overscroll-contain" style={{ height: maxHeight ? Math.min(maxHeight, height * scale) : height * scale }}>
        {/* Sized to the scaled height, so the scroll area matches what you see */}
        <div className="overflow-hidden" style={{ height: height * scale }}>
          <div ref={inner} style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }} aria-hidden inert>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
