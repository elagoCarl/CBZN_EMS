import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import ForgotPass from './Components/forgotPass.jsx';
<<<<<<< Updated upstream
import ManageUsers from "./Components/manageUsers.jsx"; 
import MyAttendance from "./Components/myAttendance.jsx"
import AccSettings from './Components/accSettings.jsx';
import AdminAttendance from './Components/adminAttendance.jsx';
=======
import AdminDashboard from "./Components/adminDashboard.jsx"; 
import EmployeeDashboard from "./Components/myAttendance.jsx"
import Sidebar from './Components/callComponents/sidebar.jsx';
import AdminSettings from './Components/adminSettings.jsx';
import AttendanceList from './Components/attendanceList.jsx';
>>>>>>> Stashed changes
import ReqPage from './Components/reqPage.jsx';
import DeptPage from "./Components/departmentPage.jsx";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/reqPage" element={<ReqPage />} />
          <Route path="/forgotPass" element={<ForgotPass />} />
<<<<<<< Updated upstream
          <Route path="/manageUsers" element={<ManageUsers />} />
          <Route path="/myAttendance" element={<MyAttendance />} />
          <Route path="/accSettings" element={<AccSettings />} />
          <Route path="/adminAttendance" element={<AdminAttendance />} />
=======
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path="/employeeDashboard" element={<EmployeeDashboard />} />
          <Route path="/adminSettings" element={<AdminSettings />} />
          <Route path="/attendanceList" element={<AttendanceList />} />
>>>>>>> Stashed changes
          <Route path="/deptPage" element={<DeptPage />} />
          <Route path="/myAttendance" element={<MyAttendance />} />
      </Routes>
      </Router>
    </>
  )
}

export default App