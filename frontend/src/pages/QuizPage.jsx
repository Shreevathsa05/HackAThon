import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const backendUrl = `https://hack-a-thon-genai.onrender.com`;

export default function QuizPage() {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // duration and no. of questions come from ExamCard
  const examDuration = location.state?.duration || 30; // minutes
  const TOTAL_QUESTIONS = 10;

  const [timeLeft, setTimeLeft] = useState(() => {
    const stored = localStorage.getItem(`exam_${examId}_time`);
    if (stored) return parseInt(stored, 10);
    localStorage.setItem(`exam_${examId}_time`, examDuration * 60);
    return examDuration * 60;
  });

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
      const res = await fetch(`${backendUrl}/quiz/${examId}`, {
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

    // cleanup localStorage
    localStorage.removeItem(`exam_${examId}_time`);

    navigate(`/student/analysis/${examId}`, { state: { sessionAnswers: formatted } });
  };

  // Timer setup
 // Timer setup
useEffect(() => {
  if (loading) {
    clearInterval(timerRef.current); // stop timer while loading
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
      const updated = prev - 1;
      localStorage.setItem(`exam_${examId}_time`, updated);
      return updated;
    });
  }, 1000);

  return () => clearInterval(timerRef.current);
}, [loading]); // re-run whenever loading changes


  // Fetch first question or continue until all are answered
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
      question: currentQuestion.question,
      answer: currentQuestion.answer,
      useranswer: choice,
    };
    setAnswers((prev) => [...prev, newEntry]);
    setCurrentQuestion(null);
  };

  if (loading) return <p className="text-center mt-20 text-lg">Loading question...</p>;
  if (!currentQuestion) return <p className="text-center mt-20 text-lg">No question yet</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Question {answers.length + 1}/{TOTAL_QUESTIONS}
        </h2>
        <div className="text-lg font-semibold text-red-600">
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${((answers.length + 1) / TOTAL_QUESTIONS) * 100}%` }}
        />
      </div>

      <p className="text-lg mb-6">{currentQuestion.question}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(opt)}
            className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transform transition-all"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
