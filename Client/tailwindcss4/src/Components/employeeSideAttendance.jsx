
import bg2 from './img/editbg.png';
import logo from './img/CBZN-Logo.png';
import three from './img/three-lines.png';

// ATTENDANCE on Employee's side 
const EmployeeSideAttendance = () => {
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
            <span className="ml-4 text-[#4E9F48] text-xl font-bold">Attendance</span>
            <div className="bg-white bg-opacity-100 shadow-lg w-full max-w-3xl">
                <table className="table-auto w-full border-collapse">
                    <thead>
                        <tr style={{ backgroundColor: "#555454", color: "#ffffff" }}>
                            <th className="px-8 py-4">User ID</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="text-center ">
                            <td className="p-4">00001</td>
                            <td className="p-4">Present</td>
                            <td className="p-4">Feb 04, 2025 8:59 AM</td>
                        </tr>
                        <tr className="bg-gray-200 text-center">
                            <td className="p-4">00002</td>
                            <td className="p-4">Present</td>
                            <td className="p-4">Feb 03, 2025 7:59 AM</td>
                        </tr>

                        <tr className="text-center">
                            <td className="p-4">00003</td>
                            <td className="p-4">Absent</td>
                            <td className="p-4">Feb 02, 2025 00:00:00</td>
                        </tr>

                        <tr className="text-center">
                            <td className="p-4">00004</td>
                            <td className="p-4">Absent</td>
                            <td className="p-4">Feb 02, 2025 00:00:00</td>

                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeSideAttendance;