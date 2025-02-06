import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Components/loginPage.jsx';


function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <div>
        <LoginPage />
      </div>
    </>
  )
}

export default App
