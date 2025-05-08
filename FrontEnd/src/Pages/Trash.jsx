import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Trash2, RotateCcw, MoreVertical, Search, X } from "lucide-react";
import { clsx } from "clsx";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`rounded-xl p-6 w-full max-w-md shadow-2xl ${
          isDarkMode
            ? "bg-gray-900/95 border border-gray-800"
            : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-gray-800"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

const Trash = ({ theme }) => {
  const isDarkMode = theme === "dark";
  const { userToken, userData } = useContext(UserContext);
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Redirect if not admin
  if (userData?.role === "user") {
    return <Navigate to="/tasks" replace />;
  }

  // Load deleted tasks
  useEffect(() => {
    const fetchTrashTasks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:3000/api/task/trash",
          {
            headers: {
              token: userToken,
            },
          }
        );
        if (response.data.message === "success") {
          setDeletedTasks(response.data.tasks);
        }
      } catch (error) {
        console.error("Error fetching trash tasks:", error);
        toast.error("Failed to load trash tasks");
      } finally {
        setLoading(false);
      }
    };

    if (userToken) {
      fetchTrashTasks();
    }
  }, [userToken]);

  const handleRestoreTask = async (taskId) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/api/task/${taskId}/restore`,
        {},
        {
          headers: {
            token: userToken,
          },
        }
      );
      if (response.data.message === "Task restored successfully") {
        toast.success("Task restored successfully");
        setDeletedTasks(deletedTasks.filter((task) => task._id !== taskId));
      }
    } catch (error) {
      console.error("Error restoring task:", error);
      toast.error("Failed to restore task");
    }
  };

  const handlePermanentDelete = async (taskId) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/task/${taskId}/trash`,
        {
          headers: {
            token: userToken,
          },
        }
      );
      if (response.data.message === "Task permanently deleted successfully") {
        toast.success("Task permanently deleted");
        setDeletedTasks(deletedTasks.filter((task) => task._id !== taskId));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleEmptyTrash = async () => {
    try {
      const response = await axios.delete(
        "http://localhost:3000/api/task/trash/empty",
        {
          headers: {
            token: userToken,
          },
        }
      );
      if (response.data.message === "Trash emptied successfully") {
        toast.success("Trash cleared successfully");
        setDeletedTasks([]);
        setIsClearModalOpen(false);
      }
    } catch (error) {
      console.error("Error clearing trash:", error);
      toast.error("Failed to clear trash");
    }
  };

  const toggleDropdown = (taskId) => {
    setSelectedTask(selectedTask === taskId ? null : taskId);
    setDropdownOpen(!dropdownOpen);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return isDarkMode
          ? "text-red-300 bg-red-900 bg-opacity-30"
          : "text-red-700 bg-red-50";
      case "medium":
        return isDarkMode
          ? "text-yellow-300 bg-yellow-900 bg-opacity-30"
          : "text-yellow-700 bg-yellow-50";
      case "low":
        return isDarkMode
          ? "text-green-300 bg-green-900 bg-opacity-30"
          : "text-green-700 bg-green-50";
      default:
        return isDarkMode
          ? "text-gray-300 bg-gray-700"
          : "text-gray-700 bg-gray-100";
    }
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = deletedTasks
    .filter((task) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        (task.description &&
          task.description.toLowerCase().includes(searchLower)) ||
        task.priority.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.deletedAt) - new Date(a.deletedAt);
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Clear Trash Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Clear Trash"
        isDarkMode={isDarkMode}
      >
        <div className="text-center">
          <Trash2 className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p
            className={`text-lg mb-6 ${
              isDarkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Are you sure you want to clear the trash?
          </p>
          <p
            className={`text-sm mb-6 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsClearModalOpen(false)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleEmptyTrash}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              Clear
            </button>
          </div>
        </div>
      </Modal>

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
                    isDarkMode ? "bg-[#181943]" : "bg-[#edeaff]"
                  }`}
                >
                  <Trash2
                    className="w-5 h-5"
                    color={isDarkMode ? "#7b7dfa" : "#554ef5"}
                  />
                </div>
                <h1 className="text-2xl font-bold">Trash</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {deletedTasks.length > 0 && (
                <button
                  onClick={() => setIsClearModalOpen(true)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    isDarkMode
                      ? "bg-red-900/50 hover:bg-red-900 text-red-300"
                      : "bg-red-100 hover:bg-red-200 text-red-700"
                  }`}
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Clear Trash</span>
                </button>
              )}
              <div
                className={`text-sm font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {deletedTasks.length}{" "}
                {deletedTasks.length === 1 ? "item" : "items"} total
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Sort Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-7xl mx-auto px-6 py-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div
              className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <Search className="w-5 h-5" color="#7b7dfa" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title, description, priority..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full sm:w-48 pl-4 pr-10 py-2.5 rounded-lg appearance-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-200 text-gray-900"
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
            >
              <option value="date">Sort by Deletion Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
            </select>
            <div
              className={`absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-7xl mx-auto px-6 py-6"
      >
        {filteredAndSortedTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center py-12 rounded-xl ${
              isDarkMode ? "bg-gray-800/50" : "bg-white"
            } shadow-sm`}
          >
            <Trash2
              className={`w-12 h-12 mx-auto mb-4 ${
                isDarkMode ? "text-gray-600" : "text-gray-400"
              }`}
            />
            <p
              className={`text-lg ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No deleted tasks found
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedTasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`rounded-lg p-4 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } shadow-sm`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className={`px-2 py-1 text-xs rounded ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority.toUpperCase()} PRIORITY
                      </span>
                      <span
                        className={`text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Deleted on{" "}
                        {new Date(task.deletedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3
                      className={`font-medium mb-2 ${
                        isDarkMode ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p
                        className={`text-sm mb-3 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(task._id)}
                      className={`p-2 rounded-full ${
                        isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}
                    >
                      <MoreVertical
                        className={`w-4 h-4 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      />
                    </button>
                    {selectedTask === task._id && dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 ${
                          isDarkMode ? "bg-gray-700" : "bg-white"
                        } ring-1 ring-black ring-opacity-5`}
                      >
                        <div className="py-1">
                          <button
                            onClick={() => handleRestoreTask(task._id)}
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              isDarkMode
                                ? "text-gray-200 hover:bg-gray-600"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restore
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(task._id)}
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              isDarkMode
                                ? "text-red-400 hover:bg-gray-600"
                                : "text-red-600 hover:bg-gray-100"
                            }`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Permanently
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Trash;
