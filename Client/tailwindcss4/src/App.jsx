import { BrowserRouter as Router, Routes, Route,  } from "react-router-dom";
// import { useState } from 'react';
import LoginPage from './Components/loginPage.jsx';
import ForgotPass from './Components/forgotPass.jsx';
import ManageUsers from "./Components/manageUsers.jsx"; 
import MyAttendance from "./Components/myAttendance.jsx"
import AccSettings from './Components/accSettings.jsx';
import AdminAttendance from './Components/adminAttendance.jsx';
import ReqPage from './Components/reqPage.jsx';
import DeptPage from "./Components/departmentPage.jsx";
import NotFound from "./Components/notFound.jsx"; 
// import ProtectedRoutes from "./Components/protectedRoutes.jsx";


function App() {

  // const [isAuthenticated, setIsAuthenticated] = useState(false);
   {/* Protected Routes
          <Route path="/protectedRoutes" element={<ProtectedRoutes isAuthenticated={isAuthenticated} />} /> */}

 
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage  />} />
          <Route path="/reqPage" element={<ReqPage />} />
          <Route path="/forgotPass" element={<ForgotPass />} />
          <Route path="/manageUsers" element={<ManageUsers />} />
          <Route path="/myAttendance" element={<MyAttendance />} />
          <Route path="/accSettings" element={<AccSettings />} />
          <Route path="/adminAttendance" element={<AdminAttendance />} />
          <Route path="/deptPage" element={<DeptPage />} />
          <Route path="/myAttendance" element={<MyAttendance />} />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
      </Routes>
      </Router>
    </>
  )
}

export default App