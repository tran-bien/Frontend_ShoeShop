import { Component, ErrorInfo, ReactNode } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-mono-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-soft p-8 text-center">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="bg-red-100 rounded-full p-4">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <h2 className="text-2xl font-bold text-mono-900 mb-2">
              Đã xảy ra lỗi
            </h2>
            <p className="text-mono-600 mb-6">
              Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hỗ trợ
              nếu vấn đề vẫn tiếp diễn.
            </p>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 text-left bg-mono-100 rounded-lg p-4 max-h-48 overflow-auto">
                <p className="text-sm font-mono text-red-700 mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs text-mono-600 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-mono-black text-white px-6 py-3 rounded-lg hover:bg-mono-800 transition-colors font-medium"
              >
                Thử lại
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 bg-mono-100 text-mono-700 px-6 py-3 rounded-lg hover:bg-mono-200 transition-colors font-medium"
              >
                Về trang chủ
              </button>
            </div>

            {/* Support Link */}
            <p className="mt-6 text-sm text-mono-500">
              Cần hỗ trợ?{" "}
              <a
                href="/contact"
                className="text-mono-900 hover:underline font-medium"
              >
                Liên hệ với chúng tôi
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
