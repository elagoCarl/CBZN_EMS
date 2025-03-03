import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import TimeAdjustmentPage from "./Components/timeAdjusmentPAge.jsx";
import OvertimeReqPage from "./Components/overtimeReqPage.jsx";
import LeaveReqPage from "./Components/leaveReqPage.jsx";
import MockAttendance from "./Components/mockAttendance.jsx";


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
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
          <Route path="/mockAttendance" element={<MockAttendance />} />

      </Routes>
      </Router>
    </>
  )
}

export default App