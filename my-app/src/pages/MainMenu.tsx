import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MainMenu.css";

const MainMenu = () => {
    const [username, setUsername] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (!storedUsername) {
            navigate("/");
        } else {
            setUsername(storedUsername);
        }
    }, [navigate]);

    const handleExit = () => {
        localStorage.removeItem("username");
        navigate("/");
    };

    return (
        <div
            className="main-menu"
            style={{
                backgroundImage: "url('/images/main-background.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            }}
        >
            <div className="glass-card menu-card">
                {/*<p className="menu-greeting">Welcome</p>*/}
                <h1 className="menu-title">
                    Hello, <span>{username}</span>
                </h1>
                <div className="menu-divider" />

                <div className="menu-buttons">
                    <button
                        className="menu-btn menu-btn-primary"
                        onClick={() => navigate("/learning")}
                    >
                        <span className="menu-btn-icon">🔬</span> Learning Plankton
                    </button>
                    <button
                        className="menu-btn menu-btn-primary"
                        onClick={() => navigate("/training")}
                    >
                        <span className="menu-btn-icon">🤖</span> Training AI
                    </button>
                    <button className="menu-btn menu-btn-exit" onClick={handleExit}>
                        Exit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
