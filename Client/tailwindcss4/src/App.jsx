import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import EmployeeHome from './Components/employHome.jsx';


function App() {
  return (
    <>
      <Router>
        <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/employeeHome" element={<EmployeeHome />} />
        {/* <Route path="/attendancePage" element={<AttendancePage />} /> */}
        </Routes>
      </Router>
    </>
  )
}

export default App