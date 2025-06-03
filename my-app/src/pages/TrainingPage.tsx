import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./TrainingPage.css";

const categories = ["Copepods", "Foraminifera", "Cnidaria", "Detritus"];

const TrainingPage = () => {
    const [trainingImages, setTrainingImages] = useState<{ image: string, category: string }[]>([]);
    const [draggedImage, setDraggedImage] = useState<string | null>(null);
    const [sortedImages, setSortedImages] = useState<{ [key: string]: string[] }>({});
    const [isTraining, setIsTraining] = useState(false);
    const [trainingResult, setTrainingResult] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [timer, setTimer] = useState(50);
    const [timerActive, setTimerActive] = useState(true);
    const [topScores, setTopScores] = useState<{ username: string; accuracy: number }[]>([]);
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
    }, []);

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
                setTrainingImages(updatedImages.slice(0, 25));
            }
        } catch (error) {
            console.error("Error fetching training images:", error);
        }
    };

    const handleDragStart = (image: string) => {
        setDraggedImage(image);
    };

    const handleDrop = (category: string) => {
        if (draggedImage) {
            setSortedImages((prev) => ({
                ...prev,
                [category]: [...(prev[category] || []), draggedImage],
            }));
            setTrainingImages(trainingImages.filter(img => img.image !== draggedImage));
            setDraggedImage(null);
        }
    };

    const startTraining = async () => {
        if (!isTraining) {
            setIsTraining(true);
            setTimerActive(false);
            setTrainingResult("Training...");
            try {
                const response = await fetch("http://localhost:5000/start-training", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sortedImages })
                });
                const data = await response.json();
                const accuracy = parseFloat(data.accuracy);
                setTrainingResult(`Accuracy: ${accuracy}%`);

                await fetch("http://localhost:5000/save-score", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, accuracy, overwrite: true })
                });
            } catch (error) {
                console.error("Error starting training:", error);
                setTrainingResult("Training failed. Please try again.");
            }
            setIsTraining(false);
        }
    };

    return (
        <div className="training-page d-flex align-items-center justify-content-center vh-100" style={{
            backgroundImage: "url('/images/training-background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
        }}>
            <div className={`training-container text-center p-5 ${isTraining ? "blurred" : ""}`}>
                {!isTraining && !trainingResult ? (
                    <>
                        <h2 className="mb-4 text-white">{username}, drag and drop images to each category</h2>
                        <h3 className="text-warning">Time Left: {timer}s</h3>
                        <div className="row mb-4">
                            {categories.map((category) => (
                                <div
                                    key={category}
                                    className="col-md-3 border border-warning rounded p-4 text-center bg-dark text-white"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(category)}
                                >
                                    <h5>{category}</h5>
                                    <p>{sortedImages[category]?.length || 0} images</p>
                                </div>
                            ))}
                        </div>

                        <div className="d-flex flex-wrap justify-content-center gap-3">
                            {trainingImages.map((img, index) => (
                                <img
                                    key={index}
                                    src={img.image}
                                    alt="Training"
                                    draggable
                                    onDragStart={() => handleDragStart(img.image)}
                                    className="img-thumbnail shadow-lg rounded"
                                    style={{ width: "120px", height: "120px", cursor: "grab" }}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="score-container text-white d-flex flex-column align-items-center justify-content-center">
                        <h1 className="display-3 fw-bold score-text">{trainingResult}</h1>

                        {topScores.length > 0 && (
                            <div className="leaderboard bg-white text-dark p-4 rounded mt-4 w-75">
                                <h4 className="mb-3">Top Scores</h4>
                                <ul className="list-group">
                                    {topScores.map((entry, idx) => (
                                        <li key={idx} className="list-group-item d-flex justify-content-between">
                                            <span>{entry.username}</span>
                                            <span>{entry.accuracy}%</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button className="btn btn-primary btn-lg mt-4" onClick={() => window.location.reload()}>Train Again</button>
                        <Link to="/" className="btn btn-danger btn-lg mt-2">Exit to Start Page</Link>
                    </div>
                )}
                {!isTraining && !trainingResult && (
                    <button className="btn btn-success btn-lg mt-4" onClick={startTraining} disabled={isTraining}>
                        Start Training
                    </button>
                )}
                {!isTraining && !trainingResult && <Link to="/main-menu" className="btn btn-danger btn-lg mt-4">Back to Main Menu</Link>}
            </div>
        </div>
    );
};

export default TrainingPage;