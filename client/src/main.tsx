// import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import AppProvider from "./context/AppProvider.tsx"
import { AuthProvider } from './context/AuthContext';
import "@/styles/global.css"
import './index.css'
ReactDOM.createRoot(document.getElementById("root")!).render(
    // <React.StrictMode>
    <AppProvider>
        <AuthProvider>
        <App />
        </AuthProvider>
    </AppProvider>,
    // </React.StrictMode>
)
