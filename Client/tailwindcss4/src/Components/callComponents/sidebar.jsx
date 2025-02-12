
const Sidebar = () => {
    const menuItems = [
        { label: 'HOME', href: '#' },
        { label: 'DASHBOARD', href: '#' },
        { label: 'DEPARTMENTS', href: '#' },
        { label: 'CAREERS', href: '#' },
        { label: 'REPORTS', href: '#' },
        { label: 'USERS', href: '#' }
    ];

    return (
        <div className="fixed right-0 top-0 flex flex-col h-screen bg-black w-64 p-6 justify-between shadow-lg">
            <div className="mb-8 text-center">
                <h2 className="text-lg xl:text-3xl lg:text-2xl md:text-xl sm:text-lg font-semibold text-white tracking-wide">NAVIGATION</h2>
            </div>

            <nav>
                <ul className="flex flex-col gap-4">
                    {menuItems.map((item) => (
                        <li key={item.label} className="flex justify-center">
                            <a
                                href={item.href}
                                className="relative py-3 text-center text-lg font-medium text-white transition duration-300 hover:text-green-500"
                            >
                                {item.label}
                                {item.label === 'REPORTS' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></div>
                                )}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div>
                <button className="flex items-center justify-center w-full py-3 text-lg font-medium text-white transition duration-300 border border-transparent rounded-md bg-gray-950 hover:text-green-500 hover:border-green-500">
                    <svg
                        className="w-6 h-6 mr-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            d="M13 9l-3 3m0 0l3 3m-3-3h8M7 16a4 4 0 01-4-4 4 4 0 014-4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    LOGOUT
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
