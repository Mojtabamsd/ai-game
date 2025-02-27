import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const categories = ["Copepods", "Diatoms", "Jellyfish", "Detritus"];

const TrainingPage = () => {
    const [trainingImages, setTrainingImages] = useState<{ image: string, category: string }[]>([]);
    const [draggedImage, setDraggedImage] = useState<string | null>(null);
    const [sortedImages, setSortedImages] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        fetchTrainingImages();
    }, []);

    const fetchTrainingImages = async () => {
        try {
            const response = await fetch("http://localhost:5000/random-images");
            const data = await response.json();
            if (data.images) {
                setTrainingImages(data.images.slice(0, 10)); // Show 10 random images
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

    return (
        <div className="container text-center mt-5">
            <h1 className="mb-4">Training: Drag Images into Categories</h1>

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

            <Link to="/" className="btn btn-danger mt-4">Back to Main Menu</Link>
        </div>
    );
};

export default TrainingPage;
