import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
// import AttendancePage from './Components/attendancePage.jsx';
import AddUser from './Components/addUser.jsx';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {/* <Route path="/attendancePage" element={<AttendancePage />} /> */}
        <Route path="/addUser" element={<AddUser />} />
      </Routes>
    </Router>
  )
}

export default App