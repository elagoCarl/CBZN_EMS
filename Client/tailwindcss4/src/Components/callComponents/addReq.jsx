import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, UserCheck } from 'lucide-react';

export const AddReq = ({ isOpen, onClose }) => {
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
        setIsProfileOpen(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Submitting ${activeRequest} request:`, formData);
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
    setActiveRequest(null);
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
        className="relative w-full max-w-3xl bg-[#292929] rounded-lg shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-gray-400 hover:text-white z-50"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

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
                className={`p-3 sm:p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
                  activeRequest === id ? 'bg-green-600' : 'bg-[#363636] hover:bg-[#404040]'
                }`}
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