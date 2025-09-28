import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import { ExamCard } from "../../components/Teacher"

export default function ExamsList() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const fetchExams = async () => {
            setLoading(true);
            setErrMsg("");
            try {
                const res = await api.get("/teacher/exams");
                setExams(res.data.data);
            } catch (error) {
                setErrMsg(extractErrorMsg(error));
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    const handleEdit = (exam) => {
        console.log("Edit exam", exam);
    };

    const handleDelete = async (exam) => {
        if (!confirm(`Are you sure you want to delete exam: ${exam.subject}?`)) return;

        setDeleteLoading(true);
        try {
            await api.delete(`/exam/${exam._id}`);
            setExams(prev => prev.filter(e => e._id !== exam._id));
        } catch (error) {
            console.error("Delete error", error);
        } finally {
            setDeleteLoading(false);
        }
    };


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
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            deleteLoading={deleteLoading}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">No exams available.</p>
                )}
            </div>
        </div>
    );


}
