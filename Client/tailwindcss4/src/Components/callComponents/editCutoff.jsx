import { useState, useEffect, useRef } from 'react';
import { Calendar, X } from 'lucide-react';
import axios from 'axios';
import PropTypes from 'prop-types';

const EditCutoffModal = ({ isOpen, onClose, onCutoffUpdated, cutoff }) => {
    const [formData, setFormData] = useState({
        startDate: '',
        cutoffDate: '',
        remarks: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const errorTimeoutRef = useRef(null);

    // Populate the form when a cutoff is provided (or changed)
    useEffect(() => {
        if (cutoff) {
            setFormData({
                startDate: cutoff.start_date || '',
                cutoffDate: cutoff.end_date || '', // assuming cutoff.end_date represents the cutoff_date
                remarks: cutoff.remarks || ''
            });
            setSuccessMessage('');
            setError('');
        }
    }, [cutoff]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cutoff?.id) return;

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            await axios.put(`http://localhost:8080/cutoff/updateCutoff/${cutoff.id}`, {
                start_date: formData.startDate,
                cutoff_date: formData.cutoffDate,
                remarks: formData.remarks
            });

            // Set success message and close modal after a short delay
            setSuccessMessage("Cutoff updated successfully.");
            setTimeout(() => {
                onCutoffUpdated();
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Error updating cutoff:', err);
            setError(err.response?.data?.message || "An unexpected error occurred.");
            errorTimeoutRef.current = setTimeout(() => {
                setError('');
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="bg-[#2b2b2b] rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">Edit Cutoff Date</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/20 text-red-500 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="bg-green-500/20 text-green-500 p-3 rounded-md text-sm">
                            {successMessage}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="w-full bg-[#363636] text-white rounded-md border-0 py-2 px-3 focus:border-none focus:outline focus:outline-green-400"
                            required
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Cutoff Date
                        </label>
                        <input
                            type="date"
                            name="cutoffDate"
                            value={formData.cutoffDate}
                            onChange={handleChange}
                            className="w-full bg-[#363636] text-white rounded-md border-0 py-2 px-3 focus:border-none focus:outline focus:outline-green-400"
                            required
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Remarks
                        </label>
                        <input
                            type="text"
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            className="w-full bg-[#363636] text-white rounded-md border-0 py-2 px-3 focus:border-none focus:outline focus:outline-green-400"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-[#363636] rounded-md"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

EditCutoffModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCutoffUpdated: PropTypes.func.isRequired,
    cutoff: PropTypes.object
};

export default EditCutoffModal;
