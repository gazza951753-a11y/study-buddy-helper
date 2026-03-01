import type { Metadata } from "next";
import EmailConfirmed from "@/pages/EmailConfirmed";

export const metadata: Metadata = {
  title: "Email подтверждён — StudyAssist",
  robots: { index: false, follow: false },
};

export default function EmailConfirmedPage() {
  return <EmailConfirmed />;
}
