import React from "react";
import { Menu, MenuItem, MenuButton } from "@headlessui/react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ExamCard({ exam, onEdit, onDelete, deleteLoading, path = "teacher" }) {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.auth);

  const handleView = () => {
    navigate(`/${path}/exam/${exam._id}`, {
      state: {
        duration: exam.duration,
        totalQuestions: exam.questions.length   // 👈 added
      }
    });
  };

  return (
    <div
      className="relative bg-white p-6 rounded-2xl shadow-lg flex justify-between items-start hover:shadow-xl transition w-[90vw] sm:w-[70vw] md:w-[60vw] cursor-pointer"
      onClick={handleView}
    >
      {/* Exam info */}
      <div>
        <h3 className="text-lg font-semibold">
          {exam.subject} - {exam.className}
        </h3>
        <p className="text-gray-500 text-sm">Board: {exam.board}</p>
      </div>

      {userData.role === "teacher" && (
        <Menu
          as="div"
          className="inline-block text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <MenuButton className="p-2 rounded-full hover:bg-gray-100">
            <MoreVertical className="w-5 h-5" />
          </MenuButton>
          <Menu.Items className="absolute right-0 mt-2 w-32 bg-white border shadow-lg rounded-md z-50">
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => onEdit(exam)}
                  className={`w-full px-4 py-2 text-left ${active ? "bg-gray-100" : ""
                    }`}
                >
                  Edit
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => onDelete(exam)}
                  disabled={deleteLoading}
                  className={`w-full px-4 py-2 text-left text-red-500 ${active ? "bg-gray-100" : ""} ${deleteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Delete
                </button>
              )}
            </MenuItem>
          </Menu.Items>
        </Menu>
      )}
    </div>
  );
}

export default ExamCard;
