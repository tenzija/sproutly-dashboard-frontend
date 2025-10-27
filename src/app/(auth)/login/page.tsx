"use client";

import React, { useState } from "react";
// import { useAuth } from "../../../context/AuthContext";
import baseUrl from "@/lib/axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  rememberMe?: string;
}

function Page() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof LoginFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    if (serverError) setServerError(null);
  };
  // const { login } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    baseUrl
      .post("/auth/login", {
        ...formData,
      })
      .then(async (response) => {
        toast.success("Login successful!", { position: "top-right" });
        // await for the message to be shown before redirecting
        await new Promise((resolve) => setTimeout(resolve, 2500));
        // login(response.data);
        window.location.replace("/swapportal");
      })
      .catch((error) => {
        // console.log(error.response?.data?.msg);

        if (error.response?.data?.msg) {
          setServerError(error.response.data.msg);
        } else {
          setServerError("Something went wrong. Please try again.");
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4 relative  bg-[url('/images/bg2.png')] bg-cover bg-no-repeat ">
      {/* Background pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      ></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-[rgba(44,44,44,0.8)] p-40 shadow-[0_25px_50px_rgba(0,0,0,0.3)] backdrop-blur-[20px] sm:rounded-[20px] sm:p-[30px_20px]">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-normal text-white mb-1">Welcome back</h1>

            <div className="flex justify-center">
              <Image
                src="/images/logo-cropped.png"
                alt="Sproutly Logo"
                width={170}
                height={170}
              />
            </div>

            <p className="text-slate-400 text-sm">Sign in to your Sproutly account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@company.com"
                className={`w-full px-4 py-3   border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${formData.email.length > 0 ? "bg-slate-700" : ""}`}
                disabled={isSubmitting}
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••••••••••"
                  className={`w-full px-4 py-3 pr-12 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${formData.password.length > 0 ? "bg-slate-700" : ""}`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            {/* Form options */}

            {serverError && (
              <div className="text-red-400 text-center text-sm pb-4 m-0">
                {serverError}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-white text-slate-900 rounded-lg font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="flex items-center justify-center mt-6">
            <Link
              href="/forgot-password"
              className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </div>
          <div className="text-center mt-2">
            <p className="text-slate-400 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-white! hover:underline hover:decoration-white transition duration-200"
              >
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
