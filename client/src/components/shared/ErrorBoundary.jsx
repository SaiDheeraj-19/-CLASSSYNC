import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-8 text-white z-[9999]">
                    <div className="max-w-3xl w-full bg-gray-900 border border-red-500 rounded p-6 shadow-2xl">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">Application Error</h1>
                        <p className="text-gray-300 mb-4">The application has encountered a critical error and cannot render.</p>

                        <div className="bg-black p-4 rounded overflow-auto max-h-60 mb-4 border border-gray-800 font-mono text-xs">
                            <div className="text-red-400 font-bold mb-2">{this.state.error && this.state.error.toString()}</div>
                            <pre className="text-gray-500 whitespace-pre-wrap">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition-colors"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
