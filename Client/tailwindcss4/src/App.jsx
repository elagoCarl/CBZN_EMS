import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import ForgotPass from './Components/forgotPass.jsx';
import AdminDashboard from "./Components/adminDashboard.jsx"; 
import EmployeeDashboard from "./Components/myAttendance.jsx"
import Sidebar from './Components/callComponents/sidebar.jsx';
import AdminSettings from './Components/adminSettings.jsx';
import AdminAttendance from './Components/adminAttendance.jsx';
import ReqPage from './Components/reqPage.jsx';
import DeptPage from "./Components/departmentPage.jsx";
import SideBar from "./Components/callComponents/sidebar.jsx";
import TimeAdjustmentPage from "./Components/timeAdjustmentPage.jsx";
import ScheduleChangePage from "./Components/scheduleChangePage.jsx";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/reqPage" element={<ReqPage />} />
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/forgotPass" element={<ForgotPass />} />
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path="/employeeDashboard" element={<EmployeeDashboard />} />
          <Route path="/adminSettings" element={<AdminSettings />} />
          <Route path="/adminAttendance" element={<AdminAttendance />} />
          <Route path="/deptPage" element={<DeptPage />} />
          <Route path="/sideBar" element={<SideBar />} />
          <Route path="/timeAdjustmentPage" element={<TimeAdjustmentPage />} />
          <Route path="/scheduleChangePage" element={<ScheduleChangePage />} />
      </Routes>
      </Router>
    </>
  )
}

export default App