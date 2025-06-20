
/**
 * Simplified submission tracker for legacy compatibility
 */

const STATE_KEY = 'form_submission_state';
  
const getState = () => {
  try {
    const state = sessionStorage.getItem(STATE_KEY);
    return state ? JSON.parse(state) : { active: [], completed: [], submissionIds: {} };
  } catch (e) {
    return { active: [], completed: [], submissionIds: {} };
  }
};
  
const setState = (state: any) => {
  sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
};

// Simplified submission tracker for legacy support
export const submissionTracker = {
  isActive: (key: string): boolean => {
    const state = getState();
    return state.active.includes(key);
  },
  
  isCompleted: (userId: string): boolean => {
    const state = getState();
    return state.completed.includes(userId);
  },
  
  hasSubmissionId: (userId: string): boolean => {
    const state = getState();
    return !!state.submissionIds[userId];
  },
  
  getSubmissionId: (userId: string): string | undefined => {
    const state = getState();
    return state.submissionIds[userId];
  },
  
  addActive: (key: string): void => {
    const state = getState();
    if (!state.active.includes(key)) {
      state.active.push(key);
      setState(state);
    }
  },
  
  removeActive: (key: string): void => {
    const state = getState();
    state.active = state.active.filter((k: string) => k !== key);
    setState(state);
  },
  
  addCompleted: (userId: string): void => {
    const state = getState();
    if (!state.completed.includes(userId)) {
      state.completed.push(userId);
      setState(state);
    }
  },
  
  storeSubmissionId: (userId: string, submissionId: string): void => {
    const state = getState();
    state.submissionIds[userId] = submissionId;
    setState(state);
  },
  
  reset: (): void => {
    setState({ active: [], completed: [], submissionIds: {} });
  },
  
  clearCompleted: (userId: string): void => {
    const state = getState();
    state.completed = state.completed.filter((id: string) => id !== userId);
    setState(state);
  },
  
  getActiveCount: (): number => {
    return getState().active.length;
  }
};
