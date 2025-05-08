import {
  ClipboardList,
  CheckCircle,
  Clock,
  ListTodo,
  LayoutGrid,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
} from "recharts";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { Navigate } from "react-router-dom";

const Dashboard = ({ theme }) => {
  const isDarkMode = theme === "dark";
  const { userToken, userData } = useContext(UserContext);

  // Check if user role is "user" and redirect if true
  if (userData?.role === "user") {
    return <Navigate to="/" replace />;
  }

  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
  });
  const [priorityData, setPriorityData] = useState([
    { priority: "High", total: 0 },
    { priority: "Medium", total: 0 },
    { priority: "Low", total: 0 },
  ]);

  // Function to process task data for the activity chart
  const processTaskActivityData = (tasks) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    const activityData = last7Days.map((date) => {
      const dateStr = date.toLocaleDateString("en-US", { weekday: "short" });
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const completedTasks = tasks.filter((task) => {
        if (!task.completedAt) return false;
        const completedDate = new Date(task.completedAt);
        return completedDate >= dayStart && completedDate <= dayEnd;
      }).length;

      const createdTasks = tasks.filter((task) => {
        if (!task.createdAt) return false;
        const createdDate = new Date(task.createdAt);
        return createdDate >= dayStart && createdDate <= dayEnd;
      }).length;

      return {
        date: dateStr,
        completed: completedTasks,
        created: createdTasks,
      };
    });

    return activityData;
  };

  // Update the useEffect to process task data
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/task", {
          headers: {
            token: userToken,
          },
        });

        if (response.data.message === "success") {
          const fetchedTasks = response.data.tasks;
          setTasks(fetchedTasks);

          // Calculate task statistics
          const stats = {
            total: fetchedTasks.length,
            completed: fetchedTasks.filter(
              (task) => task.status === "completed"
            ).length,
            inProgress: fetchedTasks.filter(
              (task) => task.status === "in progress"
            ).length,
            todo: fetchedTasks.filter((task) => task.status === "to do").length,
          };
          setTaskStats(stats);

          // Calculate priority data
          const highPriority = fetchedTasks.filter(
            (task) => task.priority === "high"
          ).length;
          const mediumPriority = fetchedTasks.filter(
            (task) => task.priority === "medium"
          ).length;
          const lowPriority = fetchedTasks.filter(
            (task) => task.priority === "low"
          ).length;

          setPriorityData([
            { priority: "High", total: highPriority },
            { priority: "Medium", total: mediumPriority },
            { priority: "Low", total: lowPriority },
          ]);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    if (userToken) {
      fetchTasks();
    }
  }, [userToken]);

  // Process task activity data
  const activityData = processTaskActivityData(tasks);

  // Calculate total tasks created in the last 7 days
  const totalCreatedLastWeek = activityData.reduce(
    (sum, day) => sum + day.created,
    0
  );

  // Define colors for each priority level
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#EF4444"; // Red
      case "Medium":
        return "#F59E0B"; // Yellow
      case "Low":
        return "#10B981"; // Green
      default:
        return isDarkMode ? "#60A5FA" : "#2563EB";
    }
  };

  // Define colors for task status
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#10B981"; // Green
      case "in progress":
        return "#F59E0B"; // Yellow
      case "to do":
        return "#60A5FA"; // Blue
      default:
        return isDarkMode ? "#60A5FA" : "#2563EB";
    }
  };

  // Prepare data for status pie chart
  const statusData = [
    { name: "Completed", value: taskStats.completed },
    { name: "In Progress", value: taskStats.inProgress },
    { name: "To Do", value: taskStats.todo },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header Section */}
      <div
        className={`sticky top-0 z-10 backdrop-blur-sm bg-opacity-80 ${
          isDarkMode ? "bg-gray-900/80" : "bg-white/80"
        } border-b ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isDarkMode ? "bg-[#181943]" : "bg-[#edeaff]"
              }`}
            >
              <LayoutGrid className="w-5 h-5" color="#7b7dfa" />
            </div>
            <h1 className="text-2xl sm:text-2xl font-bold">Dashboard</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Task Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {[
            {
              title: "Total Tasks",
              value: taskStats.total,
              lastWeekValue: totalCreatedLastWeek,
              Icon: ClipboardList,
              color: isDarkMode ? "bg-[#554ef5]" : "bg-[#edeaff]",
              iconColor: isDarkMode ? "#b2b3ff" : "#554ef5",
            },
            {
              title: "Completed Tasks",
              value: taskStats.completed,
              lastWeekValue: totalCreatedLastWeek,
              Icon: CheckCircle,
              color: isDarkMode ? "bg-[#10B981]" : "bg-emerald-100",
              iconColor: isDarkMode ? "#a7f3d0" : "#10B981",
            },
            {
              title: "Tasks In Progress",
              value: taskStats.inProgress,
              lastWeekValue: totalCreatedLastWeek,
              Icon: Clock,
              color: isDarkMode ? "bg-[#F59E0B]" : "bg-[#fff7e0]",
              iconColor: isDarkMode ? "#fde68a" : "#F59E0B",
            },
            {
              title: "To Do Tasks",
              value: taskStats.todo,
              lastWeekValue: totalCreatedLastWeek,
              Icon: ListTodo,
              color: isDarkMode ? "bg-[#3b82f6]" : "bg-[#e6f0ff]",
              iconColor: isDarkMode ? "#93c5fd" : "#3b82f6",
            },
          ].map((task, index) => (
            <div
              key={index}
              className={`p-4 sm:p-6 rounded-xl transition-all ${
                task.title === "Completed Tasks"
                  ? isDarkMode
                    ? "bg-gray-800/50"
                    : "bg-white"
                  : isDarkMode
                  ? "bg-gray-800/50"
                  : "bg-white"
              } shadow-lg hover:shadow-xl border transition-shadow duration-300 ${
                task.title === "Completed Tasks"
                  ? isDarkMode
                    ? "border-gray-700/50"
                    : "border-gray-100"
                  : isDarkMode
                  ? "border-gray-700/50"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-lg ${task.color}`}>
                  <task.Icon
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    color={task.iconColor}
                  />
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  last week
                </span>
              </div>
              <h3
                className={`text-xl sm:text-2xl font-semibold mb-1 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {task.value}
              </h3>
              <p
                className={`text-xs sm:text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {task.title}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Priority Bar Chart */}
          <div
            className={`p-4 sm:p-6 rounded-xl transition-all ${
              isDarkMode ? "bg-gray-800/50" : "bg-white"
            } shadow-lg hover:shadow-xl border transition-shadow duration-300 ${
              isDarkMode ? "border-gray-700/50" : "border-gray-100"
            }`}
          >
            <h2
              className={`text-base sm:text-lg font-semibold mb-4 sm:mb-6 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Tasks by Priority
            </h2>
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#555" : "#ddd"}
                  />
                  <XAxis
                    dataKey="priority"
                    stroke={isDarkMode ? "#bbb" : "#333"}
                    tick={{ fill: isDarkMode ? "#fff" : "#000" }}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#bbb" : "#333"}
                    tickCount={5}
                    domain={[0, "auto"]}
                    allowDecimals={false}
                    tick={{ fill: isDarkMode ? "#fff" : "#000" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1F2937" : "#fff",
                      color: isDarkMode ? "#fff" : "#000",
                      borderRadius: "8px",
                      border: isDarkMode
                        ? "1px solid #374151"
                        : "1px solid #ddd",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      color: isDarkMode ? "#fff" : "#000",
                    }}
                  />
                  <Bar dataKey="total" barSize={150}>
                    {priorityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getPriorityColor(entry.priority)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Pie Chart */}
          <div
            className={`p-4 sm:p-6 rounded-xl transition-all ${
              isDarkMode ? "bg-gray-800/50" : "bg-white"
            } shadow-lg hover:shadow-xl border transition-shadow duration-300 ${
              isDarkMode ? "border-gray-700/50" : "border-gray-100"
            }`}
          >
            <h2
              className={`text-base sm:text-lg font-semibold mb-4 sm:mb-6 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Task Status Distribution
            </h2>
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getStatusColor(entry.name.toLowerCase())}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1F2937" : "#fff",
                      color: isDarkMode ? "#fff" : "#000",
                      borderRadius: "8px",
                      border: isDarkMode
                        ? "1px solid #374151"
                        : "1px solid #ddd",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      color: isDarkMode ? "#fff" : "#000",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Activity Line Chart */}
          <div
            className={`p-4 sm:p-6 rounded-xl transition-all col-span-1 lg:col-span-2 ${
              isDarkMode ? "bg-gray-800/50" : "bg-white"
            } shadow-lg hover:shadow-xl border transition-shadow duration-300 ${
              isDarkMode ? "border-gray-700/50" : "border-gray-100"
            }`}
          >
            <h2
              className={`text-base sm:text-lg font-semibold mb-4 sm:mb-6 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Task Activity (Last 7 Days)
            </h2>
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#555" : "#ddd"}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={isDarkMode ? "#bbb" : "#333"}
                    tick={{ fill: isDarkMode ? "#fff" : "#000" }}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#bbb" : "#333"}
                    tickCount={5}
                    domain={[0, "auto"]}
                    allowDecimals={false}
                    tick={{ fill: isDarkMode ? "#fff" : "#000" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1F2937" : "#fff",
                      color: isDarkMode ? "#fff" : "#000",
                      borderRadius: "8px",
                      border: isDarkMode
                        ? "1px solid #374151"
                        : "1px solid #ddd",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      color: isDarkMode ? "#fff" : "#000",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    name="Completed Tasks"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981" }}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="created"
                    name="Created Tasks"
                    stroke="#60A5FA"
                    strokeWidth={2}
                    dot={{ fill: "#60A5FA" }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
