// index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import Question from './models/Question.js';
import { indexPDF, generateQuestions } from './Services/questionService.js';

const app = express();
app.use(cors());
app.use(express.json());


// ✅ File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ✅ Connect MongoDB Atlas
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "questionsDB", // use your DB name here
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Atlas Connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}
connectDB();

// 🟢 Single endpoint for everything
app.post("/generate-questions", upload.single("pdf"), async (req, res) => {
  try {
    const topic = req.body.topic;
    const numQuestions = Number(req.body.numQuestions);

    if (!req.file) {
      return res.status(400).json({ error: "PDF file is required" });
    }
    if (!topic || isNaN(numQuestions) || numQuestions <= 0) {
      return res.status(400).json({
        error: "Valid topic and numQuestions are required",
      });
    }

    // 1️⃣ Index PDF
    await indexPDF(req.file.path);

    // 2️⃣ Generate questions
    const questions = await generateQuestions(numQuestions, topic);
    console.log("Generated Questions:", questions);

    // 3️⃣ Save to MongoDB
    const saved = await Question.insertMany(questions);

    // 4️⃣ Return response
    res.json({ message: "✅ Questions generated & stored", data: saved });
  } catch (err) {
    console.error("Error in /generate-questions:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start server only after MongoDB is connected
const PORT = process.env.PORT || 3000;
mongoose.connection.once("open", () => {
  app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
  );
});
