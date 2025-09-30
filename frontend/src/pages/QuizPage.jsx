import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const backendUrl = `https://hack-a-thon-genai.onrender.com`
export default function QuizPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch next question
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

  useEffect(() => {
    if (answers.length < 20) {
      fetchNextQuestion();
    } else {
      // After 20 questions, send to Analysis page
      const formatted = answers.map((a) => ({
        question: a.question,
        originalanswer: a.answer, // correct answer from quiz
        useranswer: a.useranswer,
      }));
      navigate(`/analysis/${examId}`, { state: { sessionAnswers: formatted } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  const handleAnswer = (choice) => {
    if (!currentQuestion) return;
    const newEntry = {
      question: currentQuestion.question,
      answer: currentQuestion.answer, // correct answer
      useranswer: choice,
    };
    setAnswers((prev) => [...prev, newEntry]);
  };

  if (loading) return <p className="text-center">Loading question...</p>;
  if (!currentQuestion) return <p className="text-center">No question yet</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Question {answers.length + 1}/20</h2>
      <p className="mb-4">{currentQuestion.question}</p>
      <div className="grid gap-2">
        {currentQuestion.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(opt)}
            className="p-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
