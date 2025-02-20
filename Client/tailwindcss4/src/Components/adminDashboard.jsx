import { useState, useEffect } from 'react';
import { Search, Menu, X } from 'lucide-react';
import logo from '../Components/Img/CBZN-Logo.png';

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine number of users per page based on screen size
  const usersPerPage = windowWidth < 768 ? 5 : 11;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Your existing format functions
  const formatDate = (date) => {
    const parts = date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).split('/');
    return (
      <div className="text-center">
        {parts[0]}<span className="text-green-500">/</span>{parts[1]}<span className="text-green-500">/</span>{parts[2]}
      </div>
    );
  };

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

  // Simplified user data for mobile
  const users = [
    { id: '212236', name: 'Simon Masucol', department: 'Broadcast', title: 'Web dev' },
    { id: '212546', name: 'John Trasporto', department: 'IT Department', title: 'Intern' },
    { id: '212578', name: 'Charles Davies', department: 'Intern', title: 'Executive Marketing' },
    { id: '213631', name: 'Sweden Sadaya', department: 'Intern', title: 'System Analyst' },
    { id: '214205', name: 'Karen Bautista', department: 'Human Resources', title: 'HR Manager' },
    { id: '212236', name: 'Simon Masucol', department: 'Broadcast', title: 'Web dev' },
    { id: '212546', name: 'John Trasporto', department: 'IT Department', title: 'Intern' },
    { id: '212578', name: 'Charles Davies', department: 'Intern', title: 'Executive Marketing' },
    { id: '213631', name: 'Sweden Sadaya', department: 'Intern', title: 'System Analyst' },
    { id: '214205', name: 'Karen Bautista', department: 'Human Resources', title: 'HR Manager' },
    
  ];

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex h-screen bg-black/90">
      {/* Mobile Nav Toggle */}
      <button 
        onClick={() => setIsNavOpen(!isNavOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-green-600 text-white hover:bg-green-700"
      >
        {isNavOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar - Hidden on mobile by default */}
      <div className={`${
        isNavOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:relative w-64 bg-black p-6 flex flex-col h-full transition-transform duration-300 ease-in-out z-40`}>
        {/* Your existing sidebar content */}
        <div className="mb-8">
          <div className="w-full text-white p-4 flex justify-center items-center">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
          </div>
        </div>

        <div className="flex flex-col h-screen justify-center items-center space-y-4">
          <nav className="w-full space-y-4 text-center font-semibold text-base">
            <div className="text-white hover:bg-gray-900 px-4 py-2 rounded cursor-pointer">Home</div>
            <div className="text-white hover:bg-gray-900 px-4 py-2 rounded cursor-pointer">Attendance</div>
            <div className="text-white hover:bg-gray-900 px-4 py-2 rounded cursor-pointer">Manage Users</div>
            <div className="text-white hover:bg-gray-900 px-4 py-2 rounded cursor-pointer">Reports</div>
            <div className="text-white hover:bg-gray-900 px-4 py-2 rounded cursor-pointer">Settings</div>
            <div className="text-white hover:bg-gray-900 px-4 py-2 rounded cursor-pointer">Help</div>
          </nav>
        </div>

        <div className="mt-auto flex items-center space-x-3 p-4 border-t border-gray-800">
          <div className="w-6 h-6 bg-gray-600 rounded-full" />
          <div>
            <div className="text-white text-xs font-medium">ADMIN</div>
            <div className="text-gray-400 text-xs">ADMIN@CBZN@GMAIL.COM</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 flex flex-col">
        {/* Centered Header for mobile */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-xl md:text-5xl text-white mb-4 md:mb-0">
            Hello, <span className="text-green-500">Admin!</span>
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
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 font-semibold">
          <div className="flex gap-2">
            <select className="bg-green-600 text-white px-3 md:px-4 py-1 md:py-2 rounded text-sm md:text-base hover:bg-green-800  hover:active:bg-green-800 duration-300">
              <option className='bg-white text-black'>Employee</option>
              <option className='bg-white text-black'>Intern</option>
              <option className='bg-white text-black'>Inactive</option>
            </select>
            <select className="bg-green-600 text-white px-3 md:px-4 py-1 md:py-2 rounded text-sm md:text-base hover:bg-green-800 hover:active:bg-green-800 duration-300">
              <option className='bg-white text-black'>Active</option>
              <option className='bg-white text-black'>Archive</option>
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
            <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="bg-[#363636] rounded-lg overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <div className="overflow-y-auto max-h-[calc(100vh-500px)] md:max-h-[calc(100vh-400px)]">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#2b2b2b] z-10">
                  <tr>
                    <th className="text-[#4E9F48] py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">ID</th>
                    <th className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">Name</th>
                    <th className="hidden md:table-cell text-white py-2 md:py-3 px-2 md:px-4 text-center">Department</th>
                    <th className="hidden md:table-cell text-white py-2 md:py-3 px-2 md:px-4 text-center">Job Title</th>
                    <th className="text-white py-2 md:py-3 px-2 md:px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-[#2b2b2b] hover:bg-[#404040]">
                      <td className="text-[#4E9F48] py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">{user.id}</td>
                      <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">{user.name}</td>
                      <td className="hidden md:table-cell text-white py-2 md:py-3 px-2 md:px-4 text-center">{user.department}</td>
                      <td className="hidden md:table-cell text-white py-2 md:py-3 px-2 md:px-4 text-center">{user.title}</td>
                      <td className="text-white py-2 md:py-3 px-2 md:px-4">
                        <button className="bg-green-600 text-white px-2 md:px-4 py-1 rounded text-sm md:text-base">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Responsive Pagination */}
          <div className="bg-[#2b2b2b] py-2 px-2 md:px-4 flex justify-center gap-1">
            {Array.from({ length: Math.ceil(users.length / usersPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-2 md:px-3 py-1 rounded text-sm md:text-base ${
                  currentPage === index + 1
                    ? 'bg-green-600 text-white'
                    : 'bg-[#363636] text-white hover:bg-[#404040]'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Time Buttons */}
        <div className="flex justify-end mt-2 gap-2">
          <button className="bg-green-600 text-white px-4 md:px-8 py-1 md:py-2 rounded text-sm md:text-base hover:bg-green-700">
            TIME-IN
          </button>
          <button className="bg-black/90 text-white px-4 md:px-8 py-1 md:py-2 rounded text-sm md:text-base hover:bg-black/40">
            TIME-OUT
          </button>
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

export default AdminDashboard;