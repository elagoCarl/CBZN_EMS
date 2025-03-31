import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import ForgotPass from './Components/forgotPass.jsx';
import ManageUsers from './Components/manageUsers.jsx';
import MyAttendance from "./Components/myAttendance.jsx";
import AccountSettings from './Components/accSettings.jsx';
import AttendanceList from './Components/attendanceList.jsx';
import AddReqPage from './Components/AddReqPage.jsx';
import DeptPage from "./Components/departmentPage.jsx";
import ScheduleChangePage from "./Components/scheduleChangePage.jsx";
import TimeAdjustmentPage from "./Components/timeAdjustmentPage.jsx";
import OvertimeReqPage from "./Components/overtimeReqPage.jsx";
import LeaveReqPage from "./Components/leaveReqPage.jsx";
import ScheduleHistory from "./Components/schedHistory.jsx";
import Page404 from "./Components/page404.jsx";
import Page403 from "./Components/page403.jsx"
import SchedulePage from "./Components/schedPage.jsx";
import ProtectedRoute from './Components/protectedRoute.jsx';
import { AuthProvider } from "./Components/authContext"; // adjust path as needed
import ErrorBoundary from "./Components/pageErrorBoundary.jsx"
import DTR from "./Components/DTRpage.jsx";
import SavedDTR from "./Components/savedDTRpage.jsx"


function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <ErrorBoundary>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LoginPage />} />
              <Route path="/forgotPass" element={<ForgotPass />} />

              {/* Regular Protected Routes */}
              <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                <Route path="/myAttendance" element={<MyAttendance />} />
                <Route path="/accSettings" element={<AccountSettings />} />
                <Route path="/addReqPage" element={<AddReqPage />} />
                <Route path="/schedulePage" element={<SchedulePage />} />
                <Route path="/dtr" element={<DTR />} />

                {/* Error Pages */}
                <Route path="*" element={<Page404 />} />
                <Route path="/403" element={<Page403 />} />
              </Route>

              {/* Admin-Only Protected Routes */}
              <Route element={<ProtectedRoute adminOnly={true}><Outlet /></ProtectedRoute>}>
                <Route path="/manageUsers" element={<ManageUsers />} />
                <Route path="/attendanceList" element={<AttendanceList />} />
                <Route path="/savedDTR" element={<SavedDTR />} />
                <Route path="/deptPage" element={<DeptPage />} />
                <Route path="/scheduleChangePage" element={<ScheduleChangePage />} />
                <Route path="/timeAdjustmentPage" element={<TimeAdjustmentPage />} />
                <Route path="/overtimeReqPage" element={<OvertimeReqPage />} />
                <Route path="/leaveReqPage" element={<LeaveReqPage />} />
                <Route path="/schedHistory" element={<ScheduleHistory />} />
              </Route>
            </Routes>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App;