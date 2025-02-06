import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import './index.css'


function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <div>
        <loginPage />
      </div>
    </>
  )
}

export default App
