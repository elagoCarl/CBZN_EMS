const CancelReq = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#292929] p-6 rounded-lg shadow-lg mx-8">
        <h2 className="text-md md:text-lg font-bold text-white text-center mb-4">
          {message}
        </h2>
        <div className="flex justify-center gap-4">

          <button
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none text-sm md:text-md"
            onClick={onConfirm}
          >
            Yes
          </button>
          <button
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 focus:outline-none text-sm md:text-md"
            onClick={onClose}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelReq;