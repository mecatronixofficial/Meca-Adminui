// ✅ Core React Imports
import React from "react";
import { createRoot } from "react-dom/client";

// ✅ React Router
import { RouterProvider } from "react-router-dom";
import Router from "./router/Router";

// ✅ Redux
import { Provider } from "react-redux";
import store from "./redux/store";

// ✅ Toast Notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Global Styles
import "./index.css";

// ✅ Create React Root
const container = document.getElementById("root");
if (!container) {
  throw new Error(
    "❌ Root element not found. Make sure you have <div id='root'></div> in index.html"
  );
}

const root = createRoot(container);

// ✅ Render App
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={Router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        limit={4}
        closeOnClick
        pauseOnFocusLoss
        theme="dark"
        aria-label="Application notifications"
      />
    </Provider>
  </React.StrictMode>
);
