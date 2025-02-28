import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const categories = ["Copepods", "Diatoms", "Jellyfish", "Detritus"];

const LearningPage = () => {
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
        <div className="container text-center mt-5">
            {!showQuiz ? (
                step < categories.length ? (
                    <>
                        <h2 className="mb-4">Learn About: {categories[step]}</h2>
                        <img src={`/dataset/${categories[step]}/image1.png`} alt={categories[step]} className="img-fluid border rounded mb-4" style={{ width: "300px", height: "300px" }} />
                        <button onClick={() => setStep(step + 1)} className="btn btn-success">Next</button>
                    </>
                ) : null
            ) : (
                <>
                    <h2 className="mb-4">Which category is this?</h2>
                    {quizImage && <img src={quizImage} alt="Quiz Example" className="img-fluid border rounded mb-4" style={{ width: "300px", height: "300px" }} />}
                    <div className="row justify-content-center">
                        {categories.map((category) => (
                            <div className="col-6 col-md-3 mb-2" key={category}>
                                <button onClick={() => checkAnswer(category)} className="btn btn-primary w-100">
                                    {category}
                                </button>
                            </div>
                        ))}
                    </div>
                    {feedback && <p className="mt-4 fw-bold">{feedback}</p>}
                </>
            )}
            <Link to="/" className="btn btn-danger mt-4">Back to Main Menu</Link>
        </div>
    );
};

export default LearningPage;
