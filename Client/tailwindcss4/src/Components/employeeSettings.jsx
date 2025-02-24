import { useState, useEffect } from 'react';
import { Menu, X, Eye, EyeOff } from 'lucide-react';
import logo from '../Components/Img/CBZN-Logo.png';
// import defaulticon from '../Components/Img/default-icon.png';


const EmployeeSettings = () => {
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

    // Handle window resize
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Date and time display
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
        // Handle email change logic here
        console.log('Changes saved:', { email });
    };

    const handlePasswordChange = () => {
        // Handle password change logic here
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

            <div className={`${isNavOpen ? 'translate-x-0' : '-translate-x-full'
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
                        <div className="text-white hover:bg-gray-900 px-4 py-2 rounded cursor-pointer">Settings</div>
                        <div className="text-white hover:bg-gray-900 px-4 py-2 rounded cursor-pointer">Help</div>
                    </nav>
                </div>

                <div className="mt-auto flex items-center space-x-3 p-4 border-t border-gray-800">
                    <div className="w-6 h-6 bg-gray-600 rounded-full" />
                    <div>
                        <div className="text-white text-xs font-medium">EMPLOYEE</div>
                        <div className="text-gray-400 text-xs">EMPLOYEE@CBZN@GMAIL.COM</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-6 flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-xl md:text-5xl text-white mb-4 ml-10 md:mb-0">
                        Account Settings
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

                <div className="flex flex-col md:flex-row gap-6 py-15 justify-center">
    {/* Profile and Change Password Section */}
    <div className="bg-[#313131] p-6 shadow-lg w-full max-w-7xl mx-auto md:mx-0 relative min-h-[800px]">
        <div className="flex flex-col md:flex-row h-full">
            {/* Left Column - Titles */}
            <div className="flex flex-col md:w-1/3">
                <h2 className="text-xl text-white mb-4 md:text-3xl">Profile</h2>
                <h3 className="text-xl text-white mb-4 md:text-3xl mt-90">Change Password</h3>
            </div>

            {/* Right Column */}
            <div className="bg-[#3E3E3E] p-15 shadow-lg flex-5 w-full md:w-2/3 min-h-[800px] absolute top-0 right-0 bottom-0">

                {/* Top Section - Two Columns: Profile Pic and Email */}
                <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
                    {/* Profile Pic */}
                    <div className="relative">
                        <img
                            src={profilePic || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            className="w-50 h-40 rounded-full object-cover"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleProfilePicChange}
                        />
                    </div>

                    {/* Email Input */}
                    <div className="relative w-full">
                        <input
                            type="email"
                            placeholder="EMAIL ADDRESS"
                            className="w-full p-4 bg-[#757575] rounded text-white placeholder-white focus:placeholder-transparent"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                {/* Change Button */}
                <div className="flex justify-end mb-6">
                    <button
                        className="bg-green-600 text-white px-7 py-2 rounded hover:bg-green-700"
                        onClick={handleEmailChange}
                    >
                        Change Email
                    </button>
                </div>

                {/* Password Fields */}
                <div className="mt-40">
                    <div className="mb-8 w-full relative">
                        <input
                            type={showOldPassword ? 'text' : 'password'}
                            placeholder="OLD PASSWORD"
                            className="w-full p-4 bg-[#757575] rounded text-white placeholder-white focus:placeholder-transparent"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <button
                                type="button"
                                className="absolute inset-y-0 right-0 px-3 py-7 flex items-center"
                                onMouseDown={() => setShowOldPassword(true)}
                                onMouseUp={() => setShowOldPassword(false)}
                                onMouseLeave={() => setShowOldPassword(false)}
                            >
                                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        
                    </div>
                    <div className="mb-8 w-full relative">
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="NEW PASSWORD"
                            className="w-full p-4 bg-[#757575] rounded text-white placeholder-white focus:placeholder-transparent"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                                type="button"
                                className="absolute inset-y-0 right-0 px-3 py-7 flex items-center"
                                onMouseDown={() => setShowNewPassword(true)}
                                onMouseUp={() => setShowNewPassword(false)}
                                onMouseLeave={() => setShowNewPassword(false)}
                            >
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <div className="mb-8 w-full relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="CONFIRM PASSWORD"
                            className="w-full p-4 bg-[#757575] rounded text-white placeholder-white focus:placeholder-transparent"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                                type="button"
                                className="absolute inset-y-0 right-0 px-3 py-7 flex items-center"
                                onMouseDown={() => setShowConfirmPassword(true)}
                                onMouseUp={() => setShowConfirmPassword(false)}
                                onMouseLeave={() => setShowConfirmPassword(false)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <div className="flex justify-end w-full mt-8">
                        <button
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
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

export default EmployeeSettings;