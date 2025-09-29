import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";
import { createExam, deleteExam, getExamQuestions } from "../controllers/exam.controller.js";

const router = Router();
router.use(verifyJWT)
router.route("/").post(verifyRole("teacher"), createExam).delete(verifyRole("teacher"), deleteExam);
router.route("/:examId").get(getExamQuestions).delete(verifyRole("teacher"), deleteExam);
export default router;