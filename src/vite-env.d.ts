
/// <reference types="vite/client" />

// Add Calendly type declarations
interface Window {
  Calendly?: {
    initInlineWidget: (options: {
      url: string | null;
      parentElement: Element;
      prefill?: Record<string, any>;
      utm?: Record<string, any>;
    }) => void;
  }
}
