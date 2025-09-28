import React from "react";
import { NavLink, Link } from "react-router-dom";
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
            { path: "/student/tools", name: "Tools" },
        ],
        parent: [
            { path: "/parent/dashboard", name: "Dashboard" },
        ],
    };

    const { userData } = useSelector((state) => state.auth);
    const navItems = navItemsByRole[userData?.role] || [];


    return (
        <header className="w-full bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-md fixed">
            {/* Left: Logo + Website Name */}
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-700 rounded-md flex items-center justify-center">
                    <span className="font-bold text-lg">E</span>
                </div>
                <Link className="text-2xl font-bold text-white tracking-wide" to={'/'}>EduAi</Link>
            </div>

            {/* Right: Navigation + Avatar */}
            <div className="flex items-center space-x-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-md font-medium transition-colors ${isActive ? "bg-blue-700" : "hover:bg-blue-700"
                            }`
                        }
                    >
                        {item.name}
                    </NavLink>
                ))}

                {/* Profile dropdown */}
                {userData && (
                    <DropdownDialog
                        trigger={
                            <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold hover:bg-blue-600 transition-colors">
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
