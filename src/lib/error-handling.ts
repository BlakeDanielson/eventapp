/**
 * Centralized Error Handling Utilities
 * 
 * This module provides standardized error handling across the application,
 * including error types, formatting utilities, and API response helpers.
 */

// ===== ERROR TYPES & INTERFACES =====

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION', 
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  code?: string;
  statusCode?: number;
  timestamp?: string;
  userId?: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    type: ErrorType;
    message: string;
    details?: string;
    code?: string;
    timestamp: string;
    requestId?: string;
  };
}

export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationErrorResponse extends ApiErrorResponse {
  error: ApiErrorResponse['error'] & {
    type: ErrorType.VALIDATION;
    fields: FieldError[];
  };
}

// ===== ERROR CREATION UTILITIES =====

export function createAppError(
  type: ErrorType,
  message: string,
  options: {
    details?: string;
    code?: string;
    statusCode?: number;
    userId?: string;
    requestId?: string;
  } = {}
): AppError {
  return {
    type,
    message,
    details: options.details,
    code: options.code,
    statusCode: options.statusCode || getDefaultStatusCode(type),
    timestamp: new Date().toISOString(),
    userId: options.userId,
    requestId: options.requestId,
  };
}

export function createValidationError(
  message: string,
  fields: FieldError[],
  options: { details?: string; code?: string } = {}
): AppError {
  return createAppError(ErrorType.VALIDATION, message, {
    ...options,
    statusCode: 400,
    details: options.details || `Validation failed for: ${fields.map(f => f.field).join(', ')}`,
  });
}

export function createAuthenticationError(
  message: string = 'Authentication required',
  options: { details?: string; code?: string } = {}
): AppError {
  return createAppError(ErrorType.AUTHENTICATION, message, {
    ...options,
    statusCode: 401,
  });
}

export function createAuthorizationError(
  message: string = 'Access denied',
  options: { details?: string; code?: string } = {}
): AppError {
  return createAppError(ErrorType.AUTHORIZATION, message, {
    ...options,
    statusCode: 403,
  });
}

export function createNotFoundError(
  resource: string,
  options: { details?: string; code?: string } = {}
): AppError {
  return createAppError(ErrorType.NOT_FOUND, `${resource} not found`, {
    ...options,
    statusCode: 404,
  });
}

// ===== STATUS CODE MAPPING =====

function getDefaultStatusCode(type: ErrorType): number {
  switch (type) {
    case ErrorType.VALIDATION:
      return 400;
    case ErrorType.AUTHENTICATION:
      return 401;
    case ErrorType.AUTHORIZATION:
      return 403;
    case ErrorType.NOT_FOUND:
      return 404;
    case ErrorType.CONFLICT:
      return 409;
    case ErrorType.RATE_LIMIT:
      return 429;
    case ErrorType.SERVER_ERROR:
    case ErrorType.DATABASE_ERROR:
    case ErrorType.EXTERNAL_API_ERROR:
      return 500;
    case ErrorType.NETWORK_ERROR:
      return 503;
    default:
      return 500;
  }
}

// ===== API RESPONSE HELPERS =====

export function createApiErrorResponse(error: AppError): ApiErrorResponse {
  return {
    success: false,
    error: {
      type: error.type,
      message: error.message,
      details: error.details,
      code: error.code,
      timestamp: error.timestamp || new Date().toISOString(),
      requestId: error.requestId,
    },
  };
}

export function createValidationErrorResponse(
  message: string,
  fields: FieldError[]
): ValidationErrorResponse {
  return {
    success: false,
    error: {
      type: ErrorType.VALIDATION,
      message,
      fields,
      timestamp: new Date().toISOString(),
    },
  };
}

// ===== ERROR PARSING & HANDLING =====

export function parseError(error: unknown): AppError {
  // If it's already an AppError, return as is
  if (isAppError(error)) {
    return error;
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return createAppError(
      ErrorType.SERVER_ERROR,
      error.message,
      { details: error.stack }
    );
  }

  // Handle API response errors
  if (isApiErrorResponse(error)) {
    return {
      type: error.error.type,
      message: error.error.message,
      details: error.error.details,
      code: error.error.code,
      timestamp: error.error.timestamp,
      requestId: error.error.requestId,
    };
  }

  // Handle unknown errors
  return createAppError(
    ErrorType.SERVER_ERROR,
    'An unknown error occurred',
    { details: String(error) }
  );
}

export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'message' in value &&
    Object.values(ErrorType).includes((value as AppError).type)
  );
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as ApiErrorResponse).success === false &&
    'error' in value
  );
}

// ===== USER-FRIENDLY ERROR MESSAGES =====

export function getUserFriendlyMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.AUTHENTICATION:
      return 'Please sign in to continue.';
    case ErrorType.AUTHORIZATION:
      return "You don't have permission to perform this action.";
    case ErrorType.NOT_FOUND:
      return 'The requested item could not be found.';
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorType.CONFLICT:
      return 'This action conflicts with existing data. Please refresh and try again.';
    case ErrorType.RATE_LIMIT:
      return 'Too many requests. Please wait a moment and try again.';
    case ErrorType.NETWORK_ERROR:
      return 'Network connection issue. Please check your internet and try again.';
    case ErrorType.DATABASE_ERROR:
    case ErrorType.SERVER_ERROR:
    case ErrorType.EXTERNAL_API_ERROR:
      return 'Something went wrong on our end. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
}

// ===== RETRY LOGIC HELPERS =====

export function shouldRetry(error: AppError): boolean {
  return [
    ErrorType.NETWORK_ERROR,
    ErrorType.SERVER_ERROR,
    ErrorType.EXTERNAL_API_ERROR,
  ].includes(error.type);
}

export function getRetryDelay(attemptNumber: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
  return Math.min(1000 * Math.pow(2, attemptNumber - 1), 30000);
}

// ===== LOGGING UTILITIES =====

export function logError(error: AppError, context?: string): void {
  const logData = {
    ...error,
    context,
    timestamp: error.timestamp || new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', logData);
  }

  // In production, you might want to send to an external service
  // e.g., Sentry, LogRocket, etc.
}

// ===== FETCH ERROR HANDLER =====

export async function handleFetchError(response: Response): Promise<never> {
  let errorData: any;
  
  try {
    errorData = await response.json();
  } catch {
    // If response isn't JSON, create a generic error
    throw createAppError(
      response.status >= 500 ? ErrorType.SERVER_ERROR : ErrorType.VALIDATION,
      `HTTP ${response.status}: ${response.statusText}`
    );
  }

  // If it's already a properly formatted error response, use it
  if (isApiErrorResponse(errorData)) {
    throw parseError(errorData);
  }

  // Create error based on status code
  const errorType = getErrorTypeFromStatus(response.status);
  throw createAppError(
    errorType,
    errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    { details: JSON.stringify(errorData) }
  );
}

function getErrorTypeFromStatus(status: number): ErrorType {
  if (status === 400) return ErrorType.VALIDATION;
  if (status === 401) return ErrorType.AUTHENTICATION;
  if (status === 403) return ErrorType.AUTHORIZATION;
  if (status === 404) return ErrorType.NOT_FOUND;
  if (status === 409) return ErrorType.CONFLICT;
  if (status === 429) return ErrorType.RATE_LIMIT;
  if (status >= 500) return ErrorType.SERVER_ERROR;
  return ErrorType.SERVER_ERROR;
} 