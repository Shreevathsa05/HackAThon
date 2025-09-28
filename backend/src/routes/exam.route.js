import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";
import { createExam, deleteExam } from "../controllers/exam.controller.js";

const router = Router();
router.use(verifyJWT)
router.route("/").post(verifyRole("teacher"), createExam).delete(verifyRole("teacher"), deleteExam);
router.route("/:examId").delete(verifyRole("teacher"), deleteExam);
export default router;