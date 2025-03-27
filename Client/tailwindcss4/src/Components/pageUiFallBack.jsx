import { useState, useEffect } from "react";
import PropTypes from "prop-types";  // Import PropTypes
import axios from "axios";

const PageUiFallback = ({ children }) => {
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/data");
        setData(response.data);
      } catch (err) {
        setError("Failed to load data. Please try again.");
      }
    };

    fetchData();
  }, []);

  if (error) return <p>{error}</p>;
  if (!data) return <p>Loading...</p>
  return error ? <p>{error}</p> : children;
};

// ✅ Define prop types
PageUiFallback.propTypes = {
  children: PropTypes.node.isRequired, // Ensures children are valid React elements
};

export default PageUiFallback;


{/**WARNING: DONT REMOVE, This component serves as an error-handling wrapper for UI components that depend on fetching external data. It ensures that if an error occurs during data retrieval (e.g., due to network issues or a backend failure), the application does not break entirely but instead provides a graceful fallback message to the user. */}