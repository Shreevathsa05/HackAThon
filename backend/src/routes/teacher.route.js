import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";
import { getLeaderboard, getMyExams, getSkillProfile } from "../controllers/teacher.controller.js";

const router = Router();
router.route("/skills/:examId").get(verifyJWT, verifyRole("teacher"), getSkillProfile);
router.route("/leaderboard/:examId").get(verifyJWT, verifyRole("teacher"), getLeaderboard);
router.route("/exams").get(verifyJWT, verifyRole("teacher"), getMyExams);
export default router;