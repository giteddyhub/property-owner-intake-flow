
/// <reference types="vite/client" />

// Add Calendly type declarations
interface Window {
  Calendly?: {
    initInlineWidgets: () => void;
  }
}
