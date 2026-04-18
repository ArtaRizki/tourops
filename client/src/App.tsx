import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import type { UserProfile } from "@shared/schema";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import StaffLoginPage from "@/pages/staff-login";
import AdminLoginPage from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminTours from "@/pages/admin/tours";
import AdminDepartures from "@/pages/admin/departures";
import AdminBookings from "@/pages/admin/bookings";
import AdminBookingDetail from "@/pages/admin/booking-detail";
import AdminWorkflowDetail from "@/pages/admin/workflow-detail";
import AdminAssignments from "@/pages/admin/assignments";
import AdminDocuments from "@/pages/admin/documents";
import AdminMessages from "@/pages/admin/messages";
import AdminPayments from "@/pages/admin/payments";
import AdminUsers from "@/pages/admin/users";
import AdminMasterData from "@/pages/admin/master-data";
import AdminTransport from "@/pages/admin/transport";
import AdminRateCards from "@/pages/admin/rate-cards";
import BrowseTours from "@/pages/customer/browse-tours";
import TourDetail from "@/pages/customer/tour-detail";
import MyBookings from "@/pages/customer/my-bookings";
import CustomerBookingDetail from "@/pages/customer/booking-detail";
import LeaderDashboard from "@/pages/customer/leader-dashboard";
import LeaderPayments from "@/pages/customer/leader-payments";
import TourBrochure from "@/pages/customer/tour-brochure";
import CreateBrochure from "@/pages/customer/create-brochure";
import ManagePassengers from "@/pages/customer/manage-passengers";
import SupplierDashboard from "@/pages/supplier/dashboard";
import OpsDashboard from "@/pages/ops/dashboard";
import TransportDashboard from "@/pages/ops/transport-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

function AuthenticatedLayout() {
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/user-profile"],
  });

  const role = profile?.role;

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 p-2 border-b sticky top-0 z-50 bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/tours" component={AdminTours} />
              <Route path="/admin/departures" component={AdminDepartures} />
              <Route path="/admin/bookings" component={AdminBookings} />
              <Route path="/admin/bookings/:id" component={AdminBookingDetail} />
              <Route path="/admin/workflows/:id" component={AdminWorkflowDetail} />
              <Route path="/admin/assignments" component={AdminAssignments} />
              <Route path="/admin/documents" component={AdminDocuments} />
              <Route path="/admin/messages" component={AdminMessages} />
              <Route path="/admin/payments" component={AdminPayments} />
              <Route path="/admin/master-data" component={AdminMasterData} />
              <Route path="/admin/transport" component={AdminTransport} />
              <Route path="/admin/rate-cards" component={AdminRateCards} />
              <Route path="/admin/users" component={AdminUsers} />

              <Route path="/tours" component={BrowseTours} />
              <Route path="/create-brochure" component={CreateBrochure} />
              <Route path="/tours/:id/brochure" component={TourBrochure} />
              <Route path="/tours/:id" component={TourDetail} />
              <Route path="/leader-dashboard" component={LeaderDashboard} />
              <Route path="/leader-payments" component={LeaderPayments} />
              <Route path="/manage-passengers" component={ManagePassengers} />
              <Route path="/my-bookings" component={MyBookings} />
              <Route path="/my-bookings/:id" component={CustomerBookingDetail} />
              <Route path="/my-documents" component={MyBookings} />
              <Route path="/my-messages" component={MyBookings} />

              <Route path="/supplier" component={SupplierDashboard} />
              <Route path="/supplier/bookings" component={SupplierDashboard} />
              <Route path="/supplier/quotes" component={SupplierDashboard} />
              <Route path="/supplier/messages" component={SupplierDashboard} />

              <Route path="/ops" component={OpsDashboard} />
              <Route path="/ops/transport" component={TransportDashboard} />
              <Route path="/ops/tasks" component={OpsDashboard} />
              <Route path="/ops/fulfillment" component={OpsDashboard} />
              <Route path="/ops/messages" component={OpsDashboard} />

              <Route path="/admin/login">
                {() => <Redirect to="/admin" />}
              </Route>
              <Route path="/staff/login">
                {() => {
                  if (role === "airline_supplier") return <Redirect to="/supplier" />;
                  if (role === "country_manager" || role === "hotel_manager" || role === "transport_manager" || role === "guide_manager" || role === "sights_manager") return <Redirect to="/ops" />;
                  return <Redirect to="/admin" />;
                }}
              </Route>

              <Route path="/">
                {() => {
                  if (role === "admin") return <Redirect to="/admin" />;
                  if (role === "airline_supplier") return <Redirect to="/supplier" />;
                  if (role === "country_manager" || role === "hotel_manager" || role === "transport_manager" || role === "guide_manager" || role === "sights_manager") return <Redirect to="/ops" />;
                  return <Redirect to="/tours" />;
                }}
              </Route>

              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/staff/login" component={StaffLoginPage} />
        <Route path="/admin/login" component={AdminLoginPage} />
        <Route path="/tours/:id" component={() => (
          <ThemeProvider>
            <TourDetail />
          </ThemeProvider>
        )} />
        <Route component={LandingPage} />
      </Switch>
    );
  }

  return <AuthenticatedLayout />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
