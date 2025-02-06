import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from '../Components/loginPage.jsx';

function App() {
    return (
        <Routes>
            <Route path="/loginPage" element={<LoginPage />} />
        </Routes>
    );
}

export default App;
