import React, { useState, useRef, useEffect, useContext } from "react";
import {
  LayoutGrid,
  List,
  Plus,
  MoreVertical,
  Flag,
  Calendar,
  MessageSquare,
  CheckCircle2,
  X,
  Edit,
  Trash2,
  User,
  Check,
  Search,
} from "lucide-react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

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

// Reusable Form Input Component
const FormInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  rows,
  isDarkMode,
}) => {
  const inputClasses = `w-full p-3 rounded-lg transition-colors ${
    isDarkMode
      ? "bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
      : "bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500"
  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${className}`;

  return (
    <div className="mb-4">
      <label
        className={`block text-sm font-medium mb-2 ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows || 3}
          className={inputClasses}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}
    </div>
  );
};

// Reusable Form Select Component
const FormSelect = ({ label, value, onChange, options, isDarkMode }) => {
  return (
    <div className="mb-4">
      <label
        className={`block text-sm font-medium mb-2 ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`w-full p-3 rounded-lg appearance-none transition-colors ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700 text-white"
              : "bg-white border border-gray-200 text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className={`w-4 h-4 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
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
  );
};

// Updated UserSelect component for better user selection
const UserSelect = ({
  label,
  value = [],
  onChange,
  options = [],
  isDarkMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleUser = (userId) => {
    const newValue = value.includes(userId)
      ? value.filter((id) => id !== userId)
      : [...value, userId];
    onChange(newValue);
  };

  const getSelectedUsers = () => {
    return options
      .filter((user) => value.includes(user.value))
      .map((user) => `${user.label} (${user.jobTitle || "No Title"})`)
      .join(", ");
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
    <div className="mb-4" ref={dropdownRef}>
      <label
        className={`block text-sm font-medium mb-2 ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full p-3 rounded-lg transition-all duration-200 ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700 text-white hover:border-gray-600 hover:bg-gray-700/50"
              : "bg-white border border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50"
          } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-left flex items-center justify-between shadow-sm`}
        >
          {value.length > 0 ? (
            <span className="truncate">{getSelectedUsers()}</span>
          ) : (
            <span
              className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Select users to assign
            </span>
          )}
          <span
            className={`transform transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute z-50 w-full mt-2 rounded-lg shadow-lg max-h-60 overflow-y-auto ${
              isDarkMode
                ? "bg-gray-800/95 border border-gray-700"
                : "bg-white border border-gray-200"
            } backdrop-blur-sm`}
          >
            {options.length > 0 ? (
              options.map((user) => (
                <button
                  key={user.value}
                  type="button"
                  onClick={() => toggleUser(user.value)}
                  className={`w-full px-4 py-3 flex items-center justify-between transition-all duration-200 ${
                    isDarkMode
                      ? "hover:bg-gray-700/50 text-white"
                      : "hover:bg-gray-100 text-gray-900"
                  } border-b last:border-b-0 ${
                    isDarkMode ? "border-gray-700" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium shadow-md">
                      {user.image ? (
                        <img
                          src={`/uploads/${user.image}`}
                          alt={user.label}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        getInitials(user.label)
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{user.label}</span>
                      <span
                        className={`text-xs mt-0.5 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {user.jobTitle || "No Title"}
                      </span>
                    </div>
                  </div>
                  {value.includes(user.value) && (
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div
                className={`px-4 py-3 text-center ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No users available
              </div>
            )}
          </motion.div>
        )}
      </div>
      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {options
            .filter((user) => value.includes(user.value))
            .map((user) => (
              <span
                key={user.value}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  isDarkMode
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-blue-100 text-blue-700"
                } shadow-sm hover:shadow-md transition-all duration-200`}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium shadow-sm">
                  {user.image ? (
                    <img
                      src={`/uploads/${user.image}`}
                      alt={user.label}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user.label)
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{user.label}</span>
                  <span
                    className={`text-xs mt-0.5 ${
                      isDarkMode ? "text-blue-300" : "text-blue-500"
                    }`}
                  >
                    {user.jobTitle || "No Title"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleUser(user.value)}
                  className={`ml-2 p-1 rounded-full transition-colors ${
                    isDarkMode
                      ? "hover:bg-blue-500/20 hover:text-blue-300"
                      : "hover:bg-blue-200 hover:text-blue-600"
                  }`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onEdit, onDelete, isDarkMode, index, setTasks }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { userData, userToken } = useContext(UserContext);
  const navigate = useNavigate();
  const isAdmin = userData?.role === "admin";

  // Add function to check if task is overdue
  const isTaskOverdue = () => {
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return (
      dueDate < today &&
      (task.status === "to do" || task.status === "in progress")
    );
  };

  // Add function to handle task status update
  const handleStatusUpdate = async (e) => {
    e.stopPropagation();
    try {
      if (!userToken) {
        toast.error("Please login to update task status");
        return;
      }

      const response = await axios.patch(
        `http://localhost:3000/api/task/${task._id}/status`,
        {
          status: "in progress",
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message === "status updated") {
        // Refresh the tasks list
        const tasksResponse = await axios.get(
          `http://localhost:3000/api/task/userTasks/${userData._id}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (tasksResponse.data.message === "success") {
          setTasks(tasksResponse.data.tasks);
          toast.success("Task moved to In Progress");
        }
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if (error.response?.status === 403) {
        toast.error("You are not assigned to this task");
      } else {
        toast.error("Failed to update task status");
      }
    }
  };

  // Add function to handle finishing task
  const handleFinishTask = async (e) => {
    e.stopPropagation();
    try {
      if (!userToken) {
        toast.error("Please login to update task status");
        return;
      }

      const response = await axios.patch(
        `http://localhost:3000/api/task/${task._id}/status`,
        {
          status: "completed",
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message === "status updated") {
        // Refresh the tasks list
        const tasksResponse = await axios.get(
          `http://localhost:3000/api/task/userTasks/${userData._id}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (tasksResponse.data.message === "success") {
          setTasks(tasksResponse.data.tasks);
          toast.success("Task marked as completed");
        }
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if (error.response?.status === 403) {
        toast.error("You are not assigned to this task");
      } else {
        toast.error("Failed to update task status");
      }
    }
  };

  function handleClickOutside(event) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handleCardClick = () => {
    // Only allow clicking if user is admin or task is not overdue
    if (isAdmin || !isTaskOverdue()) {
      navigate(`/tasks/${task._id}`);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(task);
    setDropdownOpen(false);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(task._id);
    setDropdownOpen(false);
  };

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onClick={handleCardClick}
      className={`p-4 rounded-lg transition-all duration-200 ${
        isAdmin || !isTaskOverdue() ? "cursor-pointer" : "cursor-not-allowed"
      } ${
        task.status === "completed"
          ? isDarkMode
            ? "bg-green-900/80 hover:bg-green-900/90 border-green-700"
            : "bg-emerald-100 hover:bg-emerald-200 border-emerald-200"
          : isDarkMode
          ? isTaskOverdue()
            ? "bg-red-900/20 hover:bg-red-900/30 border-red-500/50"
            : "bg-gray-800/50 hover:bg-gray-800/80 border-gray-700/50"
          : isTaskOverdue()
          ? "bg-red-200 hover:bg-red-300 border-red-500"
          : "bg-white hover:bg-gray-50 border-gray-200"
      } shadow-md hover:shadow-lg border transition-shadow duration-300`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3
              className={`text-base font-medium truncate ${
                isDarkMode
                  ? isTaskOverdue()
                    ? "text-red-800"
                    : "text-white"
                  : isTaskOverdue()
                  ? "text-red-800"
                  : "text-gray-800"
              }`}
            >
              {task.title}
            </h3>
            {isAdmin ? (
              <div className="relative ml-2" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className={`p-1.5 rounded-lg hover:bg-opacity-20 transition-colors ${
                    isDarkMode
                      ? "text-gray-400 hover:text-white hover:bg-white/10"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${
                      isDarkMode ? "bg-gray-800/95" : "bg-white"
                    } ring-1 ring-black ring-opacity-5 border ${
                      isDarkMode ? "border-gray-700" : "border-gray-200"
                    } backdrop-blur-sm`}
                  >
                    <div className="py-1">
                      <button
                        onClick={handleEditClick}
                        className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                          isDarkMode
                            ? "text-gray-200 hover:bg-gray-700/50"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteClick}
                        className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                          isDarkMode
                            ? "text-red-400 hover:bg-gray-700/50"
                            : "text-red-600 hover:bg-gray-100"
                        }`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                {task.status === "to do" && (
                  <button
                    onClick={handleStatusUpdate}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isDarkMode
                        ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    }`}
                  >
                    Start Task
                  </button>
                )}
                {task.status === "in progress" && (
                  <button
                    onClick={handleFinishTask}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isDarkMode
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "bg-green-100 text-green-600 hover:bg-green-200"
                    }`}
                  >
                    Finish Task
                  </button>
                )}
              </div>
            )}
          </div>
          {task.description && (
            <p
              className={`text-sm mb-3 break-words ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="flex items-center mt-3">
              <div className="flex -space-x-2">
                {task.assignedTo.map((user, index) => (
                  <div
                    key={user?._id || index}
                    className={`w-6 h-6 rounded-full ring-2 ${
                      isDarkMode ? "ring-gray-800" : "ring-white"
                    }`}
                    title={user?.name || "Unknown User"}
                  >
                    {user?.image ? (
                      <img
                        src={`/uploads/${user.image}`}
                        alt={user.name || "User"}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                        {getInitials(user?.name)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {task.assignedTo.length > 0 && (
                <span
                  className={`ml-2 text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {task.assignedTo.length}{" "}
                  {task.assignedTo.length === 1 ? "assignee" : "assignees"}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Task Column Component
const TaskColumn = ({
  title,
  tasks,
  onEditTask,
  onDeleteTask,
  isDarkMode,
  color,
  index,
  setTasks,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.2 }}
      className={`flex-1 min-w-[300px] p-4 rounded-xl transition-all duration-200 ${
        isDarkMode ? "bg-gray-800/50" : "bg-gray-100"
      } shadow-lg hover:shadow-xl border transition-shadow duration-300 ${
        isDarkMode ? "border-gray-700/50" : "border-gray-200"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <h2 className={`text-lg font-semibold ${color}`}>{title}</h2>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            isDarkMode
              ? "bg-gray-700 text-gray-300"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task, taskIndex) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            isDarkMode={isDarkMode}
            index={taskIndex}
            setTasks={setTasks}
          />
        ))}
        {tasks.length === 0 && (
          <div
            className={`text-center py-8 rounded-lg ${
              isDarkMode ? "bg-gray-800/30" : "bg-gray-50"
            }`}
          >
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No tasks in this column
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Add this new component at the top with other components
const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      {message}
    </div>
  );
};

function Tasks({ theme }) {
  const isDarkMode = theme === "dark";
  const { userData, userToken } = useContext(UserContext);
  const isAdmin = userData?.role === "admin";
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    status: "to do",
    assignedTo: [],
  });
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("columns");
  const [sortBy, setSortBy] = useState("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const navigate = useNavigate();
  const { taskId } = useParams();

  // Fetch normal users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!userToken) {
          console.error("No user token available");
          return;
        }

        console.log("Fetching users with token:", userToken);
        const response = await axios.get(
          "http://localhost:3000/api/user/normal",
          {
            headers: {
              token: userToken,
            },
          }
        );
        console.log("Users API response:", response.data);
        if (response.data.message === "success") {
          setUsers(response.data.users);
          console.log("Set users:", response.data.users);
        }
      } catch (error) {
        console.error("Error fetching users:", error.response?.data || error);
      }
    };

    if (userToken) {
      console.log("User token exists, fetching users");
      fetchUsers();
    } else {
      console.log("No user token available");
    }
  }, [userToken]);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let response;
        if (userData?.role === "user") {
          // Fetch only assigned tasks for normal users
          response = await axios.get(
            `http://localhost:3000/api/task/userTasks/${userData._id}`,
            {
              headers: {
                token: userToken,
              },
            }
          );
        } else {
          // Fetch all tasks for admin users
          response = await axios.get("http://localhost:3000/api/task", {
            headers: {
              token: userToken,
            },
          });
        }

        if (response.data.message === "success") {
          setTasks(response.data.tasks);
        } else {
          console.error("Error fetching tasks:", response.data);
        }
      } catch (error) {
        console.error(
          "Error fetching tasks:",
          error.response?.data || error.message
        );
      }
    };

    if (userToken) {
      fetchTasks();
    }
  }, [userToken, userData]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    setIsModalOpen(true);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      status: "to do",
      assignedTo: [],
    });
  };

  const handleCreateTask = async () => {
    setError(null);
    try {
      // Validate form fields
      if (!newTask.title || newTask.title.length < 2) {
        setError("Title must be at least 2 characters long");
        return;
      }
      if (!newTask.description || newTask.description.length < 2) {
        setError("Description must be at least 2 characters long");
        return;
      }
      if (newTask.description.length > 500) {
        setError("Description cannot exceed 500 characters");
        return;
      }
      if (!newTask.dueDate) {
        setError("Due date is required");
        return;
      }
      if (new Date(newTask.dueDate) < new Date()) {
        setError("Due date cannot be in the past");
        return;
      }
      if (!newTask.assignedTo || newTask.assignedTo.length === 0) {
        setError("Please assign at least one user to the task");
        return;
      }

      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: newTask.status,
        dueDate: newTask.dueDate,
        assignedTo: newTask.assignedTo,
      };

      const response = await axios.post(
        "http://localhost:3000/api/task",
        taskData,
        {
          headers: {
            token: userToken,
          },
        }
      );

      if (response.data.message === "added") {
        // Fetch updated tasks based on user role
        let tasksResponse;
        if (userData?.role === "user") {
          tasksResponse = await axios.get(
            `http://localhost:3000/api/task/userTasks/${userData._id}`,
            {
              headers: {
                token: userToken,
              },
            }
          );
        } else {
          tasksResponse = await axios.get("/api/task", {
            headers: {
              token: userToken,
            },
          });
        }

        if (tasksResponse.data.message === "success") {
          setTasks(tasksResponse.data.tasks);
          setCreateSuccess(true);
          setTimeout(() => {
            setCreateSuccess(false);
            setIsModalOpen(false);
            setNewTask({
              title: "",
              description: "",
              priority: "medium",
              dueDate: "",
              status: "to do",
              assignedTo: [],
            });
          }, 1000);
        }
      }
    } catch (error) {
      setError(
        error.response?.data?.error || "Error creating task. Please try again."
      );
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask({
      ...task,
      assignedTo: task.assignedTo.map((user) => user._id),
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async () => {
    setError(null);
    try {
      // Validate form fields
      if (!selectedTask.title || selectedTask.title.length < 2) {
        setError("Title must be at least 2 characters long");
        return;
      }
      if (!selectedTask.description || selectedTask.description.length < 2) {
        setError("Description must be at least 2 characters long");
        return;
      }
      if (selectedTask.description.length > 500) {
        setError("Description cannot exceed 500 characters");
        return;
      }
      if (!selectedTask.dueDate) {
        setError("Due date is required");
        return;
      }
      if (new Date(selectedTask.dueDate) < new Date()) {
        setError("Due date cannot be in the past");
        return;
      }
      if (!selectedTask.assignedTo || selectedTask.assignedTo.length === 0) {
        setError("Please assign at least one user to the task");
        return;
      }

      const taskData = {
        title: selectedTask.title,
        description: selectedTask.description || "",
        priority: selectedTask.priority,
        status: selectedTask.status,
        dueDate: selectedTask.dueDate,
        assignedTo: selectedTask.assignedTo,
      };

      const response = await axios.put(
        `http://localhost:3000/api/task/${selectedTask._id}`,
        taskData,
        {
          headers: {
            token: userToken,
          },
        }
      );

      if (response.data.message === "updated") {
        // Fetch updated tasks based on user role
        let tasksResponse;
        if (userData?.role === "user") {
          tasksResponse = await axios.get(
            `http://localhost:3000/api/task/userTasks/${userData._id}`,
            {
              headers: {
                token: userToken,
              },
            }
          );
        } else {
          tasksResponse = await axios.get("/api/task", {
            headers: {
              token: userToken,
            },
          });
        }

        if (tasksResponse.data.message === "success") {
          setTasks(tasksResponse.data.tasks);
          setUpdateSuccess(true);
          setTimeout(() => {
            setUpdateSuccess(false);
            setIsEditModalOpen(false);
            setSelectedTask(null);
          }, 1000);
        }
      }
    } catch (error) {
      setError(
        error.response?.data?.error || "Error updating task. Please try again."
      );
    }
  };

  const handleDeleteTask = async (taskId) => {
    setTaskToDelete(taskId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/task/${taskToDelete}`,
        {
          headers: { token: userToken },
        }
      );

      if (response.data.message === "Task moved to trash successfully") {
        // Fetch updated tasks based on user role
        let tasksResponse;
        if (userData?.role === "user") {
          tasksResponse = await axios.get(
            `http://localhost:3000/api/task/userTasks/${userData._id}`,
            {
              headers: {
                token: userToken,
              },
            }
          );
        } else {
          tasksResponse = await axios.get("/api/task", {
            headers: {
              token: userToken,
            },
          });
        }

        if (tasksResponse.data.message === "success") {
          setTasks(tasksResponse.data.tasks);
          setDeleteSuccess(true);
          toast.success("Task moved to trash");
          setTimeout(() => {
            setDeleteSuccess(false);
            setIsDeleteModalOpen(false);
            setTaskToDelete(null);
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error moving task to trash:", error);
      toast.error("Failed to move task to trash");
    }
  };

  // Remove filterTasks function and keep only sortTasks
  const sortTasks = (tasksToSort) => {
    const sortedTasks = [...tasksToSort];
    switch (sortBy) {
      case "date":
        return sortedTasks.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
      case "priority":
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return sortedTasks.sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );
      case "title":
        return sortedTasks.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sortedTasks;
    }
  };

  // Add search filter function
  const filterTasksBySearch = (tasksToFilter) => {
    if (!searchQuery.trim()) return tasksToFilter;

    const query = searchQuery.toLowerCase().trim();
    return tasksToFilter.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(query);
      const descriptionMatch =
        task.description?.toLowerCase().includes(query) || false;
      const priorityMatch = task.priority.toLowerCase().includes(query);
      const statusMatch = task.status.toLowerCase().includes(query);

      return titleMatch || descriptionMatch || priorityMatch || statusMatch;
    });
  };

  // Update the task filtering section to use both search and sorting
  const filteredTasks = filterTasksBySearch(tasks);
  const sortedTasks = sortTasks(filteredTasks);

  // Update the task columns to use sorted tasks
  const todoTasks = sortedTasks.filter((task) => task.status === "to do");
  const inProgressTasks = sortedTasks.filter(
    (task) => task.status === "in progress"
  );
  const completedTasks = sortedTasks.filter(
    (task) => task.status === "completed"
  );

  // Update the list view to use sorted tasks
  const displayTasks = viewMode === "columns" ? sortedTasks : sortedTasks;

  const handleTaskClick = (task) => {
    navigate(`/tasks/${task._id}`);
  };

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (taskId) {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/task/${taskId}`,
            {
              headers: {
                token: userToken,
              },
            }
          );
          setSelectedTask(response.data.task);
        } catch (error) {
          console.error(
            "Error fetching task details:",
            error.response?.data?.message || error.message
          );
          setSelectedTask(null);
          // Show error message to user
          if (error.response?.status === 403) {
            toast.error("You are not authorized to view this task");
          } else if (error.response?.status === 404) {
            toast.error("Task not found");
          } else {
            toast.error("Failed to fetch task details");
          }
        }
      }
    };

    fetchTaskDetails();
  }, [taskId, userToken]);

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
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDarkMode ? "bg-[#181943]" : "bg-[#edeaff]"
                  }`}
                >
                  <LayoutGrid
                    className="w-5 h-5"
                    color={isDarkMode ? "#7b7dfa" : "#554ef5"}
                  />
                </div>
                <h1 className="text-2xl font-bold">Tasks</h1>
              </div>
              {isAdmin && (
                <button
                  onClick={handleAddTask}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-[#554ef5] hover:bg-[#463fd4] text-white"
                >
                  <Plus className="w-4 h-4" color="#fff" />
                  <span className="font-medium">New Task</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`text-sm font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"} total
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
              <option value="date">Sort by Due Date</option>
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
        {/* View Mode Toggle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("columns")}
              className={`group px-4 py-2 rounded-lg transition-all duration-200 ${
                viewMode === "columns"
                  ? isDarkMode
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-900 shadow-sm"
                  : isDarkMode
                  ? "text-gray-400 hover:bg-gray-800"
                  : "text-gray-500 hover:bg-white"
              }`}
            >
              <LayoutGrid
                className={`w-5 h-5 transition-transform duration-200 ${
                  viewMode === "columns" ? "scale-110" : "group-hover:scale-110"
                }`}
              />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`group px-4 py-2 rounded-lg transition-all duration-200 ${
                viewMode === "list"
                  ? isDarkMode
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-900 shadow-sm"
                  : isDarkMode
                  ? "text-gray-400 hover:bg-gray-800"
                  : "text-gray-500 hover:bg-white"
              }`}
            >
              <List
                className={`w-5 h-5 transition-transform duration-200 ${
                  viewMode === "list" ? "scale-110" : "group-hover:scale-110"
                }`}
              />
            </button>
          </div>
          <div
            className={`text-sm font-medium ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} total
          </div>
        </motion.div>

        {/* Tasks Content */}
        {viewMode === "columns" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TaskColumn
              title="To Do"
              tasks={todoTasks}
              onEditTask={isAdmin ? handleEditTask : null}
              onDeleteTask={isAdmin ? handleDeleteTask : null}
              isDarkMode={isDarkMode}
              color={isDarkMode ? "text-blue-400" : "text-blue-600"}
              index={0}
              setTasks={setTasks}
            />

            <TaskColumn
              title="In Progress"
              tasks={inProgressTasks}
              onEditTask={isAdmin ? handleEditTask : null}
              onDeleteTask={isAdmin ? handleDeleteTask : null}
              isDarkMode={isDarkMode}
              color={isDarkMode ? "text-yellow-400" : "text-yellow-600"}
              index={1}
              setTasks={setTasks}
            />

            <TaskColumn
              title="Completed"
              tasks={completedTasks}
              onEditTask={isAdmin ? handleEditTask : null}
              onDeleteTask={isAdmin ? handleDeleteTask : null}
              isDarkMode={isDarkMode}
              color={isDarkMode ? "text-green-400" : "text-green-600"}
              index={2}
              setTasks={setTasks}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-4"
          >
            {displayTasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={isAdmin ? handleEditTask : null}
                onDelete={isAdmin ? handleDeleteTask : null}
                isDarkMode={isDarkMode}
                index={index}
                setTasks={setTasks}
              />
            ))}
            {displayTasks.length === 0 && (
              <div
                className={`text-center py-12 rounded-xl ${
                  isDarkMode ? "bg-gray-800/50" : "bg-white"
                } shadow-sm`}
              >
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  No tasks found.{" "}
                  {isAdmin
                    ? 'Click "New Task" to get started!'
                    : "No tasks available."}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Add Task Modal */}
      {isAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setError(null);
            setCreateSuccess(false);
          }}
          title={createSuccess ? "Task Created" : "Add New Task"}
          isDarkMode={isDarkMode}
        >
          {createSuccess ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p
                className={`text-lg font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Task created successfully
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div
                  className={`p-3 mb-4 rounded-lg ${
                    isDarkMode
                      ? "bg-red-900/50 text-red-200"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {error}
                </div>
              )}
              <FormInput
                label="Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder="Enter task title"
                isDarkMode={isDarkMode}
              />

              <FormInput
                label="Description"
                type="textarea"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Enter task description"
                isDarkMode={isDarkMode}
              />

              <UserSelect
                label="Assigned To"
                value={newTask.assignedTo}
                onChange={(selectedUsers) =>
                  setNewTask({ ...newTask, assignedTo: selectedUsers })
                }
                options={users.map((user) => ({
                  value: user._id,
                  label: user.name,
                  image: user.image,
                  jobTitle: user.jobTitle,
                }))}
                isDarkMode={isDarkMode}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Priority"
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value })
                  }
                  options={[
                    { value: "high", label: "High" },
                    { value: "medium", label: "Medium" },
                    { value: "low", label: "Low" },
                  ]}
                  isDarkMode={isDarkMode}
                />

                <FormSelect
                  label="Status"
                  value={newTask.status}
                  onChange={(e) =>
                    setNewTask({ ...newTask, status: e.target.value })
                  }
                  options={[
                    { value: "to do", label: "To Do" },
                    { value: "in progress", label: "In Progress" },
                    { value: "completed", label: "Completed" },
                  ]}
                  isDarkMode={isDarkMode}
                />
              </div>

              <FormInput
                label="Due Date"
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
                isDarkMode={isDarkMode}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDarkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-800"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#554ef5] hover:bg-[#463fd4] rounded-lg transition-colors"
                >
                  Create Task
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Edit Task Modal */}
      {isAdmin && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setError(null);
            setUpdateSuccess(false);
          }}
          title={updateSuccess ? "Task Updated" : "Edit Task"}
          isDarkMode={isDarkMode}
        >
          {updateSuccess ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p
                className={`text-lg font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Task updated successfully
              </p>
            </div>
          ) : (
            selectedTask && (
              <div className="space-y-4">
                {error && (
                  <div
                    className={`p-3 mb-4 rounded-lg ${
                      isDarkMode
                        ? "bg-red-900/50 text-red-200"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {error}
                  </div>
                )}
                <FormInput
                  label="Title"
                  value={selectedTask.title}
                  onChange={(e) =>
                    setSelectedTask({ ...selectedTask, title: e.target.value })
                  }
                  placeholder="Enter task title"
                  isDarkMode={isDarkMode}
                />

                <FormInput
                  label="Description"
                  type="textarea"
                  value={selectedTask.description || ""}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter task description"
                  isDarkMode={isDarkMode}
                />

                <UserSelect
                  label="Assigned To"
                  value={selectedTask.assignedTo || []}
                  onChange={(selectedUsers) =>
                    setSelectedTask({
                      ...selectedTask,
                      assignedTo: selectedUsers,
                    })
                  }
                  options={users.map((user) => ({
                    value: user._id,
                    label: user.name,
                    image: user.image,
                    jobTitle: user.jobTitle,
                  }))}
                  isDarkMode={isDarkMode}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormSelect
                    label="Priority"
                    value={selectedTask.priority}
                    onChange={(e) =>
                      setSelectedTask({
                        ...selectedTask,
                        priority: e.target.value,
                      })
                    }
                    options={[
                      { value: "high", label: "High" },
                      { value: "medium", label: "Medium" },
                      { value: "low", label: "Low" },
                    ]}
                    isDarkMode={isDarkMode}
                  />

                  <FormSelect
                    label="Status"
                    value={selectedTask.status}
                    onChange={(e) =>
                      setSelectedTask({
                        ...selectedTask,
                        status: e.target.value,
                      })
                    }
                    options={[
                      { value: "to do", label: "To Do" },
                      { value: "in progress", label: "In Progress" },
                      { value: "completed", label: "Completed" },
                    ]}
                    isDarkMode={isDarkMode}
                  />
                </div>

                <FormInput
                  label="Due Date"
                  type="date"
                  value={selectedTask.dueDate || ""}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      dueDate: e.target.value,
                    })
                  }
                  isDarkMode={isDarkMode}
                />

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isDarkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-800"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateTask}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#554ef5] hover:bg-[#463fd4] rounded-lg transition-colors"
                  >
                    Update Task
                  </button>
                </div>
              </div>
            )
          )}
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
          setDeleteSuccess(false);
        }}
        title={deleteSuccess ? "Task Moved to Trash" : "Move to Trash"}
        isDarkMode={isDarkMode}
      >
        {deleteSuccess ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p
              className={`text-lg font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Task moved to trash successfully
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p
              className={`text-center ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Are you sure you want to move this task to trash? You can restore
              it later from the trash.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setTaskToDelete(null);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDarkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Move to Trash
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}

export default Tasks;
