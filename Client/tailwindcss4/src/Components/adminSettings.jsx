import { useState, useEffect } from 'react';
import { Menu, X, Eye, EyeOff } from 'lucide-react';
import logo from '../Components/Img/CBZN-Logo.png';

const AdminSettings = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const setWindowWidth = useState(window.innerWidth);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [profilePic, setProfilePic] = useState(null);
    const [email, setEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            <div className="text-center">
                {parts[0]}<span className="text-green-500">/</span>{parts[1]}<span className="text-green-500">/</span>{parts[2]}
            </div>
        );
    };

    const formatTime = (date) => {
        const timeString = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        const [time, period] = timeString.split(' ');
        return (
            <span className="text-white bg-black/40 rounded-xl px-4 sm:px-5 flex flex-1 items-center justify-center">
                {time} <span className="text-green-500 ml-2">{period}</span>
            </span>
        );
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEmailChange = () => {
        console.log('Changes saved:', { email });
    };

    const handlePasswordChange = () => {
        console.log('Password changed:', { oldPassword, newPassword, confirmPassword });
    };

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
                <div className="mb-8">
                    <div className="w-full text-white p-4 flex justify-center items-center">
                        <img src={logo} alt="Logo" className="h-8 w-auto" />
                    </div>
                </div>

                <div className="flex flex-col h-screen justify-center items-center space-y-4">
                    <nav className="w-full space-y-4 text-center font-semibold text-base">
                        <div className="text-white hover:bg-gray-900 px-4 py-2 rounded cursor-pointer">Home</div>
                        <div className="text-white hover:bg-gray-900 px-4 py-2 rounded cursor-pointer">Attendance</div>
                        <div className="text-white hover:bg-gray-900 px-4 py-2 rounded cursor-pointer">Manage Users</div>
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
            <div className="flex-1 p-4 md:p-6 flex flex-col">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-xl md:text-5xl text-white mb-4 md:mb-0">
                        Account <span className="text-green-500">Settings</span>
                    </h1>
                    <div className="flex flex-col items-center">
                        <div className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 text-white">
                            {formatDate(currentTime)}
                        </div>
                        <div className="text-lg md:text-[clamp(1.5rem,4vw,4rem)]">
                            {formatTime(currentTime)}
                        </div>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="bg-[#363636] rounded-lg overflow-hidden flex-1">
                    <div className="p-8 flex-1 flex-col md:flex-row gap-8">
                        {/* Profile Section */}
                        <div className="w-full md:w-1/2">
                            <h2 className="text-2xl text-white mb-6">Profile</h2>
                            <div className="bg-[#2b2b2b] p-6 rounded-lg">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="relative">
                                        <img
                                            src={profilePic || 'https://via.placeholder.com/150'}
                                            alt="Profile"
                                            className="w-32 h-32 rounded-full object-cover"
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleProfilePicChange}
                                        />
                                    </div>
                                    <div className="w-full">
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            className="w-full p-3 bg-[#363636] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <button
                                            className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300"
                                            onClick={handleEmailChange}
                                        >
                                            Change Email
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="w-full md:w-1/2">
                            <h2 className="text-2xl text-white mb-6">Change Password</h2>
                            <div className="bg-[#2b2b2b] p-6 rounded-lg">
                                <div className="space-y-4">
                                    {/* Password Fields */}
                                    <div className="relative">
                                        <input
                                            type={showOldPassword ? 'text' : 'password'}
                                            placeholder="Old Password"
                                            className="w-full p-3 bg-[#363636] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            onMouseDown={() => setShowOldPassword(true)}
                                            onMouseUp={() => setShowOldPassword(false)}
                                            onMouseLeave={() => setShowOldPassword(false)}
                                        >
                                            {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder="New Password"
                                            className="w-full p-3 bg-[#363636] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            onMouseDown={() => setShowNewPassword(true)}
                                            onMouseUp={() => setShowNewPassword(false)}
                                            onMouseLeave={() => setShowNewPassword(false)}
                                        >
                                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Confirm Password"
                                            className="w-full p-3 bg-[#363636] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            onMouseDown={() => setShowConfirmPassword(true)}
                                            onMouseUp={() => setShowConfirmPassword(false)}
                                            onMouseLeave={() => setShowConfirmPassword(false)}
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>

                                    <button
                                        className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300"
                                        onClick={handlePasswordChange}
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
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

export default AdminSettings;