import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Trash2 } from 'lucide-react';

const ScheduleModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialSchedule = null, 
  isEditMode = false 
}) => {
  const [title, setTitle] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [schedule, setSchedule] = useState({
    Monday: { In: '', Out: '' },
    Tuesday: { In: '', Out: '' },
    Wednesday: { In: '', Out: '' },
    Thursday: { In: '', Out: '' },
    Friday: { In: '', Out: '' },
    Saturday: { In: '', Out: '' },
    Sunday: { In: '', Out: '' }
  });

  useEffect(() => {
    if (isEditMode && initialSchedule) {
      setTitle(initialSchedule.title);
      setIsActive(initialSchedule.isActive);
      setSchedule(initialSchedule.schedule);
    } else {
      // Reset to default when opening for add
      setTitle('');
      setIsActive(true);
      setSchedule({
        Monday: { In: '', Out: '' },
        Tuesday: { In: '', Out: '' },
        Wednesday: { In: '', Out: '' },
        Thursday: { In: '', Out: '' },
        Friday: { In: '', Out: '' },
        Saturday: { In: '', Out: '' },
        Sunday: { In: '', Out: '' }
      });
    }
  }, [isOpen, isEditMode, initialSchedule]);

  const handleTimeChange = (day, type, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        schedule,
        isActive
      };

      if (isEditMode) {
        await axios.put(`http://localhost:8080/schedule/updateSchedule/${initialSchedule.id}`, payload);
      } else {
        await axios.post('http://localhost:8080/schedule/createSchedule', payload);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving schedule:', error);
      // TODO: Add error handling toast or notification
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#2b2b2b] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {isEditMode ? 'Edit Schedule' : 'Add New Schedule'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-white hover:text-red-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Schedule Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#363636] text-white rounded-md border-0 py-2.5 px-3 focus:ring-2 focus:ring-green-500"
                placeholder="Enter schedule title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Schedule Status
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 text-green-600 bg-[#363636] border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-300">
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Daily Time Schedule
              </h3>
              {Object.keys(schedule).map((day) => (
                <div key={day} className="grid grid-cols-3 gap-4 mb-3 items-center">
                  <div className="text-sm text-gray-300 font-medium">{day}</div>
                  <div>
                    <input
                      type="time"
                      value={schedule[day].In}
                      onChange={(e) => handleTimeChange(day, 'In', e.target.value)}
                      className="w-full bg-[#363636] text-white rounded-md border-0 py-2 px-3 text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      value={schedule[day].Out}
                      onChange={(e) => handleTimeChange(day, 'Out', e.target.value)}
                      className="w-full bg-[#363636] text-white rounded-md border-0 py-2 px-3 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {isEditMode ? 'Update Schedule' : 'Create Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AddScheduleModal = ({ isOpen, onClose, onSuccess }) => (
  <ScheduleModal 
    isOpen={isOpen} 
    onClose={onClose} 
    onSuccess={onSuccess} 
    isEditMode={false} 
  />
);

export const EditScheduleModal = ({ isOpen, onClose, schedule, onSuccess }) => (
  <ScheduleModal 
    isOpen={isOpen} 
    onClose={onClose} 
    onSuccess={onSuccess} 
    initialSchedule={schedule} 
    isEditMode={true} 
  />
);

export default ScheduleModal;