import React, { useState, useEffect } from "react";

const App = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [aiPrediction, setAiPrediction] = useState<string | null>(null);
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadRandomImage();
  }, []);

  const loadRandomImage = async () => {
    try {
      const response = await fetch("http://localhost:5000/random-image");
      const data = await response.json();
      if (data.error) {
        console.error(data.error);
        return;
      }

      setCurrentImage(data.image);
      setAiPrediction(data.category);
      setPlayerChoice(null);
      setFeedback(null);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const handlePlayerChoice = (choice: string) => {
    setPlayerChoice(choice);
    setFeedback(choice === aiPrediction ? "✅ Great! AI also got it right." : `❌ Oops! AI classified this as ${aiPrediction}.`);
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-4">AI vs. You: Classification Game</h1>

        {currentImage && (
            <img src={currentImage} alt="Random Plankton" className="w-60 h-60 object-cover border rounded mb-4" />
        )}

        <div className="grid grid-cols-2 gap-4">
          {["Copepods", "Diatoms", "Jellyfish", "Detritus"].map((category) => (
              <button
                  key={category}
                  onClick={() => handlePlayerChoice(category)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                {category}
              </button>
          ))}
        </div>

        {feedback && <p className="mt-4 text-lg font-semibold">{feedback}</p>}

        <button onClick={loadRandomImage} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">
          Next Image
        </button>
      </div>
  );
};

export default App;
