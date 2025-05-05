import { useState } from 'react';
import axios from '../axiosConfig';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../Components/Img/CBZN-Logo.png';
import { useAuth } from '../Components/authContext'; // Adjust path if needed

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const response = await axios.post(
        '/users/loginUser',
        { email, password },
        { withCredentials: true }
      );

      if (response.data.successful) {
        setUser({
          id: response.data.user,
          email: response.data.userEmail,
          first_name: response.data.first_name, // if provided
          surname: response.data.surname,         // if provided
          isAdmin: response.data.isAdmin,
          profilePicture: response.data.profilePicture
        });
        navigate('/myAttendance'); // Redirect on successful login
        console.log('Login successful:', response);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col gap-8 min-h-screen w-screen bg-black/95">
      <div className="w-full bg-black text-white p-8 flex justify-between items-center z-50">
        <img src={logo} alt="Logo" className="h-11 w-auto ml-8" />
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="bg-black/60 p-10 rounded-lg shadow-lg w-full max-w-md mx-4">
          <h2 className="text-2xl font-bold text-white text-center mb-6">LOGIN TO YOUR ACCOUNT</h2>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded bg-white/10 border border-gray-600 text-white focus:outline-none focus:border-green-500"
                required
              />
            </div>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded bg-white/10 border border-gray-600 text-white focus:outline-none focus:border-green-500 pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                className="font-bold text-white hover:bg-green-700 text-center text-lg rounded-md bg-green-600 p-2 duration-300 w-full"
              >
                Login
              </button>
              <button
                type="button"
                className="font-semibold text-white hover:text-gray-400 text-center text-lg rounded-md duration-300 w-full"
                onClick={() => navigate('/forgotPass')}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;