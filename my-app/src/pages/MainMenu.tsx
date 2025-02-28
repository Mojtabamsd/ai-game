import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
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
        <div className="main-menu d-flex align-items-center justify-content-center vh-100" style={{
            backgroundImage: "url('/images/ocean-background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
        }}>
            <div className="menu-container text-center p-4">
                <h1 className="mb-4 text-white">Hello, {username}! Welcome to the Main Menu</h1>
                <div className="d-grid gap-3 col-6 mx-auto">
                    <button className="btn btn-primary btn-lg menu-button" onClick={() => navigate("/learning")}>Learning Plankton</button>
                    <button className="btn btn-primary btn-lg menu-button" onClick={() => navigate("/training")}>Training AI</button>
                    <button className="btn btn-danger btn-lg menu-button" onClick={handleExit}>Exit</button>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
