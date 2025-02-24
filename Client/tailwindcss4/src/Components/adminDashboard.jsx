import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import Sidebar from '../Components/callComponents/sidebar';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [employmentFilter, setEmploymentFilter] = useState('Employee');
  const [loading, setLoading] = useState(true);

  // Fetch Users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8080/users/getAllUsers');
        console.log("response data: ", response.data.data); // Debugging: Log the response
        setUsers(Array.isArray(response.data?.data) ? response.data.data : []); // Ensure it's always an array
        console.log("users: ", users); // Debugging: Log the users
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]); // Fallback to empty array in case of error
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset to first page when search query or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, employmentFilter]);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter users safely
  const filteredUsers = (users || []).filter(user => {
    if (user.employment_status !== employmentFilter) return false;
    return (
      user.employeeId?.toString().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Determine number of users per page based on screen size
  const usersPerPage = windowWidth < 768 ? 8 : 12;
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Pagination handler
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="flex h-screen bg-black/90">
      <Sidebar />

      <div className="flex-1 p-4 md:p-6 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-xl md:text-2xl text-white">
            Hello, <span className="text-green-500">Admin</span>
          </h1>
          <div className="flex flex-col items-center">
            <div className="text-2xl md:text-4xl font-bold text-white">
              {currentTime.toLocaleDateString()}
            </div>
            <div className="text-lg md:text-4xl bg-black/40 px-4 py-1 rounded-xl text-white">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 font-semibold">
          <select
            className="bg-green-600 text-white px-4 py-2 rounded text-base"
            value={employmentFilter}
            onChange={(e) => setEmploymentFilter(e.target.value)}
          >
            <option value="Employee">Employee</option>
            <option value="Intern">Intern</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search ID or name..."
              className="bg-black/80 text-white px-10 py-2 rounded text-base w-full md:w-auto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {/* User Table */}
        <div className="bg-[#363636] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-white text-center p-4">Loading users...</div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#2b2b2b] text-white">
                  <tr>
                    <th className="py-3 px-4 text-left">Employee ID</th>
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="hidden md:table-cell py-3 px-4 text-left">Email</th>
                    <th className="hidden md:table-cell py-3 px-4 text-left">Job Title</th>
                    <th className="hidden md:table-cell py-3 px-4 text-left">Admin</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user.employeeId} className="border-b border-[#2b2b2b] hover:bg-[#404040]">
                      <td className="py-3 px-4 text-green-500">{user.employeeId}</td>
                      <td className="py-3 px-4 text-white">{user.name}</td>
                      <td className="hidden md:table-cell py-3 px-4 text-white">{user.email}</td>
                      <td className="hidden md:table-cell py-3 px-4 text-white">{user.jobTitle?.title || 'N/A'}</td>
                      <td className="hidden md:table-cell py-3 px-4">
                        {user.isAdmin ? (
                          <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">Admin</span>
                        ) : (
                          <span className="bg-gray-600 text-white px-2 py-1 rounded text-xs">User</span>
                        )}
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button className="bg-green-600 hover:bg-green-800 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="bg-[#2b2b2b] py-2 px-4 flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-1 rounded text-sm ${currentPage === index + 1 ? 'bg-green-600 text-white' : 'bg-[#363636] text-white hover:bg-[#404040]'
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;