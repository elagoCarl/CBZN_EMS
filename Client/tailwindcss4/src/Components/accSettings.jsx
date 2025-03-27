import { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Camera } from 'lucide-react';
import logo from '../Components/Img/CBZN-Logo.png';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "./callComponents/sidebar.jsx"; // Import the Sidebar component as used in MyAttendance
import { useAuth } from '../Components/authContext.jsx';

const AccountSettings = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profilePic, setProfilePic] = useState(null);
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { user } = useAuth();
  console.log("userid: ", user.id);
  const userId = user.id;

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch the logged-in user's data (email, etc.)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/users/getUser/${userId}`);
        if (response.data.successful) {
          setEmail(response.data.data.email);
        } else {
          console.error('User not found:', response.data.message);
          toast.error(response.data.message || 'User not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data');
      }
    };

    fetchUserData();
  }, [userId]);

  // Fetch Profile Picture
  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/users/getProfilePic/${userId}`, {
          responseType: 'arraybuffer'
        });
        const base64Image = btoa(
          new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        setProfilePic(`data:image/jpeg;base64,${base64Image}`);
      } catch (error) {
        console.error("Error fetching profile picture:", error);
        setProfilePic(null);
      }
    };

    fetchProfilePic();
  }, [userId]);

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

  // Handle profile picture upload
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if the file format is valid
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Invalid file format. Please select a .jpeg or .png file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const response = await axios.post(
        `http://localhost:8080/users/uploadProfilePicture/${userId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.profilePicture) {
        setProfilePic(`http://localhost:8080/${response.data.profilePicture}`);
        toast.success('Profile picture updated successfully!');
      } else {
        // If there's no profilePicture in the response, still show a success or fallback message
        toast.success('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture. Please try again.");
    }
  };

  // Handle email change
  const handleEmailChange = async () => {
    try {
      const response = await axios.put(`http://localhost:8080/users/updateUserEmail/${userId}`, { email });
      if (response.data.successful) {
        toast.success('Email updated successfully!');
      } else {
        toast.error(response.data.message || 'Failed to update email. Please try again.');
      }
    } catch (error) {
      console.error('Error updating email:', error);
      toast.error(error.response?.data?.message || 'An error occurred. Please try again later.');
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:8080/users/updateUserPassword/${userId}`, {
        password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (response.data.successful) {
        toast.success('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(response.data.message || 'Failed to update password.');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'An error occurred. Please try again later.');
    }
  };

  return (
    <div className="flex h-screen bg-black/90">
      {/* Use the Sidebar component from MyAttendance */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white">
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
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        {showOldPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2 font-medium">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        className="w-full p-3 bg-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2 font-medium">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        className="w-full p-3 bg-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
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

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default AccountSettings;
