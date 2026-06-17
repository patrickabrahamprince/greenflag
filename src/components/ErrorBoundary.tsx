"use client";
import { Component } from "react";
import type { ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-dvh bg-bg flex flex-col items-center justify-center px-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-[20px] bg-accent/10 border-[0.5px] border-accent/20 flex items-center justify-center">
            <span className="text-3xl font-display text-accent font-bold">G</span>
          </div>
          <h1 className="text-[22px] font-display font-semibold">Something went wrong</h1>
          <p className="text-sm text-text-muted">Please try again.</p>
          <button onClick={() => this.setState({ hasError: false })}
            className="h-12 px-6 rounded-[16px] bg-accent text-bg font-semibold text-sm">
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
