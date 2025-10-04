import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

const backendUrl = `https://hack-a-thon-genai.onrender.com`;

export default function AnalysisPage() {
  const { examId } = useParams();
  const location = useLocation();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const sessionAnswers = location.state?.sessionAnswers || [];

  useEffect(() => {
  const fetchAnalysis = async () => {
    if (sessionAnswers.length === 0) return;
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/quiz/${examId}/analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionAnswers }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);

      // ✅ Save analysis in DB
      await fetch(`${backendUrl}/analysis/${examId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ analysis: data.analysis })
      });
    } catch (err) {
      console.error("Error fetching analysis:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchAnalysis();
}, [examId, sessionAnswers]);


  if (loading) return <p className="text-center">Analyzing your performance...</p>;
  if (!analysis) return <p className="text-center">No analysis available.</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Quiz Analysis</h1>

      {/* Summary */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow">
        <p><strong>Total Questions:</strong> {analysis.summary.totalQuestions}</p>
        <p><strong>Correct:</strong> {analysis.summary.correctCount}</p>
        <p><strong>Score:</strong> {analysis.summary.weightedScore}/{analysis.summary.maxScore}</p>
        <p><strong>Percent:</strong> {analysis.summary.percent}%</p>
        <p><strong>Grade:</strong> {analysis.summary.grade}</p>
      </div>

      {/* Teacher Notes */}
      <div className="mb-6 p-4 bg-yellow-100 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-2">Teacher Notes</h2>
        <p>{analysis.teacherNotes}</p>
      </div>

      {/* Action Plan */}
      <div className="mb-6 p-4 bg-green-100 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-2">Action Plan</h2>
        <ul className="list-disc pl-6">
          {analysis.actionPlan.nextSteps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ul>
        <p className="mt-2"><strong>Schedule:</strong> {analysis.actionPlan.schedule}</p>
        <p><strong>Resources:</strong></p>
        <ul className="list-disc pl-6">
          {analysis.actionPlan.resources.map((res, idx) => (
            <li key={idx}>{res}</li>
          ))}
        </ul>
      </div>

      {/* Per-question analysis */}
      <div>
        <h2 className="text-lg font-bold mb-4">Detailed Breakdown</h2>
        {analysis.questionAnalysis.map((q, idx) => (
          <div key={idx} className="mb-4 p-4 border rounded-lg shadow-sm">
            <p><strong>Q{idx + 1}:</strong> {q.question}</p>
            <p><strong>Your Answer:</strong> {q.studentAnswer}</p>
            <p><strong>Correct Answer:</strong> {q.correctAnswer}</p>
            <p><strong>Status:</strong> {q.wasCorrect ? "✅ Correct" : "❌ Incorrect"}</p>
            <p><strong>Explanation:</strong> {q.explanation}</p>
            <p><strong>Misconception:</strong> {q.misconception}</p>
            <p><strong>Remedy:</strong> {q.remedy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
