import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, UserCheck, Menu, X } from 'lucide-react';
import logo from '../Img/CBZN-Logo.png';

export const Req = () => {
  const [activeRequest, setActiveRequest] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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

  // Close profile dropdown when clicking outside
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

  const renderForm = () => {
    switch (activeRequest) {
      case 'overtime':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl text-green-500 font-semibold mb-4">Overtime Request</h2>
            <input
              type="date"
              name="overtimeDate"
              value={formData.overtimeDate}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded focus:border-none focus:outline focus:outline-green-400"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="time"
                name="overtimeStart"
                value={formData.overtimeStart}
                onChange={handleInputChange}
                className="w-full bg-[#2b2b2b] text-white p-2 rounded focus:border-none focus:outline focus:outline-green-400"
                placeholder="Start Time"
              />
              <input
                type="time"
                name="overtimeEnd"
                value={formData.overtimeEnd}
                onChange={handleInputChange}
                className="w-full bg-[#2b2b2b] text-white p-2 rounded focus:border-none focus:outline focus:outline-green-400"
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
            <div className='flex justify-end'>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Submit Overtime Request
              </button>
            </div>
          </form>
        );

      case 'leave':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl text-green-500 font-semibold mb-4">Leave Request</h2>
            <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              name="leavStartDate"
              value={formData.leaveStartDate}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded focus:border-none focus:outline focus:outline-green-400"
            />
            <input
              type="date"
              name="leaveEndDate"
              value={formData.leaveEndDate}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded focus:border-none focus:outline focus:outline-green-400"
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
            <div className='flex justify-end'>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Submit Leave Request
              </button>
            </div>

          </form>
        );

      case 'timeadjustment':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl text-green-500 font-semibold mb-4">Time Adjustment Request</h2>
            <input
              type="date"
              name="timeAdjustDate"
              value={formData.timeAdjustDate}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded focus:border-none focus:outline focus:outline-green-400"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="time"
                name="timeAdjustFrom"
                value={formData.timeAdjustFrom}
                onChange={handleInputChange}
                className="w-full bg-[#2b2b2b] text-white p-2 rounded focus:border-none focus:outline focus:outline-green-400"
                placeholder="Original Time"
              />
              <input
                type="time"
                name="timeAdjustTo"
                value={formData.timeAdjustTo}
                onChange={handleInputChange}
                className="w-full bg-[#2b2b2b] text-white p-2 rounded focus:border-none focus:outline focus:outline-green-400"
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
            <div className='flex justify-end'>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Submit Time Adjustment
              </button>
            </div>
          </form>
        );

      case 'schedule':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl text-green-500 font-semibold mb-4">Schedule Change Request</h2>
            <input
              type="date"
              name="scheduleDate"
              value={formData.scheduleDate}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded focus:border-none focus:outline focus:outline-green-400"
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
            <textarea
              name="scheduleReason"
              placeholder="Reason for schedule change..."
              value={formData.scheduleReason}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded h-32 focus:border-none focus:outline focus:outline-green-400"
            />
            <div className='flex justify-end'>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
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
    <div className="min-h-screen bg-black/90 flex">

      {/* Main Content */}
      <div className="flex flex-col justify-center items-center flex-1">
        <div className="flex flex-col justify-center px-4 w-full md:w-3/4 lg:w-1/2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <button
              onClick={() => setActiveRequest('overtime')}
              className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${activeRequest === 'overtime' ? 'bg-green-600' : 'bg-[#363636] hover:bg-[#404040]'
                }`}
            >
              <Clock className="w-6 h-6 text-white" />
              <span className="text-white text-sm">Overtime</span>
            </button>

            <button
              onClick={() => setActiveRequest('leave')}
              className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${activeRequest === 'leave' ? 'bg-green-600' : 'bg-[#363636] hover:bg-[#404040]'
                }`}
            >
              <Calendar className="w-6 h-6 text-white" />
              <span className="text-white text-sm">Leave</span>
            </button>

            <button
              onClick={() => setActiveRequest('timeadjustment')}
              className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${activeRequest === 'timeadjustment' ? 'bg-green-600' : 'bg-[#363636] hover:bg-[#404040]'
                }`}
            >
              <Clock className="w-6 h-6 text-white" />
              <span className="text-white text-sm">Time Adjustment</span>
            </button>

            <button
              onClick={() => setActiveRequest('schedule')}
              className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${activeRequest === 'schedule' ? 'bg-green-600' : 'bg-[#363636] hover:bg-[#404040]'
                }`}
            >
              <UserCheck className="w-6 h-6 text-white" />
              <span className="text-white text-sm">Schedule Change</span>
            </button>
          </div>

          <div className="bg-[#363636] rounded-lg p-4">
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Req;