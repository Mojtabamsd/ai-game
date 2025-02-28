import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LearningPage from "./pages/LearningPage";
import TrainingPage from "./pages/TrainingPage";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/learning" element={<LearningPage />} />
                <Route path="/training" element={<TrainingPage />} />
            </Routes>
        </Router>
    );
};

export default App;