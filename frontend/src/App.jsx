import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import Results from "./pages/Results";
import DetailedAnalysis from "./pages/DetailedAnalysis";
import History from "./pages/History";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AmbientField from "./components/AmbientField";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
    return (
        <>
            <AmbientField />

            <ErrorBoundary>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/history" element={<History />} />
                        <Route path="/analyze" element={<Analyze />} />
                        <Route path="/results/:id" element={<Results />} />
                        <Route
                            path="/results/:id/details"
                            element={<DetailedAnalysis />}
                        />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </ErrorBoundary>
        </>
    );
}
