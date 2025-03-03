import { useNavigate } from "react-router-dom";

const Page404 = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center h-screen bg-white px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-800">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600">Page Not Found</h2>
        <p className="text-2xl md:text-2xl font-light text-gray-600 mt-4">
          The page you are looking for doesn&apos;t exist.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-md hover:bg-blue-700 transition duration-300"
        >
          Go Back?
        </button>
      </div>
    </div>
  );
};

export default Page404;
