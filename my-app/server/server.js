const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

const DATASET_PATH = path.join(__dirname, "../public/dataset");
const DATASET_PATH_TRAIN = path.join(__dirname, "../public/dataset/train");
const DATASET_PATH_TEST = path.join(__dirname, "../public/dataset/test");
const MODEL_PATH = path.join(__dirname, "../server/plankton_classifier.pkl");

// Function to get a random image from a category
const getRandomImage = (category, datasetPath) => {
    const categoryPath = path.join(datasetPath, category);
    if (!fs.existsSync(categoryPath)) return null;

    const images = fs.readdirSync(categoryPath).filter(file => file.endsWith(".png"));
    if (images.length === 0) return null;

    const randomImage = images[Math.floor(Math.random() * images.length)];
    return { image: `/dataset/${category}/${randomImage}`, category };
};

// API Endpoint: Get a random image from any category (For Teaching)
app.get("/random-image", (req, res) => {
    const categories = fs.readdirSync(DATASET_PATH).filter(folder =>
        fs.statSync(path.join(DATASET_PATH, folder)).isDirectory()
    );

    if (categories.length === 0) return res.json({ error: "No categories found" });

    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomImagePath = getRandomImage(randomCategory, DATASET_PATH);

    if (!randomImagePath) return res.json({ error: "No images found in category" });

    res.json(randomImagePath);
});

// API Endpoint: Get 10 random images (For Training Page)
app.get("/random-images", (req, res) => {
    const categories = fs.readdirSync(DATASET_PATH_TRAIN).filter(folder =>
        fs.statSync(path.join(DATASET_PATH_TRAIN, folder)).isDirectory()
    );

    if (categories.length === 0) return res.json({ error: "No categories found" });

    let trainingImages = [];
    for (let i = 0; i < 100; i++) { // Get 10 images
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const imageObj = getRandomImage(randomCategory, DATASET_PATH_TRAIN);
        if (imageObj) trainingImages.push(imageObj);
    }

    if (trainingImages.length === 0) return res.json({ error: "No images found in any category" });

    res.json({ images: trainingImages });
});

// API Endpoint: Start training with user-sorted data
app.post("/start-training", (req, res) => {
    const sortedImages = req.body.sortedImages;
    if (!sortedImages || Object.keys(sortedImages).length === 0) {
        return res.status(400).json({ error: "No training data provided" });
    }

    const trainingDataPath = path.join(__dirname, "../server/training_data.json");
    fs.writeFileSync(trainingDataPath, JSON.stringify(sortedImages, null, 2));

    const pythonPath = path.join(__dirname, "../../.venv/Scripts/python");
    exec(`"${pythonPath}" server/train_model.py "${trainingDataPath}" "${MODEL_PATH}" "${DATASET_PATH_TEST}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error training model: ${stderr}`);
            return res.status(500).json({ error: "Training failed" });
        }
        console.log(`Training Output: ${stdout}`);
        res.json({ accuracy: parseFloat(stdout.trim()) });
    });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));