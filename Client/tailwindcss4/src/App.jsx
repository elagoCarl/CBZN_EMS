// src/App.js
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import ForgotPass from './Components/forgotPass.jsx';
import ManageUsers from './Components/manageUsers.jsx';
import MyAttendance from "./Components/myAttendance.jsx";
import AccountSettings from './Components/accSettings.jsx';
import AttendanceList from './Components/attendanceList.jsx';
import ReqPage from './Components/reqPage.jsx';
import DeptPage from "./Components/departmentPage.jsx";
import ScheduleChangePage from "./Components/scheduleChangePage.jsx";
import TimeAdjustmentPage from "./Components/timeAdjustmentPage.jsx";
import OvertimeReqPage from "./Components/overtimeReqPage.jsx";
import LeaveReqPage from "./Components/leaveReqPage.jsx";
import SchedulePage from "./Components/schedPage.jsx";
import ProtectedRoute from './Components/protectedRoute.jsx';
import { AuthProvider } from "./Components/authContext"; // adjust path as needed

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/forgotPass" element={<ForgotPass />} />

          {/* Protected Routes Group */}
          <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
            <Route path="/myAttendance" element={<MyAttendance />} />
            <Route path="/manageUsers" element={<ManageUsers />} />
            <Route path="/accSettings" element={<AccountSettings />} />
            <Route path="/attendanceList" element={<AttendanceList />} />
            <Route path="/reqPage" element={<ReqPage />} />
            <Route path="/deptPage" element={<DeptPage />} />
            <Route path="/scheduleChangePage" element={<ScheduleChangePage />} />
            <Route path="/timeAdjustmentPage" element={<TimeAdjustmentPage />} />
            <Route path="/overtimeReqPage" element={<OvertimeReqPage />} />
            <Route path="/leaveReqPage" element={<LeaveReqPage />} />
            <Route path="/schedulePage" element={<SchedulePage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
