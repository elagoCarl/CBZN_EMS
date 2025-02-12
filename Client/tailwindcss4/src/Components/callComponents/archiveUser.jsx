import React from "react";

const ArchiveUser = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-black/80 p-6 sm:p-8 rounded-lg shadow-lg mx-4 sm:mx-8 w-full max-w-lg">
                <h2 className="text-xl font-bold text-white text-center mb-4">
                    Are you sure you want to archive this user?
                </h2>

                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                    <button
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 focus:outline-none"
                        onClick={onConfirm}
                    >
                        Yes
                    </button>
                    <button
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 focus:outline-none"
                        onClick={onClose}
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArchiveUser;