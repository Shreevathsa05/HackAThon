import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const skillSchema = new mongoose.Schema({
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 }
}, { _id: false });

const studentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    skill_profile: {
        listening: skillSchema,
        grasping: skillSchema,
        retention: skillSchema,
        application: skillSchema
    },

    exam_history: [{ type: mongoose.Schema.Types.ObjectId, ref: "Result" }]
}, { timestamps: true });

studentSchema.plugin(mongooseAggregatePaginate);

export const Student = mongoose.model("Student", studentSchema);
