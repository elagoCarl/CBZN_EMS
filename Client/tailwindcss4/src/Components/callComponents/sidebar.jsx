import { useState, useRef, useEffect } from 'react';
import logo from '../Img/CBZN-Logo.png';


const Sidebar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileRef = useRef(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-black text-white w-10 h-10 flex flex-col justify-center items-center gap-1.5"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:relative w-64 bg-black flex flex-col min-h-screen 
                transition-transform duration-300 ease-in-out z-40
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo Section */}
                `<div className="p-6">
                    <div className="w-full flex justify-center items-center">
                        <img src={logo} alt="Logo" className="h-12 w-auto" />
                    </div>
                </div>`

                {/* Navigation Links */}
                <nav className="flex-1 flex flex-col justify-center px-4">
                    <div className="space-y-8 text-xl cursor-pointer font-semibold">
                        {['Home', 'Attendance', 'Manage Users', 'Reports', 'Settings', 'Help'].map((item) => (
                            <div key={item} className="flex justify-center">
                                <a
                                    href="#"
                                    className="text-white hover:text-green-600 duration-300"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item}
                                </a>
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Profile Section */}
                <div className="p-4 border-t border-[#363636] relative" ref={profileRef}>
                    <div
                        className="flex items-center gap-2 text-sm cursor-pointer"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        <div className="w-8 h-8 bg-[#363636] rounded-full flex items-center justify-center text-white">
                            A
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white">ADMIN</span>
                            <span className="text-gray-400 text-xs">ADMIN@CBZN@GMAIL.COM</span>
                        </div>
                    </div>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                        <div className="absolute right-6 bottom-full mb-2 w-40 bg-[#2b2b2b] text-white p-2 rounded-lg shadow-md">
                            <button
                                className="w-full text-left px-3 py-2 hover:bg-red-600 rounded duration-300"
                                onClick={() => {
                                    setIsProfileOpen(false);
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                Log Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;