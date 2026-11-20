import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

// Brand fonts (self-hosted, same faces as Meca-UI)
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";

import "./index.css";
import NetworkStatus from "./components/feedback/NetworkStatus";
import { FeedbackProvider } from "./components/ui/Feedback";
import { reloadForNewVersion } from "./lib/errors";
import router from "./router/Router";

// A deploy replaces the hashed page chunks; tabs opened before it fail to load them.
// Reload once to pick up the new build (the route error screen covers a second failure).
window.addEventListener("vite:preloadError", (event) => {
  if (reloadForNewVersion()) event.preventDefault();
});

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found in index.html");

createRoot(container).render(
  <StrictMode>
    <FeedbackProvider>
      <RouterProvider router={router} />
      <NetworkStatus />
    </FeedbackProvider>
  </StrictMode>,
);
