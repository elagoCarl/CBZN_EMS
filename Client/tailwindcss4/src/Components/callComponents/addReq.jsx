import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, UserCheck, X } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const AddReq = ({ isOpen, onClose, onRequestAdded }) => {
  const [activeRequest, setActiveRequest] = useState(null);
  const profileRef = useRef(null);
  const [formData, setFormData] = useState({
    // Overtime fields
    overtimeDate: '',         // Date-only (YYYY-MM-DD)
    overtimeStart: '',        // Datetime-local (date and time)
    overtimeEnd: '',          // Datetime-local (date and time)
    overtimeReason: '',
    // Leave fields
    leaveStartDate: '',
    leaveEndDate: '',
    leaveType: '',
    leaveReason: '',
    // Time Adjustment fields
    timeAdjustDate: '',       // Date-only (YYYY-MM-DD)
    timeAdjustFrom: '',       // Datetime-local (date and time)
    timeAdjustTo: '',         // Datetime-local (date and time)
    timeAdjustReason: '',
    // Schedule Change fields
    scheduleDate: '',
    scheduleTimeIn: '',    // Add this instead of schedule
    scheduleTimeOut: '',   // Add this  
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
      overtimeStart: '',
      overtimeEnd: '',
      overtimeReason: '',
      leaveStartDate: '',
      leaveEndDate: '',
      leaveType: '',
      leaveReason: '',
      timeAdjustDate: '',
      timeAdjustFrom: '',
      timeAdjustTo: '',
      timeAdjustReason: '',
      scheduleDate: '',
      scheduleTimeIn: '',    // Add this instead of schedule
      scheduleTimeOut: '',   // Add this
      scheduleReason: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeRequest === 'schedule') {
      // Schedule Change Request
      const { scheduleDate, scheduleTimeIn, scheduleTimeOut, scheduleReason } = formData;
      
      // Validate inputs
      if (!scheduleDate || !scheduleTimeIn || !scheduleTimeOut || !scheduleReason) {
        toast.error("All fields are required");
        return;
      }
      
      try {
        const response = await axios.post('http://localhost:8080/schedAdjustment/addSchedAdjustment', {
          user_id: 1, // Replace with actual user id
          date: scheduleDate,
          time_in: scheduleTimeIn,
          time_out: scheduleTimeOut,
          reason: scheduleReason,
        });
        toast.success(response.data.message || "Schedule change request submitted successfully.");
        if (onRequestAdded) onRequestAdded(response.data);
        resetForm();
        setActiveRequest(null);
        onClose();
      } catch (error) {
        console.error("Error submitting schedule change request:", error);
        toast.error(error.response?.data?.message || "An error occurred while submitting the schedule change request.");
      }
    } else if (activeRequest === 'timeadjustment') {
      // Time Adjustment Request with separate date and datetime fields
      const { timeAdjustDate, timeAdjustFrom, timeAdjustTo, timeAdjustReason } = formData;

      // Ensure all mandatory fields are provided
      if (!timeAdjustDate || !timeAdjustFrom || !timeAdjustTo || !timeAdjustReason) {
        toast.error("All fields (date, start datetime, end datetime, and reason) are required.");
        return;
      }

      // Split the datetime-local strings into date and time parts
      const [fromDate, fromTime] = timeAdjustFrom.split('T');
      const [toDate, toTime] = timeAdjustTo.split('T');

      // Validate that both datetime inputs match the selected adjustment date
      if (fromDate !== timeAdjustDate || toDate !== timeAdjustDate) {
        toast.error("Start and end datetime must match the selected adjustment date.");
        return;
      }

      // Replace the existing time adjustment submission code with this:
try {
  const response = await axios.post('http://localhost:8080/timeAdjustment/addTimeAdjustment', {
    user_id: 1,               // Replace with actual user id
    date: timeAdjustDate,     // e.g., "2025-03-03"
    from_datetime: timeAdjustFrom, // Send the full datetime string e.g., "2025-03-03T08:00"
    to_datetime: timeAdjustTo,     // Send the full datetime string e.g., "2025-03-03T17:00"
    reason: timeAdjustReason, // Reason must be non-empty
  });
  // setBackendMessage(response.data.message || "Time adjustment request submitted successfully.");
  if (onRequestAdded) onRequestAdded(response.data);
  resetForm();
  setActiveRequest(null);
  onClose();
} catch (error) {
  console.error("Error submitting time adjustment request:", error);
  // setBackendMessage(error.response?.data?.message || "An unexpected error occurred");
}
    } else if (activeRequest === 'leave') {
      // Leave Request
      const { leaveStartDate, leaveEndDate, leaveType, leaveReason } = formData;
      try {
        const response = await axios.post('http://localhost:8080/leaveRequest/addLeaveRequest', {
          user_id: 1, // Replace with actual user id
          type: leaveType,
          start_date: leaveStartDate,
          end_date: leaveEndDate,
          reason: leaveReason,
        });
        toast.success(response.data.message || "Leave request submitted successfully.");
        if (onRequestAdded) onRequestAdded(response.data);
        resetForm();
        setActiveRequest(null);
        onClose();
      } catch (error) {
        console.error("Error submitting leave request:", error);
        toast.error(error.response?.data?.message || "An error occurred while submitting the leave request.");
      }
    } else if (activeRequest === 'overtime') {
      // Overtime Request with separate date and datetime fields
      const { overtimeDate, overtimeStart, overtimeEnd, overtimeReason } = formData;
      if (!overtimeDate || !overtimeStart || !overtimeEnd) {
        toast.error("All fields (date, start, and end datetime) are required.");
        return;
      }
      const [startDate, startTime] = overtimeStart.split('T');
      const [endDate, endTime] = overtimeEnd.split('T');
      if (startDate !== overtimeDate || endDate !== overtimeDate) {
        toast.error("Start and end datetime must match the selected overtime date.");
        return;
      }
      try {
        const response = await axios.post('http://localhost:8080/OTrequests/addOvertimeReq', {
          user_id: 1, // Replace with actual user id
          date: overtimeDate,    // 'YYYY-MM-DD'
          start_time: startTime,   // 'HH:mm'
          end_time: endTime,       // 'HH:mm'
          reason: overtimeReason,
        });
        toast.success(response.data.message || "Overtime request submitted successfully.");
        if (onRequestAdded) onRequestAdded(response.data);
        resetForm();
        setActiveRequest(null);
        onClose();
      } catch (error) {
        console.error("Error submitting overtime request:", error);
        toast.error(error.response?.data?.message || "An error occurred while submitting the overtime request.");
      }
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
            {/* Overtime Date */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-300">Overtime Date</label>
              <InputField
                type="date"
                name="overtimeDate"
                value={formData.overtimeDate}
                onChange={handleInputChange}
              />
            </div>
            {/* Overtime Start Date & Time */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-300">Start Date & Time</label>
              <InputField
                type="datetime-local"
                name="overtimeStart"
                value={formData.overtimeStart}
                onChange={handleInputChange}
              />
            </div>
            {/* Overtime End Date & Time */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-300">End Date & Time</label>
              <InputField
                type="datetime-local"
                name="overtimeEnd"
                value={formData.overtimeEnd}
                onChange={handleInputChange}
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
            {/* Time Adjustment Date */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-300">Adjustment Date</label>
              <InputField
                type="date"
                name="timeAdjustDate"
                value={formData.timeAdjustDate}
                onChange={handleInputChange}
              />
            </div>
            {/* Original Date & Time */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-300">Original Date & Time</label>
              <InputField
                type="datetime-local"
                name="timeAdjustFrom"
                value={formData.timeAdjustFrom}
                onChange={handleInputChange}
              />
            </div>
            {/* Adjusted Date & Time */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-300">Adjusted Date & Time</label>
              <InputField
                type="datetime-local"
                name="timeAdjustTo"
                value={formData.timeAdjustTo}
                onChange={handleInputChange}
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
                <div className="space-y-2">
                  <label className="block text-sm text-gray-300">Date</label>
                  <InputField
                    type="date"
                    name="scheduleDate"
                    value={formData.scheduleDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-gray-300">Time In</label>
                  <InputField
                    type="time"
                    name="scheduleTimeIn"
                    value={formData.scheduleTimeIn}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-gray-300">Time Out</label>
                  <InputField
                    type="time"
                    name="scheduleTimeOut"
                    value={formData.scheduleTimeOut}
                    onChange={handleInputChange}
                  />
                </div>
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
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default AddReq;
