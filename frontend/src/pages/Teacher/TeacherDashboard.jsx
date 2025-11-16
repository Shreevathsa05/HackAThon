import React, { useState } from "react";
import { TeacherAnalyticsLeft, TeacherExamsRight, ExamWiseAnalytics } from "../../components/Teacher";

const TeacherDashboard = () => {
  const [selectedExam, setSelectedExam] = useState(null);

  const handleViewExam = (exam) => {
    setSelectedExam(exam);
  };

  return (
    <div className="w-full h-full flex gap-4 p-4 bg-gray-100">

      <div className="w-3/5 overflow-y-auto">
        {selectedExam ? (
          <ExamWiseAnalytics exam={selectedExam} />
        ) : (
          <TeacherAnalyticsLeft />
        )}
      </div>

      <div className="w-2/5 overflow-y-auto">
        <TeacherExamsRight onViewExam={handleViewExam} />
      </div>
    </div>
  );
};

export default TeacherDashboard