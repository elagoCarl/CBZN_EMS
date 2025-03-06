// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { AuthProvider } from "./Components/authContext"; // adjust the path as needed

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/forgotPass" element={<ForgotPass />} />

          {/* Protected Routes */}
          <Route path="/myAttendance" element={
            <ProtectedRoute>
              <MyAttendance />
            </ProtectedRoute>
          } />
          <Route path="/manageUsers" element={
            <ProtectedRoute>
              <ManageUsers />
            </ProtectedRoute>
          } />
          <Route path="/accSettings" element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          } />
          <Route path="/attendanceList" element={
            <ProtectedRoute>
              <AttendanceList />
            </ProtectedRoute>
          } />
          <Route path="/reqPage" element={
            <ProtectedRoute>
              <ReqPage />
            </ProtectedRoute>
          } />
          <Route path="/deptPage" element={
            <ProtectedRoute>
              <DeptPage />
            </ProtectedRoute>
          } />
          <Route path="/scheduleChangePage" element={
            <ProtectedRoute>
              <ScheduleChangePage />
            </ProtectedRoute>
          } />
          <Route path="/timeAdjustmentPage" element={
            <ProtectedRoute>
              <TimeAdjustmentPage />
            </ProtectedRoute>
          } />
          <Route path="/overtimeReqPage" element={
            <ProtectedRoute>
              <OvertimeReqPage />
            </ProtectedRoute>
          } />
          <Route path="/leaveReqPage" element={
            <ProtectedRoute>
              <LeaveReqPage />
            </ProtectedRoute>
          } />
          <Route path="/schedulePage" element={
            <ProtectedRoute>
              <SchedulePage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
