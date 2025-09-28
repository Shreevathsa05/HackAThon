// index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import Question from './models/Question.js';
import { indexPDF, generateQuestions } from './Services/questionService.js';
import { DB_NAME } from './constants.js';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json());

// ✅ File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), "uploads")), //works for prod
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const PORT = process.env.PORT || 3000;

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`MongoDB connected || DB HOST: ${connectionInstance.connection.host}`)

  } catch (error) {
    console.error("MONGODB connection failed", error);
    process.exit(1);
  }
}

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
    // console.log("Generated Questions:", questions);

    // 3️⃣ Save to MongoDB
    const saved = await Question.insertMany(questions);

    // 4️⃣ Return response
    res.json({ message: "✅ Questions generated & stored", data: saved });
  } catch (err) {
    console.error("Error in /generate-questions:", err);
    res.status(500).json({ error: err.message });
  }
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server listening on ${PORT}`);
    })
  })
  .catch((err) => console.error("MONGO db connection failed", err));
