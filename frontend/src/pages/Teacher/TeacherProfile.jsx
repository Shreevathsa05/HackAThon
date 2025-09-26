import React, { useState } from "react";
import Input from "../../components/Input";
import { useSelector } from "react-redux";

function TeacherProfile() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const { userData } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-8 flex flex-col gap-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
            {userData.fullName[0]}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {userData.fullName}
            </h2>
            <p className="text-gray-600">{userData.email}</p>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Update Password Section */}
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="self-start bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-500 transition"
          >
            Update Password
          </button>
        ) : (
          <form className="flex flex-col gap-4">
            <Input type="password" label="Current Password" />
            <Input type="password" label="New Password" />
            <Input type="password" label="Confirm New Password" />

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-500 transition"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default TeacherProfile;
