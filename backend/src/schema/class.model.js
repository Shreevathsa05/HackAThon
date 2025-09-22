import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const classSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    teacher: {
        types: mongoose.Schema.Types.ObjectId,
        ref: "Teacher"
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam"
    },
}, { timestamps: true });

classSchema.plugin(mongooseAggregatePaginate);

export const Class = mongoose.model("Class", classSchema);