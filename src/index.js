import React from "react";
import ReactDOM from "react-dom";
import { LanguageProvider } from "./i18n/LanguageContext";
import App from "./App";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
  rootElement
);
