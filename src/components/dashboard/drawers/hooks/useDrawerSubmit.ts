
// This file is deprecated - functionality moved to specific drawer submit hooks
// to fix React hook rules violations. Use useOwnerDrawerSubmit or usePropertyDrawerSubmit instead.

export const useDrawerSubmit = () => {
  console.warn('useDrawerSubmit is deprecated. Use specific drawer submit hooks instead.');
  return {
    handleSubmit: () => Promise.resolve(),
    isSubmitting: false
  };
};
