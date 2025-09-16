"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth(); // Add a loading state to your AuthContext
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
      setIsRedirecting(true);
      router.replace("/login");
    }
  }, [isAuthenticated, pathname, router]);

  // Avoid rendering while auth is loading or redirecting
  if (isRedirecting) {
    return null;
  }

  return <>{children}</>;
}
