import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import EditUser from './Components/callComponents/editUser.jsx';
import EmployeeHome from './Components/employHome.jsx';
import AddUser from './Components/callComponents/addUser.jsx';
import AdminEms from './Components/admin_Ems.jsx'
import ForgotPass from './Components/forgotPass.jsx';
import AdminDashboard from "./Components/adminDashboard.jsx"; 
import EmployeeDashboard from "./Components/employeeDashboard.jsx";



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
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path="/employeeDashboard" element={<EmployeeDashboard />} />
      </Routes>
      </Router>
    </>
  )
}

export default App