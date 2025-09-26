import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Exam } from "../schema/exam.model.js";
import { Result } from "../schema/result.model.js";
import mongoose from "mongoose";
import { Student } from "../schema/student.model.js";

const submitAnswer = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!userId) throw new ApiError(401, "Unauthenticated access");

    const { examId } = req.params;
    const { question_id, selected_option, question_type, difficulty } = req.body;

    if (!examId) throw new ApiError(403, "ExamId is required");
    if (!question_id || !selected_option || !question_type || !difficulty || !["a", "b", "c", "d"].includes(selected_option))
        throw new ApiError(403, "Invalid fields");

    const exam = await Exam.findById(examId);
    if (!exam) throw new ApiError(404, "Exam not found");

    const question = exam.questions.find(q => q._id.toString() === question_id);
    if (!question) throw new ApiError(400, "Question not found in this exam");

    const is_correct = question.answer === selected_option;

    let result = await Result.findOne({
        student: userId,
        exam: new mongoose.Types.ObjectId(examId)
    });

    if (!result) {
        result = await Result.create({
            exam: examId,
            student: userId,
            answers: [],
            score: 0
        });
    }

    const updatedResult = await Result.findByIdAndUpdate(result._id, {
        $push: {
            answers: {
                question_id,
                question_type,
                difficulty,
                selected_option,
                is_correct
            }
        },
        ...(is_correct && { $inc: { score: 1 } })
    }, { new: true });

    if (is_correct) {
        const question_type = question.question_type
        const difficulty = question.difficulty

        const updateStudentProfile = await Student.findOneAndUpdate({ user_id: userId },
            { $inc: { [`skill_profile.${question_type}.${difficulty}`]: 1 } },
            { new: true }
        )
    }

    return res.status(200).json(
        new ApiResponse(200, updatedResult, "Answer submitted successfully")
    );
});

export { submitAnswer };
