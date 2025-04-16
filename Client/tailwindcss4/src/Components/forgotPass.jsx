import bg from './img/mainbg.png';
import logo from '../Components/Img/CBZN-Logo.png';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from '../axiosConfig'

const ForgotPass = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setMessage({ text: 'Please enter your email address', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '' }); // Clear previous messages before request

        try {
            const { data } = await axios.post('/users/forgotPass', { email });
            console.log("API Response:", data); // Log the actual response structure

            setMessage({
                text: 'Password reset instructions have been sent to your email, Redirecting Back to Login Page...',
                type: 'success'
            });

            // After showing success message, redirect to login page after 5 seconds
            setTimeout(() => {
                setMessage({ text: '' });
                navigate('/');
            }, 5000);

        } catch (error) {
            console.error('Error:', error);

            setMessage({
                text: error.response?.data?.message || 'Something went wrong. Please try again.',
                type: 'error'
            });

        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="bg-cover bg-no-repeat bg-center min-h-screen w-full flex flex-col"
            style={{ backgroundImage: `url(${bg})` }}
        >
            {/* Top Menu */}
            <header className="sticky top-0 left-0 w-full bg-black/90 backdrop-blur-sm text-white p-3 md:p-4 flex justify-between items-center z-50 shadow-md">
                {/* Logo */}
                <div className="flex items-center">
                    <img src={logo} onClick={() => navigate('/')} alt="Logo" className="h-8 md:h-10 w-auto cursor-pointer" />
                </div>
            </header>

            {/* Reset Password Page */}
            <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
                <div className="bg-black/80 p-6 sm:p-8 md:p-10 rounded-lg shadow-xl w-full max-w-md backdrop-blur-sm border border-gray-800">
                    <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-6">
                        Reset Password
                    </h2>

                    {message.text && (
                        <div className={`mb-4 p-3 rounded text-sm text-center ${message.type === 'error' ? 'bg-red-900/70 text-red-200' : 'bg-green-900/70 text-green-200'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-gray-300 text-sm block">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 rounded bg-white/10 border border-gray-600 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder-gray-400 text-sm md:text-base transition-colors"
                                required
                            />
                        </div>

                        <div className='flex flex-col space-y-4 mt-6'>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`font-bold text-gray-900 hover:bg-green-600 text-center text-md rounded-md bg-green-500 p-2 md:p-3 duration-300 w-full transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}`}
                            >
                                {loading ? 'Sending...' : 'Reset Password'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className='font-semibold text-white hover:text-gray-300 text-center text-md rounded-md duration-300 w-full transition-colors focus:outline-none'
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer */}
            {/* <footer className="bg-black/80 text-center text-gray-400 py-2 text-xs">
                © {new Date().getFullYear()} CBZN. All rights reserved.
            </footer> */}
        </div>
    );
};

export default ForgotPass;
