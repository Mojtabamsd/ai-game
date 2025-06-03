import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./LearningPage.css";

const categories = ["Copepods", "Foraminifera", "Cnidaria", "Detritus"];
const categoryDescriptions: { [key: string]: string } = {
    "Copepods": "Tiny crustaceans and the most numerous animals in the ocean! Copepods are the \"insects of the sea\" fast, abundant, and vital food for fish, whales, and seabirds.",
    "Foraminifera": "Single-celled organisms with beautiful, shell-like structures. These \"living sand grains\" help scientists study past climates from the seafloor.",
    "Cnidaria": "This group includes jellyfish and other gelatinous drifters. With stinging cells and graceful movements, they’re both mesmerizing and mysterious.",
    "Detritus": "Marine snow! Made of dead plankton, waste, and organic debris, detritus drifts down the water column and feeds life in the deep sea."
};

const LearningPage = () => {
    const [step, setStep] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizImage, setQuizImage] = useState<string | null>(null);
    const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (step < categories.length) {
            stopSpeaking();
            speakText(categoryDescriptions[categories[step]]);
        }
    }, [step]);

    const speakText = (text: string) => {
        stopSpeaking(); // Stop any ongoing speech
        if (text) {
            const speech = new SpeechSynthesisUtterance(text);
            speech.lang = "en-US";
            window.speechSynthesis.speak(speech);
        }
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
    };

    useEffect(() => {
        if (step >= categories.length) {
            startQuiz();
        }
    }, [step]);

    const startQuiz = async () => {
        setShowQuiz(true);
        stopSpeaking();
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

    const handleBackToMainMenu = () => {
        stopSpeaking();
        navigate("/main-menu");
    };

    return (
        <div className="learning-page d-flex align-items-center justify-content-center vh-100" style={{
            backgroundImage: "url('/images/learning-background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
        }}>
            <div className="learning-container text-center p-4">
                {!showQuiz ? (
                    step < categories.length ? (
                        <>
                            <h2 className="mb-4 text-white">{categories[step]}</h2>
                            <p className="text-white mb-4">{categoryDescriptions[categories[step]]}</p>
                            <img src={`/dataset/${categories[step]}/image1.png`} alt={categories[step]} className="img-fluid border rounded mb-4" style={{ width: "500px", height: "500px" }} />
                            <button onClick={() => setStep(step + 1)} className="btn btn-success btn-lg">Next</button>
                        </>
                    ) : null
                ) : (
                    <>
                        <h2 className="mb-4 text-white">Which category is this?</h2>
                        {quizImage && <img src={quizImage} alt="Quiz Example" className="img-fluid border rounded mb-4" style={{ width: "500px", height: "500px" }} />}
                        <div className="row justify-content-center">
                            {categories.map((category) => (
                                <div className="col-6 col-md-3 mb-2" key={category}>
                                    <button onClick={() => checkAnswer(category)} className="btn btn-primary btn-lg w-100">
                                        {category}
                                    </button>
                                </div>
                            ))}
                        </div>
                        {feedback && <p className="mt-4 fw-bold text-white">{feedback}</p>}
                    </>
                )}
                <button onClick={handleBackToMainMenu} className="btn btn-danger btn-lg mt-4">Back to Main Menu</button>
            </div>
        </div>
    );
};

export default LearningPage;
