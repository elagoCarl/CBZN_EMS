import logo from '../Img/CBZN-Logo.png';
import three from '../Img/three-lines.png';

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 w-full flex items-center justify-between bg-black p-4 shadow-md z-50">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 ml-8">
                <img className="h-10" src={logo} alt="CBZN Logo" />
            </div>

            {/* Menu Button */}
            <div className="flex items-center">
                <div className="p-2 rounded-lg transition-colors hover:bg-gray-800 mr-8">
                    <img className="w-12 h-12" src={three} alt="Menu" />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
