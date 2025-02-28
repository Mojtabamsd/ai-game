import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TeachingPage from "./pages/TeachingPage";
import TrainingPage from "./pages/TrainingPage";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/teaching" element={<TeachingPage />} />
                <Route path="/training" element={<TrainingPage />} />
            </Routes>
        </Router>
    );
};

export default App;