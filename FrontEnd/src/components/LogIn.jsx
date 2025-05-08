import React, { useContext, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { UserContext } from "../context/UserContext";
import { motion } from "framer-motion";

export default function LogIn() {
  let { setUserToken, setUserData } = useContext(UserContext);
  let navigate = useNavigate();
  const [error, seterror] = useState(null);
  const [isloading, setisLoading] = useState(false);

  async function logInSubmit(value) {
    setisLoading(true);
    seterror(null);
    try {
      const { data } = await axios.post(`/api/auth/signin`, {
        email: value.email,
        password: value.password,
      });

      if (data.message === "success") {
        // Store token and user data
        localStorage.setItem("userToken", data.token);
        setUserToken(data.token);
        setUserData(data.user);
        navigate("/");
      }
    } catch (err) {
      seterror(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
      console.error("Login error:", err);
    } finally {
      setisLoading(false);
    }
  }

  let validationSchema = Yup.object({
    email: Yup.string().email("Email is invalid").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: logInSubmit,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        {/* Left side - Image and Title */}
        <div className="flex-1 bg-gradient-to-br from-indigo-600 to-purple-600 p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold mb-6"
            >
              Welcome to TaskFlow
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg opacity-90"
            >
              Sign in to access your tasks and continue being productive with
              TaskFlow's cloud-based solution.
            </motion.p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 p-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Sign In to TaskFlow
            </h2>
            <p className="text-gray-600 mb-8">
              Enter your credentials to access your TaskFlow account
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.email}
                />
                {formik.errors.email && formik.touched.email && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {formik.errors.email}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.password}
                />
                {formik.errors.password && formik.touched.password && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {formik.errors.password}
                  </motion.p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isloading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 font-medium"
              >
                {isloading ? <PuffLoader color="white" size={24} /> : "Sign in"}
              </button>

              <p className="text-center text-gray-600 mt-6">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Create account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
