import { useState, useEffect } from "react";
import axios from "../axiosConfig.js";
import Sidebar from "./callComponents/sidebar.jsx";
import dayjs from "dayjs";
import { useAuth } from '../Components/authContext.jsx';
import AttendanceCalendar from "../Components/callComponents/attendanceCalendar.jsx";

const MyAttendance = () => {
  const { user } = useAuth();
  const userId = user.id;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [userData, setUserData] = useState({
    employeeId: "",
    name: "",
    date: "",
    day: "",
    site: "",
    timeIn: "",
    timeOut: "",
    status: "",
  });
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [siteSelection, setSiteSelection] = useState("Onsite");
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // "table" or "calendar"

  // Responsive records per page based on screen size
  const getRecordsPerPage = () => {
    if (windowWidth < 480) return 3;
    if (windowWidth < 640) return 5;
    if (windowWidth < 1024) return 8;
    return 10;
  };

  const recordsPerPage = getRecordsPerPage();

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = attendanceRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(attendanceRecords.length / recordsPerPage);

  // Helper function to format time_out
  const formatTimeOut = (timeOutStr, recordDate) => {
    const timeOutObj = dayjs(timeOutStr, "YYYY-MM-DD HH:mm");
    if (!timeOutObj.isValid()) return "-";
    if (recordDate === timeOutObj.format("YYYY-MM-DD")) {
      return timeOutObj.format("hh:mm A");
    }
    return `${timeOutObj.format("hh:mm A")} (${timeOutObj.format("MM/DD/YYYY")})`;
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`/users/getUser/${userId}`);
      if (response.data && response.data.successful) {
        const user = response.data.data;
        setUserData({
          employeeId: user.employeeId,
          name: user.name || "Employee",
          date: "",
          day: "",
          site: "",
          timeIn: "",
          timeOut: "",
          status: "",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fetch attendance records and include remarks and unique id
  const fetchAttendanceRecords = async () => {
    try {
      const response = await axios.get(`/attendance/getAttendanceByUser/${userId}`);
      if (response.data && response.data.successful && Array.isArray(response.data.data)) {
        const formattedRecords = response.data.data
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
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      setAttendanceRecords([]);
    }
  };

  // Handle Time-In with updated API endpoint
  const handleTimeIn = async () => {
    setIsLoading(true);
    setAttendanceStatus("");

    try {
      // Updated endpoint format with userId in path and only site in body
      const response = await axios.post(`/attendance/addAttendance/${userId}`, {
        site: siteSelection
      });

      if (response.data && response.data.successful) {
        setAttendanceStatus(response.data.message || "Time-in recorded successfully.");
        fetchAttendanceRecords();
      }
    } catch (error) {
      console.error("Error recording time-in:", error);
      setAttendanceStatus(error.response?.data?.message || "Error recording time-in.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Time-Out with updated API endpoint
  const handleTimeOut = async () => {
    setIsLoading(true);
    setAttendanceStatus("");

    try {
      // Updated endpoint format with record ID in path and no request body
      const response = await axios.put(`/attendance/updateAttendance/${user.id}`);

      if (response.data && response.data.successful) {
        setAttendanceStatus("Time-out recorded successfully.");
        fetchAttendanceRecords();
      } else {
        setAttendanceStatus(response.data?.message || "Error recording time-out.");
      }
    } catch (error) {
      console.error("Error recording time-out:", error);
      if (error.response) {
        setAttendanceStatus(error.response.data?.message || `Error ${error.response.status}: Failed to record time-out.`);
      } else if (error.request) {
        setAttendanceStatus("Server did not respond. Please try again.");
      } else {
        setAttendanceStatus(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Toggle view mode between table and calendar
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === "table" ? "calendar" : "table");
  };

  // Formatting helpers for date and time
  const formatDate = (date) => {
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
  };

  const formatTime = (date) => {
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
  };

  // Effects for window resize, data fetch, and current time update
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchAttendanceRecords();
    const dataInterval = setInterval(() => {
      fetchUserData();
      fetchAttendanceRecords();
    }, 3000);
    return () => clearInterval(dataInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Create a responsive table for small screens
  const renderMobileTable = () => {
    return (
      <div className="grid grid-cols-1 gap-4 mt-4">
        {currentRecords.length > 0 ? (
          currentRecords.map((record, index) => (
            <div key={index} className="bg-[#404040] p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-bold text-white">Date:</div>
                <div className="text-white">{record.date}</div>

                <div className="font-bold text-white">Day:</div>
                <div className="text-white">{record.day}</div>

                <div className="font-bold text-white">Site:</div>
                <div className="text-white">{record.site}</div>

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
          ))
        ) : (
          <div className="py-4 text-center text-gray-400">No attendance records found</div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-black/90">
      <Sidebar />

      <div className="flex-1 p-2 sm:p-4 md:p-6 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <h1 className="text-lg sm:text-xl md:text-3xl lg:text-5xl mt-4 sm:mt-8 mb-2 sm:mb-0 font-bold text-white">
            Hello, <span className="font-normal text-green-500">{userData.name}</span>
          </h1>
          <div className="flex flex-col items-center">
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              {formatDate(currentTime)}
            </div>
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>

        {/* Employee ID */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-2 sm:mb-0 font-bold text-white">
            Employee ID: <span className="font-normal text-green-500">{userData.employeeId}</span>
          </h1>
        </div>

        {/* Status Message */}
        {attendanceStatus && (
          <div className={`mt-2 p-2 rounded text-center ${attendanceStatus.includes("successfully")
            ? "bg-green-500/20 text-green-300"
            : "bg-red-500/20 text-red-300"
            }`}>
            {attendanceStatus}
          </div>
        )}

        {/* Attendance Buttons and Site Dropdown */}
        <div className="flex flex-col sm:flex-row justify-between sm:justify-end gap-2 items-center mt-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={toggleViewMode}
              className={`text-white text-xs sm:text-sm cursor-pointer ${viewMode === "calendar"
                ? "bg-green-700 hover:bg-green-800"
                : "bg-black/90 hover:bg-black/20"
                } px-3 py-2 rounded-md duration-300 flex items-center gap-1`}
              title={viewMode === "calendar" ? "Switch to Table View" : "Switch to Calendar View"}
            >
              📅 <span className="hidden sm:inline">{viewMode === "calendar" ? "Table" : "Calendar"}</span>
            </button>
            <label className="text-white text-sm sm:text-base">Site:</label>
            <select
              value={siteSelection}
              onChange={(e) => setSiteSelection(e.target.value)}
              className="bg-[#2b2b2b] text-white rounded px-2 py-1 text-xs sm:text-sm flex-grow sm:flex-grow-0"
            >
              <option value="Onsite">Onsite</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleTimeIn}
              disabled={isLoading}
              className="bg-green-600 text-white px-3 sm:px-4 md:px-6 py-1 md:py-2 rounded text-xs sm:text-sm hover:bg-green-700 disabled:opacity-50 flex-1 sm:flex-auto"
            >
              TIME-IN
            </button>
            <button
              onClick={handleTimeOut}
              disabled={isLoading}
              className="bg-black/90 text-white px-3 sm:px-4 md:px-6 py-1 md:py-2 rounded text-xs sm:text-sm hover:bg-black/40 disabled:opacity-50 flex-1 sm:flex-auto"
            >
              TIME-OUT
            </button>
          </div>
        </div>

        {/* Conditional Rendering based on viewMode */}
        {viewMode === "table" ? (
          // Attendance Records Table (Desktop) / Cards (Mobile)
          <div className="bg-[#363636] rounded-lg overflow-hidden mt-4 flex flex-col w-full">
            {windowWidth >= 640 ? (
              <>
                <div className="overflow-x-auto">
                  <div className="overflow-y-auto max-h-[calc(100vh-400px)] sm:max-h-[calc(100vh-450px)] md:max-h-[calc(100vh-400px)]">
                    <table className="w-full text-white">
                      <thead className="sticky top-0 bg-[#2b2b2b] z-10">
                        <tr>
                          <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Date</th>
                          <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Day</th>
                          <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Site</th>
                          <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Time-in</th>
                          <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Time-out</th>
                          <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Remarks</th>
                          <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRecords.length > 0 ? (
                          currentRecords.map((record, index) => (
                            <tr key={index} className="hover:bg-[#404040]">
                              <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{record.date}</td>
                              <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{record.day}</td>
                              <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{record.site}</td>
                              <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{record.time_in}</td>
                              <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{record.time_out}</td>
                              <td className={`py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center ${(record.remarks.includes("Under") || record.remarks.includes("Late"))
                                ? "text-red-500"
                                : record.remarks === "OnTime"
                                  ? "text-green-500"
                                  : "text-gray-400"
                                }`}>
                                {record.remarks}
                              </td>
                              <td className={`py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center ${record.isRestDay === "Rest Day" ? "text-red-500" : "text-green-500"
                                }`}>
                                {record.isRestDay}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="py-4 text-center text-gray-400">No attendance records found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              // Mobile card layout
              <div className="p-2 overflow-y-auto max-h-[calc(100vh-280px)]">
                {renderMobileTable()}
              </div>
            )}

            {/* Pagination */}
            {attendanceRecords.length > recordsPerPage && (
              <div className="bg-[#2b2b2b] py-1 sm:py-2 px-1 sm:px-4 flex justify-center gap-1 flex-wrap">
                {/* Previous Page Button */}
                {currentPage > 1 && (
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs sm:text-sm"
                  >
                    &lt;
                  </button>
                )}

                {/* Dynamic Pagination - Show limited buttons on small screens */}
                {Array.from({ length: totalPages }).map((_, index) => {
                  // For mobile, just show current page and immediate neighbors
                  if (windowWidth < 480) {
                    if (index + 1 === currentPage ||
                      index + 1 === currentPage - 1 ||
                      index + 1 === currentPage + 1) {
                      return (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          className={`px-2 py-1 rounded text-xs sm:text-sm ${currentPage === index + 1 ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"}`}
                        >
                          {index + 1}
                        </button>
                      );
                    }
                    return null;
                  }

                  // More pagination buttons for larger screens
                  if (windowWidth >= 480) {
                    return (
                      <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={`px-2 py-1 rounded text-xs sm:text-sm ${currentPage === index + 1 ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"}`}
                      >
                        {index + 1}
                      </button>
                    );
                  }
                  return null;
                })}

                {/* Next Page Button */}
                {currentPage < totalPages && (
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs sm:text-sm"
                  >
                    &gt;
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          // Calendar View
          <div className="bg-[#363636] rounded-lg overflow-hidden mt-4 flex flex-col w-full h-[calc(100vh-250px)]">
            <AttendanceCalendar
              attendanceRecords={attendanceRecords}
              userData={userData}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAttendance;