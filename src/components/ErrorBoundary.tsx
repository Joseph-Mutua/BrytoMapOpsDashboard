import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { Button, Card, CardHeader } from '@/components/ui';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
  };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : 'Unexpected UI error',
    };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('Bryto dashboard rendering error', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: null });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="app-shell">
        <Card>
          <CardHeader
            title="Something went wrong"
            subtitle="The dashboard hit an unexpected rendering error."
          />
          <div className="inline-alert inline-alert--error" role="alert">
            <p className="inline-alert__title">UI rendering error</p>
            <p className="inline-alert__body">{this.state.errorMessage ?? 'Unknown error'}</p>
            <Button onClick={this.handleReload}>Reload app</Button>
          </div>
        </Card>
      </div>
    );
  }
}
