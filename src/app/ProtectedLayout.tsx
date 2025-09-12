"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
const PUBLIC_ROUTES = ["/login", "/signup","/forgot-password", "/reset-password"]; 
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
     if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace("/login");
    }
  }, [isAuthenticated, pathname, router]);

  // While checking auth or redirecting, render nothing
 if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
    return null;
  }
  return <>{children}</>;
}
