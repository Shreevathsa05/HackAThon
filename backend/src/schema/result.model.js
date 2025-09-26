import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const resultSchema = new mongoose.Schema({
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    answers: [{
        question_id: { type: mongoose.Schema.Types.ObjectId },
        selected_option: { type: String, enum: ["a", "b", "c", "d"] },
        is_correct: { type: Boolean },
        question_type: { type: String, enum: ["listening", "grasping", "retention", "application"] },
        difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    }],
    score: { type: Number, default: 0 },
}, { timestamps: true });

resultSchema.plugin(mongooseAggregatePaginate);

export const Result = mongoose.model("Result", resultSchema)
