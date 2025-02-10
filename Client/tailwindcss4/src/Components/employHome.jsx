import React, { useState, useEffect } from 'react'
import three from './img/three-lines.png';
import logo from './img/CBZN-Logo.png';
import employbg from './img/employeeHome.png';

const EmployeeHome = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        const parts = date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        }).split('/');
        return (
            <span>
                {parts[0]}
                <span className="text-green-500">/</span>
                {parts[1]}
                <span className="text-green-500">/</span>
                {parts[2]}
            </span>
        );
    };

    const formatTime = (date) => {
        const timeString = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        const [time, period] = timeString.split(' ');
        return (
            <span className="text-white bg-black/40 backdrop-blur-md rounded-3xl px-8">
                {time} <span className="text-green-500">{period}</span>
            </span>
        );
    };

    return (
        <div
            className="bg-fixed bg-cover bg-no-repeat bg-center min-h-screen w-screen flex flex-col overflow-x-hidden"
            style={{ backgroundImage: `url(${employbg})` }}
        >
            {/* Navbar */}
            <nav className="flex items-center justify-between bg-black p-8 flex-shrink-0">
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

            {/* Main Content */}
            <div className="flex flex-1 items-center px-8 w-full md:flex flex-col xs:flex-col sm:flex-row">
                {/* Left Section */}
                <div className="flex flex-auto flex-col items-center justify-center">
                    {/* Date and Time */}
                    <div className="xl:text-8xl md:text-6xl sm:text-6xl xs:text-3xl font-bold mb-4 text-white">
                        {formatDate(currentTime)}
                    </div>
                    <div className="px-4 py-2 mb-8 sm:text-4xl md:text-5xl lg:text-6xl">
                        {formatTime(currentTime)}
                    </div>

                    {/* Time-in Button */}
                    <button className="bg-green-600 text-white px-10 py-2 rounded-3xl mb-1 hover:bg-green-700 transition-colors text-4xl z-20">
                        TIME-IN
                    </button>

                    {/* Time-out Button */}
                    <button className="text-white px-6 py-2 rounded-3xl z-[10] hover:bg-black/80 transition-colors text-4xl bg-black/40 backdrop-blur-md font-extralight">
                        TIME-OUT
                    </button>
                </div>

                {/* Right Section */}
                <div className="flex flex-auto items-center gap-2 justify-center text-6xl font-semibold text-white">Welcome, 
                    <span className="text-green-500">Name</span>
                </div>
            </div>
        </div>
    );
};

export default EmployeeHome;