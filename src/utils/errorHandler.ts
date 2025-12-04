/**
 * Utility to handle API errors in a consistent way
 */

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Formats error message from API response
 * @param error - Axios error object
 * @returns Formatted error message
 */
export const getErrorMessage = (error: any): string => {
  if (error.response && error.response.data) {
    const data = error.response.data as ApiErrorResponse;

    if (data.message) {
      return data.message;
    }

    if (data.errors) {
      const errorMessages = Object.values(data.errors).flat();
      return errorMessages.join(", ");
    }
  }

  return error.message || "Đã xảy ra lỗi, vui lòng thử lại sau";
};

/**
 * Log error details to console for debugging
 * @param error - Error object
 * @param context - Where the error occurred
 */
export const logError = (error: any, context: string): void => {
  console.error(`Error in ${context}:`, {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    requestData: error.config?.data,
  });
};
