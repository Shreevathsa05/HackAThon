import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";
import { getStudentProfile } from "../controllers/student.controller.js";

const router = Router();
router.use(verifyJWT, verifyRole("student"), getStudentProfile);
export default router;