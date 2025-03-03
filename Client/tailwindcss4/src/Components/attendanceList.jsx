import React, { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import axios from 'axios';
import dayjs from 'dayjs';
import Sidebar from "./callComponents/sidebar.jsx";

const AdminAttendance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [attendances, setAttendances] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("Employee"); // Default
  const [loading, setLoading] = useState(true);

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

      console.log("Formatted Data:", formattedData);
      setAttendances(formattedData); // Store formatted data
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

    // Convert hours to 12-hour format
    hours = hours % 12 || 12; // Converts 0 (midnight) to 12 AM

    return `${hours}:${minutes} ${amPm}`;
  }

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Number of entries per page
  const entriesPerPage = windowWidth < 780 ? 5 : 10;

  // Filter attendances based on selected employment status
  const filteredAttendances = attendances.filter(attendance => {
    const employmentStatus = attendance.User?.employment_status; // Ensure User exists
    if (!employmentStatus || employmentStatus !== selectedFilter) return false;

    const searchTerm = searchQuery.toLowerCase();
    return (
      attendance.User?.name?.toLowerCase().includes(searchTerm)
    )

  });

    const formatDate = d => d ? dayjs(d).format('MMM D, YYYY') : 'N/A';
  

  // Pagination logic
  const totalPages = Math.ceil(filteredAttendances.length / entriesPerPage)
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredAttendances.slice(indexOfFirstEntry, indexOfLastEntry);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex h-screen bg-black/90">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-xl md:text-5xl font-bold mt-13 md:mb-0 text-green-500">
            Attendance List
          </h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mt-8 mb-5 font-semibold">
          <div className="flex gap-2">
            <select
              className="bg-green-600 text-white px-3 md:px-4 py-1 md:py-2 rounded text-sm md:text-base hover:bg-green-800 duration-300"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="Employee">Employees</option>
              <option value="Intern">Interns</option>
            </select>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Name..."
              className="bg-black/80 text-white px-3 md:px-4 py-1 md:py-2 rounded pl-8 md:pl-10 text-sm md:text-base w-full md:w-auto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-[#363636] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="overflow-y-auto max-h-[calc(100vh-500px)] md:max-h-[calc(100vh-400px)]">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#2b2b2b] z-10">
                  <tr>
                    <th className="text-[#4E9F48] py-2 md:py-3 text-center">ID</th>
                    <th className="text-white py-2 md:py-3 text-center">Name</th>
                    <th className="text-white py-2 md:py-3 text-center">Date</th>
                    <th className="text-white py-2 md:py-3 text-center">Day</th>
                    <th className="text-white py-2 md:py-3 text-center">Site</th>
                    <th className="text-white py-2 md:py-3 text-center">Time-in</th>
                    <th className="text-white py-2 md:py-3 text-center">Time-out</th>
                    <th className="text-white py-2 md:py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((attendance) => (
                    <tr key={attendance.id} className="border-b border-[#2b2b2b] hover:bg-[#404040]">
                      <td className="text-[#4E9F48] py-2 md:py-3 px-2 md:px-4 text-md md:text- text-center">
                        {attendance.UserId}
                      </td>
                      <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
                        {attendance.User?.name || "Unknown"} {/* Use User.name */}
                      </td>
                      <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
                        {formatDate(attendance.date)}
                      </td>
                      <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
                        {attendance.weekday}
                      </td>
                      <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
                        {attendance.site || "—"}
                      </td>
                      <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
                        {attendance.time_in || "—"}
                      </td>
                      <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
                        {attendance.time_out || "—"}
                      </td>
                      <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
                        {attendance.isRestDay ? "Rest Day" : "Work"}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="bg-[#2b2b2b] py-2 px-2 flex justify-center gap-1">
            {Array.from({ length: Math.ceil(filteredAttendances.length / entriesPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-2 md:px-3 py-1 rounded text-sm md:text-base ${currentPage === index + 1
                    ? "bg-green-600 text-white"
                    : "bg-[#363636] text-white hover:bg-[#404040]"
                  }`}>
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;
