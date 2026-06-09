import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
                let name = generateRandomName();
                while (names.includes(name)) name = generateRandomName();
                setUsername(name);
            })
            .catch(() => setUsername(generateRandomName()));
    }, []);

    const handleLogin = () => {
        let name = username;
        if (existingUsernames.includes(name)) {
            name = generateRandomName();
            while (existingUsernames.includes(name)) name = generateRandomName();
            setUsername(name);
        }
        localStorage.setItem("username", name);
        navigate("/main-menu");
    };

    return (
        <div
            className="start-page"
            style={{
                backgroundImage: "url('/images/start-background.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            }}
        >
            <div className="glass-card start-card">
                <p className="start-eyebrow">Citizen Science Project</p>
                <h1 className="start-title">
                    AI Learning<br /><span>Platform</span>
                </h1>
                <p className="start-subtitle">
                    Help train an AI to identify plankton species.<br />
                    Drag and sort images — every choice you make matters.
                </p>

                {username ? (
                    <div className="player-badge">
                        <span className="player-badge-label">Your name</span>
                        <span className="player-badge-name">{username}</span>
                    </div>
                ) : (
                    <div className="player-badge" style={{ opacity: 0.5 }}>
                        <span className="player-badge-label">Generating name…</span>
                    </div>
                )}

                <div className="start-btn-wrapper">
                    <button
                        className="btn-ocean"
                        onClick={handleLogin}
                        disabled={!username}
                    >
                        {username ? "Start Game 🌊" : "Loading…"}
                    </button>
                </div>

                <p className="privacy-notice">
                    <strong>Data notice:</strong> Your sorting selections and accuracy score
                    are recorded anonymously for scientific research. No personal information
                    is collected. By playing, you agree to contribute your results.
                </p>
            </div>
        </div>
    );
};

export default StartPage;
