import React from 'react';
import { XCircle } from 'lucide-react';

const RejectConfirmModal = ({ requestName, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2b2b2b] rounded-lg p-6 max-w-md w-full shadow-lg">
                <h3 className="text-xl font-bold text-red-500 mb-4">Confirm Rejection</h3>
                <p className="text-gray-300 mb-6">
                    Are you sure you want to reject the {requestName} change request?
                </p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors flex items-center">
                        <XCircle className="w-4 h-4 mr-2" /> Yes, Reject
                    </button>
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 bg-[#363636] text-white rounded hover:bg-[#404040] transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RejectConfirmModal;