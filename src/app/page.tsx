"use client";
import { redirect } from "next/navigation";
import { useAuth } from "../context/AuthContext";


export default function Home() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    redirect("/swapportal");
  } else {
    redirect("/login");
  }
}
