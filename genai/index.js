// index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose, { model } from 'mongoose';
import multer from 'multer';
import path from 'path';
import Question from './schema/Question.js';
import { indexPDF, generateQuestions } from './Services/questionService.js';
import { DB_NAME } from './constants.js';
import fs from 'fs';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Exam } from './schema/ExamSchema.js';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json());

// File upload setup
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

app.get("/", (req, res) => {
  res.send("API is running...");
})

app.post("/generate-questions", upload.single("pdf"), async (req, res) => {
  const fileuploadedpath = req.file ? req.file.path : null;
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

    //Index PDF
    await indexPDF(req.file.path);

    //Generate questions
    const questions = await generateQuestions(numQuestions, topic);
    // console.log("Generated Questions:", questions);

    //Save to MongoDB
    const saved = await Question.insertMany(questions);

    fs.unlinkSync(req.file.path);

    //Return response
    res.json({ message: "Questions generated & stored", data: saved });
  } catch (err) {
    console.error("Error in /generate-questions:", err);
    fs.unlinkSync(fileuploadedpath);
    res.status(500).json({ error: err.message });
  }
});


app.post("/mock-add-question", async (req, res) => {
  try {
    const question = req.body;

    // Validate required fields
    if (!question.question_text || !question.options || !question.answer) {
      return res
        .status(400)
        .json({ message: "Missing required fields: question_text, options, or answer" });
    }

    // Save question to MongoDB
    const saved = await Question.create(question);

    // Return success response
    res.json({ message: "Question added successfully", data: saved });
  } catch (err) {
    console.error("Error in /mock-add-question:", err);
    res.status(500).json({ error: err.message });
  }
});


const BACKEND_URL = 'http://localhost:8000' || process.env.BACKEND_URL;
// 68d94bdc0a55b969c4f22bc2
app.post('/quiz/:examId', async (req, res) => {
  try {
    const { previousQnA } = req.body;
    const examId = req.params.examId;

    // Fetch all questions
    const questionsRes = await fetch(`${BACKEND_URL}/api/genai/exam/${examId}`);
    const questions = await questionsRes.json();

    // Prepare prompt
    const prompt = `
You are a quiz master. Your task is to generate the NEXT question for the student.

Context:
- Use the following Question and Answer Bank to ensure relevance:
  ${JSON.stringify(questions.data)}

- Review the Previous Questions and Answers to avoid repetition:
  ${JSON.stringify(previousQnA)}

Rules:
1. Do not repeat any previous questions.
2. Ensure the new question is contextually relevant to the topic.
3. Adapt the next question based on the student's performance:
   - If the student answered correctly, slightly increase the difficulty or move to a higher-order question type.
   - If the student answered incorrectly, lower the difficulty or shift to a simpler question type to reinforce understanding.

Return output strictly in the defined JSON schema.
    `;

    // Force JSON response with schema validation
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            answer: { type: Type.STRING },
            difficulty: {
              type: Type.STRING,
              enum: ["easy", "medium", "hard"]
            },
            question_type: {
              type: Type.STRING,
              enum: ["listening", "grasping", "retention", "application"]
            }
          },
          required: ["question", "options", "answer", "difficulty", "question_type"],
          propertyOrdering: ["question", "options", "answer", "difficulty", "question_type"],
        },
      },
    });

    // response.text is guaranteed to be valid JSON
    const nextQuestion = JSON.parse(response.text);

    res.json({ nextQuestion });
  } catch (error) {
    console.error("Error in /quiz/:examId:", error);
    res.status(500).json({ error: "Failed to generate next question" });
  }
});


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/quiz/:examId/analysis", async (req, res) => {
  try {
    const { sessionAnswers } = req.body; // Expect array of 20 Q&A objects
    const examId = req.params.examId;

    if (!Array.isArray(sessionAnswers) || sessionAnswers.length < 20) {
      return res.status(400).json({ error: "At least 20 answered questions required" });
    }

    // Fetch exam question bank (optional context)
    const questionsRes = await fetch(`${BACKEND_URL}/api/genai/exam/${examId}`);
    const questions = await questionsRes.json();

    const prompt = `
You are an expert teacher and diagnostic learning analyst. 
Analyze the student's session of 20 answered questions.

Inputs:
- Exam Question Bank: ${JSON.stringify(questions.data)}
- Student Session Answers: ${JSON.stringify(sessionAnswers)}

Tasks:
1. For each question: state if correct/incorrect, explanation, likely misconception, and a short remedy.
2. Summarize performance by ability type: listening, grasping, retention, application.
3. Summarize by difficulty (easy, medium, hard).
4. If response times provided, analyze speed (fastest, slowest, average).
5. Provide a weighted score (easy=1, medium=2, hard=3).
6. Give overall teacher-style notes, frank but encouraging.
7. Suggest a short action plan (next steps, schedule, resources).
Return STRICT JSON in the schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questionAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  studentAnswer: { type: Type.STRING },
                  correctAnswer: { type: Type.STRING },
                  wasCorrect: { type: Type.BOOLEAN },
                  difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] },
                  question_type: { 
                    type: Type.STRING, 
                    enum: ["listening", "grasping", "retention", "application"] 
                  },
                  explanation: { type: Type.STRING },
                  misconception: { type: Type.STRING },
                  remedy: { type: Type.STRING }
                },
              },
            },
            summary: {
              type: Type.OBJECT,
              properties: {
                totalQuestions: { type: Type.NUMBER },
                correctCount: { type: Type.NUMBER },
                weightedScore: { type: Type.NUMBER },
                maxScore: { type: Type.NUMBER },
                percent: { type: Type.NUMBER },
                grade: { type: Type.STRING },
                pass: { type: Type.BOOLEAN }
              },
            },
            perAbility: {
              type: Type.OBJECT,
              properties: {
                listening: { type: Type.STRING },
                grasping: { type: Type.STRING },
                retention: { type: Type.STRING },
                application: { type: Type.STRING },
              },
            },
            perDifficulty: {
              type: Type.OBJECT,
              properties: {
                easy: { type: Type.STRING },
                medium: { type: Type.STRING },
                hard: { type: Type.STRING },
              },
            },
            responseTime: {
              type: Type.OBJECT,
              properties: {
                avgMs: { type: Type.NUMBER },
                slowest: { type: Type.STRING },
                fastest: { type: Type.STRING },
              },
            },
            actionPlan: {
              type: Type.OBJECT,
              properties: {
                nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                schedule: { type: Type.STRING },
                resources: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            teacherNotes: { type: Type.STRING },
            timestamp: { type: Type.STRING },
          },
          required: ["questionAnalysis", "summary", "perAbility", "perDifficulty", "actionPlan", "teacherNotes"],
        },
      },
    });

    const analysis = JSON.parse(response.text);
    res.json({ analysis });

  } catch (error) {
    console.error("Error in /quiz/:examId/analysis:", error);
    res.status(500).json({ error: "Failed to generate analysis" });
  }
});


connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server listening on ${PORT}`);
    })
  })
  .catch((err) => console.error("MONGO db connection failed", err));
