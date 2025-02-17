import React, { useState, useEffect, useRef } from "react";
import AdminBg from "./Img/admEMS.png";
import three from "./img/three-lines.png";
import logo from "./img/CBZN-Logo.png";
import axios from 'axios';

const AdminEms = () => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const filterDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  const toggleFilterDropdown = () => {
    setIsFilterDropdownOpen((prev) => !prev);
    setIsStatusDropdownOpen(false); // Close status dropdown when opening filter dropdown
  };

  const toggleStatusDropdown = () => {
    setIsStatusDropdownOpen((prev) => !prev);
    setIsFilterDropdownOpen(false); // Close filter dropdown when opening status dropdown
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setIsFilterDropdownOpen(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="flex flex-col bg-cover bg-no-repeat bg-center min-h-screen w-screen"
      style={{ backgroundImage: `url(${AdminBg})` }}
    >
      <nav className="flex items-center justify-between bg-black p-8">
        <div className="flex items-center flex-shrink-0 ml-8">
          <img className="w-full" src={logo} alt="CBZN Logo" />
        </div>
        <div className="flex items-center">
          <div className="p-2 rounded-lg transition-colors hover:bg-gray-800 mr-8">
            <img className="w-12 h-12" src={three} alt="Menu" />
          </div>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center flex-1 px-4">
        <div className="w-full max-w-4xl">
          {/* Filter & Status Buttons */}
          <div className="flex justify-start mb-4 space-x-2">
            {/* Filter Button */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={toggleFilterDropdown}
                className="text-white bg-green-600 hover:bg-green-800 duration-300 focus:ring-1 focus:outline-none focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
                type="button"
              >
                Filter
                <svg
                  className="w-2.5 h-2.5 ml-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
              {isFilterDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 z-10 bg-gray-500 divide-y divide-gray-600 rounded-lg w-44">
                  <ul className="py-2 text-sm text-gray-200">
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-600 hover:text-white"
                      >
                        Creatives
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-600 hover:text-white"
                      >
                        HR
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Status Button */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={toggleStatusDropdown}
                className="text-white bg-green-600 hover:bg-green-800 duration-300 focus:ring-1 focus:outline-none focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
                type="button"
              >
                Status
                <svg
                  className="w-2.5 h-2.5 ml-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 z-10 bg-gray-500 divide-y divide-gray-600 rounded-lg w-44">
                  <ul className="py-2 text-sm text-gray-200">
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-600 hover:text-white"
                      >
                        Active
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-600 hover:text-white"
                      >
                        Archive
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto shadow-md rounded-2xl">
            <table className="w-full text-xl text-center text-gray-300">
              <thead className="text-md uppercase bg-black/80 text-gray-300 border-b border-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4 text-green-500">
                    USER ID
                  </th>
                  <th scope="col" className="px-6 py-4 text-gray-300">Name</th>
                  <th scope="col" className="px-6 py-4 text-gray-300">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-4 text-gray-300">
                    Job Title
                  </th>
                  <th scope="col" className="px-6 py-4 text-gray-300">
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    id: "EMP001",
                    name: "John Doe",
                    dept: "Development",
                    title: "Web Developer",
                  },
                  {
                    id: "EMP002",
                    name: "Sarah Smith",
                    dept: "Design",
                    title: "UI/UX Designer",
                  },
                  {
                    id: "EMP003",
                    name: "Mike Johnson",
                    dept: "Marketing",
                    title: "Content Manager",
                  },
                  {
                    id: "EMP003",
                    name: "Mike Johnson",
                    dept: "Marketing",
                    title: "Content Manager",
                  },
                ].map((employee) => (
                  <tr key={employee.id} className="bg-black/80">
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-300 whitespace-nowrap"
                    >
                      {employee.id}
                    </th>
                    <td className="px-6 py-4 text-gray-300">{employee.name}</td>
                    <td className="px-6 py-4 text-gray-300">{employee.dept}</td>
                    <td className="px-6 py-4 text-gray-300">{employee.title}</td>
                     <td className="px-6 py-4">
                      <button
                        className="text-white bg-green-600 hover:bg-green-800 duration-300 px-4 py-1 rounded-xl cursor-pointer"
                        onClick={() => alert(`Editing ${employee.name}`)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEms;
