import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import EditUser from './Components/callComponents/editUser.jsx';
import EmployeeAttendance from './Components/employeeAttendance.jsx';
import EmployeeHome from './Components/employHome.jsx';
import AddUser from './Components/callComponents/addUser.jsx';
import ViewEmployee from "./Components/viewEmploy.jsx";

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
          <Route path="/adminEms" element={<AdminEms />} />
          <Route path="/editUser" element={<EditUser />} />
          <Route path="/employeeAttendance" element={<EmployeeAttendance />} />
          <Route path="/viewEmploy" element={<ViewEmployee />} />
        <Route path="/adminEMS" element={<AdminEms />} />
      </Routes>
      </Router>
    </>
  )
}

export default App