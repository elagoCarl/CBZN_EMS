import  { useState, useEffect } from 'react';
import employbg from './img/employeeHome.png';
import TopMenu from './callComponents/topMenu';


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
                {parts[0]}<span className="text-green-500">/</span>{parts[1]}<span className="text-green-500">/</span>{parts[2]}
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
            <span className="text-white bg-black/40 rounded-3xl px-6 sm:px-8">
                {time} <span className="text-green-500">{period}</span>
            </span>
        );
    };

    return (
        <div className="bg-fixed bg-cover bg-no-repeat bg-center min-h-screen w-screen flex flex-col overflow-x-hidden opacity-100"
            style={{ backgroundImage: `url(${employbg})` }}>
            {/* Navbar */}
            <TopMenu />

            {/* Main Content */}
            <div className="flex flex-1 flex-col items-center px-4 sm:px-8 w-full lg:flex-row  text-center lg:text-left">
                {/* Left Section */}
                <div className="flex flex-col items-center justify-center p-4 sm:p-6 m-2 sm:m-4 w-full lg:w-1/2">
                    <div className="text-[clamp(2rem,6vw,6rem)] font-bold mb-4 text-white">
                        {formatDate(currentTime)}
                    </div>
                    <div className="text-[clamp(1.5rem,4vw,4rem)]">
                        {formatTime(currentTime)}
                    </div>

                    <button className="bg-green-600 text-white w-full sm:w-auto px-8 py-2 rounded-3xl mt-4 hover:bg-green-700 transition-colors text-[clamp(1rem,3vw,2rem)]">
                        TIME-IN
                    </button>
                    <button className="text-white w-full sm:w-auto px-6 py-2 rounded-3xl mt-2 bg-black/40 hover:bg-black/80 transition-colors text-[clamp(1rem,3vw,2rem)]">
                        TIME-OUT
                    </button>
                </div>

                {/* Right Section */}
                <div className="flex flex-auto items-center justify-center text-[clamp(1.5rem,4vw,3rem)] font-semibold text-white mt-6 lg:mt-0">
                    Welcome, <span className="text-green-500 ml-2">Name</span>
                </div>
            </div>
        </div>
    );
};

export default EmployeeHome;
