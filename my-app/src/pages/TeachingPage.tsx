import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const categories = ["Copepods", "Diatoms", "Jellyfish", "Detritus"];

const TeachingPage = () => {
    const [step, setStep] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizImage, setQuizImage] = useState<string | null>(null);
    const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    useEffect(() => {
        if (step >= categories.length) {
            startQuiz();
        }
    }, [step]);

    const startQuiz = async () => {
        setShowQuiz(true);
        loadNewQuizImage();
    };

    const loadNewQuizImage = async () => {
        try {
            const response = await fetch("http://localhost:5000/random-image");
            const data = await response.json();
            if (data.error) {
                console.error(data.error);
                return;
            }
            setQuizImage(data.image);
            setQuizAnswer(data.category);
            setFeedback(null);
        } catch (error) {
            console.error("Error fetching image:", error);
        }
    };

    const checkAnswer = (selected: string) => {
        setFeedback(selected === quizAnswer ? "✅ Correct!" : "❌ Oops! Incorrect.");
        setTimeout(() => {
            loadNewQuizImage();
            setFeedback(null);
        }, 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            {!showQuiz ? (
                step < categories.length ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Learn About: {categories[step]}</h2>
                        <img src={`/dataset/${categories[step]}/image1.png`} alt={categories[step]} className="w-60 h-60 object-cover border rounded mb-4" />
                        <button onClick={() => setStep(step + 1)} className="px-4 py-2 bg-green-500 text-white rounded">Next</button>
                    </>
                ) : null
            ) : (
                <>
                    <h2 className="text-2xl font-bold mb-4">Which category is this?</h2>
                    {quizImage && <img src={quizImage} alt="Quiz Example" className="w-60 h-60 object-cover border rounded mb-4" />}
                    <div className="grid grid-cols-2 gap-4">
                        {categories.map((category) => (
                            <button key={category} onClick={() => checkAnswer(category)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
                                {category}
                            </button>
                        ))}
                    </div>
                    {feedback && <p className="mt-4 text-lg font-semibold">{feedback}</p>}
                </>
            )}
            <Link to="/" className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Back to Main Menu</Link>
        </div>
    );
};

export default TeachingPage;
