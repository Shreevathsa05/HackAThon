import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const examSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "role"
    },
}, { timestamps: true });

examSchema.plugin(mongooseAggregatePaginate);

export const Exam = mongoose.model("Exam", examSchema);