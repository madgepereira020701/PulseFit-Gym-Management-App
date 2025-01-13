import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Utility to suppress ResizeObserver warnings
const suppressWarnings = () => {
  const originalConsoleError = console.error;

  console.error = (...args) => {
    // Suppress only the specific ResizeObserver warning
    if (
      typeof args[0] === 'string' &&
      args[0].includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      return; // Ignore this warning
    }

    // Call the original console.error for all other errors
    originalConsoleError.apply(console, args);
  };
};

// Suppress warnings before application rendering
suppressWarnings();

const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the root component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance reporting (optional)
reportWebVitals();
