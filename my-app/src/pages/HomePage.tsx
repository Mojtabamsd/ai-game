import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const HomePage = () => {
    return (
        <div className="container text-center mt-5">
            <h1 className="mb-4">AI Learning Platform</h1>
            <div className="d-grid gap-3 col-6 mx-auto">
                <Link to="/teaching" className="btn btn-primary btn-lg">
                    Teaching
                </Link>
                <Link to="/training" className="btn btn-primary btn-lg">
                    Training a Classifier
                </Link>
                <Link to="/prediction" className="btn btn-primary btn-lg">
                    AI Classifier Prediction
                </Link>
            </div>
        </div>
    );
};

export default HomePage;