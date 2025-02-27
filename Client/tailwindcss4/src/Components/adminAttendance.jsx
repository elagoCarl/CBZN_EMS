import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import logo from "../Components/Img/CBZN-Logo.png";
import Sidebar from "../Components/callComponents/sidebar.jsx"

const AdminAttendance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [data, setData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All", "Employee", "Intern"); // Default: show all

  
  useEffect(() => {
    fetch("http://localhost:8080/attendance/getAllAttendances")
      .then((res) => res.json())
      .then((result) => {
        console.log("API Data:", result);
  
        // Format time_in and time_out
        const formattedData = (Array.isArray(result.data) ? result.data : []).map((item) => ({
          ...item,
          name: item.User?.name,
          time_in: item.time_in ? formatDateTime(item.time_in) : null,
          time_out: item.time_out ? formatDateTime(item.time_out) : null
        }));
  
        console.log("Formatted Data:", formattedData);
        setData(formattedData);

      })
      .catch((error) => console.error("Fetch error:", error));
  }, []); // Empty dependency array ensures this runs only once

  

  

// Function to format time as HH:mm (exclude date)
function formatDateTime(isoString) {
  const date = new Date(isoString);
  
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const amPm = hours >= 12 ? 'PM' : 'AM';

  // Convert hours to 12-hour format
  hours = hours % 12 || 12; // Converts 0 (midnight) to 12 AM

  return `${hours}:${minutes} ${amPm}`;
}



  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine number of entries per page based on screen size
  const entriesPerPage = windowWidth < 768 ? 5 : 10;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and time
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

  // Sample attendance data
  const attendanceData = [
    {
      id: "212236",
      date: "2025-02-17",
      day: "Monday",
      type: "Onsite",
      timeIn: "08:00 AM",
      timeOut: "05:00 PM",
      status: "Work",
    },
    {
      id: "212546",
      date: "2025-02-17",
      day: "Monday",
      type: "Remote",
      timeIn: "08:30 AM",
      timeOut: "04:30 PM",
      status: "Work",
    },
    {
      id: "212578",
      date: "2025-02-17",
      day: "Monday",
      type: "Onsite",
      timeIn: "09:00 AM",
      timeOut: "06:00 PM",
      status: "Work",
    },
    {
      id: "213631",
      date: "2025-02-17",
      day: "Monday",
      type: "-",
      timeIn: "-",
      timeOut: "-",
      status: "Rest Day",
    },
    {
      id: "214205",
      date: "2025-02-17",
      day: "Monday",
      type: "Onsite",
      timeIn: "07:30 AM",
      timeOut: "03:30 PM",
      status: "Work",
    },
    {
      id: "214205",
      date: "2025-02-17",
      day: "Monday",
      type: "Onsite",
      timeIn: "07:30 AM",
      timeOut: "03:30 PM",
      status: "Work",
    },
    {
      id: "214205",
      date: "2025-02-17",
      day: "Monday",
      type: "Onsite",
      timeIn: "07:30 AM",
      timeOut: "03:30 PM",
      status: "Work",
    },
    {
      id: "214205",
      date: "2025-02-17",
      day: "Monday",
      type: "Onsite",
      timeIn: "07:30 AM",
      timeOut: "03:30 PM",
      status: "Work",
    },
    {
      id: "214205",
      date: "2025-02-17",
      day: "Monday",
      type: "Onsite",
      timeIn: "07:30 AM",
      timeOut: "03:30 PM",
      status: "Work",
    },
    {
      id: "214205",
      date: "2025-02-17",
      day: "Monday",
      type: "Onsite",
      timeIn: "07:30 AM",
      timeOut: "03:30 PM",
      status: "Work",
    },
  ];

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = attendanceData.slice(indexOfFirstEntry, indexOfLastEntry);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex h-screen bg-black/90">
      < Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 flex flex-col">
        {/* Centered Header for mobile */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-xl md:text-5xl font-bold mt-13 md:mb-0 text-green-500">
            Attendance
          </h1>
          <div className="flex flex-col items-center">
            <div className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 text-white">
              {formatDate(currentTime)}
            </div>
            <div className="text-lg md:text-[clamp(1.5rem,4vw,4rem)]">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>

        {/* Responsive Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mt-8 mb-5 font-semibold">
          <div className="flex gap-2">
            <select className="bg-green-600 text-white px-3 md:px-4 py-1 md:py-2 rounded text-sm md:text-base hover:bg-green-800  hover:active:bg-green-800 duration-300">
              <option className="bg-white text-black">Employee</option>
              <option className="bg-white text-black">Intern</option>
              <option className="bg-white text-black">Inactive</option>
            </select>
            <select className="bg-green-600 text-white px-3 md:px-4 py-1 md:py-2 rounded text-sm md:text-base hover:bg-green-800 hover:active:bg-green-800 duration-300">
              <option className="bg-white text-black">Active</option>
              <option className="bg-white text-black">Archive</option>
            </select>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search ID..."
              className="bg-black/80 text-white px-3 md:px-4 py-1 md:py-2 rounded pl-8 md:pl-10 text-sm md:text-base w-full md:w-auto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-[#363636] rounded-lg overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <div className="overflow-y-auto max-h-[calc(100vh-500px)] md:max-h-[calc(100vh-400px)]">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#2b2b2b] z-10">
                  <tr>
                    <th className="text-[#4E9F48] py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">User ID</th>
                    <th className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">Date</th>
                    <th className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">Day</th>
                    <th className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">Type</th>
                    <th className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">Time-in</th>
                    <th className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">Time-out</th>
                    <th className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                {currentEntries
  .filter((entry) => 
    entry.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedFilter === "Intern" || entry.employment_status === selectedFilter )// Filter based on role
  )
  .map((entry) => (


  <tr
    key={entry.id}
    className="border-b border-[#2b2b2b] hover:bg-[#404040]"
  >
    <td className="text-[#4E9F48] py-2 md:py-3 px-2 md:px-4 text-md md:text- text-center">
      {entry.UserId}
    </td>
    <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
      {entry.name}
    </td>
    <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
      {entry.date}
    </td>
    <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
      {entry.weekday}
    </td>
    <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
      {entry.site ? entry.site : "—"}
    </td>
    <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
      {entry.time_in ? entry.time_in : "—" }
    </td>
    <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
      {entry.time_out ? entry.time_out : "—"}
    </td>
    <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
    {entry.isRestDay ? "Rest Day" : "Work"}
    </td>
  </tr>
))}
                    
          
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="bg-[#2b2b2b] py-2 px-2 md:px-4 flex justify-center gap-1">
            {Array.from({
              length: Math.ceil(attendanceData.length / entriesPerPage),
            }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-2 md:px-3 py-1 rounded text-sm md:text-base ${
                  currentPage === index + 1
                    ? "bg-green-600 text-white"
                    : "bg-[#363636] text-white hover:bg-[#404040]"
                }`}>
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {isNavOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsNavOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminAttendance;
