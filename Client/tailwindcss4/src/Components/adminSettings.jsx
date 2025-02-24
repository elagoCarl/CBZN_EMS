import { useState, useEffect } from 'react';
import { Menu, X, Eye, EyeOff, User, Mail, Lock, Camera } from 'lucide-react';
import logo from '../Components/Img/CBZN-Logo.png';

const AccountSettings = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profilePic, setProfilePic] = useState(null);
  const [email, setEmail] = useState('admin@cbzn.com');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date for display
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

  // Format time for display
  const formatTime = (date) => {
    const timeString = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const [time, period] = timeString.split(' ');
    return (
      <span className="text-white bg-black/40 rounded-xl px-4 flex items-center justify-center">
        {time} <span className="text-green-500 ml-2">{period}</span>
      </span>
    );
  };

  // Handle profile picture change
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
    console.log('Email updated:', email);
    // Here you would implement the actual email change logic
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      console.log('Passwords do not match');
      return;
    }
    console.log('Password changed');
    // Here you would implement the actual password change logic
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

      {/* Sidebar */}
      <div className={`${
        isNavOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:relative w-64 bg-black p-6 flex flex-col h-full transition-transform duration-300 ease-in-out z-40`}>
        <div className="mb-8">
          <div className="w-full text-white p-4 flex justify-center items-center">
            <div className="flex items-center h-10 w-auto">
              <img src={logo} alt="" />
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 justify-center items-center space-y-2">
          <nav className="w-full space-y-2 text-center font-semibold text-base">
            <div className="text-gray-400 hover:bg-gray-800 px-4 py-3 rounded cursor-pointer transition-colors">Home</div>
            <div className="text-gray-400 hover:bg-gray-800 px-4 py-3 rounded cursor-pointer transition-colors">Attendance</div>
            <div className="text-gray-400 hover:bg-gray-800 px-4 py-3 rounded cursor-pointer transition-colors">Manage Users</div>
            <div className="text-gray-400 hover:bg-gray-800 px-4 py-3 rounded cursor-pointer transition-colors">Reports</div>
            <div className="bg-green-800/50 text-green-400 px-4 py-3 rounded cursor-pointer transition-colors">Settings</div>
            <div className="text-gray-400 hover:bg-gray-800 px-4 py-3 rounded cursor-pointer transition-colors">Help</div>
          </nav>
        </div>

        <div className="mt-auto flex items-center space-x-3 p-4 border-t border-gray-800">
          <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white">
            <User size={16} />
          </div>
          <div>
            <div className="text-white text-xs font-medium">ADMIN</div>
            <div className="text-gray-400 text-xs">{email}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl text-white mb-4 md:mb-0 font-bold">
            Account <span className="text-green-500">Settings</span>
          </h1>
          <div className="flex flex-col items-center">
            <div className="text-xl md:text-2xl font-bold mb-2 text-white">
              {formatDate(currentTime)}
            </div>
            <div className="text-lg md:text-xl">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="bg-black/60 rounded-lg overflow-hidden shadow-xl max-w-2xl justify-center items-center mx-auto">
          <div className="grid grid-cols-1 gap-8 p-6 md:p-8 max-w-2xl">
            {/* Profile Section */}
            <div>
              <h2 className="text-2xl text-white pb-2">Profile</h2>
              <div className="bg-black/80 p-6 rounded-lg shadow-inner">
                <div className="flex flex-col items-center gap-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border-3 border-green-500/80 hover:bg-white/0 duration-300">
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={64} className="text-gray-500" />
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full cursor-pointer hover:bg-green-500 transition-colors">
                      <Camera size={16} className="text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleProfilePicChange}
                      />
                    </div>
                  </div>
                  
                  <div className="w-full space-y-6">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2 font-medium">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="Email Address"
                          className="w-full p-3 bg-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 pr-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>
                    
                    <button
                      className="w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-800 duration-300 transition-colors font-medium flex items-center justify-center gap-2"
                      onClick={handleEmailChange}
                    >
                      <Mail size={18} />
                      Update Email
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div>
              <h2 className="text-2xl text-white pb-2">Change Password</h2>
              <div className="bg-black/30 p-6 rounded-lg shadow-inner">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2 font-medium">Current Password</label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        className="w-full p-3 bg-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        onMouseDown={() => setShowOldPassword(true)}
                        onMouseUp={() => setShowOldPassword(false)}
                        onMouseLeave={() => setShowOldPassword(false)}
                      >
                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2 font-medium">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        className="w-full p-3 bg-white/10 rounded  text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        onMouseDown={() => setShowNewPassword(true)}
                        onMouseUp={() => setShowNewPassword(false)}
                        onMouseLeave={() => setShowNewPassword(false)}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2 font-medium">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        className="w-full p-3 bg-white/10 rounded  text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        onMouseDown={() => setShowConfirmPassword(true)}
                        onMouseUp={() => setShowConfirmPassword(false)}
                        onMouseLeave={() => setShowConfirmPassword(false)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    className="w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-800 duration-300 transition-colors mt-6 font-medium flex items-center justify-center gap-2"
                    onClick={handlePasswordChange}
                  >
                    <Lock size={18} />
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

export default AccountSettings;