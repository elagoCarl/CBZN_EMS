import { useState } from "react";
import Sidebar from "./Sidebar";
import logo from "../img/CBZN-Logo.png";
import { useNavigate } from "react-router-dom";

const TopMenu = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };
  return (
    <>
      <div className="fixed top-0 left-0 w-full bg-black text-white p-4 flex justify-between items-center z-50 shadow-md">
        <img src={logo} alt="Logo" className="h-10 w-auto cursor-pointer" onClick={handleLogoClick} />
        <button onClick={toggleSidebar} className="text-white text-2xl focus:outline-none">
          ☰
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </>
  );
};

export default TopMenu;
