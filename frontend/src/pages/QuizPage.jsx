import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { GENAI_BASE_URL } from "../constants";
const backendUrl = GENAI_BASE_URL || `https://hack-a-thon-genai.onrender.com`;

export default function QuizPage() {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const examDuration = 30;
  let TOTAL_QUESTIONS = 8;

  const [timeLeft, setTimeLeft] = useState(examDuration * 60);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const fetchNextQuestion = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/quiz/${examId}?totalQuestions=${TOTAL_QUESTIONS}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previousQnA: answers }),
      });
      const data = await res.json();
      setCurrentQuestion(data.nextQuestion);
    } catch (err) {
      console.error("Error fetching question:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitExam = () => {
    const formatted = answers.map((a) => ({
      question: a.question,
      originalanswer: a.answer,
      useranswer: a.useranswer,
    }));

    navigate(`/student/analysis/${examId}`, { state: { sessionAnswers: formatted } });
  };

  useEffect(() => {
    if (loading) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          alert("⏰ Time is up! Submitting your exam...");
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading]);

  useEffect(() => {
    if (answers.length >= TOTAL_QUESTIONS) {
      submitExam();
    } else if (answers.length === 0 || currentQuestion === null) {
      fetchNextQuestion();
    }
  }, [answers]);

  const handleAnswer = (choice) => {
    if (!currentQuestion) return;
    const newEntry = {
      difficulty: currentQuestion.difficulty,
      question: currentQuestion.question,
      answer: currentQuestion.answer,
      useranswer: choice,
    };
    setAnswers((prev) => [...prev, newEntry]);
    setCurrentQuestion(null);
  };
  console.log(currentQuestion)

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center gap-4 mt-32">
        <div className="w-14 h-14 border-4 border-transparent border-t-indigo-500 border-l-indigo-400 rounded-full animate-spin" />

        <div className="text-indigo-600 font-medium text-lg animate-pulse tracking-wide">
          Generating question...
        </div>
      </div>
    );

  if (!currentQuestion)
    return (
      <p className="text-center mt-20 text-lg font-medium text-gray-500">
        Preparing question...
      </p>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 mt-12 bg-white/30 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 rounded-2xl">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-wide">
          Question {answers.length + 1}
          <span className="text-gray-500 font-medium"> / {TOTAL_QUESTIONS}</span>
        </h2>

        <div className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg animate-pulse">
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-700 ease-out"
          style={{ width: `${((answers.length + 1) / TOTAL_QUESTIONS) * 100}%` }}
        ></div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <p className="text-xl font-medium text-gray-900 leading-relaxed">
          {currentQuestion.question}
        </p>
      </div>

      {/* Badges */}
      <div className="flex gap-3 mb-6">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${currentQuestion.difficulty === "easy"
            ? "bg-green-100 text-green-700 border-green-300"
            : currentQuestion.difficulty === "medium"
              ? "bg-yellow-100 text-yellow-700 border-yellow-300"
              : "bg-red-100 text-red-700 border-red-300"
            }`}
        >
          {currentQuestion.difficulty}
        </span>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${currentQuestion.question_type === "application"
            ? "bg-blue-100 text-blue-700 border-blue-300"
            : "bg-purple-100 text-purple-700 border-purple-300"
            }`}
        >
          {currentQuestion.question_type}
        </span>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(opt)}
            className="p-4 rounded-xl border bg-white hover:bg-indigo-50 border-gray-300 text-gray-800 font-medium shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
