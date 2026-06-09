import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./StartPage.css";

const adjectives = [
    "Swift", "Brave", "Cosmic", "Deep", "Electric", "Fierce", "Golden",
    "Hidden", "Iron", "Jade", "Keen", "Lunar", "Mystic", "Noble", "Ocean",
    "Polar", "Quantum", "Radiant", "Silent", "Tidal", "Ultra", "Vivid",
    "Wild", "Xenon", "Yellow", "Zephyr"
];

const nouns = [
    "Shark", "Whale", "Diver", "Sailor", "Coral", "Anchor", "Wave",
    "Tide", "Reef", "Pearl", "Kraken", "Dolphin", "Orca", "Manta",
    "Squid", "Turtle", "Crab", "Puffer", "Marlin", "Narwhal"
];

const generateRandomName = () => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 100);
    return `${adj}${noun}${num}`;
};

const StartPage = () => {
    const [username, setUsername] = useState("");
    const [existingUsernames, setExistingUsernames] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:5000/top-scores")
            .then(res => res.json())
            .then(data => {
                const names = data.map((entry: { username: string }) => entry.username);
                setExistingUsernames(names);

                // Generate a unique random name
                let name = generateRandomName();
                while (names.includes(name)) {
                    name = generateRandomName();
                }
                setUsername(name);
            })
            .catch(() => {
                // If server is unreachable, still generate a name
                setUsername(generateRandomName());
            });
    }, []);

    const handleLogin = () => {
        let name = username;

        // Extra safety: if somehow name is taken, regenerate
        if (existingUsernames.includes(name)) {
            name = generateRandomName();
            while (existingUsernames.includes(name)) {
                name = generateRandomName();
            }
            setUsername(name);
        }

        localStorage.setItem("username", name);
        navigate("/main-menu");
    };

    return (
        <div
            className="start-page d-flex align-items-center justify-content-center vh-100"
            style={{
                backgroundImage: "url('/images/start-background.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            }}
        >
            <div className="login-container text-center p-4">
                <h1 className="mb-3 text-white">🌊 AI Learning Platform</h1>
                <p className="text-white mb-1">Ready to start the adventure?</p>
                {username && (
                    <p className="text-white mb-4">
                        You'll play as: <strong>{username}</strong>
                    </p>
                )}
                <button
                    className="btn btn-primary start-button w-100"
                    onClick={handleLogin}
                    disabled={!username}
                >
                    {username ? "Start Game" : "Loading..."}
                </button>
            </div>
        </div>
    );
};

export default StartPage;
