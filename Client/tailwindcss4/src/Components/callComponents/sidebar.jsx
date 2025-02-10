import React from 'react';

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
        <div className="fixed right-0 top-0 flex flex-col h-screen bg-black w-64 p-6 justify-between">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-medium text-white">NAVIGATION</h2>
            </div>

            <nav>
                <ul className="flex flex-col h-1/2 gap-4">
                    {menuItems.map((item) => (
                        <li key={item.label} className="flex justify-center">
                            <a
                                href={item.href}
                                className={`relative py-3 text-center text-2xl font-medium transition-colors`}>
                                <span className="relative text-white hover:text-green-500 duration-300">
                                    {item.label}
                                    {item.label === 'REPORTS' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 -mb-1"></div>
                                    )}
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div>
                <button className="flex items-center justify-center w-full text-white hover:text-green-500 hover:border-green-500 border border-transparent transition-colors py-3 text-2xl font-medium hover:outline hover:outline-green-500">
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
