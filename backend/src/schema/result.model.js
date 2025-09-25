import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class"
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam"
    }
}, { timestamps: true });

resultSchema.plugin(mongooseAggregatePaginate);

export const Result = mongoose.model("Result", resultSchema);