import { createContext, useContext, type ReactNode } from "react";

export interface ConfirmOptions {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "primary";
}

export interface FeedbackContextValue {
  toast: { success: (message: string) => void; error: (message: string) => void };
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const FeedbackContext = createContext<FeedbackContextValue | null>(null);

/** Toasts and confirm dialogs (provided once in main.tsx). */
export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useFeedback must be used inside FeedbackProvider");
  return context;
}
