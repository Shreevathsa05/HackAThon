import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Exam } from "../schema/exam.model.js"

const createExam = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, "Unauthenticated access");
    }

    const { subject, board, className, questions } = req.body;

    if (!subject || !board || !className || !questions || !Array.isArray(questions) || questions.length === 0) {
        throw new ApiError(403, "All fields including questions are required");
    }

    const exam = await Exam.create({
        teacher: userId,
        subject,
        board,
        className,
        questions
    });

    if (!exam) {
        throw new ApiError(500, "Failed to create exam");
    }

    return res.status(200).json(
        new ApiResponse(200, exam, "Exam created successfully")
    );
});

export {
    createExam,
}