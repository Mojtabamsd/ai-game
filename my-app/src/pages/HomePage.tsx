import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const HomePage = () => {
    return (
        <div className="container text-center mt-5">
            <h1 className="mb-4">AI Learning Platform</h1>
            <div className="d-grid gap-3 col-6 mx-auto">
                <Link to="/learning" className="btn btn-primary btn-lg">
                    Learning Plankton
                </Link>
                <Link to="/training" className="btn btn-primary btn-lg">
                    Training AI
                </Link>
            </div>
        </div>
    );
};

export default HomePage;