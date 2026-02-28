"use client";
import { Suspense } from "react";
import Payment from "@/pages/Payment";

export default function PaymentPage() {
  return (
    <Suspense>
      <Payment />
    </Suspense>
  );
}
