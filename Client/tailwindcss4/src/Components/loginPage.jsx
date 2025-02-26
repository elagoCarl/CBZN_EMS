import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import icon from './Img/Icone.png';
import logo from '../Components/Img/CBZN-Logo.png';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const response = await axios.post('http://localhost:8080/users/loginUser', { email, password }, { withCredentials: true });

      if (response.data.successful) {
        navigate('/employeeHome'); // Redirect on successful login
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div
      className="bg-cover bg-no-repeat bg-center min-h-screen w-screen bg-black/95"
    >
      <div className="fixed top-0 left-0 w-full bg-black text-white p-8 flex justify-between items-center z-50">
        <img src={logo} alt="Logo" className="h-11 w-auto ml-8" />
      </div>

      <div className="flex items-center justify-center h-[calc(100vh-88px)]">
        <div className="bg-black/80 p-10 rounded-lg shadow-lg w-full max-w-md mx-4">
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
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded bg-white/10 border border-gray-600 text-white focus:outline-none focus:border-green-500 pr-10"
                required
              />
              <img
                src={icon}
                alt="Show Password"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer w-5 h-5 hover:bg-gray-600 rounded-3xl duration-300"
              />
            </div>
            <div className='flex flex-col space-y-4'>
              <button type="submit" className='font-bold text-gray-900 hover:bg-green-700 text-center text-lg rounded-md bg-[#4E9F48] p-2 duration-300 w-full'>
                Login
              </button>
              {/* Forgot Password Button - Now Navigates to /forgotPass */}
              <button
                type="button"
                className='font-semibold text-white hover:text-gray-400 text-center text-lg rounded-md duration-300 w-full'
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
