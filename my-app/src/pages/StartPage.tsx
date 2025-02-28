import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./StartPage.css"; // Ensure this file exists in the same directory

const StartPage = () => {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const handleLogin = () => {
        if (username.trim() !== "") {
            localStorage.setItem("username", username);
            navigate("/main-menu");
        }
    };

    return (
        <div className="start-page d-flex align-items-center justify-content-center vh-100" style={{
            backgroundImage: "url('/images/amy-humphries-2M_sDJ_agvs-unsplash.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
        }}>
            <div className="login-container text-center p-4">
                <h1 className="mb-3 text-white">🌊 AI Learning Platform</h1>
                <p className="text-white">Enter your name to start the adventure!</p>
                <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Enter your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button className="btn btn-primary start-button w-100" onClick={handleLogin}>
                    Start Game
                </button>
            </div>
        </div>
    );
};

export default StartPage;
