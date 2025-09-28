import { Exam } from "../schema/exam.model.js";
import { Question } from "../schema/question.model.js";
import { Result } from "../schema/result.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createExam = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!userId) throw new ApiError(401, "Unauthenticated access");

    const { subject, board, className, questions } = req.body;

    if (!subject || !board || !className || !questions || !Array.isArray(questions) || questions.length === 0) {
        throw new ApiError(403, "All fields including questions are required");
    }

    const validQuestions = await Question.find({ _id: { $in: questions } });
    if (validQuestions.length !== questions.length) {
        throw new ApiError(404, "Some questions not found in DB");
    }

    const exam = await Exam.create({
        teacher: userId,
        subject,
        board,
        className,
        questions: validQuestions.map(q => q._id)
    });

    return res.status(200).json(
        new ApiResponse(200, exam, "Exam created successfully")
    );
});

const deleteExam = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { examId } = req.params;

    if (!examId) {
        throw new ApiError(400, "Exam ID is required");
    }

    // Find the exam first
    const exam = await Exam.findById(examId);
    
    if (!exam) {
        throw new ApiError(404, "Exam not found");
    }

    // Check ownership
    if (exam.teacher.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this exam");
    }

    // Delete the exam
    await Exam.findByIdAndDelete(examId);

    // Delete all questions associated with this exam
    await Question.deleteMany({ _id: { $in: exam.questions } });

    // Delete all results of this exam
    await Result.deleteMany({ exam: examId });

    return res.status(200).json(
        new ApiResponse(200, null, "Exam and all associated questions/results deleted successfully")
    );
});

export { createExam, deleteExam };
