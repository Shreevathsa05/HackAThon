import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    class_id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "role"
    },
    exam_history: {
        types: mongoose.Schema.Types.ObjectId,
        ref: "Result"
    }
}, { timestamps: true });

export const Student = new mongoose.model("Student", studentSchema);