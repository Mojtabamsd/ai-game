import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const categories = ["Copepods", "Diatoms", "Jellyfish", "Detritus"];

const TrainingPage = () => {
    const [trainingImages, setTrainingImages] = useState<{ image: string, category: string }[]>([]);
    const [draggedImage, setDraggedImage] = useState<string | null>(null);
    const [sortedImages, setSortedImages] = useState<{ [key: string]: string[] }>({});
    const [isTraining, setIsTraining] = useState(false);
    const [trainingResult, setTrainingResult] = useState<string | null>(null);
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

    useEffect(() => {
        fetchTrainingImages();
    }, []);

    const fetchTrainingImages = async () => {
        try {
            const response = await fetch("http://localhost:5000/random-images");
            const data = await response.json();
            if (data.images) {
                const updatedImages = data.images.map((img: { image: string, category: string }) => ({
                    image: `/dataset/train/${img.category}/${img.image.split("/").pop()}`, // Ensure correct path
                    category: img.category
                }));
                setTrainingImages(updatedImages.slice(0, 10)); // Show 10 random images
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
        setIsTraining(true);
        setTrainingResult(null);
        try {
            const response = await fetch("http://localhost:5000/start-training", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sortedImages })
            });
            const data = await response.json();
            setTrainingResult(`Training completed! Accuracy: ${data.accuracy}%`);
        } catch (error) {
            console.error("Error starting training:", error);
            setTrainingResult("Training failed. Please try again.");
        }
        setIsTraining(false);
    };

    return (
        <div className="container text-center mt-5">
            <h1 className="mb-4">Hello, {username}! Welcome to Training AI</h1>

            <div className="row mb-4">
                {categories.map((category) => (
                    <div
                        key={category}
                        className="col-md-3 border border-primary rounded p-3 text-center bg-light"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(category)}
                    >
                        <h5>{category}</h5>
                        <p className="text-muted">{sortedImages[category]?.length || 0} images</p>
                    </div>
                ))}
            </div>

            <div className="d-flex flex-wrap justify-content-center gap-2">
                {trainingImages.map((img, index) => (
                    <img
                        key={index}
                        src={img.image}
                        alt="Training"
                        draggable
                        onDragStart={() => handleDragStart(img.image)}
                        className="img-thumbnail"
                        style={{ width: "100px", height: "100px", cursor: "grab" }}
                    />
                ))}
            </div>

            <button
                className="btn btn-success mt-4"
                onClick={startTraining}
                disabled={isTraining}
            >
                {isTraining ? "Training..." : "Start Training"}
            </button>

            {trainingResult && <p className="mt-3 fw-bold">{trainingResult}</p>}

            <Link to="/main-menu" className="btn btn-danger mt-4">Back to Main Menu</Link>
        </div>
    );
};

export default TrainingPage;