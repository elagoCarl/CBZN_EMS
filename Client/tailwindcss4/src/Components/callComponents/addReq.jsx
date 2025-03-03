import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, UserCheck, X } from 'lucide-react';
import axios from 'axios';

export const AddReq = ({ isOpen, onClose, onRequestAdded }) => {
  const [activeRequest, setActiveRequest] = useState(null);
  const profileRef = useRef(null);
  const [formData, setFormData] = useState({
    overtimeDate: '',
    overtimeReason: '',
    overtimeStart: '',
    overtimeEnd: '',
    leaveStartDate: '',
    leaveEndDate: '',
    leaveType: '',
    leaveReason: '',
    timeAdjustDate: '',
    timeAdjustFrom: '',
    timeAdjustTo: '',
    timeAdjustReason: '',
    scheduleDate: '',
    schedule: '',
    scheduleReason: ''
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setActiveRequest(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      overtimeDate: '',
      overtimeReason: '',
      overtimeStart: '',
      overtimeEnd: '',
      leaveStartDate: '',
      leaveEndDate: '',
      leaveType: '',
      leaveReason: '',
      timeAdjustDate: '',
      timeAdjustFrom: '',
      timeAdjustTo: '',
      timeAdjustReason: '',
      scheduleDate: '',
      schedule: '',
      scheduleReason: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // For schedule change request
    if (activeRequest === 'schedule') {
      const { scheduleDate, schedule, scheduleReason } = formData;
      const scheduleMapping = {
        "9AM-6PM": { time_in: "09:00", time_out: "18:00" },
        "10AM-7PM": { time_in: "10:00", time_out: "19:00" }
      };
      const times = scheduleMapping[schedule];
      if (!times) {
        console.error("Invalid schedule selected");
        return;
      }
      try {
        const response = await axios.post('http://localhost:8080/schedAdjustment/addSchedAdjustment', {
          user_id: 1, // Replace with actual user id
          date: scheduleDate,
          time_in: times.time_in,
          time_out: times.time_out,
          reason: scheduleReason,
        });
        console.log("Schedule change request submitted:", response.data);
        // Notify parent component of the new request
        if (onRequestAdded) onRequestAdded(response.data);
        resetForm();
        setActiveRequest(null);
        onClose(); // Close modal on success
      } catch (error) {
        console.error("Error submitting schedule change request:", error);
      }
    } else if (activeRequest === 'timeadjustment') {
      // For time adjustment request
      const { timeAdjustDate, timeAdjustFrom, timeAdjustTo, timeAdjustReason } = formData;
      try {
        const response = await axios.post('http://localhost:8080/timeAdjustment/addTimeAdjustment', {
          user_id: 1, // Replace with actual user id
          date: timeAdjustDate,
          time_in: timeAdjustFrom,
          time_out: timeAdjustTo,
          reason: timeAdjustReason,
        });
        console.log("Time adjustment request submitted:", response.data);
        // Notify parent component of the new request
        if (onRequestAdded) onRequestAdded(response.data);
        resetForm();
        setActiveRequest(null);
        onClose(); // Close modal on success
      } catch (error) {
        console.error("Error submitting time adjustment request:", error);
      }
    } else {
      // For other types (overtime, leave, etc.)
      console.log(`Submitting ${activeRequest} request:`, formData);
      // You can integrate similar axios requests here if needed.
      resetForm();
      setActiveRequest(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const InputField = ({ type, name, value, onChange, placeholder, className = "" }) => (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full bg-[#2b2b2b] text-white p-2 rounded focus:border-none focus:outline focus:outline-green-400 ${className}`}
    />
  );

  const renderForm = () => {
    switch (activeRequest) {
      case 'overtime':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl text-green-500 font-semibold mb-4">Overtime Request</h2>
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                type="date"
                name="overtimeDate"
                value={formData.overtimeDate}
                onChange={handleInputChange}
                className="md:col-span-3"
              />
              <InputField
                type="time"
                name="overtimeStart"
                value={formData.overtimeStart}
                onChange={handleInputChange}
                placeholder="Start Time"
              />
              <InputField
                type="time"
                name="overtimeEnd"
                value={formData.overtimeEnd}
                onChange={handleInputChange}
                placeholder="End Time"
              />
            </div>
            <textarea
              name="overtimeReason"
              placeholder="Reason for overtime..."
              value={formData.overtimeReason}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded h-32 focus:border-none focus:outline focus:outline-green-400"
            />
            <div className="flex justify-end">
              <button type="submit" className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                Submit Overtime Request
              </button>
            </div>
          </form>
        );
      case 'leave':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl text-green-500 font-semibold mb-4">Leave Request</h2>
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 gap-4">
              <InputField
                type="date"
                name="leaveStartDate"
                value={formData.leaveStartDate}
                onChange={handleInputChange}
              />
              <InputField
                type="date"
                name="leaveEndDate"
                value={formData.leaveEndDate}
                onChange={handleInputChange}
              />
            </div>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded focus:border-none focus:outline focus:outline-green-400"
            >
              <option value="">Select Leave Type</option>
              <option value="vacation">Vacation Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="emergency">Emergency Leave</option>
            </select>
            <textarea
              name="leaveReason"
              placeholder="Reason for leave..."
              value={formData.leaveReason}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded h-32 focus:border-none focus:outline focus:outline-green-400"
            />
            <div className="flex justify-end">
              <button type="submit" className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                Submit Leave Request
              </button>
            </div>
          </form>
        );
      case 'timeadjustment':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl text-green-500 font-semibold mb-4">Time Adjustment Request</h2>
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                type="date"
                name="timeAdjustDate"
                value={formData.timeAdjustDate}
                onChange={handleInputChange}
                className="md:col-span-3"
              />
              <InputField
                type="time"
                name="timeAdjustFrom"
                value={formData.timeAdjustFrom}
                onChange={handleInputChange}
                placeholder="Original Time"
              />
              <InputField
                type="time"
                name="timeAdjustTo"
                value={formData.timeAdjustTo}
                onChange={handleInputChange}
                placeholder="Adjusted Time"
              />
            </div>
            <textarea
              name="timeAdjustReason"
              placeholder="Reason for time adjustment..."
              value={formData.timeAdjustReason}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded h-32 focus:border-none focus:outline focus:outline-green-400"
            />
            <div className="flex justify-end">
              <button type="submit" className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                Submit Time Adjustment
              </button>
            </div>
          </form>
        );
      case 'schedule':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl text-green-500 font-semibold mb-4">Schedule Change Request</h2>
            <div className="space-y-4">
              <InputField
                type="date"
                name="scheduleDate"
                value={formData.scheduleDate}
                onChange={handleInputChange}
              />
              <select
                name="schedule"
                value={formData.schedule}
                onChange={handleInputChange}
                className="w-full bg-[#2b2b2b] text-white p-2 rounded focus:border-none focus:outline focus:outline-green-400"
              >
                <option value="">Select Schedule</option>
                <option value="9AM-6PM">9AM-6PM</option>
                <option value="10AM-7PM">10AM-7PM</option>
              </select>
            </div>
            <textarea
              name="scheduleReason"
              placeholder="Reason for schedule change..."
              value={formData.scheduleReason}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded h-32 focus:border-none focus:outline focus:outline-green-400"
            />
            <div className="flex justify-end">
              <button type="submit" className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                Submit Schedule Change
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#2b2b2b] rounded-lg shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Add Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6">
            {[
              { id: 'overtime', icon: Clock, label: 'Overtime' },
              { id: 'leave', icon: Calendar, label: 'Leave' },
              { id: 'timeadjustment', icon: Clock, label: 'Time Adjustment' },
              { id: 'schedule', icon: UserCheck, label: 'Schedule Change' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveRequest(id)}
                className={`p-3 sm:p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${activeRequest === id ? 'bg-green-600' : 'bg-[#363636] hover:bg-[#404040]'}`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <span className="text-white text-xs sm:text-sm">{label}</span>
              </button>
            ))}
          </div>

          <div className="bg-[#363636] rounded-lg p-4 sm:p-6">
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddReq;
