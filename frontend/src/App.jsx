import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import Results from "./pages/Results";
import DetailedAnalysis from "./pages/DetailedAnalysis";
import AmbientField from "./components/AmbientField";

export default function App() {
    return (
        <>
            <AmbientField />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/analyze" element={<Analyze />} />
                <Route path="/results" element={<Results />} />
                <Route
                    path="/results/details"
                    element={<DetailedAnalysis />}
                />
            </Routes>
        </>
    );
}
