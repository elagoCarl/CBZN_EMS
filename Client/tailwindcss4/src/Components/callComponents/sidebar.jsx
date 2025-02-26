import { useState, useRef, useEffect } from 'react';
import logo from '../Img/CBZN-Logo.png';

const Sidebar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isRequestsOpen, setIsRequestsOpen] = useState(false);
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

    const navigationItems = [
        'My Attendance',
        'Attendance List',
        'Manage Users',
        'Account Settings',
        {
            name: 'Requests',
            subItems: ['OT Request', 'Leave Request', 'Time Adjustments', 'Schedule Change']
        },
        
    ];

    return (
        <>
            {/* Mobile Menu Button - Moved to be part of the sidebar */}
            <button
                className={`md:hidden fixed top-5.5 ${isMobileMenuOpen ? 'left-42' : 'left-4'} z-50 p-2 rounded-lg w-10 h-10 flex flex-col justify-center items-center gap-1.5 transition-all duration-300 cursor-pointer `}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className="md:block">
                {/* Sidebar */}
                <div className={`
                    fixed md:relative w-55 bg-black flex flex-col min-h-screen 
                    transition-all duration-300 ease-in-out z-40
                    md:translate-x-0 left-0
                    ${isMobileMenuOpen 
                        ? 'translate-x-0'
                        : '-translate-x-full'
                    }
                `}>
                    {/* Logo Section */}
                    <div className="p-6">
                        <div className="w-full flex justify-baseline items-center">
                            <img src={logo} alt="Logo" className="h-8 w-auto" />
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 px-4 py-4">
                        <div className="space-y-7 text-sm cursor-pointer font-semibold duration-200 ml-3">
                            {navigationItems.map((item, index) => (
                                <div key={typeof item === 'string' ? item : item.name}>
                                    {typeof item === 'string' ? (
                                        <div className="flex justify-start">
                                            <a
                                                href="#"
                                                className="text-white hover:text-green-600 duration-300"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                {item}
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-start">
                                            <button
                                                className="text-white hover:text-green-600 duration-300"
                                                onClick={() => setIsRequestsOpen(!isRequestsOpen)}
                                            >
                                                {item.name}
                                            </button>
                                            {/* Dropdown Menu */}
                                            <div className={`
                                                mt-2 space-y-1 overflow-hidden transition-all duration-300
                                                ${isRequestsOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
                                            `}>
                                                {item.subItems.map((subItem) => (
                                                    <a
                                                        key={subItem}
                                                        href="#"
                                                        className="block text-sm text-gray-300 hover:text-green-600 duration-300 py-1"
                                                        onClick={() => {
                                                            setIsMobileMenuOpen(false);
                                                            setIsRequestsOpen(false);
                                                        }}
                                                    >
                                                        {subItem}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
                            <div className="w-8 h-auto bg-[#363636] rounded-full flex items-center justify-center text-white">
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
            </div>
        </>
    );
};

export default Sidebar;