import React from "react";
import { useParams } from "react-router-dom";
import { SkillProfile, Leaderboard } from "../../components/Teacher"
export default function ExamDashboard() {
  const { examId } = useParams();

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col gap-8 overflow-y-auto">
      <SkillProfile examId={examId} />
      <Leaderboard examId={examId} />
    </div>
  );
}
