import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import ForgotPass from './Components/forgotPass.jsx';
import AdminDashboard from "./Components/adminDashboard.jsx"; 
import EmployeeDashboard from "./Components/myAttendance.jsx"
import Sidebar from './Components/callComponents/sidebar.jsx';
import AdminSettings from './Components/adminSettings.jsx';
import AttendanceList from './Components/attendanceList.jsx';
import ReqPage from './Components/reqPage.jsx';
import DeptPage from "./Components/departmentPage.jsx";
import ScheduleChangePage from "./Components/scheduleChangePage.jsx";
import MyAttendance from "./Components/myAttendance.jsx";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/reqPage" element={<ReqPage />} />
          <Route path="/forgotPass" element={<ForgotPass />} />
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path="/employeeDashboard" element={<EmployeeDashboard />} />
          <Route path="/adminSettings" element={<AdminSettings />} />
          <Route path="/attendanceList" element={<AttendanceList />} />
          <Route path="/deptPage" element={<DeptPage />} />
          <Route path="/myAttendance" element={<MyAttendance />} />
          <Route path="/scheduleChangePage" element={<ScheduleChangePage />} />
          <Route path="/sidebar" element={<Sidebar />} />
      </Routes>
      </Router>
    </>
  )
}

export default App