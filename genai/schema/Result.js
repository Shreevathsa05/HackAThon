import mongoose from "mongoose";

const QuestionAnalysisSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: String,
  question_type: String,
  difficulty: String,
  studentAnswer: String,
  correctAnswer: String,
  wasCorrect: Boolean,
  misconception: String,
  remedy: String,
  explanation: String
});

const ActionPlanSchema = new mongoose.Schema({
  nextSteps: [String],
  resources: [String],
  schedule: String
});

const ResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true
  },

  // Summary block
  summary: {
    correctCount: Number,
    totalQuestions: Number,
    maxScore: Number,
    weightedScore: Number,
    percent: Number,
    grade: String,
    pass: Boolean
  },

  perAbility: {
    application: String,
    retention: String,
    grasping: String,
    listening: String
  },

  perDifficulty: {
    easy: String,
    medium: String,
    hard: String
  },

  questionAnalysis: [QuestionAnalysisSchema],

  actionPlan: ActionPlanSchema,

  teacherNotes: String,

  submittedAt: {
    type: Date,
    default: Date.now
  }
});

export const Result = mongoose.model("Result", ResultSchema);
