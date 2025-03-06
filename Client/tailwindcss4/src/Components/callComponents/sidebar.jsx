import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from '../Img/CBZN-Logo.png';
import {
    Calendar, ClipboardList, Users, Settings, FileText, Clock, CalendarDays,
    CalendarClock, CalendarRange, ChevronDown, LogOut, Menu, X
} from 'lucide-react';
// Import AuthContext hook (adjust the path if needed)
import { useAuth } from '../../Components/authContext'; // adjust the path as needed

const Sidebar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedItem, setExpandedItem] = useState(null);
    const profileRef = useRef(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, setUser } = useAuth(); // Get logged-in user data

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

    // Handle navigation
    const handleNavigation = (path) => {
        navigate(path);
        closeMobileMenu();
    };

    // Check if a path is active
    const isActive = (path) => location.pathname === path;

    // Neutral icon color
    const iconColor = "#9ca3af";

    // Navigation items with Lucide icons and paths
    const navigationItems = [
        { name: 'My Attendance', icon: <Calendar size={20} color={iconColor} />, path: '/myAttendance' },
        { name: 'Attendance List', icon: <ClipboardList size={20} color={iconColor} />, path: '/attendanceList' },
        { name: 'Manage Users', icon: <Users size={20} color={iconColor} />, path: '/manageUsers' },
        { name: 'Account Settings', icon: <Settings size={20} color={iconColor} />, path: '/accSettings' },
        {
            name: 'Requests',
            icon: <FileText size={20} color={iconColor} />,
            subItems: [
                { name: 'OT Request', path: '/overtimeReqPage', icon: <Clock size={18} color={iconColor} /> },
                { name: 'Leave Request', path: '/leaveReqPage', icon: <CalendarDays size={18} color={iconColor} /> },
                { name: 'Time Adjustments', path: '/timeAdjustmentPage', icon: <CalendarClock size={18} color={iconColor} /> },
                { name: 'Schedule Change', path: '/scheduleChangePage', icon: <CalendarRange size={18} color={iconColor} /> }
            ]
        },
    ];

    // Logout function integrated into Sidebar
    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:8080/users/logoutUser", {}, { withCredentials: true });
            // Clear the AuthContext on logout
            setUser(null);
            navigate('/'); // Redirect to login page after logout
        } catch (error) {
            console.error("Error logging out:", error);
            // Optionally display an error notification
        }
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className={`md:hidden fixed top-5 ${isMobileMenuOpen ? 'left-44' : 'left-4'} z-50 p-2 rounded-lg w-10 h-10 flex justify-center items-center transition-all duration-300 cursor-pointer bg-gray-800`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
            >
                {isMobileMenuOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
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
                        <div className="w-full flex justify-baseline items-center cursor-pointer" onClick={() => handleNavigation('/')}>
                            <img src={logo} alt="CBZN Logo" className="h-8 w-auto" />
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 px-4 py-6 overflow-y-auto">
                        <ul className="space-y-4 text-sm font-semibold">
                            {navigationItems.map((item) => (
                                <li key={item.name}>
                                    {!item.subItems ? (
                                        <button
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 
                        ${isActive(item.path)
                                                    ? 'text-green-500 bg-gray-900'
                                                    : 'text-white hover:text-green-500 hover:bg-gray-900'}`}
                                            onClick={() => handleNavigation(item.path)}
                                        >
                                            {item.icon}
                                            <span className="text-left">{item.name}</span>
                                        </button>
                                    ) : (
                                        <div>
                                            <button
                                                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md transition-all duration-200
                          ${item.subItems.some(subItem => isActive(subItem.path))
                                                        ? 'text-green-500 bg-gray-900'
                                                        : 'text-white hover:text-green-500 hover:bg-gray-900'}`}
                                                onClick={() => toggleDropdown(item.name)}
                                                aria-expanded={expandedItem === item.name}
                                                aria-controls={`dropdown-${item.name}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.icon}
                                                    <span>{item.name}</span>
                                                </div>
                                                <ChevronDown
                                                    size={16}
                                                    color={iconColor}
                                                    className={`transition-transform duration-200 ${expandedItem === item.name ? 'rotate-180' : ''}`}
                                                />
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
                                                    <button
                                                        key={subItem.name}
                                                        className={`w-full text-left flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-all duration-200
                              ${isActive(subItem.path)
                                                                ? 'text-green-500 bg-gray-900'
                                                                : 'text-gray-300 hover:text-green-500 hover:bg-gray-900'}`}
                                                        onClick={() => handleNavigation(subItem.path)}
                                                    >
                                                        {subItem.icon}
                                                        <span>{subItem.name}</span>
                                                    </button>
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
                                {user && user.first_name ? user.first_name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-white font-medium">
                                    {user ? `${user.first_name || ''} ${user.surname || ''}`.trim() : "ADMIN"}
                                </span>
                                <span className="text-gray-400 text-xs">
                                    {user?.email || "ADMIN@CBZN.COM"}
                                </span>
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
                                        handleLogout();
                                    }}
                                >
                                    <LogOut size={16} color={iconColor} />
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
