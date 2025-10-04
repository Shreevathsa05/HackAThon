import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const backendUrl = `https://hack-a-thon-genai.onrender.com`;

export default function StudentDashboard() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");

        // --- Dummy Data (for GATE-level subjects) ---
        if (!token) {
          const dummyData = [
            {
              exam: {
                subject: "Operating Systems",
                course: "B.Tech CSE",
                examType: "GATE Mock Test",
              },
              analysis: {
                summary: {
                  totalQuestions: 25,
                  correctCount: 19,
                  percent: 76,
                  grade: "B+",
                },
                difficulty: {
                  veryEasy: 100,
                  easy: 85,
                  moderate: 70,
                  difficult: 55,
                },
                teacherNotes:
                  "Good conceptual clarity in process management and deadlocks. Improve scheduling algorithm accuracy and memory management efficiency.",
              },
            },
            {
              exam: {
                subject: "Computer Networks",
                course: "B.Tech CSE",
                examType: "Semester Practice Test",
              },
              analysis: {
                summary: {
                  totalQuestions: 20,
                  correctCount: 17,
                  percent: 85,
                  grade: "A",
                },
                difficulty: {
                  veryEasy: 100,
                  easy: 90,
                  moderate: 80,
                  difficult: 65,
                },
                teacherNotes:
                  "Excellent understanding of TCP/IP and subnetting. Work on application layer protocols and error control techniques.",
              },
            },
            {
              exam: {
                subject: "Database Management Systems",
                course: "B.Tech CSE",
                examType: "Internal Evaluation",
              },
              analysis: {
                summary: {
                  totalQuestions: 22,
                  correctCount: 16,
                  percent: 73,
                  grade: "B+",
                },
                difficulty: {
                  veryEasy: 95,
                  easy: 80,
                  moderate: 70,
                  difficult: 50,
                },
                teacherNotes:
                  "Solid understanding of normalization and SQL queries. Focus on transaction management and indexing concepts.",
              },
            },
            {
              exam: {
                subject: "Data Structures & Algorithms",
                course: "B.Tech CSE",
                examType: "Weekly Practice Test",
              },
              analysis: {
                summary: {
                  totalQuestions: 30,
                  correctCount: 25,
                  percent: 83,
                  grade: "B",
                },
                difficulty: {
                  veryEasy: 37,
                  easy: 27,
                  moderate: 20,
                  difficult: 11,
                },
                teacherNotes:
                  "Excellent logic-building ability and time complexity understanding. Practice more on graph and dynamic programming problems.",
              },
            },
          ];
          setResults(dummyData);
          return;
        }

        const res = await fetch(`${backendUrl}/analysis`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setResults(data.data || []);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    };

    fetchResults();
  }, []);

  // --- Summary Stats ---
  const avgPercent =
    results.length > 0
      ? (
          results.reduce((acc, r) => acc + r.analysis.summary.percent, 0) /
          results.length
        ).toFixed(1)
      : 0;

  const topSubject =
    results.length > 0
      ? results.reduce((a, b) =>
          a.analysis.summary.percent > b.analysis.summary.percent ? a : b
        ).exam.subject
      : "N/A";

  const totalExams = results.length;

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 tracking-tight">
        Exam Performance Dashboard
      </h1>

      {/* --- Summary Cards --- */}
      <div className="grid md:grid-cols-3 gap-5 mb-10">
        <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-2xl shadow-sm hover:shadow-md transition">
          <h2 className="text-sm text-gray-600">Average Score</h2>
          <p className="text-4xl font-semibold text-indigo-700 mt-1">
            {avgPercent}%
          </p>
        </div>
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition">
          <h2 className="text-sm text-gray-600">Total Exams Attempted</h2>
          <p className="text-4xl font-semibold text-slate-700 mt-1">
            {totalExams}
          </p>
        </div>
        <div className="p-6 bg-green-50 border border-green-200 rounded-2xl shadow-sm hover:shadow-md transition">
          <h2 className="text-sm text-gray-600">Top Performing Subject</h2>
          <p className="text-2xl font-semibold text-green-700 mt-1">
            {topSubject}
          </p>
        </div>
      </div>

      {/* --- Difficulty Level Chart --- */}
      <div className="bg-white border rounded-2xl shadow p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Performance by Difficulty Level
        </h2>
        {results.length === 0 ? (
          <p className="text-gray-600 text-sm">No data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={results.map((r) => ({
                subject: r.exam.subject,
                VeryEasy: r.analysis.difficulty.veryEasy,
                Easy: r.analysis.difficulty.easy,
                Moderate: r.analysis.difficulty.moderate,
                Difficult: r.analysis.difficulty.difficult, 
              }))}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="VeryEasy" fill="#22c55e" stackId="a" />
              <Bar dataKey="Easy" fill="#3b82f6" stackId="a" />
              <Bar dataKey="Moderate" fill="#f59e0b" stackId="a" />
              <Bar dataKey="Difficult" fill="#ef4444" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* --- Detailed Exam Cards --- */}
      <div className="grid md:grid-cols-2 gap-6">
        {results.map((res, idx) => (
          <div
            key={idx}
            className="p-6 bg-white rounded-2xl border shadow hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-gray-800">
                {res.exam.subject}
              </h3>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                {res.exam.examType}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              <strong>Course:</strong> {res.exam.course}
            </p>
            <div className="flex justify-between mb-3 text-gray-700 text-sm">
              <p>
                <strong>Score:</strong> {res.analysis.summary.correctCount}/
                {res.analysis.summary.totalQuestions}
              </p>
              <p>
                <strong>Grade:</strong> {res.analysis.summary.grade}
              </p>
              <p>
                <strong>Percent:</strong> {res.analysis.summary.percent}%
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg text-sm text-gray-600 border-l-4 border-indigo-500">
              {res.analysis.teacherNotes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
