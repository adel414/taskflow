import { useState, useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserContext } from "./context/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LogIn from "./components/LogIn";
import Register from "./components/Register";
import Dashboard from "./Pages/Dashboard";
import Tasks from "./Pages/Tasks";
import SideBar from "./components/SideBar";
import TopBar from "./components/TopBar";
import Team from "./Pages/Team";
import Completed from "./Pages/Completed";
import InProgress from "./Pages/InProgress";
import ToDo from "./Pages/ToDo";
import Trash from "./Pages/Trash";
import Profile from "./Pages/Profile";
import TaskDetails from "./Pages/TaskDetails";
import GroupChat from "./Pages/GroupChat";
import Chat from "./Pages/Chat";
import AIChat from "./Pages/AIChat";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { userToken, userData } = useContext(UserContext);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <Router future={{ v7_relativeSplatPath: true }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
      />
      {userToken ? (
        <div
          className={`flex h-screen overflow-hidden ${
            theme === "dark"
              ? "bg-gray-900 text-white"
              : "bg-gray-50 text-gray-800"
          }`}
        >
          <SideBar
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            theme={theme}
          />
          <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{ marginLeft: isSidebarOpen ? "250px" : "80px" }}
          >
            <TopBar
              theme={theme}
              toggleTheme={toggleTheme}
              isSidebarOpen={isSidebarOpen}
            />
            <div className="flex-1 overflow-y-auto p-4 mt-16">
              <Routes>
                <Route element={<ProtectedRoute />}>
                  <Route
                    path="/"
                    element={
                      userData?.role === "user" ? (
                        <Navigate to="/tasks" replace />
                      ) : (
                        <Dashboard theme={theme} />
                      )
                    }
                  />
                  <Route path="/tasks" element={<Tasks theme={theme} />} />
                  <Route
                    path="/tasks/:id"
                    element={<TaskDetails theme={theme} />}
                  />
                  <Route path="/team" element={<Team theme={theme} />} />
                  {userData?.role !== "user" && (
                    <Route path="/trash" element={<Trash theme={theme} />} />
                  )}
                  <Route path="/taskmate" element={<AIChat theme={theme} />} />
                  <Route path="/profile" element={<Profile theme={theme} />} />
                  <Route
                    path="/groupchat"
                    element={<GroupChat theme={theme} />}
                  />
                  <Route path="/chat" element={<Chat theme={theme} />} />
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
          <Routes>
            <Route path="/login" element={<LogIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      )}
    </Router>
  );
}

export default App;
