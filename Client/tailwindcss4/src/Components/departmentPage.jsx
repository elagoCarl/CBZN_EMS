import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../Components/Img/CBZN-Logo.png';

const DeptPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [filterStatus, setFilterStatus] = useState('active');

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine number of departments per page based on screen size
  const deptsPerPage = windowWidth < 768 ? 5 : 11;

  // Department data with status
  const departments = [
    { id: 'D001', name: 'Marketing', status: true },
    { id: 'D002', name: 'Human Resources', status: true },
    { id: 'D003', name: 'Information Technology', status: false },
    { id: 'D004', name: 'Finance', status: true },
    { id: 'D005', name: 'Operations', status: false },
    { id: 'D006', name: 'Research & Development', status: true },
    { id: 'D007', name: 'Customer Support', status: false },
    { id: 'D008', name: 'Legal', status: true },
    { id: 'D009', name: 'Production', status: true },
    { id: 'D010', name: 'Quality Assurance', status: false },
  ];

  // Filter departments based on status
  const filteredDepts = departments.filter(dept => {
    if (filterStatus === 'active') return dept.status === true;
    if (filterStatus === 'inactive') return dept.status === false;
    return true; // 'all' option
  });

  const indexOfLastDept = currentPage * deptsPerPage;
  const indexOfFirstDept = indexOfLastDept - deptsPerPage;
  const currentDepts = filteredDepts.slice(indexOfFirstDept, indexOfLastDept);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

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
        {/* Logo */}
        <div className="mb-8">
          <div className="w-full text-white p-4 flex justify-center items-center">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
          </div>
        </div>

        <div className="flex flex-col h-screen justify-center items-center space-y-4">
          <nav className="w-full space-y-4 text-center font-semibold text-base">
            <div className="text-white hover:bg-gray-900 px-4 py-2 rounded cursor-pointer">Home</div>
            <div className="text-white hover:bg-gray-900 px-4 py-2 rounded cursor-pointer">Attendance</div>
            <div className="text-white hover:bg-gray-900 px-4 py-2 rounded cursor-pointer">Manage Departments</div>
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
      <div className="flex-1 p-4 md:p-6 flex flex-col justify-center">
        {/* Status Filter */}
        <div className="flex justify-start mb-6">
          <div className="font-semibold">
            <select 
              className="bg-green-600 text-white px-3 md:px-4 py-1 md:py-2 rounded text-sm md:text-base hover:bg-green-800 duration-300"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option className='bg-white text-black' value="active">Active</option>
              <option className='bg-white text-black' value="inactive">Inactive</option>
              <option className='bg-white text-black' value="all">All</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="bg-[#363636] rounded-lg overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#2b2b2b] z-10">
                  <tr>
                    <th className="text-[#4E9F48] py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">ID</th>
                    <th className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">Department Name</th>
                    <th className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">Status</th>
                    <th className="text-white py-2 md:py-3 px-2 md:px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentDepts.map((dept) => (
                    <tr key={dept.id} className="border-b border-[#2b2b2b] hover:bg-[#404040]">
                      <td className="text-[#4E9F48] py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">{dept.id}</td>
                      <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">{dept.name}</td>
                      <td className="text-white py-2 md:py-3 px-2 md:px-4 text-sm md:text-base text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${dept.status ? 'bg-green-600' : 'bg-red-600'}`}>
                          {dept.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
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

          {/* Pagination */}
          <div className="bg-[#2b2b2b] py-2 px-2 md:px-4 mt-auto flex justify-center gap-1">
            {Array.from({ length: Math.ceil(filteredDepts.length / deptsPerPage) }).map((_, index) => (
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

export default DeptPage;