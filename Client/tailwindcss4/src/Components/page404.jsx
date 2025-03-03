const Page404 = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-white px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-800">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600">Page Not Found</h2>
        <p className="text-2xl md:text-2xl font-light text-gray-600 mt-4">
          The page you are looking for doesn&apos;t exist or another error occurred.
          <br />
          Go back, or head over to{" "}
          <a href="/" className="text-blue-500 hover:underline duration-300">
            Home
          </a>{" "}
          to choose a new direction.
        </p>
      </div>
    </div>
  );
};

export default Page404;
