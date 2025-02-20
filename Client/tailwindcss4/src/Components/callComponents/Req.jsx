import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, UserCheck, Menu } from 'lucide-react';
import logo from '../Img/CBZN-Logo.png';

export const Req = () => {
  const [activeRequest, setActiveRequest] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef(null); 
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

   // Close menu when clicking outside
   useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when screen expands
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="flex min-h-screen bg-black/90">
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 text-white p-2 rounded-lg bg-green-600"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar - Hidden on mobile by default */}
      <div className={`w-64 bg-black p-6 flex flex-col h-screen fixed transition-transform duration-300 ease-in-out items-center justify-center ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="mb-8">
          <div className="w-full text-white p-4 flex justify-center items-center">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
          </div>
        </div>
        
        <nav className="space-y-4">
          <div className="text-white hover:text-green-500 duration-300 px-4 py-2 rounded cursor-pointer text-center">
            Home
          </div>
          <div className="text-white hover:text-green-500 duration-300 px-4 py-2 rounded cursor-pointer text-center">
            Attendance
          </div>
          <div className="text-white hover:text-green-500 duration-300 px-4 py-2 rounded cursor-pointer text-center">
            Reports
          </div>
        </nav>

        {/* Profile Section */}
        <div className="mt-auto relative" ref={profileRef}>
          <div
            className="flex items-center space-x-3 p-4 border-t border-gray-800 cursor-pointer"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="w-8 h-8 bg-gray-600 rounded-full" />
            <div>
              <div className="text-white text-sm font-medium">EMPLOYEE</div>
              <div className="text-gray-400 text-xs">Employee@CBZN@GMAIL.COM</div>
            </div>
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 bottom-full mb-2 w-48 bg-[#2b2b2b] text-white rounded-lg shadow-lg overflow-hidden">
              <button 
                className="w-full text-left px-4 py-3 hover:bg-red-600 transition-colors duration-200"
                onClick={() => {
                  console.log('Logging out...');
                  setIsProfileOpen(false);
                }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area - Responsive margin */}
      <div className="w-full lg:ml-64 p-6 transition-all duration-300">
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