import React from 'react';
import logo from './img/CBZN-Logo.png';
import bg from './img/editbg.png';
import three from './img/three-lines.png'

const EditUser = () => {
  return (
    <div
      className="bg-cover bg-no-repeat bg-center min-h-screen w-screen flex flex-col"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <nav className="flex items-center justify-between bg-black p-8">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 ml-8">
          <img className="w-full" src={logo} alt="CBZN Logo" />
        </div>

        {/* Menu Button */}
        <div className="flex items-center">
          <div className="p-2 rounded-lg transition-colors hover:bg-gray-800 mr-8">
            <img className="w-12 h-12" src={three} alt="Menu" />
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-black/90 bg-opacity-90 shadow-2xl w-full max-w-2xl flex flex-col items-center p-8 justify-center rounded-lg mt-4">
          <h1 className="text-3xl font-bold text-center text-white mb-6">Edit User</h1>
          <form className="space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Username</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white"
                  placeholder="Username"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Job Title</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white"
                  placeholder="Sample Developer"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Email Address</label>
              <input
                type="email"
                className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white"
                placeholder="Enter your email..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Full Name</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white"
                placeholder="Enter Full Name..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Password</label>
                <input
                  type="password"
                  className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white"
                  placeholder="********"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Confirm Password</label>
                <input
                  type="password"
                  className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white"
                  placeholder="********"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Contact Number</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white"
                  placeholder="Enter Mobile Number..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Birthdate</label>
                <input
                  type="date"
                  className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-lg shadow-md hover:bg-green-600"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
