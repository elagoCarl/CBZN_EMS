import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import ForgotPass from './Components/forgotPass.jsx';
import AdminDashboard from "./Components/adminDashboard.jsx"; 
import EmployeeDashboard from "./Components/employeeDashboard.jsx";
import { Req } from './Components/callComponents/Req.jsx';
import AddUser from './Components/callComponents/addUser.jsx';
import EmployeeSettings from './Components/employeeSettings.jsx';
import AdminSettings from './Components/adminSettings.jsx';
import AdminAttendance from './Components/adminAttendance.jsx';
import ReqPage from './Components/reqPage.jsx';
import Sidebar from './Components/callComponents/sidebar.jsx';
// import EmployeeHome from './Components/employHome.jsx';
// import AdminEms from './Components/admin_Ems.jsx'
// import EmployeeAttendance from './Components/employeeAttendance.jsx';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/addUser" element={<AddUser />} />
          <Route path="/req" element={<Req/>} />
          <Route path="/reqPage" element={<ReqPage />} />
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/forgotPass" element={<ForgotPass />} />
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path="/employeeDashboard" element={<EmployeeDashboard />} />
          <Route path="/employeeSettings" element={<EmployeeSettings />} />
          <Route path="/adminSettings" element={<AdminSettings />} />
          <Route path="/adminAttendance" element={<AdminAttendance />} />
          {/* <Route path="/employeeHome" element={<EmployeeHome />} /> */}
          {/* <Route path="/attendancePage" element={<AttendancePage />} /> */}
          {/* <Route path="/adminEms" element={<AdminEms />} /> */}
          {/* <Route path="/employeeAttendance" element={<EmployeeAttendance />} /> */}
      </Routes>
      </Router>
    </>
  )
}

export default App