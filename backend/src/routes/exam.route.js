import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";
import { createExam } from "../controllers/exam.controller.js";

const router = Router();
router.route("/").post(verifyJWT, verifyRole("teacher"), createExam);
export default router;