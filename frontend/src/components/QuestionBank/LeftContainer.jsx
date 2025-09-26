import React, { useState } from "react";
import { Upload } from "lucide-react";
import { set, useForm } from "react-hook-form"
import { useSelector } from "react-redux";
import extractErrorMsg from "../../utils/extractErrorMsg";
import { api } from "../../api/api";
import Input from "../Input"
export default function LeftContainer() {
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [exam, setExam] = useState({});
    const { userData } = useSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const handleExam = async (data) => {
        setLoading(true);
        setErrMsg("");
        try {
            const res = await api.post("/exam", data);
            setExam(res.data.data);
        } catch (error) {
            setErrMsg(extractErrorMsg(error));
            console.error("Exam :: error :: ", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-xl bg-white text-gray-900 p-8 rounded-2xl shadow-lg flex flex-col gap-6">
            {/* Target Audience */}
            <Input
                type="text"
                placeholder="Target Audience"
                className="w-full p-4 text-lg rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />

            {/* Class & Board */}
            <div className="flex gap-6">
                <Input
                    type="text"
                    placeholder="Class"
                    className="flex-1 p-4 text-lg rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                />
                <Input
                    type="text"
                    placeholder="Board"
                    className="flex-1 p-4 text-lg rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                />
            </div>

            {/* Subject */}
            <Input
                type="text"
                placeholder="Subject"
                className="w-full p-4 text-lg rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />

            {/* More details + upload */}
            <div className="relative w-full">
                <textarea
                    placeholder="More details for question bank generation"
                    rows={6}
                    className="w-full p-4 text-lg rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-none pr-16"
                />

                {/* Hidden file input */}
                <input type="file" id="fileUpload" className="hidden" />

                {/* Upload button with Lucide icon */}
                <label
                    htmlFor="fileUpload"
                    className="absolute bottom-4 right-4 cursor-pointer bg-blue-600 hover:bg-blue-500 p-3 rounded-lg text-white shadow-md transition flex items-center justify-center"
                >
                    <Upload className="w-5 h-5" />
                </label>
            </div>
        </div>
    );
}
