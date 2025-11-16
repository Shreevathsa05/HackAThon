import { Result } from "../schema/result.model.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Exam } from "../schema/exam.model.js";

const getSkillProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const { examId } = req.params;
    if (!examId) {
        throw new ApiError(403, "examId is required")
    }

    const skillData = await Result.aggregate([
        {
            $match: {
                creator: new mongoose.Types.ObjectId(userId),
                exam: new mongoose.Types.ObjectId(examId)
            }
        },
        { $unwind: "$answers" },
        {
            $group: {
                _id: {
                    type: "$answers.question_type",
                    difficulty: "$answers.difficulty"
                },
                correctCount: { $sum: { $cond: ["$answers.is_correct", 1, 0] } }
            }
        },
        {
            $group: {
                _id: "$_id.type",
                difficulties: { $push: { k: "$_id.difficulty", v: "$correctCount" } }
            }
        },
        {
            $project: {
                skill_profile: { $arrayToObject: "$difficulties" }
            }
        }
    ]);

    const skill_profile = Object.fromEntries(skillData.map(d => [d._id, d.skill_profile]));
    return res.status(200).json(new ApiResponse(200, skill_profile, "successfully fetched skill profile"));
})

const getLeaderboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const { examId } = req.params;
    if (!examId) {
        throw new ApiError(403, "examId is required")
    }

    const leaderboard = await Result.aggregate([
        {
            $match: {
                creator: new mongoose.Types.ObjectId(userId),
                exam: new mongoose.Types.ObjectId(examId),
            },
        },
        {
            $group: {
                _id: "$student",             // group by student ObjectId
                scores: { $push: "$score" }, // collect all scores for this student
            },
        },
        {
            $lookup: {
                from: "users",               // join with the users collection
                localField: "_id",           // student ObjectId
                foreignField: "_id",         // user _id
                as: "student",
            },
        },
        { $unwind: "$student" },          // convert array to object
        {
            $addFields: {
                latestScore: { $arrayElemAt: ["$scores", -1] } // latest score for sorting
            }
        },
        {
            $project: {
                _id: 0,
                name: "$student.fullName",
                scores: 1,
                latestScore: 1,
            },
        },
        { $sort: { latestScore: -1 } },   // sort by latest score
    ]);


    return res.status(200).json(new ApiResponse(200, leaderboard, "successfully fetched leaderboard"));

})

const getMyExams = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    console.log('work')
    console.log(userId)
    const exams = await Exam.aggregate([
        {
            $match: {
                creator: userId
            }
        },
        {
            $lookup: {
                from: "results",
                localField: "_id",
                foreignField: "exam",
                as: "results"
            }
        },
        {
            $addFields: {
                studentsAppeared: { $size: "$results" },
                questions: { $size: "$questions" }
            }
        },
        {
            $project: {
                _id: 1,
                subject: 1,
                className: 1,
                board: 1,
                studentsAppeared: 1,
                questions: 1
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    return res.status(200).json(
        new ApiResponse(200, exams, "successfully fetched exams")
    );
});

export const getTeacherDashboardAnalytics = asyncHandler(async (req, res) => {
    const teacherId = req.user?._id;

    if (!teacherId) throw new ApiError(401, "Unauthorized request!");

    // 1️⃣ Fetch exams created by teacher
    const exams = await Exam.find({ creator: teacherId });

    if (!exams.length)
        return res.status(200).json(new ApiResponse(200, {}, "No exams created yet"));

    const examIds = exams.map(e => e._id);

    // 2️⃣ Fetch all results for these exams
    const results = await Result.find({ exam: { $in: examIds } }).populate("user exam");

    if (!results.length)
        return res.status(200).json(new ApiResponse(200, {}, "No student attempts yet"));

    // Helpers
    const extractPercentage = (v) => {
        if (!v) return 0;
        const match = String(v).match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
    };

    let ability = { retention: 0, application: 0, grasping: 0, listening: 0 };
    let difficulty = { easy: 0, medium: 0, hard: 0 };
    let totalPercent = 0;

    results.forEach(r => {
        ability.retention += extractPercentage(r.perAbility.retention);
        ability.application += extractPercentage(r.perAbility.application);
        ability.grasping += extractPercentage(r.perAbility.grasping);
        ability.listening += extractPercentage(r.perAbility.listening);

        difficulty.easy += extractPercentage(r.perDifficulty.easy);
        difficulty.medium += extractPercentage(r.perDifficulty.medium);
        difficulty.hard += extractPercentage(r.perDifficulty.hard);

        totalPercent += r.summary.percent;
    });

    const count = results.length;
    const divide = (v) => (v / count).toFixed(2);

    const avgAbility = {
        retention: divide(ability.retention),
        application: divide(ability.application),
        grasping: divide(ability.grasping),
        listening: divide(ability.listening),
    };

    const avgDifficulty = {
        easy: divide(difficulty.easy),
        medium: divide(difficulty.medium),
        hard: divide(difficulty.hard),
    };

    const overallAvgPercent = divide(totalPercent);
    const uniqueStudents = new Set(results.map(r => r.user._id.toString()));

    // 3️⃣ Exam-wise summary
    const examWise = exams.map(exam => {
        const examResults = results.filter(r => String(r.exam._id) === String(exam._id));

        if (!examResults.length) return {
            examId: exam._id,
            title: exam.title,
            subject: exam.subject,
            attempts: 0,
            avgPercent: 0
        };

        const avg = examResults.reduce((a, r) => a + r.summary.percent, 0) / examResults.length;

        return {
            examId: exam._id,
            title: exam.title,
            subject: exam.subject,
            attempts: examResults.length,
            avgPercent: avg.toFixed(2),
        };
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                overallAvgPercent,
                totalStudents: uniqueStudents.size,
                totalAttempts: results.length,
                avgAbility,
                avgDifficulty,
                examWise
            },
            "Teacher analytics dashboard fetched"
        )
    );
});

export const getTeacherExamWiseAnalytics = asyncHandler(async (req, res) => {
    const teacherId = req.user?._id;
    const { examId } = req.params;

    if (!teacherId) throw new ApiError(401, "Unauthorized request!");
    if (!examId) throw new ApiError(400, "Exam ID is required!");

    // 1️⃣ Verify exam belongs to teacher
    const exam = await Exam.findOne({ _id: examId, creator: teacherId });
    if (!exam) throw new ApiError(404, "Exam not found or unauthorized!");

    // 2️⃣ Fetch results for this exam
    const results = await Result.find({ exam: examId }).populate("user exam");

    if (!results.length)
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    examId,
                    title: exam.title,
                    subject: exam.subject,
                    attempts: 0,
                    avgPercent: 0,
                    avgAbility: {},
                    avgDifficulty: {},
                    students: []
                },
                "No attempts yet for this exam"
            )
        );

    const extractNumericFromText = (text) => {
        if (!text) return 0;
        const match = text.match(/(\d+(\.\d+)?)/); // matches first number in the string
        return match ? parseFloat(match[1]) : 0;
    };

    const students = results.map(r => {
        const percent = extractPercentage(r.summary.percent);
        totalPercent += percent;

        // For avg calculations
        ability.retention += extractNumericFromText(r.perAbility.retention);
        ability.application += extractNumericFromText(r.perAbility.application);
        ability.grasping += extractNumericFromText(r.perAbility.grasping);
        ability.listening += extractNumericFromText(r.perAbility.listening);

        difficulty.easy += extractNumericFromText(r.perDifficulty.easy);
        difficulty.medium += extractNumericFromText(r.perDifficulty.medium);
        difficulty.hard += extractNumericFromText(r.perDifficulty.hard);

        // Return numeric data for frontend
        return {
            studentId: r.user._id,
            studentName: r.user.fullName,
            percent,
            perAbility: {
                retention: extractNumericFromText(r.perAbility.retention),
                application: extractNumericFromText(r.perAbility.application),
                grasping: extractNumericFromText(r.perAbility.grasping),
                listening: extractNumericFromText(r.perAbility.listening),
            },
            perDifficulty: {
                easy: extractNumericFromText(r.perDifficulty.easy),
                medium: extractNumericFromText(r.perDifficulty.medium),
                hard: extractNumericFromText(r.perDifficulty.hard),
            }
        };
    });

});


export {
    getLeaderboard,
    getSkillProfile,
    getMyExams
}