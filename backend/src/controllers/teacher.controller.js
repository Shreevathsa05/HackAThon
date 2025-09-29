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
                studentsAppeared: { $size: "$results" }
            }
        },
        {
            $project: {
                _id: 1,
                subject: 1,
                className: 1,
                board: 1,
                studentsAppeared: 1
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    return res.status(200).json(
        new ApiResponse(200, exams, "successfully fetched exams")
    );
});

export {
    getLeaderboard,
    getSkillProfile,
    getMyExams
}