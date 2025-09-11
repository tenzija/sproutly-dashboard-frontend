// src/lib/axios.ts
import axios from "axios";

const baseUrl = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // if you need cookies / auth
});

export default baseUrl;
