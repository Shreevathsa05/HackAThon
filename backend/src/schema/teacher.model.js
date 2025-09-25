import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const teacherSchema = new mongoose.Schema({
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

teacherSchema.plugin(mongooseAggregatePaginate);

export const Teacher = mongoose.model("Teacher", teacherSchema);