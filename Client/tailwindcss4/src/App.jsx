import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import ForgotPass from './Components/forgotPass.jsx';
import AdminDashboard from "./Components/adminDashboard.jsx"; 
import EmployeeDashboard from "./Components/employeeDashboard.jsx"
import Sidebar from './Components/callComponents/sidebar.jsx';
import EmployeeHome from './Components/employHome.jsx';
import EmployeeSettings from './Components/employeeSettings.jsx';
import AdminSettings from './Components/adminSettings.jsx';
import AdminAttendance from './Components/adminAttendance.jsx';
import EmployeeAttendance from './Components/employeeAttendance.jsx';
import ReqPage from './Components/reqPage.jsx';
import DeptPage from "./Components/departmentPage.jsx";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/employeeHome" element={<EmployeeHome />} />
          <Route path="/reqPage" element={<ReqPage />} />
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/forgotPass" element={<ForgotPass />} />
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path="/employeeDashboard" element={<EmployeeDashboard />} />
          <Route path="/employeeSettings" element={<EmployeeSettings />} />
          <Route path="/adminSettings" element={<AdminSettings />} />
          <Route path="/adminAttendance" element={<AdminAttendance />} />
          <Route path="/employeeAttendance" element={<EmployeeAttendance />} />
          <Route path="/deptPage" element={<DeptPage />} />
      </Routes>
      </Router>
    </>
  )
}

export default App