import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./callComponents/sidebar.jsx";
import dayjs from "dayjs";

const userId = 4; // This should ideally come from authentication

const MyAttendance = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [userData, setUserData] = useState({
    userId: "",
    name: "",
    date: "",
    day: "",
    site: "",
    timeIn: "",
    timeOut: "",
    status: "",
  });
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isTimeOutDisabled, setIsTimeOutDisabled] = useState(true);
  const [siteSelection, setSiteSelection] = useState("Onsite"); // Default to Onsite
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const recordsPerPage = windowWidth < 640 ? 3 : windowWidth < 768 ? 5 : 10;

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = attendanceRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(attendanceRecords.length / recordsPerPage);

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/users/getUser/${userId}`);

      console.log("User data:", response.data);

      if (response.data && response.data.successful) {
        const userData = response.data.data;
        setUserData({
          employeeId: userData.employeeId,
          name: userData.name || "Employee", // Get the user's name
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

  // Function to fetch attendance records
  const fetchAttendanceRecords = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/attendance/getAttendanceByUser/${userId}`);
      if (response.data && response.data.successful) {
        // Transform data to match expected format
        const formattedRecords = response.data.data.map(record => ({
          date: record.date,
          day: record.weekday,
          site: record.site || "-",
          time_in: record.time_in ? dayjs(record.time_in).format("hh:mm A") : "-",
          time_out: record.time_out ? dayjs(record.time_out).format("hh:mm A") : "-",
          isRestDay: record.isRestDay ? "Rest Day" : "Work"
        }));
        setAttendanceRecords(formattedRecords);
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
    }
  };

  // Handle Time In
  const handleTimeIn = async () => {
    setIsLoading(true);
    setAttendanceStatus("");

    try {
      const now = dayjs();
      const currentDate = now.format("YYYY-MM-DD");
      const currentWeekday = now.format("dddd");
      const timeInFormatted = now.format("YYYY-MM-DD HH:mm");

      const response = await axios.post("http://localhost:8080/attendance/addAttendance", {
        weekday: currentWeekday,
        isRestDay: false,
        date: currentDate,
        time_in: timeInFormatted,
        site: siteSelection,
        UserId: userId
      });

      if (response.data && response.data.successful) {
        setAttendanceStatus("Time-in recorded successfully.");
        setIsTimeOutDisabled(false);
        fetchAttendanceRecords(); // Refresh records
      }
    } catch (error) {
      console.error("Error recording time-in:", error);
      setAttendanceStatus(error.response?.data?.message || "Error recording time-in.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Time Out
  const handleTimeOut = async () => {
    setIsLoading(true);
    setAttendanceStatus("");

    try {
      const now = dayjs();
      // const currentDate = now.format("YYYY-MM-DD");
      const timeOutFormatted = now.format("YYYY-MM-DD HH:mm");

      // First, let's log what we're sending to help debug
      console.log("Sending time-out request:", {
        time_out: timeOutFormatted,
        UserId: userId
      });

      // Try the request with the path matching your backend function signature
      const response = await axios.put(`http://localhost:8080/attendance/updateAttendance`, {
        time_out: timeOutFormatted,
        UserId: userId
      });

      if (response.data && response.data.successful) {
        setAttendanceStatus("Time-out recorded successfully.");
        setIsTimeOutDisabled(true);
        fetchAttendanceRecords(); // Refresh records
      } else {
        // Handle case where API returns a response but it's not successful
        setAttendanceStatus(response.data?.message || "Error recording time-out.");
      }
    } catch (error) {
      console.error("Error recording time-out:", error);

      // Improved error reporting
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        setAttendanceStatus(error.response.data?.message || `Error ${error.response.status}: Failed to record time-out.`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        setAttendanceStatus("Server did not respond. Please try again.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        setAttendanceStatus(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Rest Day
  const handleRestDay = async () => {
    setIsLoading(true);
    setAttendanceStatus("");

    try {
      const now = dayjs();
      const currentDate = now.format("YYYY-MM-DD");
      const currentWeekday = now.format("dddd");

      const response = await axios.post("http://localhost:8080/attendance/addAttendance", {
        weekday: currentWeekday,
        isRestDay: true,
        date: currentDate,
        UserId: userId
      });

      if (response.data && response.data.successful) {
        setAttendanceStatus("Rest day recorded successfully.");
        fetchAttendanceRecords(); // Refresh records
      }
    } catch (error) {
      console.error("Error recording rest day:", error);
      setAttendanceStatus(error.response?.data?.message || "Error recording rest day.");
    } finally {
      setIsLoading(false);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Formatting helpers
  const formatDate = (date) => {
    const parts = date.toLocaleDateString("en-US", {
      month: "2-digit", day: "2-digit", year: "numeric",
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
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    });
    const [time, period] = timeString.split(" ");

    return (
      <span className="text-white bg-black/40 rounded-xl px-2 sm:px-4 py-1 flex items-center justify-center text-sm sm:text-base">
        {time} <span className="text-green-500 ml-1 sm:ml-2">{period}</span>
      </span>
    );
  };

  // Check if user has already clocked in today
  useEffect(() => {
    const checkTodayAttendance = () => {
      const today = dayjs().format("YYYY-MM-DD");
      const todayRecord = attendanceRecords.find(record => record.date === today);

      if (todayRecord) {
        if (todayRecord.isRestDay === "Rest Day") {
          setIsTimeOutDisabled(true);
        } else if (todayRecord.time_in !== "-" && todayRecord.time_out === "-") {
          setIsTimeOutDisabled(false);
        } else {
          setIsTimeOutDisabled(true);
        }
      }
    };

    if (attendanceRecords.length > 0) {
      checkTodayAttendance();
    }
  }, [attendanceRecords]);

  // Effects
  useEffect(() => {
    // Window resize listener
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Initial data fetch
    fetchUserData();
    fetchAttendanceRecords();

    // Refresh data every 30 seconds
    const dataInterval = setInterval(() => {
      fetchUserData();
      fetchAttendanceRecords();
    }, 30000);

    return () => clearInterval(dataInterval);
  }, []);

  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen bg-black/90">
      <Sidebar />

      <div className="flex-1 p-2 sm:p-4 md:p-6 flex flex-col">
        {/* Header with greeting and time */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <h1 className="text-lg sm:text-xl md:text-5xl mt-8 sm:mt-13 mb-2 sm:mb-0 text-white">
            Hello, <span className="font-bold text-green-500">{userData.name}</span>
          </h1>
          <div className="flex flex-col items-center">
            <div className="text-xl sm:text-2xl md:text-4xl font-bold text-white">
              {formatDate(currentTime)}
            </div>
            <div className="text-base sm:text-lg md:text-[clamp(1.5rem,4vw,4rem)]">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>

        {/* User ID display */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
          <h1 className="text-lg sm:text-xl md:text-3xl mb-2 sm:mb-0 text-white">
            Employee ID: <span className="font-bold text-green-500">{userData.employeeId}</span>
          </h1>
        </div>

        {/* Status message */}
        {attendanceStatus && (
          <div className={`mt-2 p-2 rounded text-center ${attendanceStatus.includes("successfully")
            ? "bg-green-500/20 text-green-300"
            : "bg-red-500/20 text-red-300"
            }`}>
            {attendanceStatus}
          </div>
        )}

        {/* Attendance records table */}
        <div className="bg-[#363636] rounded-lg overflow-hidden mt-4 sm:mt-8 flex flex-col w-full">
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
                    <th className="text-white py-1 sm:py-2 px-2 sm:px-4 text-center text-xs sm:text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length > 0 ? (
                    currentRecords.map((record, index) => (
                      <tr key={index} className="border-b border-black/90 hover:bg-[#404040]">
                        <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{record.date}</td>
                        <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{record.day}</td>
                        <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{record.site}</td>
                        <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{record.time_in}</td>
                        <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">{record.time_out}</td>
                        <td className={`py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center ${record.isRestDay === "Rest Day" ? "text-red-500" : "text-green-500"
                          }`}>
                          {record.isRestDay}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-gray-400">No attendance records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {attendanceRecords.length > recordsPerPage && (
            <div className="bg-[#2b2b2b] py-1 sm:py-2 px-1 sm:px-4 flex justify-center gap-1">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`px-2 py-1 rounded text-xs sm:text-sm ${currentPage === index + 1 ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Site selection and attendance buttons */}
        <div className="flex flex-col sm:flex-row justify-between mt-2 sm:mt-4 gap-2">
          <div className="flex items-center gap-2">
            <label className="text-white text-sm sm:text-base">Site:</label>
            <select
              value={siteSelection}
              onChange={(e) => setSiteSelection(e.target.value)}
              className="bg-[#2b2b2b] text-white rounded px-2 py-1 text-xs sm:text-sm"
            >
              <option value="Onsite">Onsite</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRestDay}
              disabled={isLoading}
              className="bg-red-600 text-white px-3 sm:px-4 md:px-6 py-1 md:py-2 rounded text-xs sm:text-sm hover:bg-red-700 disabled:opacity-50"
            >
              REST DAY
            </button>
            <button
              onClick={handleTimeIn}
              disabled={isLoading || !isTimeOutDisabled}
              className="bg-green-600 text-white px-3 sm:px-4 md:px-6 py-1 md:py-2 rounded text-xs sm:text-sm hover:bg-green-700 disabled:opacity-50"
            >
              TIME-IN
            </button>
            <button
              onClick={handleTimeOut}
              disabled={isLoading || isTimeOutDisabled}
              className="bg-black/90 text-white px-3 sm:px-4 md:px-6 py-1 md:py-2 rounded text-xs sm:text-sm hover:bg-black/40 disabled:opacity-50"
            >
              TIME-OUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;