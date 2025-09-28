import React, { useState } from "react";
import { Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import extractErrorMsg from "../../utils/extractErrorMsg";
import { api, genaiApi } from "../../api/api";
import Input from "../Input";

export default function LeftContainer({ questions, setQuestions }) {
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [exam, setExam] = useState(null);
    const { userData } = useSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const watchFile = watch("file");

    // 1️⃣ Call /generate-questions
    const handleGenerateQuestions = async (data) => {
        if (!data.file || data.file.length === 0) {
            setErrMsg("Please upload a PDF file first");
            return [];
        }

        setLoading(true);
        setErrMsg("");

        try {
            const formData = new FormData();
            formData.append("pdf", data.file[0]);
            formData.append("topic", data.subject || "General");
            formData.append("numQuestions", data.numQuestions || 5);

            const res = await genaiApi.post("/generate-questions", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setQuestions(res.data.data);
            return res.data.data;
        } catch (error) {
            setErrMsg(extractErrorMsg(error));
            console.error("GenerateQuestions :: error ::", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const handleExamCreation = async (data) => {
        setLoading(true);
        setErrMsg("");

        try {
            const generatedQuestions = await handleGenerateQuestions(data);
            if (generatedQuestions.length === 0) return;

            const questionIds = generatedQuestions.map((q) => q._id);

            const examData = {
                subject: data.subject,
                className: data.className,
                board: data.board,
                questions: questionIds,
            };

            const res = await api.post("/exam", examData);
            setExam(res.data.data);
            console.log("Exam created:", res.data.data);
        } catch (error) {
            setErrMsg(extractErrorMsg(error));
            console.error("Exam creation :: error ::", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(handleExamCreation)}
            className="w-full max-w-xl bg-white text-gray-900 p-8 rounded-2xl shadow-lg flex flex-col gap-6"
        >
            {/* Class & Board */}
            <div className="flex gap-6">
                {/* Class dropdown */}
                <select
                    {...register("className", { required: true })}
                    className="flex-1 p-4 text-lg rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue=""
                >
                    <option value="" disabled>
                        Select Class
                    </option>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={`${i + 1}`}>
                            {i + 1}{i + 1 === 1 ? "st" : i + 1 === 2 ? "nd" : i + 1 === 3 ? "rd" : "th"}
                        </option>
                    ))}
                </select>

                {/* Board input */}
                <Input
                    {...register("board", { required: true })}
                    type="text"
                    placeholder="Board"
                    className="flex-1 p-4 text-lg rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                />
            </div>


            {/* Subject & Number of Questions */}
            <div className="flex gap-6">
                <Input
                    {...register("subject", { required: true })}
                    type="text"
                    placeholder="Subject"
                    className="flex-1 p-4 text-lg rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                />
                <Input
                    {...register("numQuestions", { required: true, min: 1 })}
                    type="number"
                    placeholder="Number of Questions"
                    className="flex-1 p-4 text-lg rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                />
            </div>

            {/* More details + upload */}
            <div className="relative w-full">
                <textarea
                    {...register("details")}
                    placeholder="More details for question bank generation"
                    rows={6}
                    className="w-full p-4 text-lg rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-none pr-16"
                />

                {/* Hidden file input */}
                <input
                    type="file"
                    {...register("file", { required: true })}
                    id="fileUpload"
                    className="hidden"
                />

                {/* Upload button */}
                <label
                    htmlFor="fileUpload"
                    className="absolute bottom-4 right-4 cursor-pointer bg-blue-600 hover:bg-blue-500 p-3 rounded-lg text-white shadow-md transition flex items-center justify-center"
                >
                    <Upload className="w-5 h-5" />
                </label>
            </div>

            {/* Submit button */}
            <button
                type="submit"
                disabled={loading || !watchFile || !watch("className") || !watch("board") || !watch("subject")}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-lg font-semibold transition"
            >
                {loading ? "Processing..." : "Generate Exam"}
            </button>

            {/* Display error */}
            {errMsg && <p className="text-red-500 mt-2">{errMsg}</p>}

            {/* Display created exam */}
            {exam && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold">Exam Created Successfully!</h3>
                    <p>Exam ID: {exam._id}</p>
                    <p>Subject: {exam.subject}</p>
                    <p>Number of Questions: {exam.questions.length}</p>
                </div>
            )}
        </form>
    );
}
