import { useState, useEffect, useMemo } from "react";
import { api } from "../../api/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function ResultHistory() {
  const [examList, setExamList] = useState([]);
  const [selectedExam, setSelectedExam] = useState("overall");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ability");

  // Fetch attempted exams for the dropdown
  const fetchExams = async () => {
    try {
      const res = await api.get("/student/exams");
      setExamList(res.data.data || []);
    } catch (err) {
      console.error("Exam fetch error:", err);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async (examId) => {
    setLoading(true);
    try {
      const url =
        examId === "overall"
          ? "/result/history/overall"
          : `/result/history/${examId}`;
      const res = await api.get(url);
      console.log(res)
      setData(res.data.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchAnalytics("overall");
  }, []);

  // Handle dropdown
  const handleSelectChange = (val) => {
    setSelectedExam(val);
    fetchAnalytics(val);
  };

  const abilityData = useMemo(() => {
    if (!data) return [];
    return [
      {
        name: selectedExam === "overall" ? "Overall" : "Selected Exam",
        retention: Number(data.avgAbility?.retention || 0),
        application: Number(data.avgAbility?.application || 0),
        grasping: Number(data.avgAbility?.grasping || 0),
        listening: Number(data.avgAbility?.listening || 0),
      }
    ];
  }, [data, selectedExam]);

  const difficultyData = useMemo(() => {
    if (!data) return [];
    return [
      {
        name: selectedExam === "overall" ? "Overall" : "Selected Exam",
        easy: Number(data.avgDifficulty?.easy || 0),
        medium: Number(data.avgDifficulty?.medium || 0),
        hard: Number(data.avgDifficulty?.hard || 0),
      }
    ];
  }, [data, selectedExam]);

  if (loading || !data)
    return (
      <div className="flex flex-col justify-center items-center gap-4 mt-32">
        <div className="w-14 h-14 border-4 border-transparent border-t-indigo-500 border-l-indigo-400 rounded-full animate-spin" />
      </div>
    );
  console.log(difficultyData);

  return (
    <div className="w-full min-h-screen p-10 bg-gradient-to-br from-indigo-100 via-white to-indigo-50 font-sans">

      {/* TITLE */}
      <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
        📈 Result Analytics
      </h2>

      {/* SUMMARY CARDS */}
      <div className="grid md:grid-cols-3 gap-5 mb-10">
        <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-2xl shadow-sm text-center">
          <p className="text-sm text-gray-600">Average Score</p>
          <h2 className="text-4xl font-bold text-indigo-700">{data.avgPercent}%</h2>
        </div>

        <div className="p-6 bg-white border rounded-2xl shadow-sm text-center">
          <p className="text-sm text-gray-600">Exam / Subject</p>
          <h2 className="text-xl font-semibold">
            {selectedExam === "overall" ? "All Subjects" : data.subject}
          </h2>
        </div>

        <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-2xl shadow-sm text-center">
          <p className="text-sm text-gray-600">
            {selectedExam === "overall" ? "Total Exams" : "Grade"}
          </p>
          <h2 className="text-3xl font-semibold text-indigo-700">
            {selectedExam === "overall" ? data.testCount : data.grade}
          </h2>
        </div>
      </div>

      {/* TAB + DROPDOWN */}
      <div className="flex justify-between items-center mb-5">
        {/* Tabs */}
        <div className="flex gap-6 border-b pb-2">
          {["ability", "difficulty"].map((tab) => (
            <button
              key={tab}
              className={`pb-2 font-semibold capitalize ${activeTab === tab
                ? "border-b-4 border-indigo-600 text-indigo-700"
                : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dropdown */}
        <select
          value={selectedExam}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="px-5 py-2 border border-indigo-400 text-indigo-700 rounded-xl bg-white shadow-sm hover:border-indigo-600 focus:ring focus:ring-indigo-300 transition-all"
        >
          <option value="overall">Overall Performance</option>
          {examList?.map((exam) => (
            <option key={exam._id} value={exam._id}>
              {exam.title} — {exam.subject}
            </option>
          ))}
        </select>
      </div>

      {/* ABILITY CHART */}
      {/* ABILITY CHART */}
      {activeTab === "ability" && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">Ability Performance</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={abilityData} key={selectedExam + "-ability"}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="retention" fill="#3B82F6" />
              <Bar dataKey="application" fill="#60A5FA" />
              <Bar dataKey="grasping" fill="#93C5FD" />
              <Bar dataKey="listening" fill="#BFDBFE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}


      {/* DIFFICULTY CHART */}
      {/* DIFFICULTY CHART */}
      {activeTab === "difficulty" && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">Difficulty Performance</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={difficultyData} key={selectedExam + "-difficulty"}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="easy" fill="#93C5FD" />
              <Bar dataKey="medium" fill="#3B82F6" />
              <Bar dataKey="hard" fill="#1E3A8A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}
