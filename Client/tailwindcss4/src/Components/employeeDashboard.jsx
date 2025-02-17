import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../Components/Img/CBZN-Logo.png';

const EmployeeDashboard = () => {
  // State for managing the current time (updates every second)
  const [currentTime, setCurrentTime] = useState(new Date());

  // State for tracking navigation menu visibility (mobile toggle)
  const [isNavOpen, setIsNavOpen] = useState(false);
  // State for pagination (current page of attendance records)
  const [currentPage, setCurrentPage] = useState(1);

  // State for tracking window width (used for responsive design)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  
  // Function to update the current page for pagination
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Adjust the number of records per page based on screen size
  const recordsPerPage = windowWidth < 768 ? 12 : 12;

  // Effect to update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Effect to update the current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      const handleClickOutside = (event) => {
        if (profileRef.current && !profileRef.current.contains(event.target)) {
          setIsProfileOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isProfileOpen]);
  

  // Function to format time for display (12-hour format with AM/PM)
  const formatTime = (date) => {
    const timeString = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const [time, period] = timeString.split(' ');
    return (
      <span className="text-white bg-black/40 rounded-xl px-4 sm:px-5 flex flex-1 items-center justify-center">
        {time} <span className="text-green-500 ml-2">{period}</span>
      </span>
    );
  };

   // Attendance dummy records with dates and timestamps
  const attendanceRecords = [
    { date: '02/12/2024', status: 'Present', timestamp: '08:15 AM' },
    { date: '02/13/2024', status: 'Absent', timestamp: '--' },
    { date: '02/14/2024', status: 'Present', timestamp: '08:05 AM' },
    { date: '02/15/2024', status: 'Present', timestamp: '08:10 AM' },
    { date: '02/16/2024', status: 'Present', timestamp: '08:00 AM' },
    { date: '02/17/2024', status: 'Absent', timestamp: '--' },
    { date: '02/18/2024', status: 'Present', timestamp: '08:20 AM' },
    { date: '02/19/2024', status: 'Present', timestamp: '08:15 AM' },
    { date: '02/20/2024', status: 'Absent', timestamp: '--' },
    { date: '02/21/2024', status: 'Present', timestamp: '08:05 AM' },
    { date: '02/22/2024', status: 'Present', timestamp: '08:10 AM' },
    { date: '02/23/2024', status: 'Present', timestamp: '08:00 AM' },
    { date: '02/24/2024', status: 'Absent', timestamp: '--' },
    { date: '02/25/2024', status: 'Absent', timestamp: '--' },
    { date: '02/26/2024', status: 'Present', timestamp: '08:05 AM' },
    { date: '02/27/2024', status: 'Present', timestamp: '08:10 AM' },
    { date: '02/28/2024', status: 'Present', timestamp: '08:00 AM' },
    { date: '02/29/2024', status: 'Absent', timestamp: '--' },
  ];

  // Determine the range of records to display for the current page
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = attendanceRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(attendanceRecords.length / recordsPerPage);

  {/* Mobile Navigation Toggle Button */}
  return (
    <div className="flex h-screen bg-black/90">
      <button 
        onClick={() => setIsNavOpen(!isNavOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-green-600 text-white hover:bg-green-700"
      >
        {isNavOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

       {/* Sidebar Navigation */}
      <div className={`${
        isNavOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:relative w-64 bg-black p-6 flex flex-col h-full transition-transform duration-300 ease-in-out z-40`}>
        <div className="mb-8">
          <div className="w-full text-white p-4 flex justify-center items-center">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
          </div>
        </div>
        <nav className="w-full space-y-4 text-center font-semibold md:text-xl sm:text-base items-center justify-center flex-1 flex flex-col mb-20">
          <div className="text-white hover:text-green-500 duration-300 px-4 py-2 rounded cursor-pointer">Home</div>
          <div className="text-white hover:text-green-500 duration-300 px-4 py-2 rounded cursor-pointer">Attendance</div>
          <div className="text-white hover:text-green-500 duration-300 px-4 py-2 rounded cursor-pointer">Reports</div>
        </nav>

        {/* Profile Section with Clickable Dropdown */}
        <div className="mt-auto relative" ref={profileRef}>
          <div
            className="flex items-center space-x-3 p-4 border-t border-gray-800 cursor-pointer"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="w-6 h-6 bg-gray-600 rounded-full" />
            <div>
              <div className="text-white text-xs font-medium">EMPLOYEE</div>
              <div className="text-gray-400 text-xs">Employee@CBZN@GMAIL.COM</div>
            </div>
          </div>

          {/* Pop-up Menu */}
          {isProfileOpen && (
            <div
              className="absolute right-6 bottom-full mb-2 w-40 bg-[#2b2b2b] text-white p-2 rounded-lg shadow-md duration-300"
              onClick={() => setIsProfileOpen(false)} // Close on click
            >
              <button className="w-full text-left px-3 py-2 hover:bg-red-600 rounded duration-300">
                Log Out
              </button>
            </div>
          )}
        </div>  
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 mt-40">
          <h1 className="text-xl md:text-2xl text-white sm:mb-auto md:mb-[-4rem] xl:mb-[-6rem] duration-300 transition-shadow">
            Hello, <span className="text-green-500">Employee</span>
          </h1>
          <div className="text-lg md:text-[clamp(1.5rem,4vw,4rem)]">
            {formatTime(currentTime)}
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-[#363636] rounded-lg overflow-hidden flex flex-col w-full">
          <div className="overflow-x-auto">
            <div className="overflow-y-auto max-h-[calc(100vh-500px)] md:max-h-[calc(100vh-400px)]">
              <table className="w-full text-white">
                <thead className="sticky top-0 bg-[#2b2b2b] z-10">
                  <tr>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-sm md:text-base">Date</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-sm md:text-base">Status</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-sm md:text-base">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-[#404040]">
                      <td className="py-2 md:py-3 px-2 md:px-4 text-sm md:text-base">{record.date}</td>
                      <td className={`py-2 md:py-3 px-2 md:px-4 text-sm md:text-base ${
                        record.status === 'Present' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {record.status}
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-sm md:text-base">{record.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="bg-[#2b2b2b] py-2 px-2 md:px-4 flex justify-center gap-1">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-2 md:px-3 py-1 rounded text-sm md:text-base ${
                  currentPage === index + 1 ? 'bg-green-500 hover:bg-green-700 duration-300 text-white' : 'bg-black/80 hover:bg-black/40 text-gray-300 duration-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Time-In/Time-Out Buttons */}
        <div className="flex justify-end mt-2 gap-2">
          <button className="bg-green-600 text-white px-4 md:px-8 py-1 md:py-2 rounded text-sm md:text-base hover:bg-green-700 duration-300">
            TIME-IN
          </button>
          <button className="bg-black/90 text-white px-4 md:px-8 py-1 md:py-2 rounded text-sm md:text-base hover:bg-black/40 duration-300">
            TIME-OUT
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isNavOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsNavOpen(false)}
        />
      )}
    </div>
  );
};

export default EmployeeDashboard;