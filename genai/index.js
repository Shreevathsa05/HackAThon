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
import { Result } from './schema/Result.js';

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


const BACKEND_URL = 'http://localhost:8000' || process.env.BACKEND_URL;
// 68d94bdc0a55b969c4f22bc2
app.post('/quiz/:examId', async (req, res) => {
  try {
    const { previousQnA = []} = req.body;
    const examId = req.params.examId;
    const totalQuestions = parseInt(req.query.totalQuestions, 10);

    if (!totalQuestions || totalQuestions <= 0) {
      return res.status(400).json({ error: "Invalid totalQuestions" });
    }
    console.log(totalQuestions);

    const perDifficulty = Math.floor(totalQuestions / 3);
    const remainder = totalQuestions % 3;

    const maxEasyReq = perDifficulty + (remainder > 0 ? 1 : 0);
    const maxMediumReq = perDifficulty + (remainder > 1 ? 1 : 0);
    console.log("maxEasy: ", maxEasyReq, "maxMed: ", maxMediumReq)

    let answeredEasy = 0, answeredMedium = 0;
    let correctEasy = 0, correctMedium = 0;
    for (const q of previousQnA) {
      if (q.difficulty === "easy") {
        answeredEasy++;
        if (q.answer === q.useranswer) correctEasy++;
      } else if (q.difficulty === "medium") {
        answeredMedium++;
        if (q.answer === q.useranswer) correctMedium++;
      }
    }

    console.log(previousQnA);

    let nextDifficulty = "easy";
    console.log("correctEasy: ", correctEasy, "maxEasy: ", maxEasyReq)

    if (correctEasy >= maxEasyReq) {
      nextDifficulty = "medium";
    }
    console.log("correctMed: ", correctMedium, "maxMed: ", maxMediumReq)
    if (correctMedium >= maxMediumReq) {
      nextDifficulty = "hard"
    }

    // Fetch all questions
    const questionsRes = await fetch(`${BACKEND_URL}/api/genai/exam/${examId}`);
    const questions = await questionsRes.json();
    console.log("next: ", nextDifficulty)
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
            3. Next question difficulty must be: "${nextDifficulty}"
            4. The question MUST match the selected difficulty.
            5. If no exact match exists, adapt and rewrite based on topic NOT random.

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

app.post("/quiz/analysis/:examId", async (req, res) => {
  try {
    const { sessionAnswers } = req.body; // Expect array of 20 Q&A objects
    const examId = req.params.examId;

    if (!Array.isArray(sessionAnswers) || sessionAnswers.length < 5) {
      return res.status(400).json({ error: "At least 5 answered questions required" })
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

// app.post("/analysis/:examId", async (req, res) => {

//   try {
//     const { examId } = req.params;
//     const resultData = req.body.analysis; // entire analytics object
//     console.log("working")
//     if (!examId || !resultData)
//       throw new ApiError(400, "Exam ID and result data are required");

//     // optional: prevent duplicate submission
//     const existing = await Result.findOne({ user: userId, exam: examId });
//     if (existing) throw new ApiError(409, "Result already submitted");

//     const savedResult = await Result.create({
//       user: userId,
//       exam: examId,
//       summary: resultData.summary,
//       perAbility: resultData.perAbility,
//       perDifficulty: resultData.perDifficulty,
//       questionAnalysis: resultData.questionAnalysis,
//       actionPlan: resultData.actionPlan,
//       teacherNotes: resultData.teacherNotes
//     });

//     console.log("saved result: ", savedResult)

//     return res.status(200).json(
//       {
//         statusCode: 200,
//         savedResult: savedResult,
//         message: "Result saved successfully"
//       }
//     );

//   } catch (error) {
//     console.error("Error in /analysis/:examId:", error);
//     res.status(500).json({ error: "Failed to store analysis" });
//   }
// });


connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server listening on ${PORT}`);
    })
  })
  .catch((err) => console.error("MONGO db connection failed", err));