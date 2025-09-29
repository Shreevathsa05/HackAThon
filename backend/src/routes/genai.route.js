import { Router } from "express";
import { getExamQuestions } from "../controllers/exam.controller.js";

const router = Router();
router.route("/exam/:examId").get(getExamQuestions)
export default router;