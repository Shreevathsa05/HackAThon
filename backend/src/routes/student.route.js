import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";
import { getMyExams, getStudentProfile } from "../controllers/student.controller.js";

const router = Router();
router.use(verifyJWT, verifyRole("student"))
router.route('/').get(getStudentProfile);
router.route('/exams').get(getMyExams);
export default router;