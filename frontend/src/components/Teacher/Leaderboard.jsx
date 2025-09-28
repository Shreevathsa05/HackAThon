import React, { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { api } from "../../api/api";
import extractErrorMsg from "../../utils/extractErrorMsg";

export default function Leaderboard({ examId }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");

    console.log(leaderboard);
    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            setErrMsg("");
            try {
                const res = await api.get(`/teacher/leaderboard/${examId}`);
                setLeaderboard(res.data.data);
            } catch (error) {
                setErrMsg(extractErrorMsg(error));
                console.error("Leaderboard :: error :: ", error);
            } finally {
                setLoading(false);
            }
        };

        if (examId) fetchLeaderboard();
    }, [examId]);

    if (loading) return <p>Loading Leaderboard...</p>;
    if (errMsg) return <p className="text-red-500">{errMsg}</p>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Students Leaderboard</h2>
            <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
                {leaderboard.map((student, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition"
                    >
                        <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-600">
                                Score: {student.scores[student.scores.length - 1] || 0}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
