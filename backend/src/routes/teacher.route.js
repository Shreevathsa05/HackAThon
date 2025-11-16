import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";
import { getLeaderboard, getMyExams, getSkillProfile, getTeacherDashboardAnalytics, getTeacherExamWiseAnalytics } from "../controllers/teacher.controller.js";

const router = Router();
router.route("/skills/:examId").get(verifyJWT, verifyRole("teacher"), getSkillProfile);
router.route("/leaderboard/:examId").get(verifyJWT, verifyRole("teacher"), getLeaderboard);
router.route("/exams").get(verifyJWT, verifyRole("teacher"), getMyExams);
router.route("/dashboard").get(verifyJWT, verifyRole("teacher"), getTeacherDashboardAnalytics);
router.route("/dashboard/exam/:examId").get(verifyJWT, verifyRole("teacher"), getTeacherExamWiseAnalytics);
export default router;