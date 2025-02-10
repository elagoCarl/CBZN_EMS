import TopMenu from './callComponents/topMenu';
import icon from './Img/Icone.png';
import bg from './Img/mainbg.png';


const LoginPage = () => {
  return (
    <div 
      className="bg-cover bg-no-repeat bg-center min-h-screen w-screen" 
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Top Menu */}
      <TopMenu />

      {/* Rest of the Login Page */}
      <div className="flex items-center justify-center h-[calc(100vh-88px)]">
        <div className="bg-black/80 p-28 px-10 rounded-lg shadow-lg w-full max-w-md mx-4">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            LOGIN TO YOUR ACCOUNT
          </h2>

          <form className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="USER ID"
                className="w-full px-4 py-2 rounded bg-white/10 border border-gray-600 text-white focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="relative w-full">
              <input
                type="password"
                placeholder="PASSWORD"
                className="w-full px-4 py-2 rounded bg-white/10 border border-gray-600 text-white focus:outline-none focus:border-green-500 pr-10"
              />
              <img 
                src={icon} 
                alt="Show Password" 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer w-5 h-5 hover:bg-gray-600 rounded-3xl duration-300"
              />
            </div>
            <div className='flex flex-col space-y-4'>
              <div className='font-bold text-gray-900 hover:bg-green-700 text-center text-lg rounded-md bg-[#4E9F48] p-2 duration-300 w-full'>
                <button>Login</button>
              </div>

              <div className='font-semibold text-white hover:text-gray-400 text-center text-lg rounded-md duration-300 w-full'>
                <button>Forgot Password?</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
