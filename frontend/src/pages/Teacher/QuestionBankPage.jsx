import React from "react";
import LeftContainer from "../../components/QuestionBank/LeftContainer";
import RightContainer from "../../components/QuestionBank/RightContainer";
import { useState } from "react";

function QuestionBankPage() {
  const [questions, setQuestions] = useState([]);

  return (
    <div className="h-[700px] bg-gray-100 flex items-center justify-center gap-12 m-8 p-12">
      {/* Left Side */}
      <LeftContainer questions={questions} setQuestions={setQuestions} />

      {/* Divider */}
      <div className="w-px bg-gray-700 h-auto"></div>
      {/* Right Side */}
      <RightContainer questions={questions} />
    </div>
  );
}

export default QuestionBankPage;
