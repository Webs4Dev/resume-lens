import { Component } from "react";

// Catches render errors anywhere below it (for example a result with
// an unexpected shape) and shows a recovery screen instead of a
// blank page. Has to be a class: React has no hook for this.
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error(error, info.componentStack);
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <div className="app">
                <main className="page">
                    <div className="container">
                        <div className="loading" role="alert">
                            <h2>
                                Something went wrong
                            </h2>

                            <p>
                                This page could not be displayed.
                                Try running the analysis again.
                            </p>

                            <a
                                href="/analyze"
                                className="primary-button"
                                style={{ marginTop: 24 }}
                            >
                                Back to Analyze
                            </a>
                        </div>
                    </div>
                </main>
            </div>
        );
    }
}
