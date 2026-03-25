// Utility functions for RLS (Row Level Security) error handling

export interface RLSErrorResponse {
  error: string;
  code?: string;
  details?: string;
}

export function handleRLSError(
  response: Response,
  defaultMessage: string
): never {
  if (response.status === 401) {
    throw new Error('Please sign in to perform this action');
  } else if (response.status === 403) {
    throw new Error(
      'Access denied - you can only perform this action on your own data'
    );
  } else if (response.status === 404) {
    throw new Error('Resource not found');
  } else {
    throw new Error(defaultMessage);
  }
}

export function isRLSError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('Access denied') ||
      error.message.includes('Please sign in') ||
      error.message.includes('permission denied')
    );
  }
  return false;
}

export function getRLSErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('Access denied')) {
      return 'You can only perform this action on your own data';
    }
    if (error.message.includes('Please sign in')) {
      return 'Please sign in to continue';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}
