"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/app/layout/Layout";
import Dashboard from "@/app/dashboard/Dashboard";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect based on user role
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // If user is a student, redirect to student dashboard
      if (user.role === "student") {
        router.push("/student/dashboard");
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}
