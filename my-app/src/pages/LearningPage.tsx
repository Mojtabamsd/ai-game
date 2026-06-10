import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LearningPage.css";

const categories = ["Copepods", "Foraminifera", "Jellyfish", "Marine Snow"];

const categoryDescriptions: { [key: string]: string } = {
    "Copepods": "Tiny crustaceans and the most numerous animals in the ocean! Copepods are the \"insects of the sea\" — fast, abundant, and vital food for fish, whales, and seabirds.",
    "Foraminifera": "Single-celled organisms with beautiful, shell-like structures. These \"living sand grains\" help scientists study past climates from the seafloor.",
    "Jellyfish": "This group includes jellyfish and other gelatinous drifters. With stinging cells and graceful movements, they're both mesmerising and mysterious.",
    "Marine Snow": "Made of dead plankton, waste, and organic debris, Marine Snow drifts down the water column and feeds life in the deep sea."
};

const categoryIcons: { [key: string]: string } = {
    "Copepods": "🦐",
    "Foraminifera": "🐚",
    "Jellyfish": "🪼",
    "Marine Snow": "❄️"
};

const LearningPage = () => {
    const [step, setStep] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizImage, setQuizImage] = useState<string | null>(null);
    const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (step < categories.length) {
            stopSpeaking();
            speakText(categoryDescriptions[categories[step]]);
        }
    }, [step]);

    const speakText = (text: string) => {
        stopSpeaking();
        if (text) {
            const speech = new SpeechSynthesisUtterance(text);
            speech.lang = "en-US";
            window.speechSynthesis.speak(speech);
        }
    };

    const stopSpeaking = () => window.speechSynthesis.cancel();

    useEffect(() => {
        if (step >= categories.length) startQuiz();
    }, [step]);

    const startQuiz = async () => {
        setShowQuiz(true);
        stopSpeaking();
        loadNewQuizImage();
    };

    const loadNewQuizImage = async () => {
        try {
            const response = await fetch("/random-image");
            const data = await response.json();
            if (data.error) return;
            setQuizImage(data.image);
            setQuizAnswer(data.category);
            setFeedback(null);
        } catch (error) {
            console.error("Error fetching image:", error);
        }
    };

    const checkAnswer = (selected: string) => {
        const isCorrect = selected === quizAnswer;
        setFeedback(isCorrect ? "correct" : "wrong");
        setTimeout(() => {
            loadNewQuizImage();
            setFeedback(null);
        }, 1800);
    };

    const handleBack = () => {
        stopSpeaking();
        navigate("/main-menu");
    };

    return (
        <div
            className="learning-page"
            style={{
                backgroundImage: "url('/images/learning-background.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            }}
        >
            <div className="glass-card learning-card">

                {!showQuiz ? (
                    /* ── Learning step ── */
                    <>
                        {/* Progress dots */}
                        <div className="step-dots">
                            {categories.map((_, i) => (
                                <div
                                    key={i}
                                    className={`step-dot ${i === step ? "active" : i < step ? "done" : ""}`}
                                />
                            ))}
                        </div>

                        <p className="learning-eyebrow">
                            Species {step + 1} of {categories.length}
                        </p>
                        <h2 className="learning-title">
                            {categoryIcons[categories[step]]} {categories[step]}
                        </h2>
                        <p className="learning-description">
                            {categoryDescriptions[categories[step]]}
                        </p>

                        <div className="learning-img-frame">
                            <img
                                src={`/dataset/${categories[step]}/image1.png`}
                                alt={categories[step]}
                                className="learning-img"
                            />
                        </div>

                        <div className="learning-actions">
                            <button className="btn-ocean" onClick={() => setStep(step + 1)}>
                                {step < categories.length - 1 ? "Next Species →" : "Start Quiz →"}
                            </button>
                            <button className="btn-coral" onClick={handleBack}>
                                ← Menu
                            </button>
                        </div>
                    </>
                ) : (
                    /* ── Quiz ── */
                    <>
                        <p className="quiz-label">Quick-fire quiz</p>
                        <h2 className="quiz-title">Which species is this?</h2>

                        <div className="learning-img-frame" style={{ marginBottom: "20px" }}>
                            {quizImage && (
                                <img
                                    src={quizImage}
                                    alt="Quiz"
                                    className="learning-img quiz-img"
                                />
                            )}
                        </div>

                        {feedback && (
                            <div className={`feedback-badge ${feedback}`}>
                                {feedback === "correct" ? "✓ Correct!" : "✗ Not quite — keep going!"}
                            </div>
                        )}

                        <div className="quiz-grid">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className="quiz-btn"
                                    onClick={() => checkAnswer(category)}
                                    disabled={!!feedback}
                                >
                                    {categoryIcons[category]} {category}
                                </button>
                            ))}
                        </div>

                        <div className="learning-actions">
                            <button className="btn-coral" onClick={handleBack}>
                                ← Back to Menu
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LearningPage;
