const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const { exec } = require("child_process");
const Database = require("better-sqlite3");

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../build")));
}

// Always serve dataset images as static files
app.use(express.static(path.join(__dirname, "../public")));

const DATASET_PATH = path.join(__dirname, "../public/dataset");
const DATASET_PATH_TRAIN = path.join(__dirname, "../public/dataset/train");
const DATASET_PATH_TEST = path.join(__dirname, "../public/dataset/test");
const MODEL_PATH = path.join(__dirname, "../server/plankton_classifier.pkl");
// Use /data volume for persistence in container, fall back to local for dev
const DB_PATH = process.env.NODE_ENV === "production"
    ? "/data/game.db"
    : path.join(__dirname, "game.db");

// ─── Database setup ───────────────────────────────────────────────────────────

const db = new Database(DB_PATH);

// Enable WAL mode: allows concurrent reads while a write is happening
db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS scores (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        username    TEXT    NOT NULL UNIQUE,
        accuracy    REAL    NOT NULL,
        timestamp   TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id  TEXT    NOT NULL UNIQUE,
        username    TEXT    NOT NULL,
        accuracy    REAL    NOT NULL,
        total_images INTEGER NOT NULL,
        time_taken  INTEGER NOT NULL,
        timestamp   TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS selections (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id      TEXT    NOT NULL,
        username        TEXT    NOT NULL,
        image_path      TEXT    NOT NULL,
        true_category   TEXT    NOT NULL,
        user_category   TEXT    NOT NULL,
        correct         INTEGER NOT NULL,   -- 1 = correct, 0 = wrong
        FOREIGN KEY (session_id) REFERENCES sessions(session_id)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_username  ON sessions(username);
    CREATE INDEX IF NOT EXISTS idx_selections_session ON selections(session_id);
    CREATE INDEX IF NOT EXISTS idx_selections_username ON selections(username);
`);

// Prepared statements (compiled once, reused safely across concurrent calls)
const stmts = {
    upsertScore: db.prepare(`
        INSERT INTO scores (username, accuracy, timestamp)
        VALUES (@username, @accuracy, @timestamp)
        ON CONFLICT(username) DO UPDATE SET
            accuracy  = CASE WHEN excluded.accuracy > scores.accuracy THEN excluded.accuracy ELSE scores.accuracy END,
            timestamp = CASE WHEN excluded.accuracy > scores.accuracy THEN excluded.timestamp ELSE scores.timestamp END
    `),
    topScores: db.prepare(`
        SELECT username, accuracy FROM scores ORDER BY accuracy DESC LIMIT 6
    `),
    insertSession: db.prepare(`
        INSERT INTO sessions (session_id, username, accuracy, total_images, time_taken, timestamp)
        VALUES (@sessionId, @username, @accuracy, @totalImages, @timeTaken, @timestamp)
    `),
    insertSelection: db.prepare(`
        INSERT INTO selections (session_id, username, image_path, true_category, user_category, correct)
        VALUES (@sessionId, @username, @imagePath, @trueCategory, @userCategory, @correct)
    `),
    allSessions: db.prepare(`
        SELECT * FROM sessions ORDER BY timestamp DESC
    `),
    sessionsByUser: db.prepare(`
        SELECT * FROM sessions WHERE username = ? ORDER BY timestamp DESC
    `),
    selectionsBySession: db.prepare(`
        SELECT * FROM selections WHERE session_id = ?
    `)
};

// Wrap session + selections insert in a transaction so they always succeed or fail together
const saveSessionTx = db.transaction((session, selections) => {
    stmts.insertSession.run(session);
    for (const sel of selections) {
        stmts.insertSelection.run(sel);
    }
});

// ─── Image helpers ────────────────────────────────────────────────────────────

const getRandomImage = (category, datasetPath) => {
    const categoryPath = path.join(datasetPath, category);
    if (!fs.existsSync(categoryPath)) return null;
    const images = fs.readdirSync(categoryPath).filter(file => file.endsWith(".png"));
    if (images.length === 0) return null;
    const randomImage = images[Math.floor(Math.random() * images.length)];
    return { image: `/dataset/${category}/${randomImage}`, category };
};

// ─── Endpoints ────────────────────────────────────────────────────────────────

app.get("/random-image", (req, res) => {
    const categories = fs.readdirSync(DATASET_PATH).filter(folder =>
        fs.statSync(path.join(DATASET_PATH, folder)).isDirectory()
    );
    if (categories.length === 0) return res.json({ error: "No categories found" });
    for (let i = 0; i < 10; i++) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const imageObj = getRandomImage(randomCategory, DATASET_PATH);
        if (imageObj) return res.json(imageObj);
    }
    return res.json({ error: "No images found in any category" });
});

app.get("/random-images", (req, res) => {
    const targetTotal = 32;
    const half = targetTotal / 2;
    const categories = ["Copepods", "Foraminifera", "Jellyfish", "Marine Snow"];
    const selectedImages = new Set();
    const guaranteedImages = [];
    const perCategoryCount = half / categories.length;

    for (const category of categories) {
        const categoryPath = path.join(DATASET_PATH_TRAIN, category);
        if (!fs.existsSync(categoryPath)) continue;
        const files = fs.readdirSync(categoryPath).filter(f => f.endsWith(".png"));
        const shuffled = files.sort(() => 0.5 - Math.random()).slice(0, perCategoryCount);
        for (const file of shuffled) {
            const imgPath = `/dataset/train/${category}/${file}`;
            guaranteedImages.push({ image: imgPath, category });
            selectedImages.add(imgPath);
        }
    }

    let allRemaining = [];
    const allCategories = fs.readdirSync(DATASET_PATH_TRAIN).filter(folder =>
        fs.statSync(path.join(DATASET_PATH_TRAIN, folder)).isDirectory()
    );
    for (const category of allCategories) {
        const categoryPath = path.join(DATASET_PATH_TRAIN, category);
        const files = fs.readdirSync(categoryPath).filter(f => f.endsWith(".png"));
        for (const file of files) {
            const imgPath = `/dataset/train/${category}/${file}`;
            if (!selectedImages.has(imgPath)) allRemaining.push({ image: imgPath, category });
        }
    }

    const randomExtra = allRemaining.sort(() => 0.5 - Math.random()).slice(0, half);
    res.json({ images: [...guaranteedImages, ...randomExtra] });
});

app.post("/start-training", (req, res) => {
    const sortedImages = req.body.sortedImages;
    if (!sortedImages || Object.keys(sortedImages).length === 0) {
        return res.status(400).json({ error: "No training data provided" });
    }
    const trainingDataPath = path.join(__dirname, "../server/training_data.json");
    fs.writeFileSync(trainingDataPath, JSON.stringify(sortedImages, null, 2));

    // Use Linux venv path in Docker (production), Windows path locally
    const pythonPath = process.env.NODE_ENV === "production"
        ? "/app/.venv/bin/python3"
        : path.join(__dirname, "../../.venv/Scripts/python");

    const trainScriptPath = path.join(__dirname, "train_model.py");
    exec(`"${pythonPath}" "${trainScriptPath}" "${trainingDataPath}" "${MODEL_PATH}" "${DATASET_PATH_TEST}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error training model: ${stderr}`);
            return res.status(500).json({ error: "Training failed" });
        }
        res.json({ accuracy: parseFloat(stdout.trim()) });
    });
});

// Leaderboard: keep only best score per user
app.post("/save-score", (req, res) => {
    const { username, accuracy } = req.body;
    if (!username || accuracy === undefined) {
        return res.status(400).json({ error: "Missing data" });
    }
    stmts.upsertScore.run({ username, accuracy, timestamp: new Date().toISOString() });
    res.json({ success: true });
});

app.get("/top-scores", (req, res) => {
    res.json(stmts.topScores.all());
});

// Session log: store every play in full detail
app.post("/save-session", (req, res) => {
    const { username, accuracy, sortedImages, totalImages, timeTaken } = req.body;
    if (!username || accuracy === undefined || !sortedImages) {
        return res.status(400).json({ error: "Missing session data" });
    }

    const sessionId = `${username}_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const selections = [];
    for (const [userCategory, images] of Object.entries(sortedImages)) {
        for (const imagePath of images) {
            const parts = imagePath.split("/");
            const trueCategory = parts.length >= 4 ? parts[parts.length - 2] : "Unknown";
            selections.push({
                sessionId,
                username,
                imagePath,
                trueCategory,
                userCategory,
                correct: trueCategory === userCategory ? 1 : 0
            });
        }
    }

    saveSessionTx(
        { sessionId, username, accuracy, totalImages, timeTaken, timestamp },
        selections
    );

    console.log(`Session saved — user: ${username}, accuracy: ${accuracy}%, images: ${selections.length}`);
    res.json({ success: true, sessionId });
});

// Get all sessions
app.get("/sessions", (req, res) => {
    const sessions = stmts.allSessions.all();
    res.json(sessions);
});

// Get all sessions for one user
app.get("/sessions/:username", (req, res) => {
    const sessions = stmts.sessionsByUser.all(req.params.username);
    res.json(sessions);
});

// Get full detail for one session (including per-image selections)
app.get("/session/:sessionId", (req, res) => {
    const selections = stmts.selectionsBySession.all(req.params.sessionId);
    res.json(selections);
});

// Catch-all: serve React app for any non-API route (React Router support)
if (process.env.NODE_ENV === "production") {
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../build", "index.html"));
    });
}

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
