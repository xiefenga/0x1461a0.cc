import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import "./globals.css";

const view = new URLSearchParams(window.location.search).get("view");

if (view === "popover") {
  document.documentElement.classList.add("popover-view");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
