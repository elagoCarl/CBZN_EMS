import { BrowserRouter as Router, Routes, Route,  } from "react-router-dom";
// import { useState } from 'react';
import LoginPage from './Components/loginPage.jsx';
import ForgotPass from './Components/forgotPass.jsx';
import ManageUsers from './Components/manageUsers.jsx';
import MyAttendance from "./Components/myAttendance.jsx";
import Sidebar from './Components/callComponents/sidebar.jsx';
import AccountSettings from './Components/accSettings.jsx';
import AttendanceList from './Components/attendanceList.jsx';
import ReqPage from './Components/reqPage.jsx';
import DeptPage from "./Components/departmentPage.jsx";
import ScheduleChangePage from "./Components/scheduleChangePage.jsx";
import TimeAdjustmentPage from "./Components/timeAdjustmentPage.jsx";
import OvertimeReqPage from "./Components/overtimeReqPage.jsx";
import LeaveReqPage from "./Components/leaveReqPage.jsx";
<<<<<<< HEAD
import Page404 from "./Components/page404.jsx"; 
import Page403 from "./Components/page403.jsx"
// import ProtectedRoutes from "./Components/protectedRoutes.jsx";
=======
import SchedulePage from "./Components/schedPage.jsx";
>>>>>>> dccd3b4cf218c66aacb7a086f88956312d3fdc95


function App() {

  // const [isAuthenticated, setIsAuthenticated] = useState(false);
   {/* Protected Routes
          <Route path="/protectedRoutes" element={<ProtectedRoutes isAuthenticated={isAuthenticated} />} /> */}

 
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage  />} />
          <Route path="/reqPage" element={<ReqPage />} />
          <Route path="/forgotPass" element={<ForgotPass />} />
          <Route path="/manageUsers" element={<ManageUsers />} />
          <Route path="/myAttendance" element={<MyAttendance />} />
          <Route path="/accSettings" element={<AccountSettings />} />
          <Route path="/attendanceList" element={<AttendanceList />} />
          <Route path="/deptPage" element={<DeptPage />} />
          <Route path="/myAttendance" element={<MyAttendance />} />
          <Route path="/scheduleChangePage" element={<ScheduleChangePage />} />
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/timeAdjustmentPage" element={<TimeAdjustmentPage />} />
          <Route path="/overtimeReqPage" element={<OvertimeReqPage />} />
          <Route path="/leaveReqPage" element={<LeaveReqPage />} />
<<<<<<< HEAD

          {/* Catch-all 404 Route */}
          <Route path="*" element={<Page404 />} />
          <Route path="/403" element={<Page403 />} />
      </Routes>
=======
          <Route path="/schedulePage" element={<SchedulePage />} />


        </Routes>
>>>>>>> dccd3b4cf218c66aacb7a086f88956312d3fdc95
      </Router>
    </>
  )
}

export default App