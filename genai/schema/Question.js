// models/Question.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question_text: {
    type: String,
    required: true,
  },
  options: {
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true },
  },
  answer: {
    type: String,
    enum: ["a", "b", "c", "d"],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  question_type: {
    type: String,
    enum: ["listening", "grasping", "retention", "application"],
    required: true,
  },
}, { _id: true });

export default mongoose.model("Question", questionSchema);
