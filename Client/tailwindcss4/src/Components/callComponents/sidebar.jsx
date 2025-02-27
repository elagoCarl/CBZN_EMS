import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../Img/CBZN-Logo.png';
import axios from 'axios';
import { 
  LogOut, 
  Calendar, 
  ClipboardList, 
  Users, 
  Settings, 
  FileText,
  ChevronRight
} from 'lucide-react'; 

const Sidebar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedItem, setExpandedItem] = useState(null);
    const profileRef = useRef(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userRole, setUserRole] = useState(false);
    const [userData, setUserData] = useState(null); // Store user details
    const navigate = useNavigate();
    const location = useLocation();


    useEffect(() => {
    const userId = 7; // Replace with actual user ID from auth context or localStorage

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/users/getUser/${userId}`);
            if (response.data && response.data.successful) {
                const user = response.data.data;
                setUserData(user);

                // Ensure isAdmin is a boolean
                setUserRole(user.isAdmin === "true" || user.isAdmin === true);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    if (userId) fetchUserData();
}, []);

    // // Retrieve user from localStorage
    // useEffect(() => {
    //     const user = JSON.parse(localStorage.getItem("user"));
    //     if (user) {
    //         setUserRole(user.isAdmin);
    //     }
    // }, []);

    // Fetch user data (Ensure userId is properly set)

    // Close mobile menu when clicking outside or resizing
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

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const toggleDropdown = (itemName) => {
        setExpandedItem(expandedItem === itemName ? null : itemName);
    };

    const handleNavigation = (path) => {
        navigate(path);
        closeMobileMenu();
    };

    const handleLogout = () => {
        localStorage.removeItem("user"); // Clear user data
        setIsProfileOpen(false);
        navigate('/'); // Redirect to login
    };

    const isActive = (path) => location.pathname.startsWith(path);

    // Get the icon component based on name
    const getIcon = (name) => {
        switch (name) {
            case 'My Attendance':
                return <Calendar size={18} />;
            case 'Attendance List':
                return <ClipboardList size={18} />;
            case 'Manage Users':
                return <Users size={18} />;
            case 'Account Settings':
                return <Settings size={18} />;
            case 'Requests':
                return <FileText size={18} />;
            default:
                return <FileText size={18} />;
        }
    };

    // Navigation Items
    const adminNavigation = [
        { name: 'My Attendance', path: '/myAttendance' },
        { name: 'Attendance List', path: '/adminAttendance' },
        { name: 'Manage Users', path: '/manageUsers' },
        { name: 'Account Settings', path: '/accSettings' },
        {
            name: 'Requests',
            subItems: [
                { name: 'OT Request', path: '/requests/overtime' },
                { name: 'Leave Request', path: '/requests/leave' },
                { name: 'Time Adjustments', path: '/requests/time-adjustments' },
                { name: 'Schedule Change', path: '/requests/schedule-change' }
            ]
        }
    ];

    const employeeNavigation = [
        { name: 'My Attendance', path: '/myAttendance' },
        { name: 'Account Settings', path: '/accSettings' },
        {
            name: 'Requests',
            subItems: [
                { name: 'OT Request', path: '/requests/overtime' },
                { name: 'Leave Request', path: '/requests/leave' },
                { name: 'Time Adjustments', path: '/requests/time-adjustments' },
                { name: 'Schedule Change', path: '/requests/schedule-change' }
            ]
        }
    ];

   const navigationItems = userRole ? adminNavigation : employeeNavigation;


    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className={`md:hidden fixed top-8 ${isMobileMenuOpen ? 'left-50' : 'left-4'} z-50 p-2 rounded-lg w-10 h-10 flex flex-col justify-center items-center gap-1.5 transition-all duration-300 cursor-pointer`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
            >
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>

            {/* Sidebar Container */}
            <aside
                className={`fixed md:relative w-64 bg-black flex flex-col min-h-screen transition-all duration-300 ease-in-out z-45 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-lg`}
                aria-label="Sidebar navigation"
            >
                {/* Logo Section */}
                <div className="p-8 border-b border-[#363636]">
                    <img src={logo} alt="CBZN Logo" className="h-8 w-auto cursor-pointer" onClick={() => handleNavigation('/')} />
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto">
                    <ul className="space-y-4 text-sm font-semibold">
                    {navigationItems.map((item) => (
                        <li key={item.name} className="relative">
                            <button
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all duration-300 ${isActive(item.path) ? 'text-green-500' : 'text-white hover:text-green-500 cursor-pointer'}`}
                                onClick={() => item.subItems ? toggleDropdown(item.name) : handleNavigation(item.path)}
                            >
                                <div className="flex items-center gap-3">
                                    {getIcon(item.name)}
                                    <span className="text-left">{item.name}</span>
                                </div>
                                {item.subItems && (
                                    <ChevronRight 
                                        size={16} 
                                        className={`text-white transition-transform duration-300 ${expandedItem === item.name ? 'rotate-90' : ''}`} 
                                    />
                                )}
                            </button>

                            {item.subItems && expandedItem === item.name && (
                                <ul className="ml-8 mt-2 space-y-2">
                                    {item.subItems.map((subItem) => (
                                        <li key={subItem.name}>
                                            <button
                                                className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-green-500 transition-all duration-300 cursor-pointer"
                                                onClick={() => handleNavigation(subItem.path)}
                                            >
                                                - {subItem.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
                </nav>

                {/* Profile Section */}
                <div className="p-4 border-t border-[#363636] relative" ref={profileRef}>
                    <button
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-md transition-all duration-300 cursor-pointer"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        aria-expanded={isProfileOpen}
                        aria-haspopup="true"
                    >
                        <div className="w-10 h-10 bg-[#363636] rounded-full flex items-center justify-center text-white">
                            {userData ? userData.name[0].toUpperCase() : 'A'}
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-white font-medium">{userData ? userData.name : 'ADMIN'}</span>
                            <span className="text-gray-400 text-xs">{userData ? userData.email : 'ADMIN@CBZN.COM'}</span>
                        </div>
                    </button>

                    {/* Profile Dropdown */}
                {isProfileOpen && (
                    <div className="absolute left-4 right-4 bottom-full mb-2 text-white rounded-lg shadow-lg cursor-pointer">
                        <button
                            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-600 rounded-lg cursor-pointer duration-300"
                            onClick={handleLogout}
                        >
                            <LogOut size={16} />
                            Log Out
                        </button>
                    </div>
                )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;