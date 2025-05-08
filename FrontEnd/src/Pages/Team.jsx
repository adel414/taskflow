import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Users,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Edit,
  X,
  UserPlus,
  Search,
  Check,
} from "lucide-react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="rounded-xl p-6 w-full max-w-md bg-gray-900 border border-gray-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
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
}) => {
  const inputClasses = `w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors ${className}`;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClasses}
      />
    </div>
  );
};

// Reusable Form Select Component
const FormSelect = ({ label, value, onChange, options }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors pr-10"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
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

// Error Message Component
const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      {message}
    </div>
  );
};

// Team Member Card Component
const TeamMemberCard = ({ member, isDarkMode, index, onDelete }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dropdownRef = useRef(null);
  const { userData } = useContext(UserContext);
  const isAdmin = userData?.role === "admin";
  const isOwnProfile = userData?._id === member._id;
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handleDelete = async () => {
    try {
      await onDelete(member._id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting member:", error);
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
      className={`p-4 sm:p-6 rounded-xl transition-all ${
        isDarkMode ? "bg-gray-800/50" : "bg-white"
      } shadow-lg hover:shadow-xl border transition-shadow duration-300 ${
        isDarkMode ? "border-gray-700/50" : "border-gray-100"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
            {member.image ? (
              <img
                src={`/uploads/${member.image}`}
                alt={member.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              getInitials(member.name)
            )}
          </div>
          <div>
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {member.name}{" "}
              {isOwnProfile && <span className="text-white">(me)</span>}
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {member.role}
            </p>
          </div>
        </div>
        {isAdmin && !isOwnProfile && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className={`p-2 rounded-lg hover:bg-opacity-10 transition-colors ${
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <MoreVertical
                className={`w-5 h-5 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
            </button>
            {dropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
              >
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Delete Member
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Member"
      >
        <div className="text-gray-300 mb-6">
          Are you sure you want to delete {member.name}? This action cannot be
          undone.
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>

      <div className="mt-6 space-y-4">
        {(isAdmin || isOwnProfile) && (
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-opacity-5 hover:bg-opacity-10 transition-all duration-200 bg-gray-500">
            <Mail
              className={`w-4 h-4 ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}
            />
            <span
              className={`text-sm ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {member.email}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <span
            className={`text-sm px-4 py-1.5 rounded-full font-medium tracking-wide ${
              isDarkMode
                ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400"
                : "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600"
            }`}
          >
            {member.jobTitle}
          </span>
        </div>
        {member.phone && (
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-opacity-5 hover:bg-opacity-10 transition-all duration-200 bg-gray-500">
            <Phone
              className={`w-4 h-4 ${
                isDarkMode ? "text-green-400" : "text-green-600"
              }`}
            />
            <span
              className={`text-sm ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {member.phone}
            </span>
          </div>
        )}
        {member.location && (
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-opacity-5 hover:bg-opacity-10 transition-all duration-200 bg-gray-500">
            <MapPin
              className={`w-4 h-4 ${
                isDarkMode ? "text-purple-400" : "text-purple-600"
              }`}
            />
            <span
              className={`text-sm ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {member.location}
            </span>
          </div>
        )}
        {!isOwnProfile && (
          <div className="mt-4 flex justify-end">
            <button
              className={`flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-1.5 px-4 rounded-lg hover:from-indigo-600 hover:to-indigo-700 focus:ring-2 focus:ring-indigo-200/50 transition-all duration-300 transform hover:scale-[1.02] text-sm font-medium shadow-sm hover:shadow-md ${
                isDarkMode ? "shadow-indigo-500/20" : "shadow-indigo-500/10"
              }`}
              onClick={() => navigate("/chat", { state: { user: member } })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Send Message
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

function Team({ theme }) {
  const isDarkMode = theme === "dark";
  const { userData, userToken } = useContext(UserContext);
  const isAdmin = userData?.role === "admin";
  const [members, setMembers] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get("/api/user", {
          headers: {
            token: userToken,
          },
        });
        if (response.data.message === "success") {
          setMembers(response.data.users);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    if (userToken) {
      fetchMembers();
    }
  }, [userToken]);

  const handleDeleteMember = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/user/${id}`, {
        headers: {
          token: userToken,
        },
      });
      setMembers(members.filter((member) => member._id !== id));
      setSuccessMessage("Member deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting member:", error);
      setError("Failed to delete member");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Filter and sort members
  const filteredAndSortedMembers = members
    .filter((member) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (member.jobTitle && member.name.toLowerCase().includes(searchLower)) ||
        member.jobTitle.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower) ||
        member.role.toLowerCase().includes(searchLower) ||
        (member.phone && member.phone.toLowerCase().includes(searchLower)) ||
        (member.location && member.location.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "role":
          return a.role.localeCompare(b.role);
        default:
          return 0;
      }
    });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-1/4 left-0 right-0 flex items-center justify-center z-50"
        >
          <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-100 border border-emerald-200 backdrop-blur-sm">
            <Check className="w-5 h-5 text-emerald-600" />
            <span className="text-base text-emerald-600 font-medium">
              {successMessage}
            </span>
          </div>
        </motion.div>
      )}

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
                  <Users
                    className="w-5 h-5"
                    color={isDarkMode ? "#7b7dfa" : "#554ef5"}
                  />
                </div>
                <h1 className="text-2xl font-bold">Team</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`text-sm font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {filteredAndSortedMembers.length}{" "}
                {filteredAndSortedMembers.length === 1 ? "member" : "members"}{" "}
                total
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
              placeholder="Search members by name, job title, role..."
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
              <option value="name">Sort by Name</option>
              <option value="role">Sort by Role</option>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedMembers.map((member, index) => (
            <TeamMemberCard
              key={member._id}
              member={member}
              isDarkMode={isDarkMode}
              index={index}
              onDelete={handleDeleteMember}
            />
          ))}
          {filteredAndSortedMembers.length === 0 && (
            <div
              className={`col-span-full text-center py-12 rounded-xl ${
                isDarkMode ? "bg-gray-800/50" : "bg-white"
              } shadow-sm`}
            >
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {searchQuery
                  ? "No members found matching your search."
                  : "No members available."}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Team;
