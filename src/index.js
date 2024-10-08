import "./normalize.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import WeatherApp from "./WeatherApp";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
// import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <WeatherApp />
  </StrictMode>
);

serviceWorkerRegistration.register();