import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { motion } from "framer-motion";
import {
  Calendar,
  User,
  Flag,
  MessageSquare,
  ArrowLeft,
  Edit,
  Trash2,
  LayoutGrid,
  Clock,
} from "lucide-react";

function TaskDetails({ theme }) {
  const isDarkMode = theme === "dark";
  const { userData, userToken } = useContext(UserContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/task/${id}`,
          {
            headers: {
              token: userToken,
            },
          }
        );

        if (response.data.message === "success") {
          setTask(response.data.task);
        } else {
          setError("Failed to fetch task details");
        }
      } catch (error) {
        setError(
          error.response?.data?.message || "Error fetching task details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (userToken) {
      fetchTaskDetails();
    }
  }, [id, userToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate("/tasks")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Task not found</p>
        <button
          onClick={() => navigate("/tasks")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return isDarkMode
          ? "text-red-400 bg-red-400/10"
          : "text-red-600 bg-red-50";
      case "medium":
        return isDarkMode
          ? "text-yellow-400 bg-yellow-400/10"
          : "text-yellow-600 bg-yellow-50";
      case "low":
        return isDarkMode
          ? "text-green-400 bg-green-400/10"
          : "text-green-600 bg-green-50";
      default:
        return isDarkMode
          ? "text-gray-400 bg-gray-400/10"
          : "text-gray-600 bg-gray-50";
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
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
              <button
                onClick={() => navigate("/tasks")}
                className={`flex items-center gap-2 ${
                  isDarkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Tasks
              </button>
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDarkMode ? "bg-blue-600/10" : "bg-blue-100"
                  }`}
                >
                  <LayoutGrid
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <h1 className="text-2xl font-bold">Task Details</h1>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Task Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-7xl mx-auto px-6 py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Task Content */}
          <div className="lg:col-span-2">
            <div
              className={`rounded-xl p-8 ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } shadow-lg`}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-2xl font-bold mb-4">{task.title}</h1>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        task.status === "to do"
                          ? isDarkMode
                            ? "text-blue-400 bg-blue-400/10"
                            : "text-blue-600 bg-blue-50"
                          : task.status === "in progress"
                          ? isDarkMode
                            ? "text-yellow-400 bg-yellow-400/10"
                            : "text-yellow-600 bg-yellow-50"
                          : isDarkMode
                          ? "text-green-400 bg-green-400/10"
                          : "text-green-600 bg-green-50"
                      }`}
                    >
                      {task.status === "to do"
                        ? "To Do"
                        : task.status === "in progress"
                        ? "In Progress"
                        : "Completed"}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      <Flag className="w-3 h-3 mr-1" />
                      {task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {task.description && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare
                        className={`w-5 h-5 ${
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      <h2 className="text-lg font-semibold">Description</h2>
                    </div>
                    <p
                      className={`${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      } whitespace-pre-wrap leading-relaxed`}
                    >
                      {task.description}
                    </p>
                  </div>
                )}

                {task.dueDate && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar
                        className={`w-5 h-5 ${
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      <h2 className="text-lg font-semibold">Due Date</h2>
                    </div>
                    <p
                      className={`${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock
                      className={`w-5 h-5 ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                    <h2 className="text-lg font-semibold">Created At</h2>
                  </div>
                  <p
                    className={`${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {new Date(task.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned To Section */}
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="lg:col-span-1">
              <div
                className={`rounded-xl p-8 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg h-full`}
              >
                <div className="flex items-center gap-2 mb-6">
                  <User
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                  <h2 className="text-lg font-semibold">Assigned To</h2>
                </div>
                <div className="space-y-4">
                  {task.assignedTo.map((user) => (
                    <div
                      key={user._id}
                      className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
                        isDarkMode
                          ? "bg-gray-700/50 hover:bg-gray-700"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      {user.image ? (
                        <img
                          src={`/uploads/${user.image}`}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-offset-2 ring-offset-gray-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium ring-2 ring-offset-2 ring-offset-gray-800">
                          {getInitials(user.name)}
                        </div>
                      )}
                      <div>
                        <span
                          className={`block font-medium ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {user.name}
                        </span>
                        <span
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {user.role || "Team Member"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default TaskDetails;
