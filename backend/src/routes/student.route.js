import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";

const router = Router();
router.use(verifyJWT, verifyRole("student"));
export default router;