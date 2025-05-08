import { useState, useEffect, useContext, useRef } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Calendar,
  Send,
  X,
  MessageSquare,
  CheckCircle2,
  Clock,
  ListTodo,
  Search,
  Filter,
  Menu,
  ArrowUpDown,
  MoreVertical,
} from "lucide-react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { motion } from "framer-motion";
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

// Fallback responses for when the API is unavailable
const fallbackResponses = {
  taskAssistance: [
    "Hey! For this task, let's break it down into smaller steps. That way it'll be easier to manage and complete.",
    "Have you tried using the Pomodoro technique? Work for 25 minutes, then take a 5-minute break. It really helps stay focused!",
    "Hey, I suggest setting a clear deadline for this in your calendar. When do you think you can get it done?",
    "You know what helps? Think about how good it'll feel when you finish this task. What's your motivation?",
    "Want a tip? Share this task with someone you trust - having someone to check in with can really boost your progress!",
  ],
  generalChat: [
    "Hey there! Need help organizing your tasks? I'm here to chat and help out!",
    "What's on your mind? I can help you organize your work and make it feel more manageable.",
    "Need to add something to your task list? Or maybe you want to change up an existing task?",
    "Let's work on managing your time better together. What's your biggest challenge right now?",
    "Got any questions about handling your tasks? I'm all ears!",
  ],
};

const styles = {
  chatBubble:
    "margin: 10px 0; padding: 12px 16px; border-radius: 12px; max-width: 80%; white-space: pre-wrap; word-wrap: break-word;",
  userBubble:
    "margin-left: auto; background-color: var(--color-primary, #2563eb); color: white;",
  botBubble: "margin-right: auto; background-color: #f3f4f6; color: #1f2937;",
  loadingBubble:
    "margin-right: auto; background-color: #f3f4f6; color: #6b7280; font-style: italic;",
};

const AIChat = ({ theme }) => {
  const { userToken } = useContext(UserContext);
  const isDarkMode = theme === "dark";
  const [tasks, setTasks] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTaskLoading, setIsTaskLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [error, setError] = useState(null);
  const [newChatName, setNewChatName] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // Modal states
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isEditChatModalOpen, setIsEditChatModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  const [menuChatId, setMenuChatId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isClearChatModalOpen, setIsClearChatModalOpen] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    const savedChat = localStorage.getItem("chat_history");
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedChat) setChatHistory(JSON.parse(savedChat));
  }, []);

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem("tasks", JSON.stringify(newTasks));
  };

  const saveChatHistory = (newHistory) => {
    setChatHistory(newHistory);
    localStorage.setItem("chat_history", JSON.stringify(newHistory));
  };

  const clearConversation = async () => {
    if (confirm("Are you sure you want to clear the conversation?")) {
      try {
        console.log("Clearing conversation...");
        await axios.delete("http://localhost:3000/api/chatbot/history", {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        setChatHistory([]);
        setError(null);
      } catch (error) {
        console.error("Error clearing chat history:", error);
        setError("Failed to clear chat history. Please try again later.");
      }
    }
  };

  const openAddTaskModal = () => {
    setNewTaskName("");
    setNewTaskDate(new Date().toISOString().split("T")[0]);
    setIsAddTaskModalOpen(true);
  };

  const closeAddTaskModal = () => {
    setIsAddTaskModalOpen(false);
  };

  const openEditTaskModal = (task, index) => {
    setCurrentTask({ ...task, index });
    setNewTaskName(task.name);
    setNewTaskDate(task.date || "");
    setIsEditTaskModalOpen(true);
  };

  const closeEditTaskModal = () => {
    setIsEditTaskModalOpen(false);
  };

  const addTask = async () => {
    if (!newTaskName.trim()) return;

    const newTask = {
      name: newTaskName,
      date: newTaskDate,
      assistance: "Loading...",
      status: "TODO",
    };

    const newTasks = [...tasks, newTask];
    saveTasks(newTasks);
    closeAddTaskModal();

    // Set loading state for this specific task
    setIsTaskLoading((prev) => ({ ...prev, [newTaskName]: true }));

    const assistance = await fetchAssistance(newTaskName);
    newTask.assistance = assistance;
    saveTasks(newTasks);

    // Clear loading state
    setIsTaskLoading((prev) => ({ ...prev, [newTaskName]: false }));
  };

  const editTask = async () => {
    if (!newTaskName.trim() || !currentTask) return;

    const newTasks = [...tasks];
    newTasks[currentTask.index] = {
      ...newTasks[currentTask.index],
      name: newTaskName,
      date: newTaskDate,
      assistance: "Loading...",
    };

    saveTasks(newTasks);
    closeEditTaskModal();

    // Set loading state for this specific task
    setIsTaskLoading((prev) => ({ ...prev, [newTaskName]: true }));

    const assistance = await fetchAssistance(newTaskName);
    newTasks[currentTask.index].assistance = assistance;
    saveTasks(newTasks);

    // Clear loading state
    setIsTaskLoading((prev) => ({ ...prev, [newTaskName]: false }));
  };

  const deleteTask = (index) => {
    if (confirm("Are you sure you want to delete this task?")) {
      const newTasks = tasks.filter((_, i) => i !== index);
      saveTasks(newTasks);
    }
  };

  const getFallbackResponse = (type) => {
    const responses = fallbackResponses[type] || fallbackResponses.generalChat;
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const fetchAssistance = async (taskName) => {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer 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",
            "X-Title": "TaskMate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct",
            messages: [
              {
                role: "system",
                content:
                  "You are a friendly and helpful task management assistant. Respond in a conversational, natural way as if chatting with a friend. Keep responses concise but warm and encouraging. Use casual language and occasionally ask questions to engage the user.",
              },
              {
                role: "user",
                content: `Hey, I need some help with this task: ${taskName}. What's your advice?`,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "API response not OK:",
          response.status,
          response.statusText
        );
        return getFallbackResponse("taskAssistance");
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        console.error("No choices in API response:", data);
        return getFallbackResponse("taskAssistance");
      }

      return (
        data.choices[0].message.content || getFallbackResponse("taskAssistance")
      );
    } catch (e) {
      console.error("API call error:", e);
      return getFallbackResponse("taskAssistance");
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading || !currentChat) return;

    const newMessage = { role: "user", content: userInput };
    const newHistory = [...chatHistory, newMessage];
    setChatHistory(newHistory);
    setUserInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:3000/api/chatbot/${currentChat._id}/message`,
        {
          message: userInput,
          chatId: currentChat._id,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      setChatHistory(response.data.chatHistory);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
      setChatHistory(newHistory);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTasksByDate = (date) => {
    setSelectedDate(date);
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      if (!selectedDate) return true;
      return task.date === selectedDate;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;

      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "date":
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          return dateA - dateB;
        case "status":
          return (a.status || "").localeCompare(b.status || "");
        default:
          return 0;
      }
    });

  // Fetch all chats when component mounts
  useEffect(() => {
    if (userToken) {
      fetchChats();
    }
  }, [userToken]);

  const fetchChats = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/chatbot", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setChats(response.data.chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setError("Failed to fetch chats");
    }
  };

  const createNewChat = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/chatbot",
        {
          name: newChatName || "New Chat",
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (
        response.data &&
        response.data.message === "success" &&
        response.data.chatbot
      ) {
        const newChat = response.data.chatbot;
        setChats((prevChats) => [...prevChats, newChat]);
        setCurrentChat(newChat);
        setChatHistory(newChat.chatHistory || []);
        setIsNewChatModalOpen(false);
        setNewChatName("");
      } else {
        console.error("Invalid response format:", response.data);
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      setError(
        "Failed to create chat: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const updateChatName = async (chatId, newName) => {
    if (!chatId || !newName) {
      setError("Chat ID and new name are required");
      return;
    }

    try {
      const requestBody = { name: newName };
      console.log("Updating chat name with body:", requestBody);

      const response = await axios({
        method: "patch",
        url: `http://localhost:3000/api/chatbot/${chatId}`,
        data: requestBody,
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Update response:", response.data);

      if (
        response.data &&
        response.data.message === "success" &&
        response.data.chatbot
      ) {
        const updatedChat = response.data.chatbot;
        console.log("Updated chat:", updatedChat);

        setChats((prevChats) => {
          if (!Array.isArray(prevChats)) return [updatedChat];
          return prevChats.map((chat) =>
            chat && chat._id === chatId ? updatedChat : chat
          );
        });

        if (currentChat && currentChat._id === chatId) {
          setCurrentChat(updatedChat);
        }

        setIsEditChatModalOpen(false);
        setNewChatName("");
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error updating chat name:", error);
      setError(
        "Failed to update chat name: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await axios.delete(`http://localhost:3000/api/chatbot/${chatId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setChats(chats.filter((chat) => chat._id !== chatId));
      if (currentChat?._id === chatId) {
        setCurrentChat(null);
        setChatHistory([]);
      }
      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  const enterChat = async (chat) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/chatbot/${chat._id}/history`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      setCurrentChat(chat);
      setChatHistory(response.data.chatHistory || []);
    } catch (error) {
      console.error("Error entering chat:", error);
      setError("Failed to load chat history");
    }
  };

  const clearChatHistory = async () => {
    if (!currentChat) return;

    try {
      await axios.delete(
        `http://localhost:3000/api/chatbot/${currentChat._id}/history`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      setChatHistory([]);
      setIsClearChatModalOpen(false);
      toast.success("Chat history cleared successfully");
    } catch (error) {
      console.error("Error clearing chat history:", error);
      setError("Failed to clear chat history");
    }
  };

  // Helper to close menu on outside click
  useEffect(() => {
    const handleClick = () => setMenuChatId(null);
    if (menuChatId !== null) {
      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [menuChatId]);

  const handleDeleteClick = (chat) => {
    setChatToDelete(chat);
    setIsDeleteModalOpen(true);
    setMenuChatId(null);
  };

  const confirmDelete = async () => {
    if (chatToDelete) {
      await deleteChat(chatToDelete._id);
      setIsDeleteModalOpen(false);
      setChatToDelete(null);
    }
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
                    isDarkMode ? "bg-[#181943]" : "bg-[#edeaff]"
                  }`}
                >
                  <MessageSquare
                    className="w-5 h-5"
                    color={isDarkMode ? "#7b7dfa" : "#554ef5"}
                  />
                </div>
                <h1 className="text-2xl font-bold">AI Chat</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-[#554ef5] hover:bg-[#463fd4] text-white"
              >
                <Plus className="w-4 h-4" color="#fff" />
                <span className="font-medium">New Chat</span>
              </button>
              <button
                onClick={() => setIsClearChatModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 hover:border-gray-600"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200 hover:border-gray-300"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List */}
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
              <h3 className="text-lg font-semibold mb-4">Your Chats</h3>
              <div className="space-y-2">
                {Array.isArray(chats) &&
                  chats.map(
                    (chat) =>
                      chat &&
                      chat._id && (
                        <motion.div
                          key={chat._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`relative px-4 py-3 rounded-lg cursor-pointer mb-2 transition-colors duration-150 flex items-center justify-between
                            ${
                              currentChat?._id === chat._id
                                ? isDarkMode
                                  ? "bg-gray-700 text-white"
                                  : "bg-blue-50 text-blue-900"
                                : isDarkMode
                                ? "hover:bg-gray-700/50 text-gray-200"
                                : "hover:bg-gray-50 text-gray-900"
                            }
                          `}
                          onClick={() => enterChat(chat)}
                        >
                          <span className="truncate block flex-1">
                            {chat.name || "Unnamed Chat"}
                          </span>
                          <button
                            className={`ml-2 p-1 rounded-full transition-colors ${
                              isDarkMode
                                ? "hover:bg-gray-600"
                                : "hover:bg-gray-100"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              setMenuChatId(chat._id);
                              setMenuPosition({
                                x: rect.right + 4,
                                y: rect.top,
                              });
                            }}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {/* Context Menu */}
                          {menuChatId === chat._id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className={`absolute z-50 min-w-[140px] right-0 top-full mt-1 ${
                                isDarkMode ? "bg-gray-800" : "bg-white"
                              } rounded-lg shadow-lg border ${
                                isDarkMode
                                  ? "border-gray-700"
                                  : "border-gray-200"
                              }`}
                              style={{ left: "calc(100% + 8px)" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className={`flex items-center gap-2 px-4 py-2 w-full transition-colors ${
                                  isDarkMode
                                    ? "hover:bg-gray-700 text-gray-200"
                                    : "hover:bg-gray-100 text-gray-900"
                                }`}
                                onClick={() => {
                                  setMenuChatId(null);
                                  setCurrentChat(chat);
                                  setNewChatName(chat.name || "");
                                  setIsEditChatModalOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                                <span>Rename</span>
                              </button>
                              <button
                                className={`flex items-center gap-2 px-4 py-2 w-full transition-colors ${
                                  isDarkMode
                                    ? "hover:bg-gray-700 text-red-400"
                                    : "hover:bg-gray-100 text-red-600"
                                }`}
                                onClick={() => handleDeleteClick(chat)}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </motion.div>
                          )}
                        </motion.div>
                      )
                  )}
                {(!Array.isArray(chats) || chats.length === 0) && (
                  <div
                    className={`text-center py-8 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                    <p>No chats yet</p>
                    <p className="text-sm">Create a new chat to get started</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Chat Section */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div
              className={`rounded-xl p-4 shadow-lg h-[600px] flex flex-col ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4">
                {currentChat ? currentChat.name : "Select a chat"}
              </h3>

              <div className="flex-grow overflow-y-auto mb-4 chat-container p-2">
                {chatHistory.length === 0 ? (
                  <div
                    className={`flex flex-col items-center justify-center h-full ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <MessageSquare className="w-12 h-12 mb-4" />
                    <p className="text-center">
                      {currentChat
                        ? "Start a conversation"
                        : "Select a chat to start messaging"}
                    </p>
                  </div>
                ) : (
                  chatHistory.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`mb-3 flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role !== "user" && (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                            isDarkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        >
                          <MessageSquare className="w-5 h-5" />
                        </div>
                      )}
                      <div
                        className={`
                          px-4 py-2 rounded-2xl shadow
                          max-w-[80%] whitespace-pre-line break-words
                          ${
                            msg.role === "user"
                              ? isDarkMode
                                ? "bg-blue-600 text-white"
                                : "bg-blue-600 text-white"
                              : isDarkMode
                              ? "bg-gray-700 text-white"
                              : "bg-gray-100 text-gray-900"
                          }
                        `}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="flex gap-2 mt-auto">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your message..."
                  className={`flex-grow p-3 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border border-gray-200 text-gray-900 placeholder-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  disabled={isLoading || !currentChat}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-[#554ef5] hover:bg-[#463fd4] text-white`}
                  disabled={isLoading || !currentChat}
                >
                  {isLoading ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        title="Create New Chat"
        isDarkMode={isDarkMode}
      >
        <FormInput
          label="Chat Name"
          value={newChatName}
          onChange={(e) => setNewChatName(e.target.value)}
          placeholder="Enter chat name"
          isDarkMode={isDarkMode}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setIsNewChatModalOpen(false)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-gray-800 hover:bg-gray-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={createNewChat}
            className="px-4 py-2 rounded-lg transition-colors bg-[#554ef5] hover:bg-[#463fd4] text-white"
          >
            Create Chat
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isEditChatModalOpen}
        onClose={() => {
          setIsEditChatModalOpen(false);
          setNewChatName("");
        }}
        title="Edit Chat Name"
        isDarkMode={isDarkMode}
      >
        <FormInput
          label="New Chat Name"
          value={newChatName}
          onChange={(e) => setNewChatName(e.target.value)}
          placeholder="Enter new chat name"
          isDarkMode={isDarkMode}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => {
              setIsEditChatModalOpen(false);
              setNewChatName("");
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-gray-800 hover:bg-gray-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (currentChat?._id) {
                updateChatName(currentChat._id, newChatName);
              } else {
                setError("No chat selected");
                setIsEditChatModalOpen(false);
              }
            }}
            className={`px-4 py-2 rounded-lg transition-colors bg-[#554ef5] hover:bg-[#463fd4] text-white`}
            disabled={!newChatName.trim()}
          >
            Save Changes
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setChatToDelete(null);
        }}
        title="Delete Chat"
        isDarkMode={isDarkMode}
      >
        <div className="text-center">
          <Trash2 className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p
            className={`text-lg mb-6 ${
              isDarkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Are you sure you want to delete this chat?
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
              onClick={() => {
                setIsDeleteModalOpen(false);
                setChatToDelete(null);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Clear Chat Confirmation Modal */}
      <Modal
        isOpen={isClearChatModalOpen}
        onClose={() => setIsClearChatModalOpen(false)}
        title="Clear Chat History"
        isDarkMode={isDarkMode}
      >
        <div className="text-center">
          <Trash2 className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p
            className={`text-lg mb-6 ${
              isDarkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Are you sure you want to clear the chat history?
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
              onClick={() => setIsClearChatModalOpen(false)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={clearChatHistory}
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
    </motion.div>
  );
};

export default AIChat;
