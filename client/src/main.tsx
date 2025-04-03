import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/ui/theme-provider";

// Set document to dark mode
document.documentElement.classList.remove("light");
document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="theme-preference">
    <App />
  </ThemeProvider>
);
