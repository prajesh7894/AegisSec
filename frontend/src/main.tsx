import React from "react";
import ReactDOM from "react-dom/client";
// TypeScript may complain about side-effect CSS imports when no type
// declarations are provided. Suppress that check for this import.
// @ts-ignore
import "./styles.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
