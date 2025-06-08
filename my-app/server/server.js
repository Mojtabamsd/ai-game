const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { exec } = require("child_process");
const SCORES_PATH = path.join(__dirname, "training_scores.json");

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

    // Try up to 10 times to get a valid image
    for (let i = 0; i < 10; i++) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const imageObj = getRandomImage(randomCategory, DATASET_PATH);
        if (imageObj) {
            return res.json(imageObj);
        }
    }

    console.warn("No valid images found after 10 tries");
    return res.json({ error: "No images found in any category" });
});


app.get("/random-images", (req, res) => {
    const targetTotal = 32;
    const half = targetTotal / 2;
    const categories = ["Copepods", "Foraminifera", "Jellyfish", "Marine Snow"];

    const selectedImages = new Set();
    const guaranteedImages = [];

    // Step 1: Pick equal number from each category
    const perCategoryCount = half / categories.length;

    for (const category of categories) {
        const categoryPath = path.join(DATASET_PATH_TRAIN, category);
        if (!fs.existsSync(categoryPath)) continue;

        const files = fs.readdirSync(categoryPath).filter(file => file.endsWith(".png"));
        const shuffled = files.sort(() => 0.5 - Math.random()).slice(0, perCategoryCount);

        for (const file of shuffled) {
            const imgPath = `/dataset/train/${category}/${file}`;
            guaranteedImages.push({ image: imgPath, category });
            selectedImages.add(imgPath);
        }
    }

    // Step 2: Collect all remaining images from all categories
    let allRemaining = [];
    const allCategories = fs.readdirSync(DATASET_PATH_TRAIN).filter(folder =>
        fs.statSync(path.join(DATASET_PATH_TRAIN, folder)).isDirectory()
    );

    for (const category of allCategories) {
        const categoryPath = path.join(DATASET_PATH_TRAIN, category);
        const files = fs.readdirSync(categoryPath).filter(file => file.endsWith(".png"));
        for (const file of files) {
            const imgPath = `/dataset/train/${category}/${file}`;
            if (!selectedImages.has(imgPath)) {
                allRemaining.push({ image: imgPath, category });
            }
        }
    }

    // Step 3: Randomly select the rest (excluding duplicates)
    const randomExtra = allRemaining.sort(() => 0.5 - Math.random()).slice(0, half);

    // Final merge and return
    const finalImages = [...guaranteedImages, ...randomExtra];
    res.json({ images: finalImages });
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

app.post("/save-score", (req, res) => {
    const { username, accuracy, overwrite } = req.body;
    if (!username || accuracy === undefined) {
        return res.status(400).json({ error: "Missing data" });
    }

    let scores = [];
    if (fs.existsSync(SCORES_PATH)) {
        scores = JSON.parse(fs.readFileSync(SCORES_PATH));
    }

    const existingIndex = scores.findIndex(entry => entry.username === username);

    if (existingIndex !== -1) {
        const existing = scores[existingIndex];
        if (overwrite && accuracy > existing.accuracy) {
            scores[existingIndex] = { username, accuracy, timestamp: new Date().toISOString() };
        }
    } else {
        scores.push({ username, accuracy, timestamp: new Date().toISOString() });
    }

    scores.sort((a, b) => b.accuracy - a.accuracy);
    scores = scores.slice(0, 6);

    fs.writeFileSync(SCORES_PATH, JSON.stringify(scores, null, 2));
    res.json({ success: true });
});

app.get("/top-scores", (req, res) => {
    const SCORES_PATH = path.join(__dirname, "training_scores.json");
    if (!fs.existsSync(SCORES_PATH)) return res.json([]);
    const scores = JSON.parse(fs.readFileSync(SCORES_PATH));
    res.json(scores);
});


// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));