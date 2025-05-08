import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaBriefcase,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import { User } from "lucide-react";
import clsx from "clsx";
import ProfileImageUpload from "../components/ProfileImageUpload";
import axios from "axios";

const Profile = ({ theme }) => {
  const { userData, setUserData, userToken } = useContext(UserContext);
  const isDarkMode = theme === "dark";
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: userData?.name || "",
    jobTitle: userData?.jobTitle || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({
      name: userData?.name || "",
      jobTitle: userData?.jobTitle || "",
    });
    setSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.patch(
        `http://localhost:3000/api/user/${userData._id}`,
        editedData,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            token: userToken,
          },
        }
      );

      if (response.data.message === "User updated successfully") {
        setUserData(response.data.user);
        setIsEditing(false);
        setSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`sticky top-0 z-10 backdrop-blur-sm bg-opacity-80 ${
          isDarkMode ? "bg-gray-900/80" : "bg-white/80"
        } border-b ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDarkMode ? "bg-indigo-600/10" : "bg-[#ece8ff]"
                  }`}
                >
                  <User
                    className="w-5 h-5"
                    color={isDarkMode ? "#7b7dfa" : "#7b7dfa"}
                  />
                </div>
                <h1 className="text-xl font-bold">Profile</h1>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-7xl mx-auto px-6 py-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Image Upload */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`rounded-2xl transition-all duration-200 ${
              isDarkMode ? "bg-gray-800/50" : "bg-white"
            } shadow-lg hover:shadow-xl border ${
              isDarkMode ? "border-gray-700/50" : "border-gray-100"
            } p-6 flex flex-col items-center`}
          >
            <div className="w-full flex flex-col items-center gap-4">
              <h3
                className={`text-base font-semibold ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Profile Photo
              </h3>
              <ProfileImageUpload theme={theme} />
            </div>
          </motion.div>

          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`md:col-span-2 rounded-2xl transition-all duration-200 ${
              isDarkMode ? "bg-gray-800/50" : "bg-white"
            } shadow-lg hover:shadow-xl border ${
              isDarkMode ? "border-gray-700/50" : "border-gray-100"
            } p-6`}
          >
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editedData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDarkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-gray-100 text-gray-900 border-gray-300"
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                  ) : (
                    <h2 className="text-lg font-bold mb-2">
                      {userData?.name || "Loading..."}
                    </h2>
                  )}
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className={`p-2 rounded-lg hover:bg-opacity-20 ${
                        isDarkMode
                          ? "hover:bg-indigo-600/20 text-indigo-400"
                          : "hover:bg-indigo-600/10 text-[#7b7dfa]"
                      }`}
                    >
                      <FaEdit />
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className={`p-2 rounded-lg hover:bg-opacity-20 ${
                          isDarkMode
                            ? "hover:bg-green-600/20 text-green-400"
                            : "hover:bg-green-600/10 text-green-500"
                        }`}
                      >
                        <FaSave />
                      </button>
                      <button
                        onClick={handleCancel}
                        className={`p-2 rounded-lg hover:bg-opacity-20 ${
                          isDarkMode
                            ? "hover:bg-red-600/20 text-red-400"
                            : "hover:bg-red-600/10 text-red-500"
                        }`}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-green-500 text-sm mt-1"
                  >
                    <FaCheck className="text-green-500" />
                    <span>Profile updated successfully!</span>
                  </motion.div>
                )}
                <p
                  className={`text-base ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {userData?.role || "User"}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      isDarkMode ? "bg-indigo-600/10" : "bg-[#ece8ff]"
                    }`}
                  >
                    <FaEnvelope
                      className={`text-xl ${
                        isDarkMode ? "text-indigo-400" : "text-[#7b7dfa]"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-base font-medium">
                      {userData?.email || "No email provided"}
                    </p>
                  </div>
                </div>

                {userData?.jobTitle && (
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        isDarkMode ? "bg-indigo-600/10" : "bg-[#ece8ff]"
                      }`}
                    >
                      <FaBriefcase
                        className={`text-xl ${
                          isDarkMode ? "text-indigo-400" : "text-[#7b7dfa]"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Job Title</p>
                      {isEditing ? (
                        <input
                          type="text"
                          name="jobTitle"
                          value={editedData.jobTitle}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-lg ${
                            isDarkMode
                              ? "bg-gray-700 text-white border-gray-600"
                              : "bg-gray-100 text-gray-900 border-gray-300"
                          } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                      ) : (
                        <p className="text-base font-medium">
                          {userData.jobTitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {userData?.phone && (
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        isDarkMode ? "bg-indigo-600/10" : "bg-[#ece8ff]"
                      }`}
                    >
                      <FaPhone
                        className={`text-xl ${
                          isDarkMode ? "text-indigo-400" : "text-[#7b7dfa]"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-base font-medium">{userData.phone}</p>
                    </div>
                  </div>
                )}

                {userData?.address && (
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        isDarkMode ? "bg-indigo-600/10" : "bg-[#ece8ff]"
                      }`}
                    >
                      <FaMapMarkerAlt
                        className={`text-xl ${
                          isDarkMode ? "text-indigo-400" : "text-[#7b7dfa]"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-base font-medium">
                        {userData.address}
                      </p>
                    </div>
                  </div>
                )}

                {userData?.department && (
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        isDarkMode ? "bg-indigo-600/10" : "bg-[#ece8ff]"
                      }`}
                    >
                      <FaBuilding
                        className={`text-xl ${
                          isDarkMode ? "text-indigo-400" : "text-[#7b7dfa]"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="text-base font-medium">
                        {userData.department}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Profile;
