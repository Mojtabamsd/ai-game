import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./TrainingPage.css";

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-6">Training: Drag Images into Categories</h1>

            <div className="flex gap-6 mb-6">
                {categories.map((category) => (
                    <div
                        key={category}
                        className="w-48 h-48 border-2 border-dashed flex items-center justify-center text-center text-gray-500"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(category)}
                    >
                        {category}
                        <div className="mt-2 text-sm">{sortedImages[category]?.length || 0} images</div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4">
                {trainingImages.map((img, index) => (
                    <img
                        key={index}
                        src={img.image}
                        alt="Training"
                        draggable
                        onDragStart={() => handleDragStart(img.image)}
                        className="w-24 h-24 object-cover border rounded cursor-pointer"
                    />
                ))}
            </div>

            <Link to="/" className="mt-6 px-4 py-2 bg-red-500 text-white rounded">Back to Main Menu</Link>
        </div>
    );
};

export default TrainingPage;
