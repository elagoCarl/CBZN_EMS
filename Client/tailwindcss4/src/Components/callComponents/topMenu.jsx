
export const topMenu = () => {
  return (
    <div>
       {/* Navbar */}
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

    </div>
  )
}
