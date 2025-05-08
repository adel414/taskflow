import React, { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../context/UserContext";
import axiosInstance from "../utils/axios";
import { toast } from "react-toastify";
import {
  Box,
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  IconButton,
  Avatar,
  Stack,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Badge,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PictureAsPdfIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Image as ImageIcon,
  Download as DownloadIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from "@mui/icons-material";
import PinIcon from "../components/PinIcon";

const getFileIcon = (mimeType) => {
  if (mimeType?.includes("pdf"))
    return {
      icon: <PictureAsPdfIcon sx={{ color: "#e53935" }} />,
      color: "#e53935",
    };
  if (mimeType?.includes("image"))
    return { icon: <ImageIcon sx={{ color: "#1976d2" }} />, color: "#1976d2" };
  return {
    icon: <InsertDriveFileIcon sx={{ color: "#757575" }} />,
    color: "#757575",
  };
};

const getFileSize = (size) => {
  if (!size) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const GroupChat = ({ theme }) => {
  const { userData } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isMessageAllowed, setIsMessageAllowed] = useState(true);
  const messagesEndRef = useRef(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuMessage, setMenuMessage] = useState(null);
  const [currentPinnedIndex, setCurrentPinnedIndex] = useState(0);
  const messageRefs = useRef({});

  // Function to scroll to a specific message
  const scrollToMessage = (messageId) => {
    if (messageRefs.current[messageId]) {
      messageRefs.current[messageId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Add highlight effect
      const messageEl = messageRefs.current[messageId];
      if (messageEl) {
        messageEl.style.transition = "background-color 0.5s";
        messageEl.style.backgroundColor =
          theme === "dark" ? "#333333" : "#e3f2fd";
        setTimeout(() => {
          messageEl.style.backgroundColor = "transparent";
        }, 1500);
      }
    }
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuMessage(null);
  };

  // Function to handle cycling through pinned messages
  const handlePinnedHeaderClick = () => {
    const pinnedMessages = messages.filter((m) => m.isPinned);
    if (pinnedMessages.length > 0) {
      const nextIndex = (currentPinnedIndex + 1) % pinnedMessages.length;
      setCurrentPinnedIndex(nextIndex);
      scrollToMessage(pinnedMessages[nextIndex]._id);
    }
  };

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axiosInstance.get("/api/groupChat");
      if (
        response.data &&
        response.data.status === "success" &&
        response.data.data
      ) {
        const messagesData = response.data.data;
        if (Array.isArray(messagesData)) {
          setMessages(messagesData);
        } else if (
          messagesData.messages &&
          Array.isArray(messagesData.messages)
        ) {
          setMessages(messagesData.messages);
        }
        // Update message permission state
        if (messagesData.isMessageAllowed !== undefined) {
          setIsMessageAllowed(messagesData.isMessageAllowed);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to fetch messages");
    }
  };

  const handleToggleMessagePermission = async () => {
    try {
      const response = await axiosInstance.patch(
        "/api/groupChat/toggle-messages"
      );
      if (response.data && response.data.status === "success") {
        setIsMessageAllowed(response.data.data.isMessageAllowed);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to toggle message permissions");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) return;

    const formData = new FormData();
    formData.append("content", newMessage);
    if (attachment) {
      formData.append("attachment", attachment);
    }

    try {
      await axiosInstance.post("/api/groupChat/messages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setNewMessage("");
      setAttachment(null);
      fetchMessages();
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axiosInstance.delete(`/api/groupChat/messages/${messageId}`);
      fetchMessages();
      toast.success("Message deleted");
      handleMenuClose();
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const handlePinMessage = async (messageId) => {
    try {
      console.log("Attempting to pin/unpin message:", messageId);
      const response = await axiosInstance.patch(
        `/api/groupChat/messages/${messageId}/pin`
      );

      if (response.data && response.data.status === "success") {
        console.log("Pin response:", response.data);
        await fetchMessages(); // Wait for messages to refresh
        toast.success(
          response.data.message || "Message pinned/unpinned successfully"
        );
        handleMenuClose();
      } else {
        throw new Error("Failed to pin message: Unexpected response format");
      }
    } catch (error) {
      console.error("Error pinning message:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      toast.error(error.response?.data?.message || "Failed to pin message");
    }
  };

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: "100vh" }}>
      <Paper
        elevation={3}
        sx={{
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
          color: theme === "dark" ? "#ffffff" : "#000000",
          position: "relative",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow:
            theme === "dark"
              ? "0 8px 32px rgba(0, 0, 0, 0.4)"
              : "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Chat Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: theme === "dark" ? "#1e293b" : "#dbdbdb",
            backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
            backdropFilter: "blur(8px)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="h5"
              sx={{
                color: theme === "dark" ? "#ffffff" : "#000000",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontFamily: "Instagram Sans, sans-serif",
              }}
            >
              Group Chat
            </Typography>
            {!isMessageAllowed && userData.role !== "admin" && (
              <Typography
                variant="subtitle2"
                sx={{
                  color: theme === "dark" ? "#ff6b6b" : "#f44336",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontWeight: 500,
                }}
              >
                <SendIcon sx={{ fontSize: 16 }} />
                Only admins can send messages
              </Typography>
            )}
          </Box>
          {userData.role === "admin" && (
            <Tooltip
              title={
                isMessageAllowed ? "Disable messaging" : "Enable messaging"
              }
            >
              <IconButton
                onClick={handleToggleMessagePermission}
                sx={{
                  color: isMessageAllowed ? "#4caf50" : "#f44336",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                {isMessageAllowed ? (
                  <SendIcon />
                ) : (
                  <SendIcon sx={{ opacity: 0.5 }} />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Pinned Messages Section */}
        {messages.some((m) => m.isPinned) && (
          <Fade in={true}>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: theme === "dark" ? "#1e293b" : "#dbdbdb",
                backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                position: "sticky",
                top: "64px",
                zIndex: 9,
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: theme === "dark" ? "#0f172a" : "#fafafa",
                  },
                }}
                onClick={handlePinnedHeaderClick}
              >
                <PinIcon
                  sx={{
                    color: "#0095f6",
                    width: 20,
                    height: 20,
                    animation: "pulse 2s infinite",
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: theme === "dark" ? "#a8a8a8" : "#8e8e8e",
                    fontWeight: 500,
                  }}
                >
                  {messages.filter((m) => m.isPinned).length > 0 && (
                    <>
                      {currentPinnedIndex + 1} of{" "}
                      {messages.filter((m) => m.isPinned).length} pinned message
                      {messages.filter((m) => m.isPinned).length !== 1
                        ? "s"
                        : ""}
                    </>
                  )}
                </Typography>
              </Box>
            </Box>
          </Fade>
        )}

        {/* Messages Area */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            p: 2,
            backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
            backgroundImage:
              theme === "dark"
                ? "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)"
                : "linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {messages.map((message) => {
            const isMe = message.sender._id === userData._id;
            const isPinned = message.isPinned;
            return (
              <Fade in={true} key={message._id}>
                <Box
                  ref={(el) => (messageRefs.current[message._id] = el)}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    alignItems: "flex-start",
                    mb: 2,
                    position: "relative",
                    transition: "transform 0.2s ease",
                    minHeight: "60px",
                    "&:hover": {
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {!isMe && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        minHeight: "60px",
                      }}
                    >
                      <Avatar
                        src={
                          message.sender.image
                            ? `/uploads/${message.sender.image}`
                            : undefined
                        }
                        alt={message.sender.name}
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "#0095f6",
                          fontSize: "1rem",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                          transition: "transform 0.2s ease",
                          "&:hover": {
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        {!message.sender.image && message.sender.name[0]}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: theme === "dark" ? "#a8a8a8" : "#8e8e8e",
                            mb: 0.5,
                            fontWeight: 600,
                          }}
                        >
                          {message.sender.name}
                        </Typography>
                        <Box
                          sx={{
                            position: "relative",
                            maxWidth: "400px",
                            minWidth: "200px",
                            minHeight: "40px",
                            px: 2,
                            py: 1.5,
                            borderRadius: "18px",
                            backgroundColor:
                              theme === "dark" ? "#223a5f" : "#fafafa",
                            color: theme === "dark" ? "#eaf6ff" : "#000000",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.2s ease",
                            display: "flex",
                            flexDirection: "column",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            },
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              wordBreak: "break-word",
                              flex: 1,
                              minHeight: "24px",
                            }}
                          >
                            {message.content}
                          </Typography>
                          {message.attachment && message.attachment.url && (
                            <Box
                              sx={{
                                mt: 1,
                                p: 1,
                                borderRadius: "12px",
                                backgroundColor:
                                  theme === "dark" ? "#1e293b" : "#f0f0f0",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  backgroundColor:
                                    theme === "dark" ? "#2d3748" : "#e8e8e8",
                                },
                              }}
                            >
                              {message.attachment.mimeType?.includes(
                                "image"
                              ) ? (
                                <img
                                  src={`/${message.attachment.url.replace(
                                    /\\/g,
                                    "/"
                                  )}`}
                                  alt={message.attachment.filename}
                                  style={{
                                    maxWidth: "100%",
                                    borderRadius: "8px",
                                    transition: "transform 0.2s ease",
                                  }}
                                  onMouseOver={(e) => {
                                    e.target.style.transform = "scale(1.02)";
                                  }}
                                  onMouseOut={(e) => {
                                    e.target.style.transform = "scale(1)";
                                  }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  {
                                    getFileIcon(message.attachment.mimeType)
                                      .icon
                                  }
                                  <Box sx={{ flex: 1 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 500 }}
                                    >
                                      {message.attachment.filename}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#8e8e8e" }}
                                    >
                                      {getFileSize(message.attachment.size)}
                                    </Typography>
                                  </Box>
                                  <Tooltip title="Download">
                                    <IconButton
                                      href={`/${message.attachment.url.replace(
                                        /\\/g,
                                        "/"
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      size="small"
                                      sx={{
                                        color: "#0095f6",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                          transform: "scale(1.1)",
                                          backgroundColor:
                                            "rgba(0, 149, 246, 0.1)",
                                        },
                                      }}
                                      download={message.attachment.filename}
                                    >
                                      <DownloadIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              )}
                            </Box>
                          )}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              mt: 1,
                              gap: 1,
                            }}
                          >
                            {isPinned && (
                              <PinIcon
                                sx={{
                                  color: "#0095f6",
                                  width: 16,
                                  height: 16,
                                  animation: "pulse 2s infinite",
                                }}
                              />
                            )}
                            <Typography
                              variant="caption"
                              sx={{
                                color: theme === "dark" ? "#a8a8a8" : "#8e8e8e",
                              }}
                            >
                              {message.createdAt
                                ? new Date(
                                    message.createdAt
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {isMe && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        minHeight: "60px",
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          maxWidth: "400px",
                          minWidth: "200px",
                          minHeight: "40px",
                          px: 2,
                          py: 1.5,
                          borderRadius: "18px",
                          background:
                            "linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d)",
                          color: "#ffffff",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.2s ease",
                          display: "flex",
                          flexDirection: "column",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                          },
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            wordBreak: "break-word",
                            flex: 1,
                            minHeight: "24px",
                          }}
                        >
                          {message.content}
                        </Typography>
                        {message.attachment && message.attachment.url && (
                          <Box
                            sx={{
                              mt: 1,
                              p: 1,
                              borderRadius: "12px",
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.15)",
                              },
                            }}
                          >
                            {message.attachment.mimeType?.includes("image") ? (
                              <img
                                src={`/${message.attachment.url.replace(
                                  /\\/g,
                                  "/"
                                )}`}
                                alt={message.attachment.filename}
                                style={{
                                  maxWidth: "100%",
                                  borderRadius: "8px",
                                  transition: "transform 0.2s ease",
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.transform = "scale(1.02)";
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.transform = "scale(1)";
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {getFileIcon(message.attachment.mimeType).icon}
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    {message.attachment.filename}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                                  >
                                    {getFileSize(message.attachment.size)}
                                  </Typography>
                                </Box>
                                <Tooltip title="Download">
                                  <IconButton
                                    href={`/${message.attachment.url.replace(
                                      /\\/g,
                                      "/"
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    size="small"
                                    sx={{
                                      color: "#ffffff",
                                      transition: "all 0.2s ease",
                                      "&:hover": {
                                        transform: "scale(1.1)",
                                        backgroundColor:
                                          "rgba(255, 255, 255, 0.1)",
                                      },
                                    }}
                                    download={message.attachment.filename}
                                  >
                                    <DownloadIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )}
                          </Box>
                        )}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            mt: 1,
                            gap: 1,
                          }}
                        >
                          {isPinned && (
                            <PinIcon
                              sx={{
                                color: "#ffffff",
                                width: 16,
                                height: 16,
                                animation: "pulse 2s infinite",
                              }}
                            />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(255, 255, 255, 0.7)",
                            }}
                          >
                            {message.createdAt
                              ? new Date(message.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : ""}
                          </Typography>
                        </Box>
                      </Box>
                      <Avatar
                        src={
                          message.sender.image
                            ? `/uploads/${message.sender.image}`
                            : undefined
                        }
                        alt={message.sender.name}
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "#0095f6",
                          fontSize: "1rem",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                          transition: "transform 0.2s ease",
                          "&:hover": {
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        {!message.sender.image && message.sender.name[0]}
                      </Avatar>
                    </Box>
                  )}

                  <Tooltip title="Message options">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setMenuAnchorEl(e.currentTarget);
                        setMenuMessage(message);
                      }}
                      sx={{
                        color: theme === "dark" ? "#a8a8a8" : "#8e8e8e",
                        p: 0.5,
                        ml: 1,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor:
                            theme === "dark" ? "#0f172a" : "#fafafa",
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Fade>
            );
          })}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: theme === "dark" ? "#1e293b" : "#dbdbdb",
            backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
            position: "sticky",
            bottom: 0,
            zIndex: 10,
            backdropFilter: "blur(8px)",
          }}
        >
          <form onSubmit={handleSendMessage}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                fullWidth
                variant="outlined"
                placeholder={
                  !isMessageAllowed && userData.role !== "admin"
                    ? "Messaging is disabled"
                    : isMessageAllowed
                    ? "Type a message..."
                    : "Type a message (Admin only)"
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!isMessageAllowed && userData.role !== "admin"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme === "dark" ? "#0f172a" : "#fafafa",
                    color: theme === "dark" ? "#e2e8f0" : "#000000",
                    borderRadius: "24px",
                    transition: "all 0.2s ease",
                    "& fieldset": {
                      borderColor: theme === "dark" ? "#1e293b" : "#dbdbdb",
                      transition: "all 0.2s ease",
                    },
                    "&:hover fieldset": {
                      borderColor: theme === "dark" ? "#334155" : "#c7c7c7",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#0095f6",
                      borderWidth: "2px",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: theme === "dark" ? "#0f172a" : "#f5f5f5",
                      color: theme === "dark" ? "#64748b" : "#9e9e9e",
                    },
                  },
                }}
              />
              <input
                type="file"
                id="attachment"
                style={{ display: "none" }}
                onChange={handleFileChange}
                disabled={!isMessageAllowed && userData.role !== "admin"}
              />
              <Tooltip
                title={
                  !isMessageAllowed && userData.role !== "admin"
                    ? "Messaging is disabled"
                    : isMessageAllowed
                    ? "Add attachment"
                    : "Add attachment (Admin only)"
                }
              >
                <label htmlFor="attachment">
                  <IconButton
                    component="span"
                    disabled={!isMessageAllowed && userData.role !== "admin"}
                    sx={{
                      color: "#0095f6",
                      backgroundColor: theme === "dark" ? "#0f172a" : "#fafafa",
                      minWidth: 48,
                      minHeight: 48,
                      width: 48,
                      height: 48,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor:
                          theme === "dark" ? "#1e293b" : "#f0f0f0",
                        transform: "scale(1.1)",
                      },
                      "&.Mui-disabled": {
                        color: theme === "dark" ? "#64748b" : "#8e8e8e",
                      },
                    }}
                  >
                    <AttachFileIcon />
                  </IconButton>
                </label>
              </Tooltip>
              <Tooltip
                title={
                  !isMessageAllowed && userData.role !== "admin"
                    ? "Messaging is disabled"
                    : isMessageAllowed
                    ? "Send message"
                    : "Send message (Admin only)"
                }
              >
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={
                    (!newMessage.trim() && !attachment) ||
                    (!isMessageAllowed && userData.role !== "admin")
                  }
                  sx={{
                    borderRadius: "24px",
                    px: 3,
                    minWidth: 48,
                    minHeight: 48,
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      background:
                        "linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d)",
                      opacity: 0.9,
                    },
                    "&:disabled": {
                      background: theme === "dark" ? "#0f172a" : "#fafafa",
                      color: theme === "dark" ? "#64748b" : "#8e8e8e",
                    },
                  }}
                >
                  <SendIcon />
                </Button>
              </Tooltip>
            </Stack>
          </form>
        </Box>
      </Paper>

      {/* Message Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => {
          setMenuAnchorEl(null);
          setMenuMessage(null);
        }}
      >
        <MenuItem
          onClick={() => {
            navigator.clipboard.writeText(menuMessage?.content || "");
            setMenuAnchorEl(null);
            setMenuMessage(null);
            toast.success("Copied!");
          }}
        >
          Copy
        </MenuItem>
        {menuMessage &&
          (menuMessage.sender._id === userData._id ||
            userData.role === "admin") && (
            <MenuItem
              onClick={() => {
                handleDeleteMessage(menuMessage._id);
                setMenuAnchorEl(null);
                setMenuMessage(null);
              }}
            >
              Delete
            </MenuItem>
          )}
        {userData.role === "admin" && (
          <MenuItem
            onClick={() => {
              handlePinMessage(menuMessage._id);
              setMenuAnchorEl(null);
              setMenuMessage(null);
            }}
          >
            {menuMessage?.isPinned ? "Unpin" : "Pin"}
          </MenuItem>
        )}
      </Menu>
    </Container>
  );
};

export default GroupChat;
