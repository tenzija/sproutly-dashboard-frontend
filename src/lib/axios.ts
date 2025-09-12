// src/lib/axios.ts
import axios from "axios";

const baseUrl = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
});

export default baseUrl;
