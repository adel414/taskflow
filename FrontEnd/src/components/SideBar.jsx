import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTasks,
  FaSpinner,
  FaClipboardList,
  FaUsers,
  FaTrash,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaCog,
  FaRobot,
  FaComments,
  FaCommentDots,
} from "react-icons/fa";
import {
  MdSpaceDashboard,
  MdGroups,
  MdChatBubbleOutline,
} from "react-icons/md";
import { IoChatbubblesOutline, IoChatbubbleOutline } from "react-icons/io5";
import { BsChatSquareText } from "react-icons/bs";
import { FaCheckCircle } from "react-icons/fa";
import clsx from "classnames";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";

const SideBar = ({ isOpen, toggleSidebar, theme }) => {
  const location = useLocation();
  const { userData, userToken } = useContext(UserContext);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    if (userData?._id) {
      checkUnreadMessages();
      const interval = setInterval(checkUnreadMessages, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [userData?._id]);

  useEffect(() => {
    // Listen for unread messages updates from Chat component
    const handleUnreadUpdate = () => {
      const hasUnread = localStorage.getItem("hasUnreadMessages") === "true";
      setHasUnreadMessages(hasUnread);
    };

    window.addEventListener("unreadMessagesUpdated", handleUnreadUpdate);
    return () => {
      window.removeEventListener("unreadMessagesUpdated", handleUnreadUpdate);
    };
  }, []);

  const checkUnreadMessages = async () => {
    try {
      const response = await axios.get("/api/inbox/unread", {
        headers: {
          token: userToken,
        },
      });
      if (response.data.message === "success") {
        setHasUnreadMessages(response.data.hasUnread);
        localStorage.setItem("hasUnreadMessages", response.data.hasUnread);
      }
    } catch (error) {
      console.error("Error checking unread messages:", error);
    }
  };

  const menuItems = [
    ...(userData?.role !== "user"
      ? [{ label: "Dashboard", icon: MdSpaceDashboard, path: "/" }]
      : []),
    { label: "Tasks", icon: FaTasks, path: "/tasks" },
    { label: "Team", icon: FaUsers, path: "/team" },
    { label: "GroupChat", icon: FaComments, path: "/groupchat" },
    {
      label: "Chat",
      icon: FaCommentDots,
      path: "/chat",
      hasUnread: hasUnreadMessages,
    },
    ...(userData?.role !== "user"
      ? [{ label: "Trash", icon: FaTrash, path: "/trash" }]
      : []),
    { label: "AI Chat", icon: FaRobot, path: "/taskmate" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={clsx(
        "h-screen flex flex-col fixed left-0 top-0 z-50 transition-all",
        theme === "dark"
          ? "bg-gray-900 text-gray-200"
          : "bg-white text-gray-900"
      )}
      style={{
        width: isOpen ? 280 : 80,
        boxShadow:
          theme === "dark"
            ? "0 4px 30px rgba(0, 0, 0, 0.5)"
            : "0 4px 30px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Logo and Toggle Section */}
      <div
        className={clsx(
          "flex items-center justify-between p-5 border-b",
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        )}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                TaskFlow
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className={clsx(
            "p-2 rounded-lg transition-all duration-300",
            theme === "dark"
              ? "hover:bg-gray-800 text-gray-300 hover:text-white"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
          )}
        >
          {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        <ul className="space-y-3">
          {menuItems.map(({ label, icon: Icon, path, hasUnread }) => (
            <Link to={path} key={path} className="block">
              <motion.li
                className={clsx(
                  "flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300",
                  { "justify-center": !isOpen },
                  location.pathname === path
                    ? theme === "dark"
                      ? "bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg shadow-blue-900/30"
                      : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-md"
                    : theme === "dark"
                    ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                    : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                )}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <div
                    className={clsx(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                      location.pathname === path
                        ? theme === "dark"
                          ? "bg-blue-800"
                          : "bg-blue-100"
                        : theme === "dark"
                        ? "bg-gray-800"
                        : "bg-gray-100"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "text-lg transition-all duration-300",
                        location.pathname === path
                          ? theme === "dark"
                            ? "text-white"
                            : "text-blue-600"
                          : theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-500"
                      )}
                    />
                  </div>
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                  )}
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={clsx(
                        "text-sm font-medium",
                        location.pathname === path
                          ? theme === "dark"
                            ? "text-white"
                            : "text-blue-700"
                          : theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-600"
                      )}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.li>
            </Link>
          ))}
        </ul>
      </div>

      {/* User Profile Section */}
      <div
        className={clsx(
          "p-5 border-t",
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        )}
      >
        <div
          className={clsx("flex items-center gap-4", {
            "justify-center": !isOpen,
          })}
        >
          <div
            className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0",
              theme === "dark" ? "bg-gray-800" : "bg-gray-100"
            )}
          >
            {userData?.image ? (
              <img
                src={userData.image}
                alt={userData?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FaUserCircle className="text-white text-xl" />
              </div>
            )}
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0"
              >
                <p
                  className={clsx(
                    "text-sm font-medium truncate",
                    theme === "dark" ? "text-white" : "text-gray-900"
                  )}
                >
                  {userData?.name || "Loading..."}
                </p>
                <p
                  className={clsx(
                    "text-xs truncate",
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  )}
                >
                  {userData?.email || "Loading..."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SideBar;
