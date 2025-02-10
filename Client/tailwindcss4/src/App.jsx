import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import EmployeeHome from './Components/employHome.jsx';
import ProfSettings from './Components/profileSettings.jsx';


function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <Router>
        <Routes>
        <Route path="/loginPage" element={<LoginPage />} />
        <Route path="/employeeHome" element={<EmployeeHome />} />
        <Route path="/profileSettings" element={<ProfSettings />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
