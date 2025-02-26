import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-6">AI Learning Platform</h1>
            <div className="grid grid-cols-1 gap-6">
                <Link to="/teaching" className="px-6 py-4 bg-blue-500 text-white rounded text-xl hover:bg-blue-700 text-center">
                    Teaching
                </Link>
                <Link to="/training" className="px-6 py-4 bg-gray-400 text-white rounded text-xl hover:bg-gray-600 text-center">
                    Training a Classifier (Coming Soon)
                </Link>
                <Link to="/prediction" className="px-6 py-4 bg-gray-400 text-white rounded text-xl hover:bg-gray-600 text-center">
                    AI Classifier Prediction (Coming Soon)
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
