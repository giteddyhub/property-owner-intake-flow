
import { toast } from 'sonner';

export interface DetailedError {
  message: string;
  code?: string;
  details?: any;
  context?: string;
}

export class DashboardError extends Error {
  public code?: string;
  public details?: any;
  public context?: string;

  constructor(message: string, code?: string, details?: any, context?: string) {
    super(message);
    this.name = 'DashboardError';
    this.code = code;
    this.details = details;
    this.context = context;
  }
}

export const handleDashboardError = (
  error: any,
  operation: string,
  entityType: string,
  showToast: boolean = true
): DetailedError => {
  console.error(`[Dashboard Error] ${operation} ${entityType}:`, error);
  
  let message = `Failed to ${operation.toLowerCase()} ${entityType}`;
  let code = error?.code;
  let details = error?.details || error?.hint;

  // Handle specific Supabase errors
  if (error?.message) {
    if (error.message.includes('violates row-level security policy')) {
      message = `Permission denied. Please ensure you're logged in and have access to this ${entityType}.`;
      code = 'RLS_VIOLATION';
    } else if (error.message.includes('duplicate key')) {
      message = `This ${entityType} already exists. Please check your data.`;
      code = 'DUPLICATE_KEY';
    } else if (error.message.includes('foreign key')) {
      message = `Cannot ${operation.toLowerCase()} ${entityType} due to related data dependencies.`;
      code = 'FOREIGN_KEY_VIOLATION';
    } else if (error.message.includes('not null')) {
      message = `Missing required information for ${entityType}. Please fill in all required fields.`;
      code = 'NULL_VIOLATION';
    } else if (error.message.includes('JWT')) {
      message = `Authentication session expired. Please refresh the page and try again.`;
      code = 'AUTH_ERROR';
    } else {
      message = `${message}: ${error.message}`;
    }
  }

  const detailedError: DetailedError = {
    message,
    code,
    details,
    context: `${operation} ${entityType}`
  };

  if (showToast) {
    toast.error(message, {
      description: details ? `Details: ${details}` : undefined,
      duration: 6000,
    });
  }

  return detailedError;
};

export const logOperation = (
  operation: string,
  entityType: string,
  entityId?: string,
  data?: any
) => {
  console.log(`[Dashboard Operation] ${operation} ${entityType}`, {
    entityId,
    data: data ? { ...data, id: entityId } : undefined,
    timestamp: new Date().toISOString(),
    userId: data?.user_id || 'unknown'
  });
};
