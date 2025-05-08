import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(
    localStorage.getItem("userToken") || null
  );
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("userData")) || null
  );

  // Function to format user data with proper image URL
  const formatUserData = (user) => {
    if (!user) return null;
    return {
      ...user,
      image: user.image ? `/uploads/${user.image}` : null
    };
  };

  useEffect(() => {
    if (userToken) {
      localStorage.setItem("userToken", userToken);
      // Only fetch user data if we don't have it in localStorage
      if (!userData) {
        fetchUserData();
      }
    } else {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      setUserData(null);
    }
  }, [userToken]);

  // Save userData to localStorage whenever it changes
  useEffect(() => {
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
    }
  }, [userData]);

  const fetchUserData = async () => {
    try {
      const { data } = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (data.message === "success") {
        // Format user data before setting it
        const formattedUser = formatUserData(data.user);
        setUserData(formattedUser);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // If there's an error (like expired token), clear everything
      setUserToken(null);
      setUserData(null);
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
    }
  };

  // Function to refresh user data manually if needed
  const refreshUserData = () => {
    if (userToken) {
      fetchUserData();
    }
  };

  // Function to update user data (used when updating profile image)
  const updateUserData = (user) => {
    const formattedUser = formatUserData(user);
    setUserData(formattedUser);
  };

  return (
    <UserContext.Provider value={{ 
      userToken, 
      setUserToken, 
      userData, 
      setUserData: updateUserData, // Use the new updateUserData function
      refreshUserData 
    }}>
      {children}
    </UserContext.Provider>
  );
};
