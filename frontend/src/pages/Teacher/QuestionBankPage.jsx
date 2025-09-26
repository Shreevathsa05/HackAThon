import React from "react";
import LeftContainer from "../../components/QuestionBank/LeftContainer";
import RightContainer from "../../components/QuestionBank/RightContainer";

function QuestionBankPage() {
  return (
    <div className="h-auto bg-gray-100 flex items-center justify-center gap-12 m-8 p-12">
      {/* Left Side */}
      <LeftContainer />

      {/* Divider */}
      <div className="w-px bg-gray-700 h-auto"></div>
      {/* Right Side */}
      <RightContainer />
    </div>
  );
}

export default QuestionBankPage;
