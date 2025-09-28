import React, { useState } from "react";

function RightContainer() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(URL.createObjectURL(uploadedFile));
    }
  };

  return (
    <div className="w-96 bg-white text-gray-900 p-8 rounded-2xl shadow-lg flex flex-col gap-10 items-center">
      {/* Upload + Preview */}
      <div className="w-full h-48 border border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden bg-gray-50">
        {!file ? (
          <label
            htmlFor="fileInput"
            className="cursor-pointer px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-lg shadow-md"
          >
            Upload
          </label>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {file.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
              <img
                src={file}
                alt="preview"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <p className="text-lg truncate px-2">{file}</p>
            )}
          </div>
        )}
        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Empty box 1 */}
      <div className="w-full h-32 border border-gray-300 bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 text-lg">Empty Box</p>
      </div>

      {/* Empty box 2 */}
      <div className="w-full h-40 border border-gray-300 bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 text-lg">Another Box</p>
      </div>
    </div>
  );
}

export default RightContainer;
