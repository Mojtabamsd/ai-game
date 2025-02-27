const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());

const DATASET_PATH = path.join(__dirname, "../public/dataset");

// Function to get a random image from a category
const getRandomImage = (category) => {
    const categoryPath = path.join(DATASET_PATH, category);
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
    const randomImagePath = getRandomImage(randomCategory);

    if (!randomImagePath) return res.json({ error: "No images found in category" });

    res.json(randomImagePath);
});

// ✅ API Endpoint: Get 10 random images (For Training Page)
app.get("/random-images", (req, res) => {
    const categories = fs.readdirSync(DATASET_PATH).filter(folder =>
        fs.statSync(path.join(DATASET_PATH, folder)).isDirectory()
    );

    if (categories.length === 0) return res.json({ error: "No categories found" });

    let trainingImages = [];
    for (let i = 0; i < 10; i++) { // Get 10 images
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const imageObj = getRandomImage(randomCategory);
        if (imageObj) trainingImages.push(imageObj);
    }

    if (trainingImages.length === 0) return res.json({ error: "No images found in any category" });

    res.json({ images: trainingImages });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
