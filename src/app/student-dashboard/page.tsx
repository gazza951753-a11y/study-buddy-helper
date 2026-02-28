"use client";
import { Suspense } from "react";
import StudentDashboard from "@/pages/StudentDashboard";

export default function StudentDashboardPage() {
  return (
    <Suspense>
      <StudentDashboard />
    </Suspense>
  );
}
