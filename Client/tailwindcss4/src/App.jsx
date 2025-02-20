import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import ForgotPass from './Components/forgotPass.jsx';
import AdminDashboard from "./Components/adminDashboard.jsx"; 
import EmployeeDashboard from "./Components/employeeDashboard.jsx";
import { Req } from './Components/callComponents/Req.jsx';
import Sidebar from './Components/callComponents/sidebar.jsx';
import EmployeeHome from './Components/employHome.jsx';
// import AdminEms from './Components/admin_Ems.jsx'
import AddUser from './Components/callComponents/addUser.jsx';



function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/addUser" element={<AddUser />} />
          <Route path="/employeeHome" element={<EmployeeHome />} />
          {/* <Route path="/attendancePage" element={<AttendancePage />} /> */}
          {/* <Route path="/adminEms" element={<AdminEms />} /> */}
          <Route path="/req" element={<Req />} />
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/forgotPass" element={<ForgotPass />} />
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path="/employeeDashboard" element={<EmployeeDashboard />} />
      </Routes>
      </Router>
    </>
  )
}

export default App