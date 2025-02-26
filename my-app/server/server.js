const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());

const DATASET_PATH = path.join(__dirname, "../public/dataset");

// Function to get a random image from a folder
const getRandomImage = (category) => {
    const categoryPath = path.join(DATASET_PATH, category);
    if (!fs.existsSync(categoryPath)) return null;

    const images = fs.readdirSync(categoryPath).filter(file => file.endsWith(".png"));
    if (images.length === 0) return null;

    const randomImage = images[Math.floor(Math.random() * images.length)];
    return `/dataset/${category}/${randomImage}`;
};

// API Endpoint: Get a random image from any category
app.get("/random-image", (req, res) => {
    const categories = fs.readdirSync(DATASET_PATH).filter(folder =>
        fs.statSync(path.join(DATASET_PATH, folder)).isDirectory()
    );

    if (categories.length === 0) return res.json({ error: "No categories found" });

    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomImagePath = getRandomImage(randomCategory);

    if (!randomImagePath) return res.json({ error: "No images found in category" });

    res.json({ image: randomImagePath, category: randomCategory });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
