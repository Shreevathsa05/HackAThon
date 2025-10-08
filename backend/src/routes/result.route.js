import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";
import { getAnalysis, submitAnalysis, submitAnswer} from "../controllers/result.controller.js";

const router = Router();
router.route("/:examId").post(verifyJWT, verifyRole("student"), submitAnalysis).get(verifyJWT, verifyRole("student"), getAnalysis);
export default router;