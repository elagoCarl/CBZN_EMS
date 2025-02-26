import { useState, useRef, useEffect } from 'react';
import logo from '../Img/CBZN-Logo.png';

const Sidebar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedItem, setExpandedItem] = useState(null);
    const profileRef = useRef(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Handle screen resize and close mobile menu on larger screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu when clicking on overlay
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Toggle dropdown menu
    const toggleDropdown = (itemName) => {
        setExpandedItem(expandedItem === itemName ? null : itemName);
    };

    // Navigation items with icons
    const navigationItems = [
        { name: 'My Attendance', icon: '📅' },
        { name: 'Attendance List', icon: '📋' },
        { name: 'Manage Users', icon: '👥' },
        { name: 'Account Settings', icon: '⚙️' },
        {
            name: 'Requests',
            icon: '📝',
            subItems: ['OT Request', 'Leave Request', 'Time Adjustments', 'Schedule Change']
        },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className={`md:hidden fixed top-5 ${isMobileMenuOpen ? 'left-44' : 'left-4'} z-50 p-2 rounded-lg w-10 h-10 flex flex-col justify-center items-center gap-1.5 transition-all duration-300 cursor-pointer bg-gray-800`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
            >
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Container */}
            <div className="md:block">
                <aside
                    className={`
                        fixed md:relative w-64 bg-black flex flex-col min-h-screen 
                        transition-all duration-300 ease-in-out z-45
                        md:translate-x-0 
                        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                        shadow-lg
                    `}
                    aria-label="Sidebar navigation"
                >
                    {/* Logo Section */}
                    <div className="p-6 border-b border-[#363636]">
                        <div className="w-full flex justify-baseline items-center">
                            <img src={logo} alt="CBZN Logo" className="h-8 w-auto" />
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 px-4 py-6 overflow-y-auto">
                        <ul className="space-y-4 text-sm font-semibold">
                            {navigationItems.map((item) => (
                                <li key={item.name}>
                                    {!item.subItems ? (
                                        <a
                                            href="#"
                                            className="flex items-center gap-3 px-3 py-2 text-white hover:text-green-500 hover:bg-gray-900 rounded-md transition-all duration-200"
                                            onClick={closeMobileMenu}
                                        >
                                            <span className="text-lg">{item.icon}</span>
                                            <span>{item.name}</span>
                                        </a>
                                    ) : (
                                        <div>
                                            <button
                                                className="w-full flex items-center justify-between gap-3 px-3 py-2 text-white hover:text-green-500 hover:bg-gray-900 rounded-md transition-all duration-200"
                                                onClick={() => toggleDropdown(item.name)}
                                                aria-expanded={expandedItem === item.name}
                                                aria-controls={`dropdown-${item.name}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{item.icon}</span>
                                                    <span>{item.name}</span>
                                                </div>
                                                <svg
                                                    className={`w-4 h-4 transition-transform duration-200 ${expandedItem === item.name ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {/* Dropdown Menu */}
                                            <div
                                                id={`dropdown-${item.name}`}
                                                className={`
                                                    mt-1 ml-8 space-y-1 overflow-hidden transition-all duration-300
                                                    ${expandedItem === item.name ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
                                                `}
                                            >
                                                {item.subItems.map((subItem) => (
                                                    <a
                                                        key={subItem}
                                                        href="#"
                                                        className="block text-sm text-gray-300 hover:text-green-500 hover:bg-gray-900 px-3 py-2 rounded-md transition-all duration-200"
                                                        onClick={closeMobileMenu}
                                                    >
                                                        {subItem}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Profile Section */}
                    <div className="p-4 border-t border-[#363636] relative" ref={profileRef}>
                        <button
                            className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-900 transition-all duration-200"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            aria-expanded={isProfileOpen}
                            aria-haspopup="true"
                        >
                            <div className="w-10 h-10 bg-[#363636] rounded-full flex items-center justify-center text-white">
                                A
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-white font-medium">ADMIN</span>
                                <span className="text-gray-400 text-xs">ADMIN@CBZN.COM</span>
                            </div>
                        </button>

                        {/* Profile Dropdown */}
                        {isProfileOpen && (
                            <div className="absolute left-4 right-4 bottom-full mb-2 bg-[#2b2b2b] text-white rounded-lg shadow-lg overflow-hidden">
                                <button
                                    className="w-full text-left px-4 py-3 hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
                                    onClick={() => {
                                        setIsProfileOpen(false);
                                        closeMobileMenu();
                                    }}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </>
    );
};

export default Sidebar;