import 'dotenv/config';              // load env early
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())
//routes
import userRouter from "./routes/user.route.js"
import studentRouter from "./routes/student.route.js"
import teacherRouter from "./routes/teacher.route.js"
import examRouter from "./routes/exam.route.js"
import resultRouter from "./routes/result.route.js"

app.use("/api/users", userRouter);
app.use("/api/student", studentRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/exam", examRouter);
app.use("/api/result", resultRouter);

import errorHandler from "./middleware/error.middleware.js"
app.use(errorHandler);

export { app };