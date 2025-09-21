import { ApiError } from "../utils/ApiError.js"

export const verifyRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            throw new ApiError(404, "Unauthorized access");
        }
        next();
    }
}