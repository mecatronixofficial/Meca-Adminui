import { createContext, useContext } from "react";
import type { Admin } from "../../lib/types";

export interface Session {
  user: Admin;
  setUser: (user: Admin) => void;
  /** Re-reads the sidebar badge counts (unread enquiries, pending reviews). */
  refreshCounts: () => void;
}

export const SessionContext = createContext<Session | null>(null);

/** The signed-in admin. Only available inside AdminShell. */
export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used inside AdminShell");
  return session;
}
