import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import EmployeeAttendance from './Components/employeeAttendance.jsx';
import EditUser from './Components/editUSer.jsx';
import EmployeeHome from './Components/employHome.jsx';
import AddUser from './Components/addUser.jsx';
import AdminEms from './Components/admin_Ems.jsx'


function App() {
  return (
    <>
      <Router>
        <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/employeeHome" element={<EmployeeHome />} />
        <Route path="/addUser" element={<AddUser />} />
        {/* <Route path="/attendancePage" element={<AttendancePage />} /> */}
          <Route path="/editUser" element={<EditUser />} />
          <Route path="/employeeAttendance" element={<EmployeeAttendance />} />
        <Route path="/adminHome" element={<AdminEms />} />
      </Routes>
      </Router>
    </>
  )
}

export default App