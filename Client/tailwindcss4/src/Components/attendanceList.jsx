import React, { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import axios from '../axiosConfig.js';
import dayjs from 'dayjs';
import Sidebar from "./callComponents/sidebar.jsx";

const AdminAttendance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [attendances, setAttendances] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("Employee"); // Default
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:8080/attendance/getAllAttendances');

      // Ensure data is an array, then format time_in and time_out
      const formattedData = (Array.isArray(data?.data) ? data.data : []).map((item) => ({
        ...item,
        time_in: item.time_in ? formatDateTime(item.time_in) : null,
        time_out: item.time_out ? formatDateTime(item.time_out) : null,
      }));

      setAttendances(formattedData);
    } catch (error) {
      console.error('Error fetching attendances:', error);
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  function formatDateTime(isoString) {
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const amPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${amPm}`;
  }

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsSidebarOpen(width >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamically adjust entries per page based on screen size
  const getEntriesPerPage = () => {
    if (windowWidth < 640) return 5;
    if (windowWidth < 1024) return 8;
    return 10;
  };

  const entriesPerPage = getEntriesPerPage();

  // Filter attendances based on employment status, selected date, and search query
  const filteredAttendances = attendances.filter(attendance => {
    const employmentStatus = attendance.User?.employment_status;
    if (!employmentStatus || employmentStatus !== selectedFilter) return false;
    if (!attendance.date || dayjs(attendance.date).format("YYYY-MM-DD") !== selectedDate) return false;
    const searchTerm = searchQuery.toLowerCase();
    return attendance.User?.name?.toLowerCase().includes(searchTerm);
  });

  const formatDate = d => d ? dayjs(d).format('MMM D, YYYY') : 'N/A';

  // Pagination logic
  const totalPages = Math.ceil(filteredAttendances.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredAttendances.slice(indexOfFirstEntry, indexOfLastEntry);

  // Ensure current page is valid when data or entries per page changes
  useEffect(() => {
    const maxPage = Math.max(1, totalPages);
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filteredAttendances.length, entriesPerPage, currentPage, totalPages]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 justify-start p-4 md:p-8 mt-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white">
              Attendance

            </h1>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-green-500">
              List
            </h1>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 md:mb-5 font-semibold">
          <div className="flex flex-wrap gap-2">
            <select
              className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-800 duration-300 flex-grow sm:flex-grow-0"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="Employee">Employees</option>
              <option value="Intern">Interns</option>
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-800 duration-300 flex-grow sm:flex-grow-0"
            />
          </div>
          <div className="relative w-full sm:w-auto mt-2 sm:mt-0">
            <input
              type="text"
              placeholder="Search Name..."
              className="bg-black/80 text-white px-4 py-2 rounded pl-8 text-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-green-500 text-lg">Loading data...</div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredAttendances.length === 0 && (
          <div className="bg-[#363636] rounded-lg p-8 text-center">
            <p className="text-white text-lg">No attendance records found for the selected date.</p>
          </div>
        )}

        {/* Attendance Table */}
        {!loading && filteredAttendances.length > 0 && (
          <div className="bg-[#363636] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <div className="overflow-y-auto max-h-[calc(100vh-250px)] sm:max-h-[calc(100vh-300px)] md:max-h-[calc(100vh-350px)]">
                <table className="w-full table-auto">
                  <thead className="sticky top-0 bg-[#2b2b2b] z-10">
                    <tr>
                      <th className="text-[#4E9F48] py-2 md:py-3 text-center text-xs sm:text-sm md:text-base whitespace-nowrap">ID</th>
                      <th className="text-white py-2 md:py-3 text-center text-xs sm:text-sm md:text-base">Name</th>
                      <th className="text-white py-2 md:py-3 text-center text-xs sm:text-sm md:text-base">Date</th>
                      <th className="text-white py-2 md:py-3 text-center text-xs sm:text-sm md:text-base">Day</th>
                      <th className="text-white py-2 md:py-3 text-center text-xs sm:text-sm md:text-base">Site</th>
                      <th className="text-white py-2 md:py-3 text-center text-xs sm:text-sm md:text-base whitespace-nowrap">Time-in</th>
                      <th className="text-white py-2 md:py-3 text-center text-xs sm:text-sm md:text-base whitespace-nowrap">Time-out</th>
                      <th className="text-white py-2 md:py-3 text-center text-xs sm:text-sm md:text-base">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEntries.map((attendance) => (
                      <tr key={attendance.id} className="hover:bg-[#404040]">
                        <td className="text-[#4E9F48] py-2 px-1 sm:px-2 md:px-4 text-xs sm:text-sm md:text-base text-center">
                          {attendance.UserId}
                        </td>
                        <td className="text-white py-2 px-1 sm:px-2 md:px-4 text-xs sm:text-sm md:text-base text-center">
                          {attendance.User?.name || "Unknown"}
                        </td>
                        <td className="text-white py-2 px-1 sm:px-2 md:px-4 text-xs sm:text-sm md:text-base text-center">
                          {formatDate(attendance.date)}
                        </td>
                        <td className="text-white py-2 px-1 sm:px-2 md:px-4 text-xs sm:text-sm md:text-base text-center">
                          {attendance.weekday}
                        </td>
                        <td className="text-white py-2 px-1 sm:px-2 md:px-4 text-xs sm:text-sm md:text-base text-center">
                          {attendance.site || "—"}
                        </td>
                        <td className="text-white py-2 px-1 sm:px-2 md:px-4 text-xs sm:text-sm md:text-base text-center">
                          {attendance.time_in || "—"}
                        </td>
                        <td className="text-white py-2 px-1 sm:px-2 md:px-4 text-xs sm:text-sm md:text-base text-center">
                          {attendance.time_out || "—"}
                        </td>
                        <td className="text-white py-2 px-1 sm:px-2 md:px-4 text-xs sm:text-sm md:text-base text-center">
                          {attendance.isRestDay ? "Rest Day" : "Work"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination with responsive design */}
            <div className="bg-[#2b2b2b] py-2 px-2 flex flex-wrap justify-center gap-1">
              {/* Previous page button */}
              {currentPage > 1 && (
                <button
                  onClick={() => paginate(currentPage - 1)}
                  className="px-2 py-1 rounded text-xs sm:text-sm md:text-base bg-[#363636] text-white hover:bg-[#404040]"
                >
                  &laquo;
                </button>
              )}

              {/* Dynamic page buttons - show limited buttons on mobile */}
              {totalPages <= 5 ? (
                // If 5 or fewer pages, show all page numbers
                Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm md:text-base ${currentPage === index + 1
                      ? "bg-green-600 text-white"
                      : "bg-[#363636] text-white hover:bg-[#404040]"
                      }`}
                  >
                    {index + 1}
                  </button>
                ))
              ) : (
                // If more than 5 pages, show a window of pages
                <>
                  {/* First page */}
                  {currentPage > 2 && (
                    <button
                      onClick={() => paginate(1)}
                      className="px-2 sm:px-3 py-1 rounded text-xs sm:text-sm md:text-base bg-[#363636] text-white hover:bg-[#404040]"
                    >
                      1
                    </button>
                  )}

                  {/* Ellipsis if not showing first page */}
                  {currentPage > 3 && (
                    <span className="px-2 py-1 text-white">...</span>
                  )}

                  {/* Pages around current page */}
                  {Array.from({ length: Math.min(3, totalPages) }).map((_, index) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 2, currentPage - 1)) + index;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm md:text-base ${currentPage === pageNum
                          ? "bg-green-600 text-white"
                          : "bg-[#363636] text-white hover:bg-[#404040]"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Ellipsis if not showing last page */}
                  {currentPage < totalPages - 2 && (
                    <span className="px-2 py-1 text-white">...</span>
                  )}

                  {/* Last page */}
                  {currentPage < totalPages - 1 && (
                    <button
                      onClick={() => paginate(totalPages)}
                      className="px-2 sm:px-3 py-1 rounded text-xs sm:text-sm md:text-base bg-[#363636] text-white hover:bg-[#404040]"
                    >
                      {totalPages}
                    </button>
                  )}
                </>
              )}

              {/* Next page button */}
              {currentPage < totalPages && (
                <button
                  onClick={() => paginate(currentPage + 1)}
                  className="px-2 py-1 rounded text-xs sm:text-sm md:text-base bg-[#363636] text-white hover:bg-[#404040]"
                >
                  &raquo;
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;