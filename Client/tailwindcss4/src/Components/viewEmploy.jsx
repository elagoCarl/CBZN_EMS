import React from 'react';
import bg2 from './img/bgEmpAttendance.png';
import logo from './img/CBZN-Logo.png';
import three from './img/three-lines.png';

const ViewEmployee = () => {
    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `url(${bg2})`,
                width: '100vw',
                height: '100vh',
            }}
        >
            <nav className="fixed top-0 left-0 w-full flex items-center justify-between bg-black p-8 z-50">
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

       

            <div className="bg-white bg-opacity-100 shadow-lg w-full max-w-6xl ">
                <table className="table-auto w-full border-collapse">
                    <thead>
                        <tr style={{ backgroundColor: "#555454", color: "#ffffff" }}>
                            <th className="h-12 w-50">User ID</th>
                            <th className="h-12 w-50">Name</th>
                            <th className="h-12 w-50">Department</th>
                            <th className="h-12 w-50">Time In</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="text-center ">
                            <td className="h-12 w-100">00001</td>
                            <td className="h-12 w-100">Harry Styles</td>
                            <td className="h-12 w-100">Web Development</td>
                            <td className="h-12 w-100">Web Development</td>

                        </tr>
                        <tr className=" text-center" style={{ backgroundColor: "#D2FFC8", color: "black" }}>
                            <td className="h-12 w-50">00002</td>
                            <td className="h-12 w-50">Gigi Hadid</td>
                            <td className="h-12 w-50">Web Development</td>
                            <td className="h-12 w-50">Web Development</td>

                        </tr>

                        <tr className="text-center">
                            <td className="h-12 w-50">00003</td>
                            <td className="h-12 w-50">Solana Boop</td>
                            <td className="h-12 w-50">Broadcasting</td>
                            <td className="h-12 w-50">Web Development</td>

                        </tr>

                        <tr className="text-center" style={{ backgroundColor: "#D2FFC8", color: "black" }}>
                            <td className="h-12 w-50">00003</td>
                            <td className="h-12 w-50">Analos Low</td>
                            <td className="h-12 w-50">Broadcasting</td>
                            <td className="h-12 w-50">Web Development</td>

                        </tr>

                         <tr className="text-center">
                            <td className="h-12 w-50"></td>
                            <td className="h-12 w-50"></td>
                            <td className="h-12 w-50"></td>
                            <td className="h-12 w-50"></td>
                         </tr>

                        <tr className=" opacity-85 text-center" style={{ backgroundColor: "#D2FFC8", color: "#black" }}>
                            <td className="h-12 w-50"></td>
                            <td className="h-12 w-50"></td>
                            <td className="h-12 w-50"></td>
                            <td className="h-12 w-50"></td>
                        </tr>
                        
                            <tr className="text-center">
                            <td className="h-12 w-50"></td>
                            <td className="h-12 w-50"></td>
                            <td className="h-12 w-50"></td>
                            <td className="h-12 w-50"></td>

                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewEmployee;