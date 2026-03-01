import type { Metadata } from "next";
import { Suspense } from "react";
import Auth from "@/pages/Auth";

export const metadata: Metadata = {
  title: "Вход — StudyAssist",
  robots: { index: false, follow: false },
};

export default function AuthPage() {
  return (
    <Suspense>
      <Auth />
    </Suspense>
  );
}
