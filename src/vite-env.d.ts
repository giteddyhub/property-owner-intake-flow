
/// <reference types="vite/client" />

// Add Calendly type declarations
interface Window {
  Calendly?: {
    initInlineWidgets?: () => void;
    initInlineWidget?: (options: {
      url: string;
      parentElement: Element | null;
      prefill?: Record<string, any>;
      utm?: Record<string, any>;
    }) => void;
  }
}
