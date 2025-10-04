import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import { ExamCard } from "../../components/Teacher"

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


    if (loading) return <p>Loading exams...</p>;
    if (errMsg) return <p className="text-red-500">{errMsg}</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center gap-6">
            <h1 className="text-2xl font-bold mb-4">My Exams</h1>

            {/* Use a responsive flex wrap for cards */}
            <div className="flex flex-wrap justify-center gap-6 w-full">
                {exams && exams.length > 0 ? (
                    exams.map((exam) => (
                        <ExamCard
                            key={exam._id}
                            exam={exam}
                            path={"student"}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">No exams available.</p>
                )}
            </div>
        </div>
    );


}
