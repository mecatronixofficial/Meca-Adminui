import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "../../lib/cn";

const subscribe = (onChange: () => void) => {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
};

/** Whether the browser currently has a network connection. */
const useOnline = () => useSyncExternalStore(subscribe, () => navigator.onLine, () => true);

/** A small banner while the connection is down, and a brief "back online" note when it returns. */
export default function NetworkStatus() {
  const online = useOnline();
  const wasOffline = useRef(false);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      return;
    }
    if (!wasOffline.current) return;
    wasOffline.current = false;
    setRestored(true);
    const timer = window.setTimeout(() => setRestored(false), 3000);
    return () => window.clearTimeout(timer);
  }, [online]);

  if (online && !restored) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-4 left-1/2 z-60 flex -translate-x-1/2 animate-rise items-center gap-2.5 rounded-full px-4 py-2 text-sm font-medium shadow-lift ring-1 print:hidden",
        online ? "bg-success-soft text-success ring-success/20" : "bg-ink text-white ring-white/10",
      )}
    >
      {online ? <Wifi aria-hidden className="size-4" /> : <WifiOff aria-hidden className="size-4 text-accent-glow" />}
      {online ? "Back online" : "You're offline. Changes can't be saved until the connection returns."}
    </div>
  );
}
