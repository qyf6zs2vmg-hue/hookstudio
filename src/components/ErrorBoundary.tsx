import * as React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<any, any> {
  state: any;
  props: any;

  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-deep flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full space-y-6 bg-bg-card border border-border-custom p-10 rounded-[2rem] shadow-2xl">
            <div className="w-16 h-16 bg-accent-muted rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-accent-custom" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-text-primary tracking-tight">Something went wrong</h1>
              <p className="text-text-secondary text-sm">
                The application encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>
            {this.state.error && (
              <div className="bg-bg-deep p-4 rounded-xl border border-border-custom text-left overflow-auto max-h-32">
                <code className="text-[10px] text-accent-custom font-mono">
                  {this.state.error.toString()}
                </code>
              </div>
            )}
            <Button 
              className="w-full h-12 bg-accent-custom hover:opacity-90 text-white rounded-xl font-black uppercase tracking-widest gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
