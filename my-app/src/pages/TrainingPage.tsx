import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./TrainingPage.css";

const categories = ["Copepods", "Foraminifera", "Jellyfish", "Marine Snow"];

const TrainingPage = () => {
    const [trainingImages, setTrainingImages] = useState<{ image: string, category: string }[]>([]);
    const [draggedImage, setDraggedImage] = useState<string | null>(null);
    const [sortedImages, setSortedImages] = useState<{ [key: string]: string[] }>({});
    const [isTraining, setIsTraining] = useState(false);
    const [trainingResult, setTrainingResult] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [timer, setTimer] = useState(60);
    const [timerActive, setTimerActive] = useState(true);
    const [topScores, setTopScores] = useState<{ username: string; accuracy: number }[]>([]);
    const [sessionSaved, setSessionSaved] = useState(false);
    const [history, setHistory] = useState<{ image: { image: string, category: string }, category: string }[]>([]);
    const startTimeRef = useRef<number>(Date.now());
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (!storedUsername) {
            navigate("/");
        } else {
            setUsername(storedUsername);
        }
    }, [navigate]);

    useEffect(() => {
        fetchTrainingImages();
        startTimeRef.current = Date.now();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === "z" || e.key === "Z") && !trainingResult) {
                handleUndo();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [history, trainingResult]);

    useEffect(() => {
        if (timer > 0 && timerActive) {
            const countdown = setTimeout(() => setTimer(timer - 1), 1000);
            return () => clearTimeout(countdown);
        } else if (timer === 0 && timerActive) {
            startTraining();
        }
    }, [timer, timerActive]);

    useEffect(() => {
        if (trainingResult) {
            fetch("http://localhost:5000/top-scores")
                .then(res => res.json())
                .then(data => setTopScores(data));
        }
    }, [trainingResult]);

    const fetchTrainingImages = async () => {
        try {
            const response = await fetch("http://localhost:5000/random-images");
            const data = await response.json();
            if (data.images) {
                const updatedImages = data.images.map((img: { image: string, category: string }) => ({
                    image: `/dataset/train/${img.category}/${img.image.split("/").pop()}`,
                    category: img.category
                }));
                setTrainingImages(updatedImages.slice(0, 32));
            }
        } catch (error) {
            console.error("Error fetching training images:", error);
        }
    };

    const handleDragStart = (image: string) => setDraggedImage(image);

    const handleDrop = (category: string) => {
        if (draggedImage) {
            const originalImage = trainingImages.find(img => img.image === draggedImage);
            if (originalImage) {
                setHistory(prev => [...prev, { image: originalImage, category }]);
            }
            setSortedImages(prev => ({
                ...prev,
                [category]: [...(prev[category] || []), draggedImage],
            }));
            setTrainingImages(trainingImages.filter(img => img.image !== draggedImage));
            setDraggedImage(null);
        }
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const last = history[history.length - 1];
        setSortedImages(prev => {
            const updated = { ...prev };
            updated[last.category] = (updated[last.category] || []).filter(
                img => img !== last.image.image
            );
            return updated;
        });
        setTrainingImages(prev => [...prev, last.image]);
        setHistory(prev => prev.slice(0, -1));
    };

    const saveSession = async (accuracy: number, finalSortedImages: { [key: string]: string[] }) => {
        if (!username || sessionSaved) return;
        const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
        const totalImages = Object.values(finalSortedImages).reduce((sum, imgs) => sum + imgs.length, 0);
        try {
            await fetch("http://localhost:5000/save-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, accuracy, sortedImages: finalSortedImages, totalImages, timeTaken })
            });
            setSessionSaved(true);
        } catch (error) {
            console.error("Error saving session:", error);
        }
    };

    const startTraining = async () => {
        if (!isTraining) {
            setIsTraining(true);
            setTimerActive(false);
            setTrainingResult("Training...");
            const finalSortedImages = { ...sortedImages };
            try {
                const response = await fetch("http://localhost:5000/start-training", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sortedImages: finalSortedImages })
                });
                const data = await response.json();
                const accuracy = parseFloat(data.accuracy);
                setTrainingResult(`${accuracy}`);
                await saveSession(accuracy, finalSortedImages);
                await fetch("http://localhost:5000/save-score", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, accuracy, overwrite: true })
                });
            } catch (error) {
                console.error("Error starting training:", error);
                setTrainingResult("error");
            }
            setIsTraining(false);
        }
    };

    const accuracyNum = trainingResult && trainingResult !== "error" && trainingResult !== "Training..."
        ? parseFloat(trainingResult) : null;

    return (
        <div
            className="training-page"
            style={{
                backgroundImage: "url('/images/training-background.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed"
            }}
        >
            {/* Processing overlay */}
            {isTraining && (
                <div className="processing-overlay">
                    <div className="processing-spinner" />
                    <p className="processing-text">Training AI model…</p>
                </div>
            )}

            <div className={`glass-card training-container ${isTraining ? "blurred" : ""}`}>

                {/* ── Game screen ── */}
                {!trainingResult ? (
                    <>
                        <div className="training-header">
                            <h2 className="training-title">
                                <span>{username}</span>, sort the plankton images
                            </h2>
                            <span className={`timer-badge ${timer <= 10 ? "urgent" : ""}`}>
                                ⏱ {timer}s remaining
                            </span>
                        </div>

                        {/* Drop zones */}
                        <div className="row g-3 mb-2">
                            {categories.map((category) => (
                                <div key={category} className="col-md-3 col-6">
                                    <div
                                        className="drop-zone"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => handleDrop(category)}
                                    >
                                        <div className="drop-zone-title">{category}</div>
                                        <div className="drop-zone-count">
                                            {sortedImages[category]?.length || 0} image{sortedImages[category]?.length !== 1 ? "s" : ""}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Images to sort */}
                        <div className="images-grid">
                            {trainingImages.length === 0 ? (
                                <p style={{ color: "#5a7a8a", fontSize: "0.9rem", margin: "20px 0" }}>
                                    All images sorted — press Start Training when ready.
                                </p>
                            ) : (
                                trainingImages.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img.image}
                                        alt="Plankton"
                                        draggable
                                        onDragStart={() => handleDragStart(img.image)}
                                        className="training-image"
                                    />
                                ))
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="training-actions">
                            <button
                                className="btn-ghost"
                                onClick={handleUndo}
                                disabled={history.length === 0}
                                title="Undo last drop"
                            >
                                ↩ Undo (Z)
                            </button>
                            <button
                                className="btn-ocean"
                                onClick={startTraining}
                                disabled={isTraining}
                            >
                                Submit & Train
                            </button>
                            <Link to="/main-menu" className="btn-coral" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", padding: "14px 28px", borderRadius: "14px" }}>
                                ← Back
                            </Link>
                        </div>
                    </>
                ) : (

                    /* ── Results screen ── */
                    <div className="score-container">
                        <p className="score-label">Your accuracy</p>

                        {accuracyNum !== null ? (
                            <>
                                <div className="score-value"><span>{accuracyNum}</span>%</div>
                                <p className="score-subtitle">
                                    {accuracyNum >= 80 ? "Excellent classification! 🎉" :
                                        accuracyNum >= 60 ? "Good effort — keep practising!" :
                                            "Nice try — the AI is learning from you!"}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="score-value" style={{ color: "#ff6b5b" }}>—</div>
                                <p className="score-subtitle">Training failed. Please try again.</p>
                            </>
                        )}

                        {topScores.length > 0 && (
                            <div className="leaderboard">
                                <div className="leaderboard-header">Leaderboard</div>
                                {topScores.map((entry, idx) => (
                                    <div key={idx} className="leaderboard-row">
                                        <span className="leaderboard-rank">#{idx + 1}</span>
                                        <span>{entry.username}</span>
                                        <span className="leaderboard-score">{entry.accuracy}%</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                            <button className="btn-ocean" onClick={() => window.location.reload()}>
                                Play Again
                            </button>
                            <Link to="/" className="btn-coral" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", padding: "14px 28px", borderRadius: "14px" }}>
                                Exit
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainingPage;
