import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import OrganizerLayout from "./components/organizer/OrganizerLayout";
import StallOrganizerLayout from "./components/stall-organizer/StallOrganizerLayout";
import Dashboard from "./components/admin/Dashboard";
import UsersVerification from "./components/admin/UsersVerification";
import EventVerification from "./components/admin/EventVerification";
import SalesTracking from "./components/admin/SalesTracking";
import EventForm from "./components/organizer/EventForm";
import EventList from "./components/organizer/EventList";
import OrganizerDashboard from "./components/organizer/OrganizerDashboard";
import BookingsManagement from "./components/organizer/BookingsManagement";
import SalesOverview from "./components/organizer/SalesOverview";
import StallEventForm from "./components/stall-organizer/StallEventForm";
import UserDashboard from "./components/user/UserDashboard";
import Index from "./pages/Index";
import EventDetails from "./pages/EventDetails";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import PaymentFailed from "./pages/PaymentFailed";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Redirect from "./pages/Redirect";
import StallOrganizerDashboard from "./components/stall-organizer/StallOrganizerDashboard";
import StallEventsList from "./components/stall-organizer/StallEventsList";
import StallManagersList from "./components/stall-organizer/StallManagersList";
import RevenueOverview from "./components/stall-organizer/RevenueOverview";
import StallManagerLayout from "./components/stall-manager/StallManagerLayout";
import StallManagerDashboard from "./components/stall-manager/StallManagerDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/payment/:bookingId" element={<Payment />} />
              <Route path="/payment/failed/:bookingId" element={<PaymentFailed />} />
              <Route path="/confirmation/:bookingId" element={<Confirmation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/redirect" element={<Redirect />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UsersVerification />} />
              <Route path="events" element={<EventVerification />} />
              <Route path="sales" element={<SalesTracking />} />
              <Route path="settings" element={<div>Settings Content</div>} />
              <Route path="notifications" element={<div>Notifications Content</div>} />
              <Route path="profile" element={<div>Profile Content</div>} />
            </Route>
            <Route path="/organizer" element={<OrganizerLayout />}>
              <Route index element={<OrganizerDashboard />} />
              <Route path="events" element={<EventList />} />
              <Route path="events/new" element={<EventForm />} />
              <Route path="bookings" element={<BookingsManagement />} />
              <Route path="sales" element={<SalesOverview />} />
            </Route>
            <Route path="/stall-organizer" element={<StallOrganizerLayout />}>
              <Route index element={<StallOrganizerDashboard />} />
              <Route path="events" element={<StallEventsList />} />
              <Route path="events/new" element={<StallEventForm />} />
              <Route path="managers" element={<StallManagersList />} />
              <Route path="revenue" element={<RevenueOverview />} />
            </Route>
            <Route path="/stall-manager" element={<StallManagerLayout />}>
              <Route index element={<StallManagerDashboard />} />
              <Route path="stalls" element={<div>My Stalls</div>} />
              <Route path="bookings" element={<div>Bookings</div>} />
              <Route path="earnings" element={<div>Earnings</div>} />
              <Route path="settings" element={<div>Settings</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
