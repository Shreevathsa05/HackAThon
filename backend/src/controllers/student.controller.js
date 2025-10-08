import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Student } from "../schema/student.model.js";
import { Exam } from "../schema/exam.model.js";

const getStudentProfile = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, "Unauthenticated access");
    }

    console.log(userId);

    const student = await Student.aggregate([
        {
            $match: {
                user_id: userId
            }
        },
        {
            $lookup: {
                from: "results",
                foreignField: "student",
                localField: "user_id",
                as: "exam_history"
            }
        }
    ])

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    return res.status(200).json(
        new ApiResponse(200, student, "Student profile fetched successfull")
    )

})

const getMyExams = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const exams = await Exam.find({}); // empty object = all exams

    return res.status(200).json(
        new ApiResponse(200, exams, "Successfully fetched exams")
    );
});

export {
    getStudentProfile,
    getMyExams
}