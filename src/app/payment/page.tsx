import type { Metadata } from "next";
import { Suspense } from "react";
import Payment from "@/pages/Payment";

export const metadata: Metadata = {
  title: "Оплата — StudyAssist",
  robots: { index: false, follow: false },
};

export default function PaymentPage() {
  return (
    <Suspense>
      <Payment />
    </Suspense>
  );
}
