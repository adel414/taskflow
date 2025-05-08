import { Outlet, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = () => {
  const { userToken } = useContext(UserContext);

  return userToken ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
