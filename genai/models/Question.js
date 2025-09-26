// models/Question.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question_text: { type: String, required: true },
  answer: { type: String, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  question_type: { type: String, enum: ["listening", "grasping", "retention", "application"], required: true },
  // Remove exam_id or make it optional
  exam_id: { type: mongoose.Schema.Types.ObjectId } 
});

export default mongoose.model("Question", questionSchema);
