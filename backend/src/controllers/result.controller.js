import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Exam } from "../schema/exam.model.js";
import { Result } from "../schema/result.model.js";
import { Question } from "../schema/question.model.js"; // backend Question model
import mongoose from "mongoose";
import { Student } from "../schema/student.model.js";

const submitAnswer = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) throw new ApiError(401, "Unauthenticated access");

  const { examId } = req.params;
  const { question_id, selected_option } = req.body;

  if (!examId) throw new ApiError(403, "ExamId is required");
  if (!question_id || !selected_option || !["a", "b", "c", "d"].includes(selected_option))
    throw new ApiError(403, "Invalid fields");

  // 1️⃣ Verify exam exists
  const exam = await Exam.findById(examId);
  if (!exam) throw new ApiError(404, "Exam not found");

  // 2️⃣ Check if question belongs to exam
  if (!exam.questions.includes(question_id)) {
    throw new ApiError(400, "Question not found in this exam");
  }

  // 3️⃣ Fetch only the required question
  const question = await Question.findById(question_id);
  if (!question) throw new ApiError(404, "Question not found in DB");

  // 4️⃣ Check if answer is correct
  const is_correct = question.answer === selected_option;

  // 5️⃣ Find or create student result
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

  // 6️⃣ Update result with submitted answer
  const updatedResult = await Result.findByIdAndUpdate(result._id, {
    $push: {
      answers: {
        question_id,
        question_type: question.question_type,
        difficulty: question.difficulty,
        selected_option,
        is_correct
      }
    },
    ...(is_correct && { $inc: { score: 1 } })
  }, { new: true });

  // 7️⃣ Update student's skill profile if correct
  if (is_correct) {
    await Student.findOneAndUpdate(
      { user_id: userId },
      { $inc: { [`skill_profile.${question.question_type}.${question.difficulty}`]: 1 } },
      { new: true }
    );
  }

  return res.status(200).json(
    new ApiResponse(200, updatedResult, "Answer submitted successfully")
  );
});

// ✅ Save analysis
export const submitAnalysis = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user._id;
    const { analysis } = req.body;

    if (!analysis) throw new ApiError(400, "Analysis data is required");

    const result = await Result.create({
      exam: examId,
      student: studentId,
      creator: analysis.creator || null,
      score: analysis.summary.correctCount,
      answers: analysis.answers || [],
      analysis
    });

    // update student history
    await Student.findOneAndUpdate(
      { user_id: studentId },
      { $push: { exam_history: result._id } },
      { new: true, upsert: true }
    );

    return res.status(201).json(new ApiResponse(201, result, "Analysis submitted successfully"));
  } catch (err) {
    throw new ApiError(500, err.message);
  }
};

// ✅ Fetch all analysis for a student
export const getAnalysis = async (req, res) => {
  try {
    const studentId = req.user._id;
    const results = await Result.find({ student: studentId })
      .populate("exam", "subject className board")
      .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, results, "Analysis fetched successfully"));
  } catch (err) {
    throw new ApiError(500, err.message);
  }
};


export const submitResult = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthenticated access");

  const { examId } = req.params;
  const resultData = req.body.analysis; // entire analytics object
  if (!examId || !resultData)
    throw new ApiError(400, "Exam ID and result data are required");

  // optional: prevent duplicate submission
  const existing = await Result.findOne({ user: userId, exam: examId });
  if (existing) throw new ApiError(409, "Result already submitted");

  const savedResult = await Result.create({
    user: userId,
    exam: examId,
    summary: resultData.summary,
    perAbility: resultData.perAbility,
    perDifficulty: resultData.perDifficulty,
    questionAnalysis: resultData.questionAnalysis,
    actionPlan: resultData.actionPlan,
    teacherNotes: resultData.teacherNotes
  });

  return res.status(200).json(
    new ApiResponse(201, savedResult, "Result saved successfully")
  );
});

export const getOverallStudentAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized request!");

  const results = await Result.find({ user: userId }).populate("exam");

  if (!results.length)
    return res.status(200).json(new ApiResponse(200, {}, "No results found"));

  // Extract ability & difficulty
  const ability = { retention: 0, application: 0, grasping: 0, listening: 0 };
  const difficulty = { easy: 0, medium: 0, hard: 0 };

  const extractPercentage = (value) => {
    if (!value) return 0;

    // Converts to string to avoid errors if value is numeric already
    const match = String(value).match(/(\d+(\.\d+)?)/);

    return match ? parseFloat(match[1]) : 0;
  };

  results.forEach(r => {
    ability.retention += extractPercentage(r.perAbility.retention);
    ability.application += extractPercentage(r.perAbility.application);
    ability.grasping += extractPercentage(r.perAbility.grasping);
    ability.listening += extractPercentage(r.perAbility.listening);

    difficulty.easy += extractPercentage(r.perDifficulty.easy);
    difficulty.medium += extractPercentage(r.perDifficulty.medium);
    difficulty.hard += extractPercentage(r.perDifficulty.hard);
  });

  const divide = (v) => (v / results.length).toFixed(2);

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

  const avgPercent = (
    results.reduce((acc, r) => acc + r.summary.percent, 0) /
    results.length
  ).toFixed(2);

  return res.status(200).json(
    new ApiResponse(200, {
      avgPercent,
      testCount: results.length,
      avgAbility,
      avgDifficulty
    }, "Overall analytics fetched")
  );
});

export const getExamWiseAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { examId } = req.params;

  if (!userId) throw new ApiError(401, "Unauthorized request!");
  if (!examId) throw new ApiError(400, "Exam ID is required");

  const result = await Result.findOne({ user: userId, exam: examId }).populate("exam");

  if (!result)
    return res.status(404).json(new ApiResponse(404, {}, "No result found for this exam"));
  const extractPercentage = (value) => {
    if (!value) return 0;
    const match = String(value).match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const avgAbility = {
    retention: extractPercentage(result.perAbility.retention).toFixed(2),
    application: extractPercentage(result.perAbility.application).toFixed(2),
    grasping: extractPercentage(result.perAbility.grasping).toFixed(2),
    listening: extractPercentage(result.perAbility.listening).toFixed(2),
  };

  const avgDifficulty = {
    easy: extractPercentage(result.perDifficulty.easy).toFixed(2),
    medium: extractPercentage(result.perDifficulty.medium).toFixed(2),
    hard: extractPercentage(result.perDifficulty.hard).toFixed(2),
  };

  const avgPercent = parseFloat(result.summary.percent).toFixed(2);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        avgPercent,
        grade: result.summary.grade,
        subject: result.exam.subject,
        avgAbility,
        avgDifficulty
      },
      "Exam analytics fetched"
    )
  );
});

export { submitAnswer };