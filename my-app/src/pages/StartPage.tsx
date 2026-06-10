import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./StartPage.css";

const adjectives = [
    "Swift","Brave","Cosmic","Deep","Electric","Fierce","Golden",
    "Hidden","Iron","Jade","Keen","Lunar","Mystic","Noble","Ocean",
    "Polar","Quantum","Radiant","Silent","Tidal","Ultra","Vivid",
    "Wild","Xenon","Yellow","Zephyr"
];
const nouns = [
    "Shark","Whale","Diver","Sailor","Coral","Anchor","Wave",
    "Tide","Reef","Pearl","Kraken","Dolphin","Orca","Manta",
    "Squid","Turtle","Crab","Puffer","Marlin","Narwhal"
];

const generateRandomName = () => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 100);
    return `${adj}${noun}${num}`;
};

const StartPage = () => {
    const [username, setUsername] = useState("");
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState("");
    const [editError, setEditError] = useState("");
    const [existingUsernames, setExistingUsernames] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/top-scores")
            .then(res => res.json())
            .then(data => {
                const names = data.map((e: { username: string }) => e.username);
                setExistingUsernames(names);
                let name = generateRandomName();
                while (names.includes(name)) name = generateRandomName();
                setUsername(name);
            })
            .catch(() => setUsername(generateRandomName()));
    }, []);

    useEffect(() => {
        if (editing && inputRef.current) inputRef.current.focus();
    }, [editing]);

    const startEditing = () => {
        setEditValue(username);
        setEditError("");
        setEditing(true);
    };

    const confirmEdit = () => {
        const trimmed = editValue.trim();
        if (!trimmed) { setEditError("Name can't be empty."); return; }
        if (trimmed.length < 3) { setEditError("At least 3 characters."); return; }
        if (trimmed.length > 24) { setEditError("Max 24 characters."); return; }
        if (existingUsernames.includes(trimmed)) { setEditError("Name already taken."); return; }
        setUsername(trimmed);
        setEditing(false);
    };

    const cancelEdit = () => {
        setEditing(false);
        setEditError("");
    };

    const reroll = () => {
        let name = generateRandomName();
        while (existingUsernames.includes(name)) name = generateRandomName();
        setUsername(name);
        setEditing(false);
        setEditError("");
    };

    const handleLogin = () => {
        if (!username) return;
        localStorage.setItem("username", username);
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
                <h1 className="start-title">AI Learning<br /><span>Platform</span></h1>
                <p className="start-subtitle">
                    Help train an AI to identify plankton species.<br />
                    Drag and sort images — every choice you make matters.
                </p>

                {/* Name area */}
                <div className="name-area">
                    {!editing ? (
                        <>
                            <div className="player-badge">
                                <span className="player-badge-label">Playing as</span>
                                <span className="player-badge-name">{username || "…"}</span>
                            </div>
                            <div className="name-actions">
                                <button className="name-action-btn" onClick={startEditing} title="Edit name">
                                    ✏️ Edit
                                </button>
                                <button className="name-action-btn" onClick={reroll} title="Get a new random name">
                                    🎲 Reroll
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="name-edit">
                            <input
                                ref={inputRef}
                                className={`name-input ${editError ? "has-error" : ""}`}
                                value={editValue}
                                onChange={e => { setEditValue(e.target.value); setEditError(""); }}
                                onKeyDown={e => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") cancelEdit(); }}
                                maxLength={24}
                                placeholder="Enter your name"
                            />
                            {editError && <p className="name-error">{editError}</p>}
                            <div className="name-edit-actions">
                                <button className="name-confirm-btn" onClick={confirmEdit}>✓ Confirm</button>
                                <button className="name-cancel-btn" onClick={cancelEdit}>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="start-btn-wrapper">
                    <button className="btn-ocean" onClick={handleLogin} disabled={!username || editing}>
                        {username ? "Start Game 🌊" : "Loading…"}
                    </button>
                </div>

                <p className="privacy-notice">
                    <strong>Data notice:</strong> Your sorting selections and accuracy score are recorded
                    anonymously for scientific research. No personal information is collected.
                    By playing, you agree to contribute your results.
                </p>
            </div>
        </div>
    );
};

export default StartPage;
