import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import EditUser from './Components/editUSer.jsx';
import EmployeeHome from './Components/employHome.jsx';
import ProfSettings from './Components/editUser.jsx';


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/employeeHome" element={<EmployeeHome />} />
          <Route path="/profileSettings" element={<ProfSettings />} />
          <Route path="/editUser" element={<EditUser />} />
        </Routes>
      </Router>
    </>
  )
}

export default App