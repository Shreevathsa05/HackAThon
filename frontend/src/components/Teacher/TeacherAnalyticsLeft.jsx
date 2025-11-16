import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar
} from "recharts";

const TeacherAnalyticsLeft = () => {
  const [data, setData] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/teacher/dashboard");
      setData(res.data.data);
    } catch (error) {
      console.error("Dashboard analytics error:", error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (!data)
    return (
      <div className="flex justify-center pt-20">
        <div className="animate-spin border-4 border-indigo-400 border-t-transparent w-10 h-10 rounded-full"></div>
      </div>
    );

  // PREPARE CHART DATA
  const abilityChartData = [
    { skill: "Retention", value: Number(data.avgAbility.retention) },
    { skill: "Application", value: Number(data.avgAbility.application) },
    { skill: "Grasping", value: Number(data.avgAbility.grasping) },
    { skill: "Listening", value: Number(data.avgAbility.listening) },
  ];

  const difficultyChartData = [
    { level: "Easy", value: Number(data.avgDifficulty.easy) },
    { level: "Medium", value: Number(data.avgDifficulty.medium) },
    { level: "Hard", value: Number(data.avgDifficulty.hard) },
  ];

  const examComparisonData = data.examWise.map((ex) => ({
    subject: ex.subject,
    percent: Number(ex.avgPercent),
    attempts: ex.attempts,
  }));

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 h-full overflow-y-auto space-y-8">
      <h2 className="text-2xl font-bold text-indigo-700 text-center">
        Teacher Performance Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
          <p className="text-gray-600 text-sm">Total Students</p>
          <h2 className="text-3xl font-bold text-indigo-700">{data.totalStudents}</h2>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
          <p className="text-gray-600 text-sm">Total Attempts</p>
          <h2 className="text-3xl font-bold text-indigo-700">{data.totalAttempts}</h2>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
          <p className="text-gray-600 text-sm">Overall Avg %</p>
          <h2 className="text-3xl font-bold text-indigo-700">{data.overallAvgPercent}%</h2>
        </div>
      </div>

{/* Ability Bar Chart */}
<section className="bg-gray-50 rounded-xl p-4 shadow-inner">
  <h3 className="text-lg font-semibold mb-2 text-gray-700">Ability Analysis</h3>
  <div className="w-full h-64">
    <ResponsiveContainer>
      <BarChart data={abilityChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="skill" />
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

      {/* Exam Wise Performance */}
      <section className="bg-white rounded-xl p-4 shadow">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Exam-wise Performance</h3>
        <div className="w-full h-72">
          <ResponsiveContainer>
            <BarChart data={examComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="percent" name="Avg %" fill="#6366F1" />
              <Bar dataKey="attempts" name="Attempts" fill="#A5B4FC" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <table className="w-full mt-4 text-left border-t">
          <thead className="bg-indigo-100">
            <tr>
              <th className="p-2">Subject</th>
              <th className="p-2">Attempts</th>
              <th className="p-2">Avg Percent</th>
            </tr>
          </thead>
          <tbody>
            {examComparisonData.map((row, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{row.subject}</td>
                <td className="p-2">{row.attempts}</td>
                <td className="p-2">{row.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default TeacherAnalyticsLeft;
