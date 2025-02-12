import { useState } from 'react';
import Sidebar from './Sidebar';
import logo from '../img/CBZN-Logo.png';

const TopMenu = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to close sidebar when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target.id === 'sidebar-overlay') {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full bg-black text-white p-4 flex justify-between items-center z-50">
        {/* Logo */}
        <img src={logo} alt="Logo" className="h-10 w-auto" />

        {/* Hamburger Icon */}
        <button onClick={() => setIsSidebarOpen(true)} className="text-white focus:outline-none text-2xl">
          ☰
        </button>
      </div>

      {/* Overlay with Sidebar */}
      <div
        id="sidebar-overlay"
        className={`fixed inset-0 bg-black/50 transition-all duration-300 ${isSidebarOpen ? 'visible' : 'invisible'}`}
        onClick={handleOverlayClick}
      >
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      </div>
    </>
  );
};

export default TopMenu;
