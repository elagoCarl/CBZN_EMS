import React, { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';

// Helper function to get default empty schedule with ordered days
const getEmptySchedule = () => ({
  "Monday": { "In": "", "Out": "" },
  "Tuesday": { "In": "", "Out": "" },
  "Wednesday": { "In": "", "Out": "" },
  "Thursday": { "In": "", "Out": "" },
  "Friday": { "In": "", "Out": "" },
  "Saturday": { "In": "", "Out": "" },
  "Sunday": { "In": "", "Out": "" }
});

// Order of days to ensure consistent display
const orderedDays = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export const AddScheduleModal = ({ onClose, onAddSchedule }) => {
  const [title, setTitle] = useState('');
  const [schedule, setSchedule] = useState(getEmptySchedule());
  const [isActive, setIsActive] = useState(true); // Default to active
  const [errors, setErrors] = useState({});

  const handleTimeChange = (day, type, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const clearTimeInput = (day, type) => {
    handleTimeChange(day, type, "");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Schedule title is required';
    }

    // Check if at least one day has both in and out times
    const hasValidDay = Object.values(schedule).some(
      day => day.In && day.Out
    );

    if (!hasValidDay) {
      newErrors.schedule = 'At least one day must have both in and out times';
    }

    // Check if any day has only one time set (either In or Out but not both)
    Object.entries(schedule).forEach(([day, times]) => {
      if ((times.In && !times.Out) || (!times.In && times.Out)) {
        newErrors[day] = 'Both in and out times must be set';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Filter the schedule to only include days that have both In and Out times
      const filteredSchedule = {};
      Object.entries(schedule).forEach(([day, times]) => {
        if (times.In && times.Out) {
          filteredSchedule[day] = times;
        }
      });

      onAddSchedule({
        id: Date.now(), // Generate a temporary ID
        title,
        schedule: filteredSchedule,
        isActive
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      <div className="bg-[#2b2b2b] rounded-lg w-[95%] max-h-[90vh] sm:h-auto sm:max-w-2xl sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 sm:p-6 border-b border-white/10 bg-[#2b2b2b]">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Add New Schedule</h2>
          <button onClick={onClose} className="text-white hover:text-red-500">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <label className="block text-white text-sm font-medium mb-2">Schedule Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#363636] text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter schedule title"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 bg-[#363636] border-gray-600 rounded text-green-500 focus:ring-green-500 focus:ring-opacity-25"
              />
              <label htmlFor="isActive" className="ml-2 text-white text-sm font-medium">
                Active
              </label>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-white text-sm font-medium mb-2">Working Hours</label>
            {errors.schedule && <p className="text-red-500 text-xs mb-2">{errors.schedule}</p>}

            <div className="space-y-3 sm:space-y-4">
              {orderedDays.map((day) => (
                <div key={day} className="bg-[#363636] p-3 rounded-md">
                  <div className="flex flex-col space-y-2">
                    <label className="text-white text-sm font-medium">{day}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center relative">
                        <input
                          type="time"
                          value={schedule[day].In}
                          onChange={(e) => handleTimeChange(day, 'In', e.target.value)}
                          className="w-full bg-[#2b2b2b] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm cursor-pointer pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => clearTimeInput(day, 'In')}
                          className="absolute right-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center relative">
                        <input
                          type="time"
                          value={schedule[day].Out}
                          onChange={(e) => handleTimeChange(day, 'Out', e.target.value)}
                          className="w-full bg-[#2b2b2b] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm cursor-pointer pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => clearTimeInput(day, 'Out')}
                          className="absolute right-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {errors[day] && <p className="text-red-500 text-xs mt-1">{errors[day]}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 pt-4 pb-2 mt-6 flex justify-end space-x-3 bg-[#2b2b2b]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 sm:px-4 text-sm bg-[#363636] text-white rounded-md hover:bg-[#444444]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 sm:px-4 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
              <Check className="w-4 h-4 mr-1 sm:mr-2" />
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditScheduleModal = ({ schedule, onClose, onUpdateSchedule }) => {
  const [title, setTitle] = useState('');
  const [scheduleData, setScheduleData] = useState(getEmptySchedule());
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (schedule) {
      setTitle(schedule.title);

      // Create a complete schedule with all days
      const completeSchedule = getEmptySchedule();

      // Fill in the existing schedule data
      Object.entries(schedule.schedule).forEach(([day, times]) => {
        completeSchedule[day] = times;
      });

      setScheduleData(completeSchedule);
      setIsActive(schedule.isActive !== undefined ? schedule.isActive : true);
    }
  }, [schedule]);

  const handleTimeChange = (day, type, value) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const clearTimeInput = (day, type) => {
    handleTimeChange(day, type, "");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Schedule title is required';
    }

    // Check if at least one day has both in and out times
    const hasValidDay = Object.values(scheduleData).some(
      day => day.In && day.Out
    );

    if (!hasValidDay) {
      newErrors.schedule = 'At least one day must have both in and out times';
    }

    // Check if any day has only one time set (either In or Out but not both)
    Object.entries(scheduleData).forEach(([day, times]) => {
      if ((times.In && !times.Out) || (!times.In && times.Out)) {
        newErrors[day] = 'Both in and out times must be set';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Filter the schedule to only include days that have both In and Out times
      const filteredSchedule = {};
      Object.entries(scheduleData).forEach(([day, times]) => {
        if (times.In && times.Out) {
          filteredSchedule[day] = times;
        }
      });

      onUpdateSchedule({
        ...schedule,
        title,
        schedule: filteredSchedule,
        isActive
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      <div className="bg-[#2b2b2b] rounded-lg w-[95%] max-h-[90vh] sm:h-auto sm:max-w-2xl sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 sm:p-6 border-b border-white/10 bg-[#2b2b2b]">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Edit Schedule</h2>
          <button onClick={onClose} className="text-white hover:text-red-500">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <label className="block text-white text-sm font-medium mb-2">Schedule Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#363636] text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter schedule title"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="flex items-center">
              <input
                id="isActiveEdit"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 bg-[#363636] border-gray-600 rounded text-green-500 focus:ring-green-500 focus:ring-opacity-25"
              />
              <label htmlFor="isActiveEdit" className="ml-2 text-white text-sm font-medium">
                Active
              </label>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-white text-sm font-medium mb-2">Working Hours</label>
            {errors.schedule && <p className="text-red-500 text-xs mb-2">{errors.schedule}</p>}

            <div className="space-y-3 sm:space-y-4">
              {orderedDays.map((day) => (
                <div key={day} className="bg-[#363636] p-3 rounded-md">
                  <div className="flex flex-col space-y-2">
                    <label className="text-white text-sm font-medium">{day}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center relative">
                        <input
                          type="time"
                          value={scheduleData[day]?.In || ""}
                          onChange={(e) => handleTimeChange(day, 'In', e.target.value)}
                          className="w-full bg-[#2b2b2b] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm cursor-pointer pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => clearTimeInput(day, 'In')}
                          className="absolute right-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center relative">
                        <input
                          type="time"
                          value={scheduleData[day]?.Out || ""}
                          onChange={(e) => handleTimeChange(day, 'Out', e.target.value)}
                          className="w-full bg-[#2b2b2b] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm cursor-pointer pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => clearTimeInput(day, 'Out')}
                          className="absolute right-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {errors[day] && <p className="text-red-500 text-xs mt-1">{errors[day]}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 pt-4 pb-2 mt-6 flex justify-end space-x-3 bg-[#2b2b2b]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 sm:px-4 text-sm bg-[#363636] text-white rounded-md hover:bg-[#444444]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 sm:px-4 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
              <Check className="w-4 h-4 mr-1 sm:mr-2" />
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};