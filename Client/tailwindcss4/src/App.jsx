import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import EmployeeHome from './Components/employHome.jsx';
import AddUser from './Components/callComponents/addUser.jsx';
import AdminEms from './Components/admin_Ems.jsx'
import ForgotPass from './Components/forgotPass.jsx';
import AdminAttendance from './Components/adminAttendance.jsx';
import EmployeeAttendance from './Components/employeeAttendance.jsx';



function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/employeeHome" element={<EmployeeHome />} />
          <Route path="/addUser" element={<AddUser />} />
          {/* <Route path="/attendancePage" element={<AttendancePage />} /> */}
          <Route path="/adminEms" element={<AdminEms />} />
          <Route path="/forgotPass" element={<ForgotPass />} />
          <Route path="/adminAttendance" element={<AdminAttendance />} />
          <Route path="/employeeAttendance" element={<EmployeeAttendance />} />
      </Routes>
      </Router>
    </>
  )
}

export default App