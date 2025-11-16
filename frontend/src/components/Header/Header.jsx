import React from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import DropdownDialog from "./DropdownDialog";
import { useSelector } from "react-redux";

function Header() {
  const navItemsByRole = {
    teacher: [
      { path: "/teacher/question-bank", name: "Question Bank" },
      { path: "/teacher/dashboard", name: "Dashboard" },
      { path: "/teacher/exams", name: "Exams" },
      { path: "/teacher/tools", name: "Tools" },
    ],
    student: [
      { path: "/student/dashboard", name: "Dashboard" },
      { path: "/student/exams", name: "Exams" },
      { path: "/student/tools", name: "Tools" },
    ],
    parent: [{ path: "/parent/dashboard", name: "Dashboard" }],
  };

  const { userData } = useSelector((state) => state.auth);
  const location = useLocation();
  const navItems = [...(navItemsByRole[userData?.role] || [])];

  if (userData?.role === "student" && location.pathname.includes("/student/exam/")) {
    const examId = location.pathname.split("/student/exam/")[1]?.split("/")[0];
    navItems.push(
      { path: `/student/exam/${examId}`, name: "Quiz" },
      { path: `/student/exam/${examId}/analysis`, name: "Analysis" }
    );
  }

  return (
    <header
      className="
        w-full fixed top-0
        bg-white/80 backdrop-blur-lg
        border-b border-blue-200/60
        shadow-[0_4px_18px_rgba(30,64,175,0.15)]
        px-6 py-3 flex items-center justify-between
      "
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div
          className="
            w-11 h-11 rounded-xl
            bg-gradient-to-br from-blue-500 to-indigo-600
            flex items-center justify-center text-white text-xl font-extrabold
            shadow-[0_0_12px_rgba(59,130,246,0.45)]
          "
        >
          E
        </div>

        <Link
          to="/"
          className="
            text-2xl font-extrabold tracking-wide
            bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text
          "
        >
          E-Vidya
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `
                px-4 py-2 rounded-lg font-medium text-sm md:text-base relative group
                transition-all backdrop-blur-md
                ${isActive
                  ? "text-blue-600 bg-blue-50 border border-blue-400/50 shadow-sm"
                  : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                }
              `
            }
          >
            {item.name}

            {/* Underline Animation */}
            <span
              className="
                absolute left-1/2 -bottom-1 w-0 h-[2px]
                bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full
                transition-all duration-300 group-hover:w-6 group-hover:-translate-x-1/2
              "
            ></span>
          </NavLink>
        ))}

        {/* Avatar */}
        {userData && (
          <DropdownDialog
            trigger={
              <div
                className="
                  w-11 h-11 rounded-full cursor-pointer
                  bg-gradient-to-br from-blue-500 to-indigo-600
                  flex items-center justify-center text-white font-bold select-none
                  shadow-[0_0_10px_rgba(59,130,246,0.5)]
                  hover:scale-105 transition-all
                "
              >
                {userData?.email[0].toUpperCase()}
              </div>
            }
          />
        )}
      </div>
    </header>
  );
}

export default Header;
