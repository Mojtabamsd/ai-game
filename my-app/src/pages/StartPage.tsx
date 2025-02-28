import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

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
        <div className="container text-center mt-5">
            <h1 className="mb-4">Welcome to AI Learning Platform</h1>
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleLogin}>Start Game</button>
        </div>
    );
};

export default StartPage;