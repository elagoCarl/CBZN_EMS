import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import ForgotPass from './Components/forgotPass.jsx';
import AdminDashboard from "./Components/adminDashboard.jsx"; 
<<<<<<< HEAD
import EmployeeDashboard from "./Components/employeeDashboard.jsx"
import Sidebar from './Components/callComponents/sidebar.jsx';
import EmployeeHome from './Components/employHome.jsx';
=======
import EmployeeDashboard from "./Components/employeeDashboard.jsx";
import { Req } from './Components/callComponents/Req.jsx';
>>>>>>> sweden
import AddUser from './Components/callComponents/addUser.jsx';
import EditUser from './Components/callComponents/editUser.jsx';
import EmployeeSettings from './Components/employeeSettings.jsx';
import AdminSettings from './Components/adminSettings.jsx';
import AdminAttendance from './Components/adminAttendance.jsx';
<<<<<<< HEAD
import EmployeeAttendance from './Components/employeeAttendance.jsx';
// import ReqPage from './Components/reqPage.jsx';
import DeptPage from "./Components/departmentPage.jsx";
=======
import ReqPage from './Components/reqPage.jsx';
import Sidebar from './Components/callComponents/sidebar.jsx';
// import EmployeeHome from './Components/employHome.jsx';
// import AdminEms from './Components/admin_Ems.jsx'
// import EmployeeAttendance from './Components/employeeAttendance.jsx';
>>>>>>> sweden

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/addUser" element={<AddUser />} />
<<<<<<< HEAD
          <Route path="/employeeHome" element={<EmployeeHome />} />
=======
          <Route path="/req" element={<Req/>} />
>>>>>>> sweden
          <Route path="/reqPage" element={<ReqPage />} />
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/forgotPass" element={<ForgotPass />} />
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path="/employeeDashboard" element={<EmployeeDashboard />} />
          <Route path="/employeeSettings" element={<EmployeeSettings />} />
          <Route path="/adminSettings" element={<AdminSettings />} />
          <Route path="/adminAttendance" element={<AdminAttendance />} />
<<<<<<< HEAD
          <Route path="/employeeAttendance" element={<EmployeeAttendance />} />
          <Route path="/deptPage" element={<DeptPage />} />
          <Route path="/editUser" element={<EditUser />} />
=======
          {/* <Route path="/employeeHome" element={<EmployeeHome />} /> */}
          {/* <Route path="/attendancePage" element={<AttendancePage />} /> */}
          {/* <Route path="/adminEms" element={<AdminEms />} /> */}
          {/* <Route path="/employeeAttendance" element={<EmployeeAttendance />} /> */}
>>>>>>> sweden
      </Routes>
      </Router>
    </>
  )
}

export default App