import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "../axiosConfig.js";
import Sidebar from "./callComponents/sidebar.jsx";
import dayjs from "dayjs";
import { useAuth } from '../Components/authContext.jsx';
import AttendanceCalendar from "../Components/callComponents/attendanceCalendar.jsx";
import { Calendar, TableProperties, Menu } from "lucide-react";

// Enhanced responsive components
const StatsCard = ({ title, value, color}) => (
  <div className="bg-[#1a1a1a] p-3 rounded-md transform hover:scale-105 transition-transform duration-200">
    <div className="text-xs md:text-sm text-gray-400">{title}</div>
    <div className={`text-lg sm:text-xl md:text-2xl text-${color}-400 font-bold`}>{value}</div>
  </div>
);

const TimeDisplay = ({ currentTime, formatDate, formatTime }) => (
  <div className="flex flex-col items-center">
    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
      {formatDate(currentTime)}
    </div>
    <div className="text-base sm:text-lg md:text-xl lg:text-2xl">
      {formatTime(currentTime)}
    </div>
  </div>
);

// Enhanced mobile navigation component
const MobileNav = ({ showSidebar, setShowSidebar }) => (
  <div className="lg:hidden fixed top-0 left-0 right-0 bg-black/90 p-2 z-20 flex justify-between items-center">
    <button 
      onClick={() => setShowSidebar(prev => !prev)} 
      className="text-white focus:outline-none p-2"
    >
      <Menu size={24} />
    </button>
    <h1 className="text-white text-lg font-semibold">Attendance</h1>
    <div className="w-8"></div> {/* Spacer for balance */}
  </div>
);

// Shimmer loading component for better UX
const ShimmerLoader = () => (
  <div className="animate-pulse space-y-4 w-full">
    <div className="h-10 bg-gray-700 rounded w-3/4"></div>
    <div className="h-20 bg-gray-700 rounded"></div>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-700 rounded"></div>
      ))}
    </div>
    <div className="h-60 bg-gray-700 rounded"></div>
  </div>
);

// Custom hook for window size with debounce for performance
const useWindowSize = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    let timeoutId = null;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 150); // Debounce resize events
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);
  
  return windowWidth;
};

// Main component
const MyAttendance = () => {
  const { user } = useAuth();
  const userId = user.id;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const windowWidth = useWindowSize();
  const [showSidebar, setShowSidebar] = useState(false);
  
  const [userData, setUserData] = useState({
    employeeId: "",
    name: "Employee",
  });
  
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [userSchedules, setUserSchedules] = useState([]);
  const [siteSelection, setSiteSelection] = useState("Onsite");
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState(windowWidth < 768 ? "calendar" : "table"); // Default to calendar on mobile
  
  const [attendanceStats, setAttendanceStats] = useState({
    totalDays: 0,
    presentDays: 0,
    lateDays: 0,
    absentDays: 0,
    onTimeDays: 0,
    restDays: 0
  });
  
  const [cutoffs, setCutoffs] = useState([]);
  const [selectedCutoff, setSelectedCutoff] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  });

  // Memoized values to prevent recalculation on each render
  const recordsPerPage = useMemo(() => {
    if (windowWidth < 480) return 5;
    if (windowWidth < 640) return 8;
    if (windowWidth < 1024) return 10;
    return 15;
  }, [windowWidth]);

  // Memoize pagination calculations
  const paginationData = useMemo(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = attendanceRecords.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(attendanceRecords.length / recordsPerPage);
    
    return { currentRecords, totalPages, indexOfFirstRecord, indexOfLastRecord };
  }, [attendanceRecords, currentPage, recordsPerPage]);

  // Helper function to format time_out
  const formatTimeOut = useCallback((timeOutStr, recordDate) => {
    const timeOutObj = dayjs(timeOutStr, "YYYY-MM-DD HH:mm");
    if (!timeOutObj.isValid()) return "-";
    if (recordDate === timeOutObj.format("YYYY-MM-DD")) {
      return timeOutObj.format("hh:mm A");
    }
    return `${timeOutObj.format("hh:mm A")} (${timeOutObj.format("MM/DD/YYYY")})`;
  }, []);

  // Find applicable schedule for a given date
  const getScheduleForDate = useCallback((date) => {
    const dateObj = dayjs(date);
    const dayOfWeek = dateObj.format('dddd');
    
    if (!userSchedules.length) return null;
    
    // Sort schedules by effectivity date in descending order
    const sortedSchedules = [...userSchedules].sort((a, b) => 
      dayjs(b.effectivity_date).valueOf() - dayjs(a.effectivity_date).valueOf()
    );
    
    // Find the most recent schedule that is effective on or before the given date
    const applicableSchedule = sortedSchedules.find(schedule => 
      dayjs(schedule.effectivity_date).isSame(dateObj) || dayjs(schedule.effectivity_date).isBefore(dateObj)
    );
    
    if (!applicableSchedule) return null;
    
    const daySchedule = applicableSchedule.Schedule.schedule[dayOfWeek];
    if (!daySchedule) return null; // No schedule for this day (likely a rest day)
    
    return {
      scheduleTitle: applicableSchedule.Schedule.title,
      timeIn: daySchedule.In,
      timeOut: daySchedule.Out,
      isRestDay: !daySchedule.In // If no In time, it's a rest day
    };
  }, [userSchedules]);

  // Generate a list of dates between start and end dates
  const generateDateRange = useCallback((startDate, endDate) => {
    const dates = [];
    let currentDate = dayjs(startDate);
    const lastDate = dayjs(endDate);
    
    while (currentDate.isSame(lastDate) || currentDate.isBefore(lastDate)) {
      dates.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'day');
    }
    
    return dates;
  }, []);

  // Calculate attendance statistics with more accurate absence tracking
  const calculateAttendanceStats = useCallback((records, schedules) => {
    if (!records?.length || !schedules?.length) {
      return {
        totalDays: 0,
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        onTimeDays: 0,
        restDays: 0
      };
    }

    // Initialize stats object
    const stats = {
      totalDays: 0,
      presentDays: 0,
      lateDays: 0,
      absentDays: 0,
      onTimeDays: 0,
      restDays: 0
    };

    // Create a map of attendance records by date for easy lookup
    const attendanceByDate = records.reduce((acc, record) => {
      acc[record.date] = record;
      return acc;
    }, {});

    // Get all dates in the date range
    const allDates = generateDateRange(dateRange.startDate, dateRange.endDate);
    
    // For each date in range, check if user should have been present based on schedule
    allDates.forEach(date => {
      const schedule = getScheduleForDate(date);
      
      // Skip if no schedule found for this date
      if (!schedule) return;
      
      // Check if this is a workday according to schedule
      const isWorkDay = schedule.timeIn && schedule.timeOut;
      
      if (!isWorkDay) {
        // It's a rest day
        stats.restDays++;
        return;
      }
      
      // It's a work day, increment total days
      stats.totalDays++;
      
      // Check if there's an attendance record for this date
      const record = attendanceByDate[date];
      
      if (record && record.time_in !== "-") {
        // User was present
        stats.presentDays++;
        
        // Check if late
        if (record.remarks && (record.remarks.includes("Late") || record.remarks.includes("Under"))) {
          stats.lateDays++;
        }
        
        // Check if on time
        if (record.remarks === "OnTime") {
          stats.onTimeDays++;
        }
      } else {
        // User was absent on a scheduled work day
        stats.absentDays++;
      }
    });

    return stats;
  }, [dateRange.startDate, dateRange.endDate, generateDateRange, getScheduleForDate]);

  // API request handlers with error handling
  const apiRequest = useCallback(async (method, url, data = null) => {
    try {
      const config = { method, url };
      if (data) config.data = data;
      
      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error with ${method} request to ${url}:`, error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || `Error with ${method} request` 
      };
    }
  }, []);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    const result = await apiRequest('get', `/users/getUser/${userId}`);
    if (result.success && result.data.successful) {
      const user = result.data.data;
      setUserData({
        employeeId: user.employeeId || "",
        name: user.name || "Employee",
      });
    }
  }, [userId, apiRequest]);

  // Fetch cutoffs
  const fetchCutoffs = useCallback(async () => {
    const result = await apiRequest('get', '/cutoff/getAllcutoff');
    if (result.success && result.data.successful && Array.isArray(result.data.data)) {
      // Sort cutoffs by start_date in descending order (newest first)
      const sortedCutoffs = result.data.data.sort((a, b) => 
        dayjs(b.start_date).valueOf() - dayjs(a.start_date).valueOf()
      );
      setCutoffs(sortedCutoffs);
      
      // Set default selected cutoff to the most recent one
      if (sortedCutoffs.length > 0) {
        const latestCutoff = sortedCutoffs[0];
        setSelectedCutoff(latestCutoff);
        setDateRange({
          startDate: latestCutoff.start_date,
          endDate: latestCutoff.cutoff_date
        });
      }
    }
  }, [apiRequest]);

  // Fetch user schedules
  const fetchUserSchedules = useCallback(async () => {
    const result = await apiRequest('get', `/scheduser/getallSchedUserByUser/${userId}`);
    if (result.success && result.data.successful && Array.isArray(result.data.schedUser)) {
      setUserSchedules(result.data.schedUser);
    } else {
      setUserSchedules([]);
    }
  }, [userId, apiRequest]);

  // Fetch attendance records
  const fetchAttendanceRecords = useCallback(async () => {
    const result = await apiRequest('get', `/attendance/getAttendanceByUser/${userId}`);
    if (result.success && result.data.successful && Array.isArray(result.data.data)) {
      const formattedRecords = result.data.data
        .map(record => ({
          id: record.id,
          date: record.date,
          day: record.weekday,
          site: record.site || "-",
          time_in: record.time_in ? dayjs(record.time_in).format("hh:mm A") : "-",
          time_out: record.time_out ? formatTimeOut(record.time_out, record.date) : "-",
          remarks: record.remarks || "-",
          isRestDay: record.isRestDay ? "Rest Day" : "Work"
        }))
        .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()); // Descending order

      setAttendanceRecords(formattedRecords);
    } else {
      setAttendanceRecords([]);
      setAttendanceStats({
        totalDays: 0,
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        onTimeDays: 0,
        restDays: 0
      });
    }
    setIsLoading(false);
  }, [userId, apiRequest, formatTimeOut]);

  // Handle Time-In with updated API endpoint
  const handleTimeIn = useCallback(async () => {
    setIsLoading(true);
    setAttendanceStatus("");

    const result = await apiRequest('post', `/attendance/addAttendance/${userId}`, {
      site: siteSelection
    });

    if (result.success && result.data.successful) {
      setAttendanceStatus(result.data.message || "Time-in recorded successfully.");
      fetchAttendanceRecords();
    } else {
      setAttendanceStatus(result.error || "Error recording time-in.");
      setIsLoading(false);
    }

    // Auto clear status after timeout
    setTimeout(() => setAttendanceStatus(""), 3000);
  }, [userId, siteSelection, apiRequest, fetchAttendanceRecords]);

  // Handle Time-Out with updated API endpoint
  const handleTimeOut = useCallback(async () => {
    setIsLoading(true);
    setAttendanceStatus("");

    const result = await apiRequest('put', `/attendance/updateAttendance/${userId}`);

    if (result.success && result.data.successful) {
      setAttendanceStatus("Time-out recorded successfully.");
      fetchAttendanceRecords();
    } else {
      setAttendanceStatus(result.error || "Error recording time-out.");
      setIsLoading(false);
    }

    // Auto clear status after timeout
    setTimeout(() => setAttendanceStatus(""), 3000);
  }, [userId, apiRequest, fetchAttendanceRecords]);

  // Handle cutoff selection
  const handleCutoffChange = useCallback((cutoffId) => {
    const selectedCutoffObj = cutoffs.find(cutoff => cutoff.id === parseInt(cutoffId));
    if (selectedCutoffObj) {
      setSelectedCutoff(selectedCutoffObj);
      setDateRange({
        startDate: selectedCutoffObj.start_date,
        endDate: selectedCutoffObj.cutoff_date
      });
    }
  }, [cutoffs]);

  const paginate = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the table on pagination
    if (windowWidth < 640) {
      const tableElement = document.getElementById('mobile-table');
      if (tableElement) {
        tableElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [windowWidth]);

  // Toggle view mode between table and calendar
  const toggleViewMode = useCallback(() => {
    setViewMode(prevMode => prevMode === "table" ? "calendar" : "table");
  }, []);

  // Formatting helpers for date and time
  const formatDate = useCallback((date) => {
    const parts = date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).split("/");
    return (
      <div className="text-center text-base sm:text-lg">
        {parts[0]}
        <span className="text-green-500">/</span>
        {parts[1]}
        <span className="text-green-500">/</span>
        {parts[2]}
      </div>
    );
  }, []);

  const formatTime = useCallback((date) => {
    const timeString = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const [time, period] = timeString.split(" ");
    return (
      <span className="text-white bg-black/40 rounded-xl px-2 sm:px-4 py-1 flex items-center justify-center text-sm sm:text-base">
        {time} <span className="text-green-500 ml-1 sm:ml-2">{period}</span>
      </span>
    );
  }, []);

  // Effect to update stats when dependencies change
  useEffect(() => {
    if (userSchedules.length > 0 && attendanceRecords.length > 0) {
      const stats = calculateAttendanceStats(attendanceRecords, userSchedules);
      setAttendanceStats(stats);
    }
  }, [userSchedules, attendanceRecords, dateRange, calculateAttendanceStats]);

  // Initial data fetching
  useEffect(() => {
    // Using Promise.all to fetch data in parallel
    const fetchInitialData = async () => {
      await Promise.all([
        fetchUserData(),
        fetchUserSchedules(),
        fetchCutoffs(),
        fetchAttendanceRecords()
      ]);
    };
    
    fetchInitialData();
    
    // Set up polling interval for automatic refreshes
    const dataInterval = setInterval(() => {
      fetchUserData();
      fetchAttendanceRecords();
    }, 60000); // Poll every minute
    
    return () => clearInterval(dataInterval);
  }, [fetchUserData, fetchUserSchedules, fetchCutoffs, fetchAttendanceRecords]);

  // Effect to handle auto-refreshing page title with attendance status
  useEffect(() => {
    if (attendanceStatus) {
      document.title = attendanceStatus;
      
      const timeoutId = setTimeout(() => {
        document.title = "Attendance Dashboard";
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [attendanceStatus]);

  // Timer for current time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Effect to handle responsive view mode
  useEffect(() => {
    // Auto-switch to calendar view on small screens, table view on larger screens
    if (windowWidth < 768 && viewMode === 'table') {
      setViewMode('calendar');
    }
  }, [windowWidth, viewMode]);

  // Effect to close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSidebar && windowWidth < 1024) {
        // Check if click is outside the sidebar
        const sidebar = document.getElementById('mobile-sidebar');
        if (sidebar && !sidebar.contains(event.target)) {
          setShowSidebar(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSidebar, windowWidth]);

  // Create a responsive table for small screens
  const renderMobileTable = useCallback(() => {
    const { currentRecords } = paginationData;
    
    return (
      <div id="mobile-table" className="grid grid-cols-1 gap-4 mt-4">
        {currentRecords.length > 0 ? (
          currentRecords.map((record, index) => {
            // Get schedule details for this date
            const scheduleDetails = getScheduleForDate(record.date);
            const scheduledTimeIn = scheduleDetails?.timeIn || "-";
            const scheduledTimeOut = scheduleDetails?.timeOut || "-";
            
            return (
              <div 
                key={index} 
                className="bg-[#404040] p-3 rounded-lg shadow-md transform transition-transform duration-200 hover:scale-102 hover:shadow-lg"
              >
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-bold text-white">Date:</div>
                  <div className="text-white">{record.date}</div>

                  <div className="font-bold text-white">Day:</div>
                  <div className="text-white">{record.day}</div>

                  <div className="font-bold text-white">Site:</div>
                  <div className="text-white">{record.site}</div>

                  <div className="font-bold text-white">Scheduled In:</div>
                  <div className="text-white">{scheduledTimeIn}</div>

                  <div className="font-bold text-white">Scheduled Out:</div>
                  <div className="text-white">{scheduledTimeOut}</div>

                  <div className="font-bold text-white">Time-in:</div>
                  <div className="text-white">{record.time_in}</div>

                  <div className="font-bold text-white">Time-out:</div>
                  <div className="text-white">{record.time_out}</div>

                  <div className="font-bold text-white">Remarks:</div>
                  <div className={`${(record.remarks.includes("Under") || record.remarks.includes("Late"))
                    ? "text-red-500"
                    : record.remarks === "OnTime"
                      ? "text-green-500"
                      : "text-gray-400"
                    }`}>
                    {record.remarks}
                  </div>

                  <div className="font-bold text-white">Status:</div>
                  <div className={`${record.isRestDay === "Rest Day" ? "text-red-500" : "text-green-500"}`}>
                    {record.isRestDay}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-gray-400 bg-[#2b2b2b] rounded-lg">
            <div className="text-lg mb-2">No attendance records found</div>
            <div className="text-sm">Records will appear here once you start tracking attendance</div>
          </div>
        )}
      </div>
    );
  }, [paginationData, getScheduleForDate]);

  // Render the summary section with cutoff dropdown
  const renderSummarySection = useCallback(() => {
    return (
      <div className="bg-[#2b2b2b] p-4 mt-4 rounded-lg border-t border-black/90 shadow-md transition-all duration-300 hover:shadow-lg">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-2">
          <h3 className="text-white font-semibold text-base md:text-lg">Monthly Summary</h3>
          <div className="flex items-center gap-2">
            <label className="text-white text-xs md:text-sm whitespace-nowrap">Pay Period:</label>
            <select
              value={selectedCutoff ? selectedCutoff.id : ""}
              onChange={(e) => handleCutoffChange(e.target.value)}
              className="bg-[#1a1a1a] text-white text-xs md:text-sm p-1 md:p-2 rounded flex-grow md:flex-grow-0 max-w-full"
            >
              {cutoffs.map(cutoff => (
                <option key={cutoff.id} value={cutoff.id}>
                  {dayjs(cutoff.start_date).format('MMM DD')} - {dayjs(cutoff.cutoff_date).format('MMM DD, YYYY')}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <StatsCard title="Total Workdays" value={attendanceStats.totalDays} color="gray"/>
          <StatsCard title="Present Days" value={attendanceStats.presentDays} color="green" />
          <StatsCard title="Late Days" value={attendanceStats.lateDays} color="red" />
          <StatsCard title="On-time Days" value={attendanceStats.onTimeDays} color="blue" />
          <StatsCard title="Absent Days" value={attendanceStats.absentDays} color="purple" />
        </div>
      </div>
    );
  }, [attendanceStats, cutoffs, selectedCutoff, handleCutoffChange]);

  // Improved pagination controls with responsive design
  const PaginationControls = useMemo(() => {
    const { totalPages } = paginationData;
    
    if (attendanceRecords.length <= recordsPerPage) return null;
    
    // Function to determine which page buttons to show
    const getPageButtons = () => {
      // For very small screens, just show current +/- 1
      if (windowWidth < 480) {
        return Array.from({ length: totalPages })
          .map((_, index) => index + 1)
          .filter(page => 
            page === currentPage || 
            page === currentPage - 1 || 
            page === currentPage + 1
          );
      }
      
      // For small to medium screens
      if (windowWidth < 768) {
        return Array.from({ length: totalPages })
          .map((_, index) => index + 1)
          .filter(page => 
            page === 1 || 
            page === totalPages || 
            (page >= currentPage - 1 && page <= currentPage + 1)
          );
      }
      
      // For larger screens, show more pages
      return Array.from({ length: totalPages })
        .map((_, index) => index + 1)
        .filter(page => 
          page === 1 || 
          page === totalPages || 
          (page >= currentPage - 2 && page <= currentPage + 2)
        );
    };
    
    const pageButtons = getPageButtons();
    
    // Add ellipsis where needed
    const paginationItems = [];
    let prevPage = 0;
    
    pageButtons.forEach(page => {
      if (page - prevPage > 1) {
        paginationItems.push('ellipsis-' + page);
      }
      paginationItems.push(page);
      prevPage = page;
    });
    
    return (
      <div className="bg-[#2b2b2b] py-2 px-4 flex justify-center items-center gap-1 flex-wrap rounded-b-lg">
        {/* Previous Page Button */}
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 py-1 rounded text-xs sm:text-sm ${
            currentPage === 1 
              ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          aria-label="Previous page"
        >
          &lt;
        </button>

        {/* Page Buttons with Ellipsis */}
        {paginationItems.map((item, index) => {
          if (typeof item === 'string' && item.startsWith('ellipsis')) {
            return (
              <span key={item} className="px-2 text-gray-500">
                ...
              </span>
            );
          }
          
          return (
            <button
              key={index}
              onClick={() => paginate(item)}
              className={`w-8 h-8 flex items-center justify-center rounded text-xs sm:text-sm transition-colors duration-200 ${
                currentPage === item 
                  ? "bg-green-500 text-white font-medium" 
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              aria-label={`Page ${item}`}
              aria-current={currentPage === item ? "page" : undefined}
            >
              {item}
            </button>
          );
        })}

        {/* Next Page Button */}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2 py-1 rounded text-xs sm:text-sm ${
            currentPage === totalPages 
              ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          aria-label="Next page"
        >
          &gt;
        </button>
        
        {/* Page info for accessibility */}
        <div className="text-xs text-gray-400 ml-2 hidden sm:block">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    );
  }, [attendanceRecords, currentPage, recordsPerPage, windowWidth, paginate, paginationData]);

  // Render the main content based on view mode and loading state
  const renderMainContent = useCallback(() => {
    if (isLoading) {
      return <ShimmerLoader />;
    }

    return viewMode === "table" ? (
      // Attendance Records Table (Desktop) / Cards (Mobile)
      <div className="bg-[#363636] rounded-lg overflow-hidden mt-4 flex flex-col w-full">
        {windowWidth >= 640 ? (
          <>
            <div className="overflow-x-auto">
              <div className="overflow-y-auto max-h-[calc(100vh-500px)] sm:max-h-[calc(100vh-550px)] md:max-h-[calc(100vh-500px)]">
                <table className="w-full text-white border-collapse">
                  <thead className="sticky top-0 bg-[#2b2b2b] z-10">
                    <tr>
                      <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Date</th>
                      <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Day</th>
                      <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Site</th>
                      <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Sched In</th>
                      <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Sched Out</th>
                      <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Time-in</th>
                      <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Time-out</th>
                      <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Remarks</th>
                      <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginationData.currentRecords.length > 0 ? (
                      paginationData.currentRecords.map((record, index) => {
                        // Get schedule details for this date
                        const scheduleDetails = getScheduleForDate(record.date);
                        const scheduledTimeIn = scheduleDetails?.timeIn || "-";
                        const scheduledTimeOut = scheduleDetails?.timeOut || "-";
                        
                        return (
                          <tr key={index} className="hover:bg-[#404040] transition-colors duration-150">
                            <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{record.date}</td>
                            <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{record.day}</td>
                            <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{record.site}</td>
                            <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{scheduledTimeIn}</td>
                            <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{scheduledTimeOut}</td>
                            <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{record.time_in}</td>
                            <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{record.time_out}</td>
                            <td className={`py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center${
                              (record.remarks.includes("Under") || record.remarks.includes("Late"))
                                ? "text-red-500"
                                : record.remarks === "OnTime"
                                  ? "text-green-500"
                                  : "text-gray-400"
                            }`}>
                              {record.remarks}
                            </td>
                            <td className={`py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center border-t border-[#444] ${
                              record.isRestDay === "Rest Day" ? "text-red-500" : "text-green-500"
                            }`}>
                              {record.isRestDay}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="9" className="py-8 text-center text-gray-400">
                          <div className="text-lg mb-2">No attendance records found</div>
                          <div className="text-sm">Records will appear here once you start tracking attendance</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          // Mobile card layout
          <div className="p-2 overflow-y-auto max-h-[calc(100vh-380px)]">
            {renderMobileTable()}
          </div>
        )}

        {/* Pagination */}
        {PaginationControls}
      </div>
    ) : (
      // Calendar View
      <div className="bg-[#363636] rounded-lg overflow-hidden mt-4 flex flex-col w-full h-[calc(100vh-350px)] lg:h-[calc(100vh-320px)]">
        <AttendanceCalendar
          attendanceRecords={attendanceRecords}
          userData={userData}
          attendanceStats={attendanceStats}
          dateRange={dateRange}
        />
      </div>
    );
  }, [
    isLoading, 
    viewMode, 
    windowWidth, 
    paginationData, 
    getScheduleForDate, 
    renderMobileTable, 
    PaginationControls, 
    attendanceRecords, 
    userData, 
    attendanceStats, 
    dateRange
  ]);

  // Enhanced floating action buttons for mobile
  const FloatingActionButtons = () => (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 md:hidden z-20">
      <button
        onClick={toggleViewMode}
        className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors"
        aria-label={viewMode === "calendar" ? "Switch to Table View" : "Switch to Calendar View"}
      >
        {viewMode === "calendar" ? <TableProperties size={20} /> : <Calendar size={20} />}
      </button>
      <div className="flex gap-2">
        <button
          onClick={handleTimeIn}
          disabled={isLoading}
          className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
        >
          IN
        </button>
        <button
          onClick={handleTimeOut}
          disabled={isLoading}
          className="bg-black/90 text-white px-4 py-2 rounded-full shadow-lg hover:bg-black/40 transition-colors disabled:opacity-50 flex items-center"
        >
          OUT
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-black/90 overflow-hidden">
      {/* Mobile Navigation */}
      <MobileNav showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      
      {/* Sidebar with mobile responsive handling */}
      <div 
        id="mobile-sidebar"
        className={`${
          showSidebar || windowWidth >= 1024 ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out fixed lg:relative lg:translate-x-0 z-30 lg:z-0 h-full`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className={`flex-1 p-2 sm:p-4 md:p-6 flex flex-col ${
        windowWidth < 1024 ? "w-full" : ""
      } ${
        windowWidth < 768 ? "mt-12" : "" // Add top margin for mobile nav
      }`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl mt-2 sm:mt-4 mb-2 sm:mb-0 font-bold text-white">
            Hello, <span className="font-normal text-green-500">{userData.name}</span>
          </h1>
          <TimeDisplay 
            currentTime={currentTime} 
            formatDate={formatDate} 
            formatTime={formatTime} 
          />
        </div>

        {/* Employee ID */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-2 sm:mt-4">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl mb-2 sm:mb-0 font-bold text-white">
            Employee ID: <span className="font-normal text-green-500">{userData.employeeId}</span>
          </h2>
        </div>

        {/* Status Message - more animated and visible */}
        {attendanceStatus && (
          <div className={`mt-2 p-2 rounded-md text-center ${
            attendanceStatus.includes("successfully")
              ? "bg-green-500/20 text-green-300 border border-green-500/30"
              : "bg-red-500/20 text-red-300 border border-red-500/30"
          } animate-pulse`}>
            {attendanceStatus}
          </div>
        )}

        {/* Attendance Buttons and Site Dropdown - Desktop version */}
        <div className="hidden md:flex flex-row justify-between gap-2 items-center mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleViewMode}
              className={`text-white text-sm cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-green-700 hover:bg-green-800"
                  : "bg-black/90 hover:bg-black/20"
              } px-3 py-2 rounded-md transition-colors duration-300 flex items-center gap-1`}
              title={viewMode === "calendar" ? "Switch to Table View" : "Switch to Calendar View"}
            >
              {viewMode === "calendar" ? (
                <TableProperties size={16} />
              ) : (
                <Calendar size={16} />
              )} 
              <span>{viewMode === "calendar" ? "Table View" : "Calendar View"}</span>
            </button>
          </div>
          <div className="flex gap-2">
          <label className="text-white text-sm">Site:</label>
            <select
              value={siteSelection}
              onChange={(e) => setSiteSelection(e.target.value)}
              className="bg-[#2b2b2b] text-white rounded px-3 py-2 text-sm border border-gray-700 focus:border-green-500 focus:outline-none"
            >
              <option value="Onsite">Onsite</option>
              <option value="Remote">Remote</option>
            </select>
            <button
              onClick={handleTimeIn}
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 flex-1 sm:flex-auto"
            >
              TIME-IN
            </button>
            <button
              onClick={handleTimeOut}
              disabled={isLoading}
              className="bg-black/90 text-white px-6 py-2 rounded-md text-sm hover:bg-black/40 disabled:opacity-50 transition-colors duration-200 flex-1 sm:flex-auto"
            >
              TIME-OUT
            </button>
          </div>
        </div>

        {/* Site Selection - Mobile version */}
        <div className="md:hidden flex items-center justify-between mt-4">
          <label className="text-white text-xs">Work Site:</label>
          <select
            value={siteSelection}
            onChange={(e) => setSiteSelection(e.target.value)}
            className="bg-[#2b2b2b] text-white rounded px-2 py-1 text-xs flex-grow ml-2 border border-gray-700"
          >
            <option value="Onsite">Onsite</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        {/* Summary Section */}
        {renderSummarySection()}

        {/* Main Content Area */}
        {renderMainContent()}
        
        {/* Floating Action Buttons for Mobile */}
        <FloatingActionButtons />
      </div>
    </div>
  );
};

export default MyAttendance;