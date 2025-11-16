import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";
import { getAnalysis, getExamWiseAnalytics, getOverallStudentAnalytics, submitAnalysis, submitResult } from "../controllers/result.controller.js";

const router = Router();
router.get("/history/overall", verifyJWT, verifyRole("student"), getOverallStudentAnalytics);
router.get("/history/:examId", verifyJWT, verifyRole("student"), getExamWiseAnalytics);

router.route("/analysis/:examId").post(verifyJWT, verifyRole("student"), submitResult)
router.route("/:examId").post(verifyJWT, verifyRole("student"), submitAnalysis).get(verifyJWT, verifyRole("student"), getAnalysis);

export default router;