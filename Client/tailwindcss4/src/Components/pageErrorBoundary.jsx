import React from "react";
import PropTypes from "prop-types";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.error("Error in ErrorBoundary:", error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
  if (this.state.hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black/85">
        <h2 className="text-2xl font-semibold mb-4 text-white">Oops! Something went wrong.</h2>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-green-500 hover:bg-green-700 duration-300 text-white rounded"
        >
          Refresh?
        </button>
      </div>
    );
  }
  return this.props.children;
}
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;

{/* WARNING: DONT REMOVE, this is an global error handler for React applications. It prevents the entire application from crashing due to unexpected JavaScript errors in the component tree, instead providing a user-friendly fallback UI. */}