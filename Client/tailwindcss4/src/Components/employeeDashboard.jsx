import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logo from "../Components/Img/CBZN-Logo.png";
import axios from "axios";

const userId = 1;
const EmployeeDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const recordsPerPage = windowWidth < 640 ? 3 : windowWidth < 768 ? 5 : 10;

  const [userData, setUserData] = useState({
  userId: "",
  date: "",
  day: "",
  site: "",
  timeIn: "",
  timeOut: "",
  status: "",
});

const fetchUserData = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/employeeDashboard/getUserId/${userId}`);
    console.log("API Response:", response.data);
    
    // If response is an array, take the latest record
    const latestRecord = Array.isArray(response.data) && response.data.length > 0
      ? response.data[0]  // Assuming the latest is the first record
      : response.data;
    
    setUserData({
      userId: latestRecord.userId || "",
      date: latestRecord.date || "",
      day: latestRecord.day || "",
      site: latestRecord.site || "",
      timeIn: latestRecord.timeIn || "",
      timeOut: latestRecord.timeOut || "",
      status: latestRecord.status || "",
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};


const [isTimeOutDisabled, setIsTimeOutDisabled] = useState(true);

const handleTimeIn = () => {
  // Enable Time-out after Time-in is clicked
  setIsTimeOutDisabled(false);
};

const handleTimeOut = () => {
  // Handle Time-out logic here
  console.log("Time-out clicked");
};

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

 useEffect(() => {
  fetchUserData();
  const interval = setInterval(fetchUserData, 5000); // Refresh every 5 seconds
  return () => clearInterval(interval);
}, []);


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  // naka reference pa dito yung frontend kaya pag dinedelete nawawala
  const attendanceRecords = [
    {
      user_id: "212546",
      date: "2025-02-17",
      day: "Monday",
      site: "Onsite",
      time_in: "08:00 AM",
      time_out: "05:00 PM",
      isRestDay: "Work",
    },
    {
      date: "2025-02-17",
      day: "Monday",
      site: "Remote",
      time_in: "08:30 AM",
      time_out: "04:30 PM",
      isRestDay: "Work",
    },
    {
      date: "2025-02-17",
      day: "Monday",
      site: "Onsite",
      time_in: "09:00 AM",
      time_out: "06:00 PM",
      isRestDay: "Work",
    },
    {
      date: "2025-02-17",
      day: "Monday",
      site: "-",
      time_in: "-",
      time_out: "-",
      isRestDay: "Rest Day",
    },
    {
      date: "2025-02-17",
      day: "Monday",
      site: "Onsite",
      time_in: "07:30 AM",
      time_out: "03:30 PM",
      isRestDay: "Work",
    },
    {
      date: "2025-02-17",
      day: "Monday",
      site: "Onsite",
      time_in: "07:30 AM",
      time_out: "03:30 PM",
      isRestDay: "Work",
    }
  ];

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = attendanceRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(attendanceRecords.length / recordsPerPage);

  return (
    <div className="flex h-screen bg-black/90">
      <button
        onClick={() => setIsNavOpen(!isNavOpen)}
        className="md:hidden fixed top-2 left-2 z-50 p-2 rounded-md bg-green-600 text-white hover:bg-green-700"
      >
        {isNavOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

      <div
        className={`${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative w-48 sm:w-64 bg-black p-4 sm:p-6 flex flex-col h-full transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="mb-4 sm:mb-8">
          <div className="w-full text-white p-2 sm:p-4 flex justify-center items-center">
            <img src={logo} alt="Logo" className="h-6 sm:h-8 w-auto" />
          </div>
        </div>
        <nav className="w-full space-y-2 sm:space-y-4 text-center font-semibold text-sm sm:text-base items-center justify-center flex-1 flex flex-col mb-10 sm:mb-20">
          <div className="text-white hover:text-green-500 duration-300 px-3 sm:px-4 py-1 sm:py-2 rounded cursor-pointer">
            Home
          </div>
          <div className="text-white hover:text-green-500 duration-300 px-3 sm:px-4 py-1 sm:py-2 rounded cursor-pointer">
            Attendance
          </div>
          <div className="text-white hover:text-green-500 duration-300 px-3 sm:px-4 py-1 sm:py-2 rounded cursor-pointer">
            Reports
          </div>
        </nav>

        <div className="mt-auto flex items-center space-x-2 p-2 sm:p-4 border-t border-gray-800">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-600 rounded-full" />
          <div>
            <div className="text-white text-xs">EMPLOYEE</div>
            <div className="text-gray-400 text-xs truncate">Employee@CBZN@GMAIL.COM</div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-2 sm:p-4 md:p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <h1 className="text-lg sm:text-xl md:text-5xl mt-8 sm:mt-13 mb-2 sm:mb-0 text-white">
            Hello, <span className="font-bold text-green-500">Employee!</span>
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

        <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
          <h1 className="text-lg sm:text-xl md:text-3xl mb-2 sm:mb-0 text-white">
        User ID: <span className="font-bold text-green-500">{userData.userId}</span>
      </h1>
        </div>

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
                  {currentRecords.map((record, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 hover:bg-[#404040]"
                    >
                      <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">
                        {record.date}
                      </td>
                      <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">
                        {record.day}
                      </td>
                      <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">
                        {record.site}
                      </td>
                      <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">
                        {record.time_in}
                      </td>
                      <td className="py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center">
                        {record.time_out}
                      </td>
                      <td className={`py-1 sm:py-2 px-1 sm:px-4 text-xs sm:text-sm text-center ${
                        record.isRestDay === "Rest Day" ? "text-red-500" : "text-green-500"
                      }`}>
                        {record.isRestDay}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#2b2b2b] py-1 sm:py-2 px-1 sm:px-4 flex justify-center gap-1">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-2 py-1 rounded text-xs sm:text-sm ${
                  currentPage === index + 1
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-2 sm:mt-4 gap-2">
          <button className="bg-green-600 text-white px-3 sm:px-4 md:px-8 py-1 md:py-2 rounded text-xs sm:text-sm hover:bg-green-700">
            TIME-IN
          </button>
          <button className="bg-black/90 text-white px-3 sm:px-4 md:px-8 py-1 md:py-2 rounded text-xs sm:text-sm hover:bg-black/40">
            TIME-OUT
          </button>
        </div>
      </div>

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