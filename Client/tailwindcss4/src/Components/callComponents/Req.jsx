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
    leaveDate: '',
    leaveType: '',
    leaveReason: '',
    timeAdjustDate: '',
    timeAdjustFrom: '',
    timeAdjustTo: '',
    timeAdjustReason: '',
    scheduleDate: '',
    scheduleTime: '',
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
      leaveDate: '',
      leaveType: '',
      leaveReason: '',
      timeAdjustDate: '',
      timeAdjustFrom: '',
      timeAdjustTo: '',
      timeAdjustReason: '',
      scheduleDate: '',
      scheduleTime: '',
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
              className="w-full bg-[#2b2b2b] text-white p-2 rounded"
            />
            <textarea
              name="overtimeReason"
              placeholder="Reason for overtime..."
              value={formData.overtimeReason}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded h-32"
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Submit Overtime Request
            </button>
          </form>
        );

      case 'leave':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl text-green-500 font-semibold mb-4">Leave Request</h2>
            <input
              type="date"
              name="leaveDate"
              value={formData.leaveDate}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded"
            />
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded"
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
              className="w-full bg-[#2b2b2b] text-white p-2 rounded h-32"
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Submit Leave Request
            </button>
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
              className="w-full bg-[#2b2b2b] text-white p-2 rounded"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="time"
                name="timeAdjustFrom"
                value={formData.timeAdjustFrom}
                onChange={handleInputChange}
                className="w-full bg-[#2b2b2b] text-white p-2 rounded"
                placeholder="Original Time"
              />
              <input
                type="time"
                name="timeAdjustTo"
                value={formData.timeAdjustTo}
                onChange={handleInputChange}
                className="w-full bg-[#2b2b2b] text-white p-2 rounded"
                placeholder="Adjusted Time"
              />
            </div>
            <textarea
              name="timeAdjustReason"
              placeholder="Reason for time adjustment..."
              value={formData.timeAdjustReason}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded h-32"
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Submit Time Adjustment
            </button>
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
              className="w-full bg-[#2b2b2b] text-white p-2 rounded"
            />
            <input
              type="time"
              name="scheduleTime"
              value={formData.scheduleTime}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded"
            />
            <textarea
              name="scheduleReason"
              placeholder="Reason for schedule change..."
              value={formData.scheduleReason}
              onChange={handleInputChange}
              className="w-full bg-[#2b2b2b] text-white p-2 rounded h-32"
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Submit Schedule Change
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black/90 flex">
      {/* Mobile Nav Toggle */}
      <button 
        onClick={() => setIsNavOpen(!isNavOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-green-600 text-white hover:bg-green-700"
      >
        {isNavOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`${
        isNavOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:relative w-64 bg-[#000000] flex flex-col min-h-screen transition-transform duration-300 ease-in-out z-40`}>
        {/* Logo Section */}
        <div className="p-6">
          <div className="w-full flex justify-center items-center">
            <img src={logo} alt="Logo" className="h-12 w-auto" />
          </div>
        </div>

        {/* Navigation Links - Centered */}
        <nav className="flex-1 flex flex-col justify-center px-4">
          <div className="space-y-8 text-xl cursor-pointer font-semibold">
            <div className="flex justify-center">
              <a href="#" className="text-white hover:text-green-600 duration-300">Home</a>
            </div>
            <div className="flex justify-center">
              <a href="#" className="text-white hover:text-green-600 duration-300">Attendance</a>
            </div>
            <div className="flex justify-center">
              <a href="#" className="text-white hover:text-green-600 duration-300">Manage Users</a>
            </div>
            <div className="flex justify-center">
              <a href="#" className="text-white hover:text-green-600 duration-300">Reports</a>
            </div>
            <div className="flex justify-center">
              <a href="#" className="text-white hover:text-green-600 duration-300">Settings</a>
            </div>
            <div className="flex justify-center">
              <a href="#" className="text-white hover:text-green-600 duration-300">Help</a>
            </div>
          </div>
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-[#363636]" ref={profileRef}>
          <div 
            className="flex items-center gap-2 text-sm cursor-pointer"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="w-8 h-8 bg-[#363636] rounded-full flex items-center justify-center text-white">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-white">ADMIN</span>
              <span className="text-gray-400 text-xs">ADMIN@CBZN@GMAIL.COM</span>
            </div>
          </div>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div
              className="absolute right-6 bottom-full mb-2 w-40 bg-[#2b2b2b] text-white p-2 rounded-lg shadow-md duration-300"
              onClick={() => setIsProfileOpen(false)}
            >
              <button className="w-full text-left px-3 py-2 hover:bg-red-600 rounded duration-300">
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <button
              onClick={() => setActiveRequest('overtime')}
              className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
                activeRequest === 'overtime' ? 'bg-green-600' : 'bg-[#363636] hover:bg-[#404040]'
              }`}
            >
              <Clock className="w-6 h-6 text-white" />
              <span className="text-white text-sm">Overtime</span>
            </button>
            
            <button
              onClick={() => setActiveRequest('leave')}
              className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
                activeRequest === 'leave' ? 'bg-green-600' : 'bg-[#363636] hover:bg-[#404040]'
              }`}
            >
              <Calendar className="w-6 h-6 text-white" />
              <span className="text-white text-sm">Leave</span>
            </button>

            <button
              onClick={() => setActiveRequest('timeadjustment')}
              className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
                activeRequest === 'timeadjustment' ? 'bg-green-600' : 'bg-[#363636] hover:bg-[#404040]'
              }`}
            >
              <Clock className="w-6 h-6 text-white" />
              <span className="text-white text-sm">Time Adjustment</span>
            </button>

            <button
              onClick={() => setActiveRequest('schedule')}
              className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
                activeRequest === 'schedule' ? 'bg-green-600' : 'bg-[#363636] hover:bg-[#404040]'
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