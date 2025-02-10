import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import LoginPage from './Components/loginPage.jsx';
import EmployeeAttendance from './Components/employeeAttendance.jsx';


function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <div>
        <EmployeeAttendance />
      </div>
    </>
  )
}

export default App
