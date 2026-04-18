import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@shared/schema";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  MapPin,
  Calendar,
  BookOpen,
  Users,
  ClipboardList,
  Workflow,
  FileText,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Globe,
  Plane,
  Hotel,
  Bus,
  UserCheck,
  Ticket,
  Printer,
  DollarSign,
} from "lucide-react";

const adminNav = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Tours", url: "/admin/tours", icon: MapPin },
  { title: "Departures", url: "/admin/departures", icon: Calendar },
  { title: "Bookings", url: "/admin/bookings", icon: BookOpen },
  { title: "Assignments", url: "/admin/assignments", icon: ClipboardList },
  { title: "Transportation", url: "/admin/transport", icon: Bus },
  { title: "Rate Cards", url: "/admin/rate-cards", icon: DollarSign },
  { title: "Documents", url: "/admin/documents", icon: FileText },
  { title: "Messages", url: "/admin/messages", icon: MessageSquare },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
  { title: "Master Data", url: "/admin/master-data", icon: Globe },
  { title: "Users & Roles", url: "/admin/users", icon: Users },
];

const customerNav = [
  { title: "Browse Tours", url: "/tours", icon: Globe },
  { title: "My Bookings", url: "/my-bookings", icon: BookOpen },
  { title: "Leader Dashboard", url: "/leader-dashboard", icon: Users },
  { title: "Manage Passengers", url: "/manage-passengers", icon: UserCheck },
  { title: "Payment Report", url: "/leader-payments", icon: CreditCard },
  { title: "Create Brochure", url: "/create-brochure", icon: Printer },
  { title: "My Documents", url: "/my-documents", icon: FileText },
  { title: "Messages", url: "/my-messages", icon: MessageSquare },
];

const supplierNav = [
  { title: "Dashboard", url: "/supplier", icon: LayoutDashboard },
  { title: "Assigned Bookings", url: "/supplier/bookings", icon: BookOpen },
  { title: "Quotes", url: "/supplier/quotes", icon: FileText },
  { title: "Messages", url: "/supplier/messages", icon: MessageSquare },
];

const opsNav = [
  { title: "Dashboard", url: "/ops", icon: LayoutDashboard },
  { title: "Assigned Tasks", url: "/ops/tasks", icon: ClipboardList },
  { title: "Fulfillment", url: "/ops/fulfillment", icon: Workflow },
  { title: "Messages", url: "/ops/messages", icon: MessageSquare },
];

const transportManagerNav = [
  { title: "Dashboard", url: "/ops", icon: LayoutDashboard },
  { title: "Transport Mgmt", url: "/ops/transport", icon: Bus },
  { title: "Assigned Tasks", url: "/ops/tasks", icon: ClipboardList },
  { title: "Messages", url: "/ops/messages", icon: MessageSquare },
];

function getNavItems(role: string | undefined) {
  switch (role) {
    case "admin": return adminNav;
    case "airline_supplier": return supplierNav;
    case "transport_manager": return transportManagerNav;
    case "country_manager":
    case "hotel_manager":
    case "guide_manager":
    case "sights_manager":
      return opsNav;
    default: return customerNav;
  }
}

function getRoleIcon(role: string | undefined) {
  switch (role) {
    case "admin": return Settings;
    case "airline_supplier": return Plane;
    case "country_manager": return Globe;
    case "hotel_manager": return Hotel;
    case "transport_manager": return Bus;
    case "guide_manager": return UserCheck;
    case "sights_manager": return Ticket;
    default: return Users;
  }
}

function getRoleLabel(role: string | undefined) {
  const labels: Record<string, string> = {
    admin: "HQ Admin",
    customer: "Customer",
    airline_supplier: "Airline Supplier",
    country_manager: "Country Manager",
    hotel_manager: "Hotel Manager",
    transport_manager: "Transport Manager",
    guide_manager: "Guide Manager",
    sights_manager: "Sights Manager",
  };
  return labels[role || "customer"] || "Customer";
}

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/user-profile"],
    enabled: !!user,
  });

  const role = profile?.role;
  const navItems = getNavItems(role);
  const RoleIcon = getRoleIcon(role);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">TourOps</span>
        </div>
        <div className="flex items-center gap-2 mt-3 px-1">
          <RoleIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">{getRoleLabel(role)}</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url || (item.url !== "/" && location.startsWith(item.url) && item.url.length > 1)}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="text-xs">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => logout()}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
