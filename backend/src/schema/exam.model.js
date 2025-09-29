import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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

const examSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    className: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    board: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        default: false
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
    }],
}, { timestamps: true });

examSchema.plugin(mongooseAggregatePaginate);

export const Exam = mongoose.model("Exam", examSchema);