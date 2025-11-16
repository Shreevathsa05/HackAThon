import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import {
    ResponsiveContainer,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
} from "recharts";

const ExamWiseAnalytics = ({ exam }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchExamAnalytics = async () => {
        try {
            const res = await api.get(`/teacher/dashboard/exam/${exam._id}`);
            setData(res.data.data);
        } catch (error) {
            console.error("Exam analytics error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (exam?._id) fetchExamAnalytics();
    }, [exam]);

    if (loading || !data)
        return (
            <div className="flex justify-center pt-20">
                <div className="animate-spin border-4 border-indigo-400 border-t-transparent w-10 h-10 rounded-full"></div>
            </div>
        );

    // Prepare chart data
    const abilityChartData = [
        { name: "Retention", value: Number(data.avgAbility.retention) || 0 },
        { name: "Application", value: Number(data.avgAbility.application) || 0 },
        { name: "Grasping", value: Number(data.avgAbility.grasping) || 0 },
        { name: "Listening", value: Number(data.avgAbility.listening) || 0 },
    ];

    const difficultyChartData = [
        { level: "Easy", value: Number(data.avgDifficulty.easy) || 0 },
        { level: "Medium", value: Number(data.avgDifficulty.medium) || 0 },
        { level: "Hard", value: Number(data.avgDifficulty.hard) || 0 },
    ];

    return (
        <div className="bg-white shadow-lg rounded-2xl p-6 h-full overflow-y-auto space-y-8">
            <h2 className="text-2xl font-bold text-indigo-700 text-center">
                {data.title} - Analytics
            </h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                    <p className="text-gray-600 text-sm">Total Students Attempted</p>
                    <h2 className="text-3xl font-bold text-indigo-700">{data.attempts}</h2>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                    <p className="text-gray-600 text-sm">Average Score</p>
                    <h2 className="text-3xl font-bold text-indigo-700">{data.avgPercent}%</h2>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                    <p className="text-gray-600 text-sm">Subject</p>
                    <h2 className="text-3xl font-bold text-indigo-700">{data.subject}</h2>
                </div>
            </div>

            {/* Ability Bar Chart */}
            <section className="bg-gray-50 rounded-xl p-4 shadow-inner">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Ability Analysis</h3>
                <div className="w-full h-64">
                    <ResponsiveContainer>
                        <BarChart data={abilityChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#4F46E5" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Difficulty Chart */}
            <section className="bg-gray-50 rounded-xl p-4 shadow-inner">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Difficulty Response</h3>
                <div className="w-full h-64">
                    <ResponsiveContainer>
                        <BarChart data={difficultyChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="level" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#4F46E5" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Student-wise Table */}
            <section className="bg-white rounded-xl p-4 shadow">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Student-wise Performance</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-t">
                        <thead className="bg-indigo-100">
                            <tr>
                                <th className="p-2">Student Name</th>
                                <th className="p-2">Score %</th>
                                <th className="p-2">Retention</th>
                                <th className="p-2">Application</th>
                                <th className="p-2">Grasping</th>
                                <th className="p-2">Listening</th>
                                <th className="p-2">Easy</th>
                                <th className="p-2">Medium</th>
                                <th className="p-2">Hard</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.students.map((student, i) => (
                                <tr key={i} className="border-b">
                                    <td className="p-2">{student.studentName}</td>
                                    <td className="p-2">{Number(student.percent).toFixed(2)}%</td>
                                    <td className="p-2">{Number(student.perAbility?.retention || 0).toFixed(2)}</td>
                                    <td className="p-2">{Number(student.perAbility?.application || 0).toFixed(2)}</td>
                                    <td className="p-2">{Number(student.perAbility?.grasping || 0).toFixed(2)}</td>
                                    <td className="p-2">{Number(student.perAbility?.listening || 0).toFixed(2)}</td>
                                    <td className="p-2">{Number(student.perDifficulty?.easy || 0).toFixed(2)}</td>
                                    <td className="p-2">{Number(student.perDifficulty?.medium || 0).toFixed(2)}</td>
                                    <td className="p-2">{Number(student.perDifficulty?.hard || 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default ExamWiseAnalytics;
