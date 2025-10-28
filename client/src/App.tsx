import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import GitHubCorner from "./components/GitHubCorner"
import Toast from "./components/toast/Toast"
import EditorPage from "./pages/EditorPage"
import HomePage from "./pages/HomePage"
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import GetStartedPage from "./components/GetStartedPage"

const App = () => {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                     <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/editor/:roomId" element={<EditorPage />} />
                     <Route path="/get-started" element={<GetStartedPage />} />
                   
                </Routes>
            </Router>
            <GitHubCorner/>
            <Toast /> {/* Toast component from react-hot-toast */}
            
        </>
    )
}

export default App
