import { useState, useEffect, useRef } from 'react';
import { Calendar, X } from 'lucide-react';import axios from 'axios';
import PropTypes from 'prop-types';


// Edit Department Modal
const EditCutoffModal = ({ isOpen, onClose, onCutoffUpdated, cutoff }) => {
    
    const [formData, setFormData] = useState({})
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const errorTimeoutRef = useRef(null);

    // useEffect(() => {
    //     if (cutoff) {
    //         setStartdate(cutoff.start_date);
    //         setCutoffdate(cutoff.cutoff_date);
    //         setRemarks(cutoff.remarks);
    //     }
    //     if (errorTimeoutRef.current) {
    //         clearTimeout(errorTimeoutRef.current);
    //     }
    // }, [cutoff]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cutoff?.id) return;
        
        setLoading(true);
        setError('');
        
        try {
            await axios.put(`http://localhost:8080/cutoff/updateCutoff/${cutoff.id}`, {
                start_date: formData.startDate,
                cutoff_date: formData.cutoffDate,
                remarks: formData.remarks
                
            });
            
            setSuccessMessage("Cutoff updated successfully.");
            setTimeout(() => {
              onUserUpdated(formData);
        onClose();
      }, 1500);

        } catch (error) {
            console.error('Error updating cutoff:', error);
            setError(`${error.response.data.message}`);
            errorTimeoutRef.current = setTimeout(() => {
                setError('');
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };

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
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
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
                            value={formData.remarks}
                            onChange={(e) => setRemarks(e.target.value)}
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
      onCutoffUpdated: PropTypes.func.isRequired
};


export default  EditCutoffModal ;