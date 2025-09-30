import mongoose from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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
