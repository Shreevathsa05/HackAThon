import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import { ExamCard } from "../../components/Teacher";

export default function StudentExamsList() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");

    useEffect(() => {
        const fetchExams = async () => {
            setLoading(true);
            setErrMsg("");
            try {
                const res = await api.get("/student/exams");
                setExams(res.data.data);
            } catch (error) {
                setErrMsg(extractErrorMsg(error));
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    if (loading)
        return (
            <div className="flex flex-col justify-center items-center gap-4 mt-32">
                <div className="w-14 h-14 border-[5px] border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                <div className="text-indigo-600 font-semibold text-lg animate-pulse tracking-wide">
                    Fetching Exams...
                </div>
            </div>
        );

    if (errMsg) return <p className="text-red-500">{errMsg}</p>;

    return (
        <div className="h-full w-full bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-8 flex flex-col items-center">

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-wide mb-10 text-center drop-shadow-sm">
                My Exams
                <span className="block mx-auto mt-2 h-1 w-20 bg-indigo-600 rounded-full"></span>
            </h1>

            {/* Card container */}
            <div
                className="
                w-full max-w-3xl space-y-6 p-6
                rounded-2xl backdrop-blur-lg
                bg-white/60 border border-white shadow-xl
                animate-[fadeIn_0.4s_ease]
                ">
                {exams && exams.length > 0 ? (
                    exams.map((exam) => (
                        <div
                            key={exam._id}
                            className="
                            transition-all duration-300 
                            hover:-translate-y-1 hover:scale-[1.01]
                            hover:shadow-2xl rounded-xl
                            bg-white/70 backdrop-blur-sm
                            border border-indigo-50"
                        >
                            <ExamCard exam={exam} path="student" />
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center gap-3 py-10 text-gray-500 animate-pulse">
                        <span className="text-6xl">📭</span>
                        <p className="text-lg font-medium">No exams available</p>
                        <p className="text-sm">Please check back later</p>
                    </div>
                )}
            </div>
        </div>
    );
}
