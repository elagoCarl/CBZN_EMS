import { useNavigate } from "react-router-dom";
import { Frown } from "lucide-react";

const Page404 = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center h-screen px-4 bg-black/85">
      <div className="text-center">
        <Frown className="mx-auto my-4 text-gray-400" size={120} /> {/* Sad face icon */}
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300">Page Not Found</h2>
        <p className="text-2xl md:text-2xl font-light text-gray-300 mt-4">
          The page you are looking for doesn&apos;t exist.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-md hover:bg-green-800 transition duration-300 border-none animate-pulse"
        >
          Go Back?
        </button>
      </div>
    </div>
  );
};

export default Page404;
