"use client";
import { redirect } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    redirect("/swapportal");
  } else {
    redirect("/login");
  }
}
