import React, { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Send,
  MoreVertical,
  Trash2,
  Edit,
  X,
  Search,
  UserPlus,
} from "lucide-react";
import { useLocation } from "react-router-dom";

const Chat = ({ theme }) => {
  const location = useLocation();
  const isDarkMode = theme === "dark";
  const { userData, userToken } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const [menuMessage, setMenuMessage] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const [chatUsers, setChatUsers] = useState([]);

  useEffect(() => {
    if (location.state && location.state.user) {
      setSelectedUser(location.state.user);
    }
  }, [location.state]);

  const fetchChatUsers = async () => {
    try {
      const response = await axios.get("/api/inbox/chat-users", {
        headers: { token: userToken },
      });
      if (response.data.message === "success") {
        setChatUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching chat users:", error);
    }
  };

  useEffect(() => {
    fetchChatUsers();
  }, [userToken]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const fetchMessages = async () => {
    if (!selectedUser) return;
    try {
      const response = await axios.get(`/api/inbox/chat/${selectedUser._id}`, {
        headers: {
          token: userToken,
        },
      });
      if (response.data.message === "success") {
        setMessages(response.data.messages);
        localStorage.setItem("hasUnreadMessages", response.data.hasUnread);
        window.dispatchEvent(new Event("unreadMessagesUpdated"));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await axios.post(
        `/api/inbox/${selectedUser._id}`,
        { body: newMessage },
        {
          headers: {
            token: userToken,
          },
        }
      );
      setNewMessage("");
      fetchMessages();

      // Update chatUsers immediately
      setChatUsers((prev) => {
        // If user already exists, just update their lastMessage
        const exists = prev.find(({ user }) => user._id === selectedUser._id);
        if (exists) {
          return [
            { user: selectedUser, lastMessage: newMessage },
            ...prev.filter(({ user }) => user._id !== selectedUser._id),
          ];
        }
        // If not, add new user to the top
        return [{ user: selectedUser, lastMessage: newMessage }, ...prev];
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`/api/inbox`, {
        headers: {
          token: userToken,
        },
        data: { inboxes: [messageId] },
      });
      fetchMessages();
      setShowMenu(false);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleClearChat = async () => {
    if (!selectedUser) return;
    try {
      const response = await axios.delete(
        `/api/inbox/all/${selectedUser._id}`,
        {
          headers: {
            token: userToken,
          },
        }
      );
      if (response.data.message === "chat history has been cleared") {
        setMessages([]);
        setShowMenu(false);
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    setMenuMessage(message);
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  // Filter chatUsers by search query
  const filteredChatUsers = chatUsers.filter(({ user }) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Users List */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div
              className={`rounded-xl p-4 shadow-lg ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="relative mb-4">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                />
              </div>
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {filteredChatUsers.map(({ user, lastMessage }) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?._id === user._id
                        ? isDarkMode
                          ? "bg-gray-700"
                          : "bg-blue-50"
                        : isDarkMode
                        ? "hover:bg-gray-700/50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold">
                        {user.image ? (
                          <img
                            src={`/uploads/${user.image}`}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">
                          {lastMessage}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Chat Section */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div
              className={`rounded-xl p-4 shadow-lg h-[calc(100vh-100px)] flex flex-col ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              {selectedUser ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold">
                        {selectedUser.image ? (
                          <img
                            src={`/uploads/${selectedUser.image}`}
                            alt={selectedUser.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          selectedUser.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{selectedUser.name}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="flex-grow overflow-y-auto mb-4 space-y-4 p-2">
                    {messages.map((message, index) => {
                      const currentDate = new Date(
                        message.createdAt
                      ).toDateString();
                      const prevDate =
                        index > 0
                          ? new Date(
                              messages[index - 1].createdAt
                            ).toDateString()
                          : null;
                      const showDate = currentDate !== prevDate;

                      return (
                        <React.Fragment key={index}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm ${
                                  isDarkMode
                                    ? "bg-gray-800 text-gray-400"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {new Date(message.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                          )}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${
                              message.sender._id === userData._id
                                ? "justify-end"
                                : "justify-start"
                            }`}
                            onContextMenu={(e) => handleContextMenu(e, message)}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                message.sender._id === userData._id
                                  ? isDarkMode
                                    ? "bg-blue-600"
                                    : "bg-blue-500 text-white"
                                  : isDarkMode
                                  ? "bg-gray-700"
                                  : "bg-gray-100"
                              }`}
                            >
                              <p>{message.body}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.sender._id === userData._id
                                    ? "text-blue-100"
                                    : isDarkMode
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                {new Date(message.createdAt).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )}
                              </p>
                            </div>
                          </motion.div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className={`flex-grow p-3 rounded-lg transition-colors ${
                        isDarkMode
                          ? "bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border border-gray-200 text-gray-900 placeholder-gray-500"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                    />
                    <button
                      type="submit"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-[#554ef5] hover:bg-[#463fd4] text-white`}
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <p className="text-lg mb-2">
                      Select a user to start chatting
                    </p>
                    <p className="text-sm">
                      Choose someone from the list to begin your conversation
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Context Menu */}
      {showMenu && menuMessage && (
        <div
          className="fixed z-50"
          style={{
            left: menuPosition.x,
            top: menuPosition.y,
          }}
        >
          <div
            className={`rounded-lg shadow-lg ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            {menuMessage.sender._id === userData._id && (
              <button
                onClick={() => {
                  handleDeleteMessage(menuMessage._id);
                  setShowMenu(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 w-full transition-colors ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-red-400"
                    : "hover:bg-gray-100 text-red-600"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
            <button
              onClick={() => {
                handleClearChat();
                setShowMenu(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 w-full transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-700 text-red-400"
                  : "hover:bg-gray-100 text-red-600"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Chat</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Chat;
