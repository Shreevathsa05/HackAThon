import React, { useState, useRef, useEffect } from "react";
import { User, Mail, LogOut, Settings } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../api/api";
import { logout } from "../../store/authSlice";
import extractErrorMsg from "../../utils/extractErrorMsg";
import { useNavigate } from "react-router-dom";

function DropdownDialog({ trigger }) {
    const { userData } = useSelector((state) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setLoading(true);
        setErrMsg("");
        try {
            const res = await api.post("/users/logout", {});
            dispatch(logout());
        } catch (error) {
            setErrMsg(extractErrorMsg(error));
            console.error("Signout :: error :: ", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative" ref={ref}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>

            {isOpen && (
                <div className="absolute right-0 mt-2 bg-white text-gray-800 rounded-md shadow-lg z-50 w-64">
                    <div className="px-4 py-2 text-left border-b">
                        <div className="text-sm text-gray-500">{userData?.email}</div>
                    </div>

                    <button
                        onClick={() => navigate(`/${userData.role}/profile`)}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                        <User size={16} />
                        <span>Profile</span>
                    </button>

                    <button
                        onClick={() => navigate(`/${userData.role}/settings`)}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                        <Settings size={16} />
                        <span>Settings</span>
                    </button>

                    <hr className="my-1" />

                    <button
                        disabled={loading}
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-red-600 border-solid"></span>
                        ) : (
                            <LogOut size={16} />
                        )}
                        <span>{loading ? "Signing Out..." : "Sign Out"}</span>
                    </button>

                    {/* Error Message */}
                    {errMsg && (
                        <p className="text-red-500 text-xs px-4 py-1 border-t bg-red-50">
                            {errMsg}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default DropdownDialog;
