import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css'
import './utils/syncManager' // Import to initialize global online listener

// Unregister any old/stale service workers and clear caches
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
            registration.unregister();
        }
    });
    // Clear all caches so stale SW cache doesn't cause blank page
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            cacheNames.forEach(name => caches.delete(name));
        });
    }
    // Re-register the updated service worker after clearing
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: "2rem", backgroundColor: "#ffebee", color: "#b71c1c", minHeight: "100vh", fontFamily: "monospace" }}>
                    <h2>React Error Boundary Caught An Exception:</h2>
                    <p><b>{this.state.error && this.state.error.toString()}</b></p>
                    <pre style={{ whiteSpace: "pre-wrap", background: "white", padding: "1rem", border: "1px solid #ffcdd2" }}>
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
)
