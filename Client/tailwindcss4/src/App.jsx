import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import EmployeeAttendance from './Components/employeeAttendance.jsx';
import EditUser from './Components/editUSer.jsx';
import EmployeeHome from './Components/employHome.jsx';
<<<<<<< Updated upstream
import AddUser from './Components/callComponents/addUser.jsx';
import AdminEms from './Components/admin_Ems.jsx'
import ForgotPass from './Components/forgotPass.jsx';
import AdminAttendance from './Components/adminAttendance.jsx';
import EmployeeAttendance from './Components/employeeAttendance.jsx';

=======
import AddUser from './Components/addUser.jsx';
import AdminAttendance from './Components/adminAttendance.jsx';
>>>>>>> Stashed changes


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/employeeHome" element={<EmployeeHome />} />
          <Route path="/addUser" element={<AddUser />} />
          {/* <Route path="/attendancePage" element={<AttendancePage />} /> */}
<<<<<<< Updated upstream
          <Route path="/adminEms" element={<AdminEms />} />
          <Route path="/forgotPass" element={<ForgotPass />} />
          <Route path="/adminAttendance" element={<AdminAttendance />} />
          <Route path="/employeeAttendance" element={<EmployeeAttendance />} />
=======
          <Route path="/editUser" element={<EditUser />} />
          <Route path="/employeeAttendance" element={<EmployeeAttendance />} />
          <Route path="/adminAttendance" element={<AdminAttendance />} />
>>>>>>> Stashed changes
      </Routes>
      </Router>
    </>
  )
}

export default App