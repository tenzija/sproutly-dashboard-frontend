"use client";

import React, { useState } from "react";
import { redirect } from "next/navigation";
import baseUrl from "@/lib/axios";
import { countries } from "@/utils/countries";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

interface LoginFormErrors {
  email?: string;
  password?: string;
  username?: string;
  country?: string;
  confirmPassword?: string;
  termsAndConditions?: string;
}

function Page() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    country: "",
    password: "",
    confirmPassword: "",
    termsAndConditions: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = "Please select a country";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms and conditions validation
    if (!formData.termsAndConditions) {
      newErrors.termsAndConditions = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;

    const finalValue =
      type === "checkbox" && target instanceof HTMLInputElement
        ? target.checked
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    if (errors[name as keyof LoginFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const data = {
      username: formData.username,
      email: formData.email.toLowerCase(),
      country: formData.country,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      termsAndConditionsAccepted: formData.termsAndConditions,
    };

    baseUrl
      .post("/auth/register", {
        ...data,
      })
      .then((response) => {
        window.location.replace("/login");
      })
      .catch((error) => {
        if (error.response?.data?.message) {
          setServerError(error.response.data.message);
        } else {
          setServerError("Something went wrong. Please try again.");
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4 relative  bg-[url('/images/bg2.png')] bg-cover bg-no-repeat ">
      {/* Background pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      ></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[24px] border border-white/10 bg-[rgba(44,44,44,0.8)] p-10 shadow-[0_25px_50px_rgba(0,0,0,0.3)] backdrop-blur-[20px] sm:rounded-[20px] sm:p-[30px_20px]">
          {/* Header */}
          <div className="text-center mb-2">
            <h2 className="text-3xl font-light text-white mb-1 tracking-wide">
              sproutly
            </h2>
            <p className="text-slate-400 text-sm">
              Sign up to your Sproutly account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider"
              >
                UserName
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter Your Username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  errors.username
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-600 focus:ring-teal-500"
                }`}
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider"
              >
                your Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="name@company.com"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-600 focus:ring-teal-500"
                }`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider"
              >
                country
              </label>
              <select
                value={formData.country}
                onChange={handleInputChange}
                id="country"
                name="country"
                className={`w-full p-3 rounded-lg text-sm  text-slate-300 bg-slate-700 border transition-all duration-200 focus:border-transparent appearance-none placeholder-slate-400 focus:outline-none ${
                  errors.country
                    ? "border-red-500 focus:ring-2 focus:ring-red-500"
                    : "border-slate-600 focus:border-carbifyOrange"
                }`}
              >
                <option key={"1"} value={""}>
                  -- select country --
                </option>
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="mt-1 text-sm text-red-400">{errors.country}</p>
              )}
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
                  className={`w-full px-4 py-3 pr-12 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-600 focus:ring-teal-500"
                  }`}
                  placeholder="Enter Your password"
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider"
              >
                confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-600 focus:ring-teal-500"
                  }`}
                  placeholder="Confim Your password"
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
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Form options */}
            <div className="flex items-start justify-between flex-col">
              <label className="flex items-center checkbox_label">
                <input
                  type="checkbox"
                  name="termsAndConditions"
                  checked={formData.termsAndConditions}
                  onChange={handleInputChange}
                  className={`w-4 h-4 text-teal-500 bg-slate-700 border rounded focus:ring-2 ${
                    errors.termsAndConditions
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-600 focus:ring-teal-500"
                  }`}
                  disabled={isSubmitting}
                />
                <span className="checkmark"></span>
                Accept Terms and Conditions
              </label>
              {errors.termsAndConditions && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.termsAndConditions}
                </p>
              )}
            </div>

            {serverError && (
              <div className="text-red-400 text-center text-sm p-0 m-0">
                {serverError}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-white text-slate-900 rounded-lg font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Register
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-slate-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="!text-white hover:underline hover:decoration-white transition duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
