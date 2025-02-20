import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logo from "../Components/Img/CBZN-Logo.png";

const EmployeeDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const recordsPerPage = windowWidth < 768 ? 5 : 10;

  // Handle window resize
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

  const formatDate = (date) => {
    const parts = date
      .toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
      .split("/");
    return (
      <div className="text-center">
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
      <span className="text-white bg-black/40 rounded-xl px-4 sm:px-5 flex flex-1 items-center justify-center">
        {time} <span className="text-green-500 ml-2">{period}</span>
      </span>
    );
  };

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
  ];

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = attendanceRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(attendanceRecords.length / recordsPerPage);

  return (
    <div className="flex h-screen bg-black/90">
      <button
        onClick={() => setIsNavOpen(!isNavOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-green-600 text-white hover:bg-green-700"
      >
        {isNavOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div
        className={`${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative w-64 bg-black p-6 flex flex-col h-full transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="mb-8">
          <div className="w-full text-white p-4 flex justify-center items-center">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
          </div>
        </div>
        <nav className="w-full space-y-4 text-center font-semibold text-base items-center justify-center flex-1 flex flex-col mb-20">
          <div className="text-white hover:bg-gray-900 duration-300 px-4 py-2 rounded cursor-pointer">
            Home
          </div>
          <div className="text-white hover:bg-gray-900 duration-300  px-4 py-2 rounded cursor-pointer">
            Attendance
          </div>
          <div className="text-white hover:bg-gray-900 duration-300  px-4 py-2 rounded cursor-pointer">
            Reports
          </div>
        </nav>

        <div className="mt-auto flex items-center space-x-3 p-4 border-t border-gray-800">
          <div className="w-3 h-3 bg-gray-600 rounded-full" />
          <div>
            <div className="text-white text-xs font-medium">EMPLOYEE</div>
            <div className="text-gray-400 text-xs">Employee@CBZN@GMAIL.COM</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-xl md:text-5xl mt-13 md:mb-0 text-white">
            Hello, <span className="font-bold text-green-500">Employee!</span>
          </h1>
          <div className="flex flex-col items-center">
            <div className="text-2xl md:text-4xl font-bold text-white">
              {formatDate(currentTime)}
            </div>
            <div className="text-lg md:text-[clamp(1.5rem,4vw,4rem)]">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>
        {/* Displaying User ID Here */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-xl md:text-3xl md:mb-0 text-white">
            User ID <span className="font-bold text-green-500">{attendanceRecords.user_id}</span>
          </h1>
        </div>

        {/* Attendance Table */}
        <div className="bg-[#363636] rounded-lg overflow-hidden mt-8 flex flex-col w-full">
          <div className="overflow-x-auto">
            <div className="overflow-y-auto max-h-[calc(100vh-500px)] md:max-h-[calc(100vh-400px)]">
              <table className="w-full text-white">
                <thead className="sticky top-0 bg-[#2b2b2b] z-10">
                  <tr>
                    <th className="text-white py-2 px-4 text-center">Date</th>
                    <th className="text-white py-2 px-4 text-center">Day</th>
                    <th className="text-white py-2 px-4 text-center">Site</th>
                    <th className="text-white py-2 px-4 text-center">
                      Time-in
                    </th>
                    <th className="text-white py-2 px-4 text-center">
                      Time-out
                    </th>
                    <th className="text-white py-2 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 hover:bg-[#404040]"
                    >
                      <td className="py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
                        {record.date}
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
                        {record.day}
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
                        {record.site}
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
                        {record.time_in}
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
                        {record.time_out}
                      </td>
                      <td
                        className={`py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center ${
                          record.isRestDay === "Rest Day"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {record.isRestDay}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Responsive Pagination */}
          <div className="bg-[#2b2b2b] py-2 px-2 md:px-4 flex justify-center gap-1">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-2 md:px-3 py-1 rounded text-sm md:text-base ${
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

        {/* Responsive Time Buttons */}
        <div className="flex justify-end mt-4 gap-2">
          <button className="bg-green-600 text-white px-4 md:px-8 py-1 md:py-2 rounded text-sm md:text-base hover:bg-green-700">
            TIME-IN
          </button>
          <button className="bg-black/90 text-white px-4 md:px-8 py-1 md:py-2 rounded text-sm md:text-base hover:bg-black/40">
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
