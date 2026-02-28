"use client";
import { Suspense } from "react";
import OrderDetail from "@/pages/OrderDetail";

export default function OrderPage() {
  return (
    <Suspense>
      <OrderDetail />
    </Suspense>
  );
}
