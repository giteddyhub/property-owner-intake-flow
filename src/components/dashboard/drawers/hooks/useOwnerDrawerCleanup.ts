
export const useOwnerDrawerCleanup = () => {
  const handleClose = () => {
    // Remove any pointer-events blocking that might have been applied
    document.body.style.pointerEvents = '';
    
    // Remove any lingering overlay elements
    const overlays = document.querySelectorAll('[data-state="open"][data-radix-portal]');
    overlays.forEach(overlay => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    });
  };

  return { handleClose };
};
