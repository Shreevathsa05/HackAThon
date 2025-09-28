import React from "react";

export default function RightContainer({ questions }) {
  return (
    <div className="w-96 bg-white text-gray-900 p-8 rounded-2xl shadow-lg flex flex-col gap-6">
      {/* Header */}
      <h2 className="text-xl font-bold mb-4 text-center">Generated Questions</h2>

      {/* Questions Preview */}
      {questions && questions.length > 0 ? (
        <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
          {questions.map((q, idx) => (
            <div
              key={q._id || idx}
              className="border border-gray-200 bg-gray-50 rounded-lg p-4 shadow-sm"
            >
              <p className="font-semibold">
                Q{idx + 1}: {q.question_text}
              </p>
              <div className="mt-2 flex flex-col gap-1 text-gray-700 text-sm">
                {q.options && (
                  <>
                    <p>A: {q.options.a}</p>
                    <p>B: {q.options.b}</p>
                    <p>C: {q.options.c}</p>
                    <p>D: {q.options.d}</p>
                  </>
                )}
                <p className="mt-1 text-gray-500">
                  Difficulty: {q.difficulty}, Type: {q.question_type}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-8">
          No questions generated yet.
        </p>
      )}
    </div>
  );
}
