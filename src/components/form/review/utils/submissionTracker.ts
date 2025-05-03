
/**
 * Submission tracker utility to prevent duplicate submissions
 * and track submission states across page reloads
 */

const STATE_KEY = 'form_submission_state';
  
/**
 * Get the current submission state from session storage
 */
const getState = () => {
  try {
    const state = sessionStorage.getItem(STATE_KEY);
    return state ? JSON.parse(state) : { active: [], completed: [], submissionIds: {} };
  } catch (e) {
    return { active: [], completed: [], submissionIds: {} };
  }
};
  
/**
 * Save the submission state to session storage
 */
const setState = (state: any) => {
  sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
};

/**
 * Submission tracker to prevent duplicate submissions
 * and manage submission state across page reloads
 */
export const submissionTracker = {
  /**
   * Check if a submission with the given key is active
   */
  isActive: (key: string): boolean => {
    const state = getState();
    return state.active.includes(key);
  },
  
  /**
   * Check if a user has already completed a submission
   */
  isCompleted: (userId: string): boolean => {
    const state = getState();
    return state.completed.includes(userId);
  },
  
  /**
   * Check if we have a stored submission ID for the user
   */
  hasSubmissionId: (userId: string): boolean => {
    const state = getState();
    return !!state.submissionIds[userId];
  },
  
  /**
   * Get the stored submission ID for a user
   */
  getSubmissionId: (userId: string): string | undefined => {
    const state = getState();
    return state.submissionIds[userId];
  },
  
  /**
   * Mark a submission as active
   */
  addActive: (key: string): void => {
    const state = getState();
    if (!state.active.includes(key)) {
      state.active.push(key);
      setState(state);
    }
  },
  
  /**
   * Remove a submission from the active list
   */
  removeActive: (key: string): void => {
    const state = getState();
    state.active = state.active.filter((k: string) => k !== key);
    setState(state);
  },
  
  /**
   * Mark a user as having completed a submission
   */
  addCompleted: (userId: string): void => {
    const state = getState();
    if (!state.completed.includes(userId)) {
      state.completed.push(userId);
      setState(state);
    }
  },
  
  /**
   * Store a submission ID for a user
   */
  storeSubmissionId: (userId: string, submissionId: string): void => {
    const state = getState();
    state.submissionIds[userId] = submissionId;
    setState(state);
  },
  
  /**
   * Reset the submission tracker state
   */
  reset: (): void => {
    setState({ active: [], completed: [], submissionIds: {} });
  },
  
  /**
   * Clear a user from the completed submissions list
   */
  clearCompleted: (userId: string): void => {
    const state = getState();
    state.completed = state.completed.filter((id: string) => id !== userId);
    setState(state);
  },
  
  /**
   * Get the number of active submissions
   */
  getActiveCount: (): number => {
    return getState().active.length;
  }
};
