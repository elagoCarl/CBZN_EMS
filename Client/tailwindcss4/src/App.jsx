
// src/App.js
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

  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  {/* Protected Routes
          <Route path="/protectedRoutes" element={<ProtectedRoutes isAuthenticated={isAuthenticated} />} /> */}

  return (
    <>
      <AuthProvider>
        <Router>
          <ErrorBoundary>
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
                <Route path="/addReqPage" element={<AddReqPage />} />
                <Route path="/savedDTR" element={<SavedDTR />} />
                <Route path="/deptPage" element={<DeptPage />} />
                <Route path="/scheduleChangePage" element={<ScheduleChangePage />} />
                <Route path="/timeAdjustmentPage" element={<TimeAdjustmentPage />} />
                <Route path="/overtimeReqPage" element={<OvertimeReqPage />} />
                <Route path="/leaveReqPage" element={<LeaveReqPage />} />
                <Route path="/schedulePage" element={<SchedulePage />} />
                <Route path="/schedHistory" element={<ScheduleHistory />} />

                {/* Catch-all 404 Route */}
                <Route path="*" element={<Page404 />} />
                <Route path="/403" element={<Page403 />} />
                <Route path="/dtr" element={<DTR />} />

              </Route>
            </Routes >
          </ErrorBoundary >
        </Router >
      </AuthProvider >
    </>
  )
}

export default App;
