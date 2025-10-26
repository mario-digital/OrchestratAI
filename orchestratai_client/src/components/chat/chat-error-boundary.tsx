/**
 * ChatErrorBoundary - Error boundary component for chat section
 *
 * Catches React errors in chat components and displays fallback UI
 * instead of crashing the entire application.
 *
 * @module components/chat/chat-error-boundary
 */

"use client";

import { Component, type ReactNode } from "react";

interface ChatErrorBoundaryProps {
  children: ReactNode;
}

interface ChatErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ChatErrorBoundary - Catches and handles errors in chat UI
 *
 * Features:
 * - Prevents full app crashes from chat errors
 * - Displays user-friendly error fallback UI
 * - Provides retry functionality
 * - Logs errors in development mode
 *
 * @example
 * ```tsx
 * <ChatErrorBoundary>
 *   <ChatInterface />
 * </ChatErrorBoundary>
 * ```
 */
export class ChatErrorBoundary extends Component<
  ChatErrorBoundaryProps,
  ChatErrorBoundaryState
> {
  constructor(props: ChatErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ChatErrorBoundaryState {
    // Update state so the next render shows fallback UI
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details in development
    if (process.env.NODE_ENV === "development") {
      console.error("Chat Error Boundary caught an error:", error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-panel-bg">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold text-error mb-4">
              Something went wrong
            </h2>
            <p className="text-text-secondary mb-6">
              The chat interface encountered an error. Please try refreshing the
              page or contact support if the problem persists.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-text-muted mb-2">
                  Error details (development only)
                </summary>
                <pre className="text-xs text-error bg-black/20 p-4 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="px-6 py-2 bg-error text-white rounded hover:bg-error/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
