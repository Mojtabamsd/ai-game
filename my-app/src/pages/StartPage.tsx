import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./StartPage.css";

const StartPage = () => {
    const [username, setUsername] = useState("");
    const [existingUsernames, setExistingUsernames] = useState<string[]>([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:5000/top-scores")
            .then(res => res.json())
            .then(data => setExistingUsernames(data.map((entry: { username: string }) => entry.username)));
    }, []);

    const handleLogin = () => {
        if (username.trim() === "") {
            setError("Please enter a name.");
            return;
        }
        if (existingUsernames.includes(username.trim())) {
            setError("Name already used. Please try another.");
            return;
        }
        localStorage.setItem("username", username.trim());
        navigate("/main-menu");
    };

    return (
        <div className="start-page d-flex align-items-center justify-content-center vh-100" style={{
            backgroundImage: "url('/images/start-background.jpg')",
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
                    onChange={(e) => {
                        setUsername(e.target.value);
                        setError("");
                    }}
                />
                <button className="btn btn-primary start-button w-100" onClick={handleLogin}>
                    Start Game
                </button>
                {error && <p className="text-danger mt-2">{error}</p>}
            </div>
        </div>
    );
};

export default StartPage;
