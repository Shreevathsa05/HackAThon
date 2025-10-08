import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const detailedBreakdownSchema = new mongoose.Schema({
    question: { type: String }, // e.g. "If 'r'% of 'r' is 49, what is the value of 'r'?"
    your_answer: { type: String },
    correct_answer: { type: String },
    status: { type: String, enum: ["correct", "incorrect"] },
    explanation: { type: String },
    misconception: { type: String },
    remedy: { type: String }
}, { _id: false });

const resultSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  answers: [{
    question_id: { type: mongoose.Schema.Types.ObjectId },
    selected_option: { type: String, enum: ["a", "b", "c", "d"] },
    is_correct: { type: Boolean },
    question_type: { type: String, enum: ["listening", "grasping", "retention", "application"] },
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
  }],
  score: { type: Number, default: 0 },

  // Full analysis storage
  analysis: {
    summary: {
      totalQuestions: Number,
      correctCount: Number,
      weightedScore: Number,
      maxScore: Number,
      percent: Number,
      grade: String,
    },
    teacherNotes: String,
    actionPlan: {
      nextSteps: [String],
      schedule: String,
      resources: [String]
    },
    questionAnalysis: [{
      question: String,
      studentAnswer: String,
      correctAnswer: String,
      wasCorrect: Boolean,
      explanation: String,
      misconception: String,
      remedy: String,
    }]
  }

}, { timestamps: true });


resultSchema.plugin(mongooseAggregatePaginate);

export const Result = mongoose.model("Result", resultSchema);
