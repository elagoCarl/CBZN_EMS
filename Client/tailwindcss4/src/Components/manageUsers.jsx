import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Plus } from 'lucide-react';
import Sidebar from './callComponents/sidebar';
import AddUserModal from './callComponents/addUser';
import EditUserModal from './callComponents/editUser';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [employmentFilter, setEmploymentFilter] = useState('Employee');
  const [loading, setLoading] = useState(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:8080/users/getAllUsers');
      setUsers(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();

    // Handle window resize
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // Set up timer for clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
    };
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, employmentFilter]);

  const handleAddUser = () => setIsAddUserModalOpen(true);
  const handleCloseModal = () => setIsAddUserModalOpen(false);

  const handleUserAdded = (newUser) => {
    setUsers(prevUsers => [newUser, ...prevUsers]);
    setIsAddUserModalOpen(false);
    fetchUsers();
  };

  const handleEditUser = (employeeId) => {
    const userToEdit = users.find(user => user.employeeId === employeeId);
    if (userToEdit) {
      setSelectedUserId(userToEdit.id);
      setIsEditUserModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditUserModalOpen(false);
    setSelectedUserId(null);
  };

  const handleUserUpdated = () => {
    fetchUsers();
    handleCloseEditModal();
  };

  const filteredUsers = users.filter(user => {
    if (user.employment_status !== employmentFilter) return false;
    const searchTerm = searchQuery.toLowerCase();
    return (
      user.employeeId?.toString().includes(searchTerm) ||
      user.name?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm)
    );
  });

  const usersPerPage = windowWidth < 768 ? 8 : 12;
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // Responsive styling based on screen size
  const getStatusClass = (status) => {
    if (status === 'Employee') return 'bg-green-500/20 text-green-500';
    if (status === 'Intern') return 'bg-blue-500/20 text-blue-500';
    return 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black/90 overflow-hidden">
      {/* Sidebar */}
      <div className="md:block">
        <Sidebar />
      </div>

      <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4  p-4 md:p-6">
          <div className="space-y-1 md:space-y-2 text-center md:text-left">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white">
              Welcome Back, <span className="text-green-600">Admin</span>
            </h1>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center">
          <button
            className="w-full sm:w-auto bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-md font-medium transition-all hover:bg-green-700 focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-black flex items-center justify-center gap-2"
            onClick={handleAddUser}
          >
            <Plus size={15} />
            Add
          </button>

          <select
            className="w-full sm:w-auto bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-md font-medium transition-all hover:bg-green-800 focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-black"
            value={employmentFilter}
            onChange={(e) => setEmploymentFilter(e.target.value)}
          >
            <option value="Employee">Employees</option>
            <option value="Intern">Interns</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by ID, name, or email..."
              className="w-full bg-[#363636] text-white pl-12 pr-4 py-2 md:py-3 rounded-md focus:ring-2 focus:ring-green-600 focus:outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-[#363636] rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48 md:h-64">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <div className="text-green-600 text-lg md:text-xl">Loading users...</div>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3 p-4">
                {currentUsers.length === 0 ? (
                  <div className="text-center text-gray-400 py-6">No users found</div>
                ) : (
                  currentUsers.map((user) => (
                    <div key={user.employeeId} className="bg-[#404040] rounded-md p-4 space-y-2 border border-gray-800 hover:border-green-600/30 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-green-500 font-medium">ID: {user.employeeId}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusClass(user.employment_status)}`}>
                          {user.employment_status}
                        </span>
                      </div>
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-gray-400 text-sm">{user.email}</div>
                      <div className="text-gray-400 text-sm">Role: {user.isAdmin ? 'Admin' : 'User'}</div>
                      <div className="pt-2">
                        <button
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          onClick={() => handleEditUser(user.employeeId)}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col className="w-1/12" />
                      <col className="w-2/12" />
                      <col className="w-3/12" />
                      <col className="w-2/12" />
                      <col className="w-2/12" />
                      <col className="w-2/12" />
                    </colgroup>
                    <thead>
                      <tr className="bg-[#2b2b2b] text-gray-300">
                        <th className="py-4 px-6 text-left">ID</th>
                        <th className="py-4 px-6 text-left">Name</th>
                        <th className="py-4 px-6 text-left">Email</th>
                        <th className="py-4 px-6 text-left">Role</th>
                        <th className="py-4 px-6 text-left">Status</th>
                        <th className="py-4 px-6 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#404040]">
                      {currentUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-gray-400">No users found</td>
                        </tr>
                      ) : (
                        currentUsers.map((user) => (
                          <tr
                            key={user.employeeId}
                            className="hover:bg-[#404040] border-l-4 border-transparent hover:border-l-green-600"
                          >
                            <td className="py-4 px-6 truncate">
                              <span className="text-green-600 font-medium">{user.employeeId}</span>
                            </td>
                            <td className="py-4 px-6 truncate">
                              <div className="text-white font-medium">{user.name}</div>
                            </td>
                            <td className="py-4 px-6 text-gray-300 truncate" title={user.email}>
                              {user.email}
                            </td>
                            <td className="py-4 px-6 text-gray-300">
                              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${user.isAdmin ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                {user.isAdmin ? 'Admin' : 'User'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${getStatusClass(user.employment_status)}`}>
                                {user.employment_status}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <button
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-black"
                                onClick={() => handleEditUser(user.employeeId)}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="bg-[#2b2b2b] py-3 md:py-4 px-4 md:px-6 flex justify-between items-center">
              <div className="text-gray-400 text-sm">
                {filteredUsers.length > 0 ?
                  `Showing ${(currentPage - 1) * usersPerPage + 1}-${Math.min(currentPage * usersPerPage, filteredUsers.length)} of ${filteredUsers.length} users` :
                  'No results found'
                }
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
            ${currentPage === 1 
              ? 'bg-[#363636] text-gray-600 cursor-not-allowed' 
              : 'bg-[#404040] text-white hover:bg-green-600'}`}
                >
                  Previous
                </button>

                {totalPages <= 5 ? (
                  // Show all pages if 5 or fewer
                  Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`
                px-3 py-1 rounded-md text-sm font-medium transition-colors
                ${currentPage === index + 1
                          ? 'bg-green-600 text-white'
                          : 'bg-[#404040] text-white hover:bg-green-600/80'
                        }
              `}
                    >
                      {index + 1}
                    </button>
                  ))
                ) : (
                  // Show limited pages with ellipsis for many pages
                  <>
                    {/* First page */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === 1 ? 'bg-green-600 text-white' : 'bg-[#404040] text-white hover:bg-green-600/80'}`}
                    >
                      1
                    </button>

                    {/* Ellipsis or second page */}
                    {currentPage > 3 && (
                      <span className="px-2 py-1 text-gray-400">...</span>
                    )}

                    {/* Pages around current page */}
                    {Array.from({ length: totalPages }).slice(
                      Math.max(1, currentPage - 2),
                      Math.min(totalPages - 1, currentPage + 1)
                    ).map((_, idx) => {
                      const pageNum = Math.max(2, currentPage - 2) + idx;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`
                    px-3 py-1 rounded-md text-sm font-medium transition-colors
                    ${currentPage === pageNum
                              ? 'bg-green-600 text-white'
                              : 'bg-[#404040] text-white hover:bg-green-600/80'
                            }
                  `}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Ellipsis or second-to-last page */}
                    {currentPage < totalPages - 2 && (
                      <span className="px-2 py-1 text-gray-400">...</span>
                    )}

                    {/* Last page if not already shown */}
                    {totalPages > 1 && (
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === totalPages ? 'bg-green-600 text-white' : 'bg-[#404040] text-white hover:bg-green-600/80'}`}
                      >
                        {totalPages}
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
            ${currentPage === totalPages 
              ? 'bg-[#363636] text-gray-600 cursor-not-allowed' 
              : 'bg-[#404040] text-white hover:bg-green-600'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseModal}
        onUserAdded={handleUserAdded}
      />

      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={handleCloseEditModal}
        userId={selectedUserId}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
};

export default ManageUsers;