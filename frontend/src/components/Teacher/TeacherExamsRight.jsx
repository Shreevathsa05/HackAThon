import React, { useEffect, useState } from "react";
import { api } from "../../api/api";

const TeacherExamsRight = ({ onViewExam }) => {
  const [exams, setExams] = useState([]);

  const fetchExams = async () => {
    try {
      const res = await api.get("/teacher/exams");
      setExams(res.data.data);
    } catch (error) {
      console.error("Error loading exams", error);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  if (!exams.length)
    return (
      <div className="bg-white shadow-md rounded-xl p-6 text-center text-gray-600">
        No exams created yet.
      </div>
    );

  return (
    <div className="bg-white shadow-md rounded-xl p-5 h-full">
      <h2 className="text-2xl font-extrabold text-blue-700 mb-4">Exams</h2>

      <div className="flex flex-col gap-4">
        {exams.map((exam) => (
          <div
            key={exam._id}
            className="p-4 rounded-xl border bg-white shadow-sm hover:shadow-lg hover:border-blue-400 transition-all duration-200"
          >
            {/* Title Row */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{exam.title}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                {exam.questions} Qs
              </span>
            </div>

            {/* Sub Info */}
            <p className="text-sm text-gray-600 mt-1">
              Subject: <span className="font-semibold">{exam.subject}</span>
            </p>

            {/* Tags Row */}
            <div className="flex gap-2 flex-wrap mt-2">
              <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-700 font-medium">
                Class: {exam.className}
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-700 font-medium">
                Board: {exam.board}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                Students: {exam.studentsAppeared}
              </span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherExamsRight;
