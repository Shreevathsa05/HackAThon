import React from "react";

function Loading({ size = "md", text = "Loading...", fullscreen = false }) {
  // size styles
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-4",
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin`}
    ></div>
  );

  // fullscreen mode
  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/70 z-50">
        {spinner}
        {text && <p className="mt-2 text-gray-600">{text}</p>}
      </div>
    );
  }

  // inline mode
  return (
    <div className="flex flex-col items-center justify-center">
      {spinner}
      {text && <p className="mt-2 text-gray-600 text-sm">{text}</p>}
    </div>
  );
}

export default Loading;
