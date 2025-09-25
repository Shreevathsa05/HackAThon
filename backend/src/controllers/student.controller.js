import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Student } from "../schema/student.model.js"

const getStudentProfile = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, "Unauthenticated access");
    }

    const student = await Student.findOne({
        user_id: userId
    })

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    return res.status(200).json(
        new ApiResponse(200, student, "Student profile fetched successfull")
    )

})

export {
    getStudentProfile
}