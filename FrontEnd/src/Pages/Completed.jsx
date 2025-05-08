import React, { useState, useEffect } from "react";
import {
  Plus,
  MoreVertical,
  Flag,
  Calendar,
  X,
  Edit,
  Trash2,
} from "lucide-react";

function Completed({ theme }) {
  const isDarkMode = theme === "dark";
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRef = React.useRef(null);

  // Initialize tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const allTasks = JSON.parse(savedTasks);
      // Filter for COMPLETED tasks that are not in trash
      const completedTasks = allTasks.filter(
        (task) => task.status === "COMPLETED" && !task.deletedAt
      );
      setTasks(completedTasks);
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const allTasks = JSON.parse(savedTasks);
      // Update the tasks in the main tasks array
      const updatedAllTasks = allTasks.map((task) => {
        const updatedTask = tasks.find((t) => t.id === task.id);
        return updatedTask || task;
      });
      localStorage.setItem("tasks", JSON.stringify(updatedAllTasks));
    }
  }, [tasks]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee: "",
    status: "COMPLETED",
    date: new Date().toISOString().split("T")[0],
    priority: "NORMAL",
  });

  const handleAddTask = () => {
    const task = {
      id: (tasks.length + 1).toString(),
      title: newTask.title,
      description: newTask.description,
      date: new Date(newTask.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      priority: newTask.priority === "NORMAL" ? "MEDIUM" : newTask.priority,
      status: "COMPLETED",
      category: "New Task",
      comments: 0,
      attachments: 0,
      subtasks: { total: 0, completed: 0 },
      assignees: [newTask.assignee],
      deletedAt: null,
    };

    setTasks([...tasks, task]);
    setIsModalOpen(false);
    setNewTask({
      title: "",
      description: "",
      assignee: "",
      status: "COMPLETED",
      date: new Date().toISOString().split("T")[0],
      priority: "NORMAL",
    });
  };

  const handleEditTask = (task) => {
    // Create a deep copy of the task to avoid modifying the original
    const taskCopy = JSON.parse(JSON.stringify(task));
    setSelectedTask(taskCopy);
    setIsEditModalOpen(true);
    // Close the dropdown after opening the edit modal
    setDropdownOpen(null);
  };

  const handleUpdateTask = () => {
    if (!selectedTask) return;

    // Format the date correctly
    const formattedDate = new Date(selectedTask.date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

    // Create a copy of the task with the formatted date
    const updatedTask = {
      ...selectedTask,
      date: formattedDate,
    };

    // Update the task in the tasks array
    const updatedTasks = tasks.map((task) => {
      if (task.id === updatedTask.id) {
        return updatedTask;
      }
      return task;
    });

    // Update the state and save to localStorage
    setTasks(updatedTasks);

    // Close the modal and reset the selected task
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId) => {
    // First, update the task in localStorage
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const allTasks = JSON.parse(savedTasks);
      const updatedAllTasks = allTasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            deletedAt: new Date().toISOString(),
            status: "TRASH",
            originalStatus: task.status,
          };
        }
        return task;
      });
      localStorage.setItem("tasks", JSON.stringify(updatedAllTasks));
    }

    // Then, immediately filter out the deleted task from the current view
    const filteredTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(filteredTasks);
    setDropdownOpen(null);
  };

  const toggleDropdown = (taskId, event) => {
    event.stopPropagation();
    setDropdownOpen(dropdownOpen === taskId ? null : taskId);
  };

  const TaskCard = ({ task }) => (
    <div
      className={`rounded-lg shadow-sm p-4 mb-4 ${
        isDarkMode
          ? "bg-gray-800 hover:bg-gray-750"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <span
            className={`px-2 py-1 text-xs rounded ${
              task.priority === "HIGH"
                ? isDarkMode
                  ? "text-red-300 bg-red-900 bg-opacity-30"
                  : "text-red-700 bg-red-50"
                : task.priority === "MEDIUM"
                ? isDarkMode
                  ? "text-yellow-300 bg-yellow-900 bg-opacity-30"
                  : "text-yellow-700 bg-yellow-50"
                : isDarkMode
                ? "text-green-300 bg-green-900 bg-opacity-30"
                : "text-green-700 bg-green-50"
            }`}
          >
            <Flag className="w-3 h-3 inline mr-1" />
            {task.priority} PRIORITY
          </span>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            className={
              isDarkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-400 hover:text-gray-600"
            }
            onClick={(e) => toggleDropdown(task.id, e)}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {dropdownOpen === task.id && (
            <div
              className={`absolute right-0 mt-1 w-36 rounded-md shadow-lg z-10 ${
                isDarkMode ? "bg-gray-700" : "bg-white"
              } ring-1 ring-black ring-opacity-5`}
            >
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button
                  onClick={() => {
                    handleEditTask(task);
                  }}
                  className={`flex items-center w-full px-4 py-2 text-sm ${
                    isDarkMode
                      ? "text-gray-200 hover:bg-gray-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  role="menuitem"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleDeleteTask(task.id);
                    setDropdownOpen(null);
                  }}
                  className={`flex items-center w-full px-4 py-2 text-sm ${
                    isDarkMode
                      ? "text-red-300 hover:bg-gray-600"
                      : "text-red-600 hover:bg-gray-100"
                  }`}
                  role="menuitem"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
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

      <div
        className={`flex items-center text-sm mb-4 ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        <Calendar className="w-4 h-4 mr-1" />
        <span>{task.date}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4"></div>

        <div className="flex -space-x-2">
          {task.assignees.map((assignee, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 ${
                isDarkMode ? "border-gray-800" : "border-white"
              }`}
              style={{
                backgroundColor: isDarkMode ? "#4B5563" : "#3B82F6",
                color: "white",
              }}
            >
              {assignee}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen p-6 transition-colors ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1
            className={`text-3xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Completed Tasks
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Task
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {tasks.length === 0 ? (
            <div
              className={`text-center py-8 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <p>No completed tasks</p>
            </div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>

        {/* Add Task Modal */}
        {isModalOpen && (
          <div
            className={`fixed inset-0 ${
              isDarkMode ? "backdrop-brightness-75" : "backdrop-brightness-50"
            } bg-opacity-50 flex items-center justify-center`}
          >
            <div
              className={`rounded-lg p-6 w-full max-w-md ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  ADD TASK
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={
                    isDarkMode
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-400 hover:text-gray-600"
                  }
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    className={`w-full p-2 border rounded-md ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "border-gray-300"
                    }`}
                    placeholder="Task title..."
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    className={`w-full p-2 border rounded-md ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "border-gray-300"
                    }`}
                    placeholder="Task description..."
                    rows="3"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Assign Task To:
                  </label>
                  <input
                    type="text"
                    value={newTask.assignee}
                    onChange={(e) =>
                      setNewTask({ ...newTask, assignee: e.target.value })
                    }
                    className={`w-full p-2 border rounded-md ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter assignee initials..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Task Date
                    </label>
                    <input
                      type="date"
                      value={newTask.date}
                      onChange={(e) =>
                        setNewTask({ ...newTask, date: e.target.value })
                      }
                      className={`w-full p-2 border rounded-md ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "border-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Priority Level
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) =>
                        setNewTask({ ...newTask, priority: e.target.value })
                      }
                      className={`w-full p-2 border rounded-md ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="NORMAL">NORMAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className={`px-4 py-2 ${
                      isDarkMode
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTask}
                    className={`px-4 py-2 rounded-md ${
                      isDarkMode
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {isEditModalOpen && selectedTask && (
          <div
            className={`fixed inset-0 ${
              isDarkMode ? "backdrop-brightness-75" : "backdrop-brightness-50"
            } bg-opacity-50 flex items-center justify-center`}
          >
            <div
              className={`rounded-lg p-6 w-full max-w-md ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  EDIT TASK
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className={
                    isDarkMode
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-400 hover:text-gray-600"
                  }
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={selectedTask.title}
                    onChange={(e) =>
                      setSelectedTask({
                        ...selectedTask,
                        title: e.target.value,
                      })
                    }
                    className={`w-full p-2 border rounded-md ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Description
                  </label>
                  <textarea
                    value={selectedTask.description || ""}
                    onChange={(e) =>
                      setSelectedTask({
                        ...selectedTask,
                        description: e.target.value,
                      })
                    }
                    className={`w-full p-2 border rounded-md ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "border-gray-300"
                    }`}
                    placeholder="Task description..."
                    rows="3"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Assignees
                  </label>
                  <input
                    type="text"
                    value={selectedTask.assignees.join(", ")}
                    onChange={(e) =>
                      setSelectedTask({
                        ...selectedTask,
                        assignees: e.target.value
                          .split(",")
                          .map((a) => a.trim())
                          .filter((a) => a),
                      })
                    }
                    className={`w-full p-2 border rounded-md ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter assignee initials (comma separated)..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Task Stage
                    </label>
                    <select
                      value={selectedTask.status}
                      onChange={(e) =>
                        setSelectedTask({
                          ...selectedTask,
                          status: e.target.value,
                        })
                      }
                      className={`w-full p-2 border rounded-md ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Task Date
                    </label>
                    <input
                      type="date"
                      value={
                        selectedTask.date
                          ? new Date(
                              selectedTask.date.split("-").reverse().join("-")
                            )
                              .toISOString()
                              .split("T")[0]
                          : new Date().toISOString().split("T")[0]
                      }
                      onChange={(e) =>
                        setSelectedTask({
                          ...selectedTask,
                          date: e.target.value,
                        })
                      }
                      className={`w-full p-2 border rounded-md ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Priority Level
                  </label>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) =>
                      setSelectedTask({
                        ...selectedTask,
                        priority: e.target.value,
                      })
                    }
                    className={`w-full p-2 border rounded-md ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className={`px-4 py-2 ${
                      isDarkMode
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateTask}
                    className={`px-4 py-2 rounded-md ${
                      isDarkMode
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Completed;
