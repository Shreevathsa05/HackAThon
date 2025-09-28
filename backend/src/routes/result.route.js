import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";
import { submitAnswer} from "../controllers/result.controller.js";

const router = Router();
router.route("/:examId").post(verifyJWT, verifyRole("student"), submitAnswer);
export default router;