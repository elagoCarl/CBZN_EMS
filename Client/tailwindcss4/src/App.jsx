import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import EmployHome from './Components/employHome.jsx';


function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <Router>
        <Routes>
        <Route path="/loginPage" element={<LoginPage />} />
        <Route path="/EmployHome" element={<EmployHome />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
