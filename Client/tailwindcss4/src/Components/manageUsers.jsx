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

  // New state for edit modal
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
  }, [fetchUsers]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, employmentFilter]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddUserModalOpen(false);
  };

  // Handler for when a new user is added
  const handleUserAdded = (newUser) => {
    // Optimistically update the UI
    setUsers(prevUsers => [newUser, ...prevUsers]);
    setIsAddUserModalOpen(false);
    // Refetch to ensure consistency with backend
    fetchUsers();
  };

  // Handler to open the edit modal for a specific user using the employeeId
  const handleEditUser = (employeeId) => {
    const userToEdit = users.find(user => user.employeeId === employeeId);
    if (userToEdit) {
      setSelectedUserId(userToEdit.id); // The issue might be here
      setIsEditUserModalOpen(true);
    }
  }


  // Handler to close the edit modal
  const handleCloseEditModal = () => {
    setIsEditUserModalOpen(false);
    setSelectedUserId(null);
  };

  // Callback after user is updated via the edit modal
  const handleUserUpdated = () => {
    // You can optimistically update the UI or refetch all users
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

  return (
    <div className="flex h-screen bg-black/95">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6 overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-black/40 p-6 rounded-2xl backdrop-blur-sm">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome Back, <span className="text-green-500">Admin</span>
            </h1>
          </div>
          <div className="text-center backdrop-blur-md bg-black/20 p-4 rounded-xl">
            <div className="text-3xl font-bold text-white mb-1">
              {currentTime.toLocaleDateString()}
            </div>
            <div className="text-2xl text-green-500">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <button
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black flex items-center gap-2"
            onClick={handleAddUser}
          >
            <Plus size={20} />
            Add User
          </button>

          <select
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black"
            value={employmentFilter}
            onChange={(e) => setEmploymentFilter(e.target.value)}
          >
            <option value="Employee">Employees</option>
            <option value="Intern">Interns</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by ID, name, or email..."
              className="w-full bg-black/40 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-black/40 rounded-2xl overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-green-500 text-xl">Loading users...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/60 text-gray-300">
                    <th className="py-4 px-6 text-left">Employee ID</th>
                    <th className="py-4 px-6 text-left">Name</th>
                    <th className="hidden md:table-cell py-4 px-6 text-left">Email</th>
                    <th className="hidden md:table-cell py-4 px-6 text-left">Role</th>
                    <th className="hidden md:table-cell py-4 px-6 text-left">Status</th>
                    <th className="py-4 px-6 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {currentUsers.map((user) => (
                    <tr key={user.employeeId} className="transition-colors hover:bg-black/40">
                      <td className="py-4 px-6">
                        <span className="text-green-500 font-medium">{user.employeeId}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-white font-medium">{user.name}</div>
                      </td>
                      <td className="hidden md:table-cell py-4 px-6 text-gray-300">{user.email}</td>
                      <td className="hidden md:table-cell py-4 px-6 text-gray-300">
                        {user.isAdmin ? 'Admin' : 'User'}
                      </td>
                      <td className="hidden md:table-cell py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.employment_status === 'Employee'
                          ? 'bg-green-500/20 text-green-500'
                          : user.employment_status === 'Intern'
                            ? 'bg-blue-500/20 text-blue-500'
                            : 'bg-gray-500/20 text-gray-400'
                          }`}>
                          {user.employment_status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          onClick={() => handleEditUser(user.employeeId)}
                        >
                          Edit
                        </button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="bg-black/60 py-4 px-6 flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${currentPage === index + 1
                    ? 'bg-green-600 text-white'
                    : 'bg-black/40 text-gray-400 hover:bg-black/60'
                  }
                `}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseModal}
        onUserAdded={handleUserAdded}
      />

      {/* Edit User Modal */}
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
