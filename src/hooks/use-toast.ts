
import { useState, useEffect } from "react"
import { toast as sonnerToast } from "sonner"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000

type ToasterToast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function generateId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

type State = {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        toastTimeouts.set(
          toastId,
          setTimeout(() => {
            toastTimeouts.delete(toastId)
          }, TOAST_REMOVE_DELAY)
        )
      } else {
        for (const toastToDelete of state.toasts) {
          toastTimeouts.set(
            toastToDelete.id,
            setTimeout(() => {
              toastTimeouts.delete(toastToDelete.id)
            }, TOAST_REMOVE_DELAY)
          )
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
              }
            : t
        ),
      }
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// This is used to forward shadcn toast calls to sonner
const toast = {
  success: (message: string, options = {}) => {
    sonnerToast.success(message, options)
    return generateId()
  },
  error: (message: string, options = {}) => {
    sonnerToast.error(message, options)
    return generateId()
  },
  info: (message: string, options = {}) => {
    sonnerToast(message, options)
    return generateId()
  },
  warning: (message: string, options = {}) => {
    sonnerToast.warning(message, options)
    return generateId()
  },
  // Add compatibility layer for the shadcn useToast structure
  // to support the previous component implementations
  ...sonnerToast
}

function useToast() {
  const [state, setState] = useState<State>({ toasts: [] })

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => {
      setState((prevState) => {
        return {
          ...prevState,
          toasts: prevState.toasts.filter((t) => t.id !== toastId),
        }
      })
    },
  }
}

export { useToast, toast }
