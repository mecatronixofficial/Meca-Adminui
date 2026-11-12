import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

// Brand fonts (self-hosted, same faces as Meca-UI)
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";

import "./index.css";
import { FeedbackProvider } from "./components/ui/Feedback";
import router from "./router/Router";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found in index.html");

createRoot(container).render(
  <StrictMode>
    <FeedbackProvider>
      <RouterProvider router={router} />
    </FeedbackProvider>
  </StrictMode>,
);
