import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import StartPage from "./pages/StartPage";
import MainMenu from "./pages/MainMenu";
import LearningPage from "./pages/LearningPage";
import TrainingPage from "./pages/TrainingPage";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<StartPage />} />
                <Route path="/main-menu" element={<MainMenu />} />
                <Route path="/learning" element={<LearningPage />} />
                <Route path="/training" element={<TrainingPage />} />
            </Routes>
        </Router>
    );
};

export default App;
