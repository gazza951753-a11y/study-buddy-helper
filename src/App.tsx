import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AuthorDashboard from "./pages/AuthorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OrderDetail from "./pages/OrderDetail";
import Payment from "./pages/Payment";
import EmailConfirmed from "./pages/EmailConfirmed";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          {/* Role-based dashboard router */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Student cabinet */}
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          {/* Author cabinet */}
          <Route path="/author-dashboard" element={<AuthorDashboard />} />
          {/* Admin panel */}
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Order detail page with chat */}
          <Route path="/order/:id" element={<OrderDetail />} />
          {/* Legacy payment page */}
          <Route path="/payment" element={<Payment />} />
          {/* Email confirmation landing */}
          <Route path="/email-confirmed" element={<EmailConfirmed />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
