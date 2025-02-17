import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import EmployeeHome from './Components/employHome.jsx';
import AddUser from './Components/callComponents/addUser.jsx';
<<<<<<<<< Temporary merge branch 1
=========
import ViewEmployee from "./Components/viewEmploy.jsx";

>>>>>>>>> Temporary merge branch 2
import AdminEms from './Components/admin_Ems.jsx'
import ForgotPass from './Components/forgotPass.jsx';



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
          <Route path="/editUser" element={<EditUser/>} />
>>>>>>>>> Temporary merge branch 2
      </Routes>
      </Router>
    </>
  )
}

export default App