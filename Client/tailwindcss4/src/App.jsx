import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import ForgotPass from './Components/forgotPass.jsx';
import ManageUsers from "./Components/manageUsers.jsx"; 
import MyAttendance from "./Components/MyAttendance.jsx"
import AdminSettings from './Components/adminSettings.jsx';
import AdminAttendance from './Components/adminAttendance.jsx';
import ReqPage from './Components/reqPage.jsx';
import DeptPage from "./Components/departmentPage.jsx";
import OTReqPage from "./Components/otReqPage.jsx";
import LeaveReqPage from "./Components/leaveReqPage.jsx";

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
          <Route path="/adminSettings" element={<AdminSettings />} />
          <Route path="/adminAttendance" element={<AdminAttendance />} />
          <Route path="/deptPage" element={<DeptPage />} />
          <Route path="/otReqPage" element={<OTReqPage />} />
          <Route path="/leaveReqPage" element={<LeaveReqPage />} />
      </Routes>
      </Router>
    </>
  )
}

export default App