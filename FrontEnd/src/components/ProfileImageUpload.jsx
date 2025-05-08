import { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { motion } from "framer-motion";
import { FaUpload, FaSpinner, FaCamera } from "react-icons/fa";
import clsx from "clsx";

const ProfileImageUpload = ({ theme }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const { userData, setUserData } = useContext(UserContext);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsUploading(true);
      setError(null);
      const token = localStorage.getItem("userToken");

      if (!token) {
        setError("Please log in to upload images");
        return;
      }

      const response = await axios.put("/api/auth/profilePhoto", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
          token: token,
        },
      });

      if (response.data?.user) {
        setUserData(response.data.user);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to upload image. Please try again."
      );
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative group">
        <label htmlFor="profile-upload" className="cursor-pointer block">
          <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-offset-4 ring-offset-gray-50 dark:ring-offset-gray-900 ring-indigo-500 relative transform transition-transform duration-200 group-hover:scale-105">
            {userData?.image ? (
              <img
                src={userData.image}
                alt={userData?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <FaUpload className="text-white text-6xl" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <FaCamera className="text-white text-3xl" />
                <span className="text-white text-sm font-medium">
                  Change Photo
                </span>
              </div>
            </div>
          </div>
        </label>
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {file && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3"
        >
          <p
            className={clsx(
              "text-sm font-medium",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}
          >
            Selected: {file.name}
          </p>
          <motion.button
            onClick={handleUpload}
            disabled={isUploading}
            className={clsx(
              "px-4 py-2.5 rounded-xl transition-all duration-200 font-medium flex items-center gap-2",
              theme === "dark"
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUploading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              "Upload Photo"
            )}
          </motion.button>
        </motion.div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-red-500 text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default ProfileImageUpload;
