import bg from './img/mainbg.png';
import logo from '../Components/Img/CBZN-Logo.png';
import { useNavigate } from 'react-router-dom';


const ResetPass = () => {
    const navigate = useNavigate();

    return (
        <div
            className="bg-cover bg-no-repeat bg-center min-h-screen w-screen"
            style={{ backgroundImage: `url(${bg})` }}
        >
            {/* Top Menu */}
            <div className="fixed top-0 left-0 w-full bg-black text-white p-4 flex justify-between items-center z-50">
                {/* Logo */}
                <img src={logo} alt="Logo" className="h-10 w-auto" />
            </div>

            {/* Reset Password Page */}
            <div className="flex items-center justify-center h-[calc(100vh-88px)]">
                <div className="bg-black/80 p-28 px-10 rounded-lg shadow-lg w-full max-w-md mx-4">
                    <h2 className="text-sm sm:text-base lg:text-xl font-bold text-white text-center mb-6">
                        RESET YOUR PASSWORD
                    </h2>

                    <form className="space-y-4">
                        <div>
                            <input
                                type="email"
                                placeholder="EMAIL ADDRESS"
                                className="w-full px-4 py-2 rounded bg-white/10 border border-gray-600 text-white focus:outline-none focus:border-green-500"
                            />
                        </div>
                        <div className='flex flex-col space-y-4'>
                            <div className='font-bold text-gray-900 hover:bg-green-700 text-center text-lg rounded-md bg-[#4E9F48] p-2 duration-300 w-full'>
                                <button className=''>Reset Password</button>
                            </div>
                            <div className='font-semibold text-white hover:text-gray-400 text-center text-lg rounded-md duration-300 w-full'>
                                <button onClick={() => navigate('/')} >Back to Login</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPass;