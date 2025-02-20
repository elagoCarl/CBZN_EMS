import React, { useState } from 'react';
import bg2 from './img/editbg.png';
import logo from './img/CBZN-Logo.png';
import three from './img/three-lines.png';

const AdminAttendance = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('Admin');

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const handleSelect = (option) => {
        setSelectedOption(option);
        setDropdownOpen(false);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `url(${bg2})`,
                width: '100vw',
                height: '100vh',
            }}
        >
            <nav className="fixed top-0 left-0 w-full flex items-center justify-between bg-black p-8 z-50">
                {/* Logo */}
                <div className="flex items-center flex-shrink-0 ml-8">
                    <img className="w-full" src={logo} alt="CBZN Logo" />
                </div>

                {/* Menu Button */}
                <div className="flex items-center">
                    <div className="p-2 rounded-lg transition-colors hover:bg-gray-800 mr-8">
                        <img className="w-12 h-12" src={three} alt="Menu" />
                    </div>
                </div>
            </nav>

            {/* Dropdown and Table Container */}
            <div className="w-full max-w-6xl">
                {/* Dropdown Button on the Right */}
                <div className="flex justify-end mb-4 pr-14.5">
                    <div className="relative">
                    <span className="ml-4 text-[#4E9F48] text-xl font-bold">Attendance</span>
                        <button
                            className="bg-[#4E9F48] text-white px-12 py-2 rounded-4xl hover:bg-green-700"
                            onClick={toggleDropdown}
                        >
                            {selectedOption}
                        </button>
                        {dropdownOpen && (
                            <ul className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                                <li className="px-4 py-2 hover:bg-[#4E9F48] cursor-pointer" onClick={() => handleSelect('Admin')}>
                                    Admin
                                </li>
                                <li className="px-4 py-2 hover:bg-[#4E9F48] cursor-pointer" onClick={() => handleSelect('Employee')}>
                                    Employee
                                </li>
                            </ul>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="flex justify-center">
                    <div className="bg-white bg-opacity-100 shadow-lg w-full max-w-3xl">
                        <table className="table-auto w-full border-collapse">
                            <thead>
                                <tr style={{ backgroundColor: '#555454', color: '#ffffff' }}>
                                    <th className="px-8 py-4">Day</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4">Time Stamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="text-center">
                                    <td className="p-4">Wednesday</td>
                                    <td className="p-4">Present</td>
                                    <td className="p-4">Feb 04, 2025 8:59 AM </td>
                                </tr>
                                <tr className="bg-gray-200 text-center">
                                    <td className="p-4">Tuesday</td>
                                    <td className="p-4">Present</td>
                                    <td className="p-4">Feb 03, 2025 7:59 AM</td>
                                </tr>
                                <tr className="text-center">
                                    <td className="p-4">Monday</td>
                                    <td className="p-4">Absent</td>
                                    <td className="p-4">Feb 02, 2025 00:00:00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAttendance;