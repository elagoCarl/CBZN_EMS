import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';
import EditUser from './Components/editUSer.jsx';


function App() {
  const [count, setCount] = useState(0)
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/editUser" element={<EditUser />} />
      </Routes>
    </Router>
  )
}

export default App
