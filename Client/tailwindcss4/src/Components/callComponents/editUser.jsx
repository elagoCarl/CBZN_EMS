import React from 'react';

const EditUser = () => {
  return (
    <div className="min-h-screen w-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-black/90 bg-opacity-90 shadow-2xl w-full max-w-4xl flex flex-col items-center p-8 justify-center rounded-lg mt-4">
          <h1 className="text-3xl font-bold text-center text-white mb-6">Edit User</h1>

          <form className="space-y-6 w-full">
            {/* Company Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Company ID</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white"
                  placeholder="Enter Company ID"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Department</label>
                <select
                  className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white">
                  <option value="" className="bg-black/80">Select Department</option>
                  <option value="it" className="bg-black/80">IT</option>
                  <option value="hr" className="bg-black/80">HR</option>
                  <option value="finance" className="bg-black/80">Finance</option>
                  <option value="operations" className="bg-black/80">Operations</option>
                </select>
              </div>
            </div>

            {/* Position Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Job Title</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white"
                  placeholder="Enter Job Title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Role</label>
                <select
                  className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white">
                  <option value="" className="bg-black/80">Select Role</option>
                  <option value="admin" className="bg-black/80">Admin</option>
                  <option value="employee" className="bg-black/80">Employee</option>
                </select>
              </div>
            </div>

            {/* Rest of the form remains unchanged */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">First Name</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white"
                  placeholder="Enter First Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Last Name</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white"
                  placeholder="Enter Last Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Middle Name</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white"
                  placeholder="Enter Middle Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white"
                  placeholder="Enter your email..."
                />
              </div>
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

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Address</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-white/10 focus:border-none focus:outline focus:outline-green-400 shadow-sm text-white"
                placeholder="Enter Address..."
              />
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