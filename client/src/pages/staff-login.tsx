import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Globe,
  Shield,
  Plane,
  Hotel,
  Bus,
  UserCheck,
  Ticket,
  MapPin,
} from "lucide-react";
import { Link } from "wouter";

const staffRoles = [
  {
    icon: Shield,
    title: "Admin",
    desc: "Full platform management, tours, bookings, users, and operations",
  },
  {
    icon: MapPin,
    title: "Country Manager",
    desc: "Manage operations for assigned countries and coordinate local services",
  },
  {
    icon: Plane,
    title: "Airline Ticketing Agency",
    desc: "Process airline bookings, issue tickets, and manage PNRs",
  },
  {
    icon: Hotel,
    title: "Hotel Manager",
    desc: "Handle hotel reservations, confirmations, and room assignments",
  },
  {
    icon: Bus,
    title: "Transportation Company",
    desc: "Manage ground transport, vehicle assignments, and schedules",
  },
  {
    icon: UserCheck,
    title: "Guide Manager",
    desc: "Assign tour guides, manage availability, and coordinate tours",
  },
  {
    icon: Ticket,
    title: "Sights Manager",
    desc: "Manage attraction tickets, museum bookings, and venue coordination",
  },
];

export default function StaffLoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
                <Globe className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">TourOps</span>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/">
                <Button variant="outline" data-testid="button-back-to-main">
                  Customer Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif mb-3" data-testid="text-staff-title">
              Staff & Operations Portal
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Secure login for administrators, suppliers, and operations managers.
              Sign in to access your dashboard and manage tour operations.
            </p>
          </div>

          <div className="max-w-md mx-auto mb-12">
            <LoginForm
              portal="staff"
              title="Staff Sign In"
              subtitle="Use your staff credentials to access the operations portal."
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-center mb-6">Supported Roles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffRoles.map((role) => (
                <Card key={role.title} data-testid={`card-role-${role.title.toLowerCase().replace(/\s/g, '-')}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <role.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">{role.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{role.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Are you a traveler or tour leader?{" "}
              <Link href="/">
                <span className="text-primary underline cursor-pointer" data-testid="link-customer-login">
                  Go to the main site
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="py-8 border-t bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <span className="font-bold">TourOps</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; 2026 TourOps. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
