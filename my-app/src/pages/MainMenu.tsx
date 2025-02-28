import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

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
        <div className="container text-center mt-5">
            <h1 className="mb-4">Hello, {username}! Welcome to the Main Menu</h1>
            <div className="d-grid gap-3 col-6 mx-auto">
                <button className="btn btn-primary btn-lg" onClick={() => navigate("/learning")}>Learning Plankton</button>
                <button className="btn btn-primary btn-lg" onClick={() => navigate("/training")}>Training AI</button>
                <button className="btn btn-danger btn-lg" onClick={handleExit}>Exit</button>
            </div>
        </div>
    );
};

export default MainMenu;
