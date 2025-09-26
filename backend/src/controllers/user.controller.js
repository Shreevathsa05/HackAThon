import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../schema/user.model.js"
import { Student } from "../schema/student.model.js"
import { Parent } from "../schema/parent.model.js";

const COOKIES_OPTIONS = {
    httpOnly: true,
    secure: true,
}

const accessTokenExpiry = parseInt(process.env.ACCESS_TOKEN_EXPIRY)

const register = asyncHandler(async (req, res) => {
    const { fullName, email, role, password } = req.body;

    if (
        [fullName, email, password].some((field) =>
            !field || field?.trim() === "")
    ) {
        throw new ApiError(400, "Bad request")
    }

    const existedUser = await User.findOne({ email })

    if (existedUser) {
        throw new ApiError(409, "user with email or username already exist")
    }

    const user = await User.create({
        fullName,
        email,
        role,
        password
    })

    if (!user) {
        throw new ApiError(500, "Failed to create user");
    }

    if (user.role === "student") {
        const student = await Student.create({ user_id: user._id });
        if (!student) {
            throw new ApiError(500, "Failed to create student")
        }
    } else if (user.role === "parent") {
        const parent = await Parent.create({ user_id: user._id });
        if (!parent) {
            throw new ApiError(500, "Failed to create parent")
        }
    }

    const jwtToken = user.generateAccessToken();
    const registeredInUser = await User.findById(user._id).select("-password -refreshToken")
    if (!registeredInUser) {
        throw new ApiError(500, "Failed to register user");
    }

    return res.status(200)
        .cookie("jwtToken", jwtToken, { ...COOKIES_OPTIONS, maxAge: accessTokenExpiry })
        .json(
            new ApiResponse(200, registeredInUser, "User is created successfull")
        )

})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, 'User not found')
    }

    const isPasswordCorrect = user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const accessToken = user.generateAccessToken();
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    return res.status(200)
        .cookie("jwtToken", accessToken, { ...COOKIES_OPTIONS, maxAge: accessTokenExpiry })
        .json(
            new ApiResponse(200, loggedInUser, "User is created successfull")
        )
})


const logout = asyncHandler(async (req, res) => {

    return res.status(200)
        .clearCookie("jwtToken", { ...COOKIES_OPTIONS, maxAge: accessTokenExpiry })
        .json(
            new ApiResponse(200, {}, "Successfully logout user")
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user
    return res.status(200)
        .json(new ApiResponse(200, user, "current user fetched successfully"))
});

export {
    register,
    login,
    logout,
    getCurrentUser,
}