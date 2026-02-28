"use client";
import { Suspense } from "react";
import Auth from "@/pages/Auth";

export default function AuthPage() {
  return (
    <Suspense>
      <Auth />
    </Suspense>
  );
}
