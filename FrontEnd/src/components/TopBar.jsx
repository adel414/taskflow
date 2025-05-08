import {
  FaBell,
  FaUserCircle,
  FaMoon,
  FaSun,
  FaSignOutAlt,
  FaCog,
  FaTrash,
} from "react-icons/fa";
import { AnimatePresence } from "framer-motion";
import { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { notificationAPI } from "../lib/api";
import { motion } from "framer-motion";

const formatRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "just now";
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else if (days < 7) {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  } else {
    return new Date(date).toLocaleDateString();
  }
};

const TopBar = ({ theme, toggleTheme, isSidebarOpen }) => {
  const { setUserToken, userData } = useContext(UserContext);
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [deletingAll, setDeletingAll] = useState(false);
  const [deleteAllError, setDeleteAllError] = useState("");

  // Add refs for the notification and user menu containers
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    console.log("Current user data:", userData);
  }, [userData]);

  useEffect(() => {
    if (userData?._id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userData?._id]);

  const fetchNotifications = async () => {
    if (!userData?._id) {
      console.warn("No user ID available for notifications fetch.");
      return;
    }

    try {
      setLoading(true);
      const response = await notificationAPI.getUserNotifications(userData._id);
      const sortedNotifications = (response.data.userNotification || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotifications(sortedNotifications);

      // Check if there are any unread notifications
      const hasUnreadNotifications = sortedNotifications.some(
        (notification) => !notification.isRead
      );
      setHasUnread(hasUnreadNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    setUserToken(null);
    navigate("/login");
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      // Remove the deleted notification from the state
      setNotifications(
        notifications.filter((notif) => notif._id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    setNotificationError(""); // Clear previous error
    try {
      const response = await notificationAPI.getSingleNotification(
        notification._id
      );
      const notificationData = response.data.notification;

      // Handle task-related notifications
      if (notificationData.relatedTask && notificationData.relatedTask._id) {
        navigate(`/tasks/${notificationData.relatedTask._id}`);
      }
      // Handle message notifications (general type)
      else if (
        notificationData.type === "general" &&
        notificationData.createdBy
      ) {
        // Navigate to chat with the sender
        navigate("/chat", {
          state: {
            user: {
              _id: notificationData.createdBy._id,
              name: notificationData.createdBy.name,
              email: notificationData.createdBy.email,
              image: notificationData.createdBy.image,
            },
          },
        });
      } else {
        setNotificationError("This item has been deleted.");
        // Clear error message after 2 seconds
        setTimeout(() => {
          setNotificationError("");
        }, 1000);
      }

      setShowNotifications(false);

      // After clicking a notification, check if there are still unread notifications
      const updatedNotifications = notifications.map((n) =>
        n._id === notification._id ? { ...n, isRead: true } : n
      );
      setNotifications(updatedNotifications);
      setHasUnread(updatedNotifications.some((n) => !n.isRead));
    } catch (error) {
      setNotificationError("An error occurred while fetching the item.");
      // Clear error message after 2 seconds
      setTimeout(() => {
        setNotificationError("");
      }, 1000);
      console.error("Error handling notification click:", error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (!userData?._id) {
      setDeleteAllError("User ID not found");
      return;
    }

    try {
      setDeletingAll(true);
      setDeleteAllError("");
      await notificationAPI.deleteAllNotifications(userData._id);
      setNotifications([]);
      setHasUnread(false);
      setShowNotifications(false);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      setDeleteAllError(
        error.response?.data?.message || "Failed to delete notifications"
      );
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div
      className={clsx(
        "h-16 flex items-center justify-end px-6 fixed top-0 right-0 z-40 transition-all duration-300",
        theme === "dark"
          ? "bg-gray-900/95 backdrop-blur-sm text-white border-b border-gray-800"
          : "bg-white/95 backdrop-blur-sm text-gray-900 border-b border-gray-200"
      )}
      style={{ left: isSidebarOpen ? "280px" : "80px" }}
    >
      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={clsx(
            "p-2 rounded-lg transition-all duration-300",
            theme === "dark"
              ? "hover:bg-gray-800/80 text-yellow-400 hover:text-yellow-300"
              : "hover:bg-gray-100/80 text-gray-700 hover:text-gray-900"
          )}
        >
          {theme === "dark" ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={clsx(
              "p-2 rounded-lg transition-all duration-300",
              theme === "dark"
                ? "hover:bg-gray-800/80 text-gray-300 hover:text-white"
                : "hover:bg-gray-100/80 text-gray-600 hover:text-gray-900"
            )}
          >
            <FaBell size={18} />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={clsx(
                  "absolute right-0 mt-2 w-80 rounded-lg shadow-xl overflow-hidden backdrop-blur-sm",
                  theme === "dark"
                    ? "bg-gray-800/95 border border-gray-700/50"
                    : "bg-white/95 border border-gray-200/50"
                )}
              >
                <div
                  className={clsx(
                    "p-4 border-b flex justify-between items-center",
                    theme === "dark"
                      ? "border-gray-700/50"
                      : "border-gray-200/50"
                  )}
                >
                  <h3
                    className={clsx(
                      "text-sm font-medium",
                      theme === "dark" ? "text-white" : "text-gray-900"
                    )}
                  >
                    Notifications
                  </h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleDeleteAllNotifications}
                      disabled={deletingAll}
                      className={clsx(
                        "text-xs px-2 py-1 rounded transition-all duration-300",
                        theme === "dark"
                          ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          : "text-red-600 hover:text-red-700 hover:bg-red-50/80",
                        deletingAll && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {deletingAll ? "Deleting..." : "Clear All"}
                    </button>
                  )}
                </div>

                {/* Error Message */}
                {deleteAllError && (
                  <div
                    className={clsx(
                      "p-2 text-xs text-center",
                      theme === "dark" ? "text-red-400" : "text-red-600"
                    )}
                  >
                    {deleteAllError}
                  </div>
                )}

                <div className="p-2 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-3 text-center">
                      <p
                        className={clsx(
                          "text-sm",
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        )}
                      >
                        Loading notifications...
                      </p>
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <div
                        key={notification._id || index}
                        className={clsx(
                          "p-3 rounded-lg transition-all duration-300 mb-2",
                          theme === "dark"
                            ? notification.isRead
                              ? "hover:bg-gray-700/50"
                              : "bg-blue-900/20 hover:bg-blue-900/30"
                            : notification.isRead
                            ? "hover:bg-gray-50/80"
                            : "bg-blue-50/80 hover:bg-blue-100/80"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            <p
                              className={clsx(
                                "text-sm",
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-600"
                              )}
                            >
                              {notification.message}
                            </p>
                            <p
                              className={clsx(
                                "text-xs mt-1",
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              )}
                            >
                              {formatRelativeTime(notification.createdAt)}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteNotification(notification._id)
                            }
                            className={clsx(
                              "p-1 rounded-full transition-all duration-300",
                              theme === "dark"
                                ? "hover:bg-gray-600/50 text-gray-400 hover:text-red-400"
                                : "hover:bg-gray-100/80 text-gray-500 hover:text-red-500"
                            )}
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className={clsx(
                        "p-3 rounded-lg transition-all duration-300",
                        theme === "dark"
                          ? "hover:bg-gray-700/50"
                          : "hover:bg-gray-50/80"
                      )}
                    >
                      <p
                        className={clsx(
                          "text-sm",
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        )}
                      >
                        No new notifications
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message Card */}
          <AnimatePresence>
            {notificationError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={clsx(
                  "absolute right-0 mt-2 w-80 rounded-lg shadow-xl overflow-hidden backdrop-blur-sm",
                  theme === "dark"
                    ? "bg-gray-800/95 border border-gray-700/50"
                    : "bg-white/95 border border-gray-200/50"
                )}
              >
                <div className="p-4 flex items-center gap-3">
                  <div
                    className={clsx(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      theme === "dark" ? "bg-red-900/20" : "bg-red-100/80"
                    )}
                  >
                    <FaTrash
                      className={clsx(
                        theme === "dark" ? "text-red-400" : "text-red-500"
                      )}
                      size={20}
                    />
                  </div>
                  <div>
                    <p
                      className={clsx(
                        "text-sm font-medium",
                        theme === "dark" ? "text-white" : "text-gray-900"
                      )}
                    >
                      {notificationError}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative" ref={userMenuRef}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={clsx(
              "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-300",
              theme === "dark" ? "hover:bg-gray-800/80" : "hover:bg-gray-100/80"
            )}
          >
            <div
              className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center overflow-hidden",
                theme === "dark" ? "bg-gray-800/80" : "bg-gray-100/80"
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
                  <FaUserCircle className="text-white text-lg" />
                </div>
              )}
            </div>
            <div className="hidden md:block">
              <p
                className={clsx(
                  "text-sm font-medium",
                  theme === "dark" ? "text-white" : "text-gray-900"
                )}
              >
                {userData?.name || "Loading..."}
              </p>
              <p
                className={clsx(
                  "text-xs",
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                )}
              >
                {userData?.role || "User"}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {showUserMenu && (
              <div
                className={clsx(
                  "absolute right-0 mt-2 w-48 rounded-lg shadow-xl overflow-hidden backdrop-blur-sm",
                  theme === "dark"
                    ? "bg-gray-800/95 border border-gray-700/50"
                    : "bg-white/95 border border-gray-200/50"
                )}
              >
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/profile");
                    }}
                    className={clsx(
                      "flex items-center gap-2 w-full p-2 rounded-lg transition-all duration-300",
                      theme === "dark"
                        ? "hover:bg-gray-700/50 text-gray-300 hover:text-white"
                        : "hover:bg-gray-50/80 text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <FaUserCircle size={16} />
                    <span className="text-sm">Profile</span>
                  </button>
                  <div
                    className={clsx(
                      "my-1 border-t",
                      theme === "dark"
                        ? "border-gray-700/50"
                        : "border-gray-200/50"
                    )}
                  />
                  <button
                    onClick={handleLogout}
                    className={clsx(
                      "flex items-center gap-2 w-full p-2 rounded-lg transition-all duration-300",
                      theme === "dark"
                        ? "hover:bg-red-900/20 text-red-400 hover:text-red-300"
                        : "hover:bg-red-50/80 text-red-600 hover:text-red-700"
                    )}
                  >
                    <FaSignOutAlt size={16} />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
