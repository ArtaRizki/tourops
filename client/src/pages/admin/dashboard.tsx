import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  BookOpen, Users, AlertTriangle, CheckCircle, Clock,
  Calendar, ArrowRight, FileText, CreditCard, ClipboardList,
  Workflow, MapPin,
} from "lucide-react";
import { BOOKING_STATUSES, FULFILLMENT_STATUSES } from "@/lib/constants";
import type { Booking, TourDeparture, Tour, BookingWorkflow, Document as DocType, Payment } from "@shared/schema";

function StatCard({ title, value, icon: Icon, description, color }: {
  title: string; value: string | number; icon: any; description?: string; color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className={`w-10 h-10 rounded-md flex items-center justify-center ${color || "bg-primary/10"}`}>
            <Icon className={`h-5 w-5 ${color ? "text-white" : "text-primary"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: bookings, isLoading: loadingBookings } = useQuery<Booking[]>({ queryKey: ["/api/bookings"] });
  const { data: departures } = useQuery<TourDeparture[]>({ queryKey: ["/api/departures"] });
  const { data: tours } = useQuery<Tour[]>({ queryKey: ["/api/tours"] });
  const { data: workflows } = useQuery<BookingWorkflow[]>({ queryKey: ["/api/workflows"] });
  const { data: documents } = useQuery<DocType[]>({ queryKey: ["/api/documents"] });
  const { data: payments } = useQuery<Payment[]>({ queryKey: ["/api/payments"] });

  const totalBookings = bookings?.length || 0;
  const confirmedBookings = bookings?.filter((b) => b.status === "confirmed").length || 0;
  const pendingBookings = bookings?.filter((b) => b.status === "submitted").length || 0;
  const blockedFulfillments = bookings?.filter((b) => b.fulfillmentStatus === "blocked").length || 0;
  const upcomingDepartures = departures?.filter((d) => d.status === "open").length || 0;
  const pendingDocs = documents?.filter(d => d.status === "uploaded").length || 0;
  const blockedWorkflows = workflows?.filter(w => w.status === "blocked").length || 0;
  const pendingPayments = payments?.filter(p => p.status === "pending").length || 0;
  const totalTours = tours?.length || 0;

  const totalRevenue = payments?.filter(p => p.status === "paid").reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
  const pendingRevenue = payments?.filter(p => p.status === "pending").reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

  // Tour popularity
  const tourStats = tours?.map(t => {
    const bookingCount = bookings?.filter(b => b.tourId === t.id && b.status !== "cancelled").length || 0;
    const revenue = bookings?.filter(b => b.tourId === t.id && b.status === "confirmed").reduce((sum, b) => sum + (b.totalPrice || 0), 0) || 0;
    return { id: t.id, title: t.title, count: bookingCount, revenue };
  }).sort((a, b) => b.count - a.count).slice(0, 5) || [];

  if (loadingBookings) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif" data-testid="text-admin-title">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview of your tour operations</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/tours"><Button variant="outline" data-testid="button-manage-tours">Manage Tours</Button></Link>
          <Link href="/admin/bookings"><Button data-testid="button-view-bookings">View Bookings</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <StatCard title="Total Bookings" value={totalBookings} icon={BookOpen} />
        <StatCard title="Confirmed" value={confirmedBookings} icon={CheckCircle} color="bg-green-600" />
        <StatCard title="Revenue (Paid)" value={`$${totalRevenue.toLocaleString()}`} icon={CreditCard} color="bg-primary" />
        <StatCard title="Revenue (Pend)" value={`$${pendingRevenue.toLocaleString()}`} icon={DollarSign} color="bg-amber-500" />
        <StatCard title="Open Departures" value={upcomingDepartures} icon={Calendar} />
        <StatCard title="Tours" value={totalTours} icon={MapPin} />
        <StatCard title="Pending Review" value={pendingBookings} icon={Clock} color="bg-amber-500" />
        <StatCard title="Blocked" value={blockedFulfillments} icon={AlertTriangle} color={blockedFulfillments > 0 ? "bg-destructive" : "bg-muted"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Top Performing Tours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {tourStats.length > 0 ? tourStats.map((stat) => (
                <div key={stat.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-4 text-sm mb-1">
                    <span className="font-medium truncate max-w-[250px]">{stat.title}</span>
                    <span className="text-muted-foreground">{stat.count} bookings | ${stat.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${Math.min(100, (stat.count / (totalBookings || 1)) * 100)}%` }} 
                    />
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No tour data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Operations Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fulfillment Funnel</p>
              {[
                { label: "Pending", count: bookings?.filter((b) => b.fulfillmentStatus === "pending").length || 0, color: "bg-muted" },
                { label: "In Progress", count: bookings?.filter((b) => b.fulfillmentStatus === "in_progress").length || 0, color: "bg-primary" },
                { label: "Completed", count: bookings?.filter((b) => b.fulfillmentStatus === "completed").length || 0, color: "bg-green-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-bold">{item.count}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Needs Attention</p>
              {pendingDocs > 0 && (
                <Link href="/admin/documents">
                  <div className="flex items-center justify-between text-sm cursor-pointer hover:text-primary">
                    <span className="flex items-center gap-2"><ClipboardList className="h-3.5 w-3.5" /> Pending Documents</span>
                    <Badge variant="secondary" className="h-5">{pendingDocs}</Badge>
                  </div>
                </Link>
              )}
              {pendingPayments > 0 && (
                <Link href="/admin/payments">
                  <div className="flex items-center justify-between text-sm cursor-pointer hover:text-primary">
                    <span className="flex items-center gap-2"><CreditCard className="h-3.5 w-3.5" /> Pending Payments</span>
                    <Badge variant="secondary" className="h-5">{pendingPayments}</Badge>
                  </div>
                </Link>
              )}
              {blockedWorkflows > 0 && (
                <div className="flex items-center justify-between text-sm text-destructive font-medium">
                  <span className="flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5" /> Blocked Workflows</span>
                  <Badge variant="destructive" className="h-5">{blockedWorkflows}</Badge>
                </div>
              )}
              {pendingDocs === 0 && pendingPayments === 0 && blockedWorkflows === 0 && (
                <p className="text-xs text-muted-foreground italic text-center py-2">All clear! No pending actions.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <Link href="/admin/bookings">
            <Button variant="ghost" size="sm">View All Bookings <ArrowRight className="ml-1 h-3 w-3" /></Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {bookings && bookings.length > 0 ? (
            <div className="divide-y">
              {bookings.slice(0, 8).map((booking) => (
                <Link key={booking.id} href={`/admin/bookings/${booking.id}`}>
                  <div className="flex items-center justify-between gap-4 px-6 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${booking.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{booking.bookingCode}</p>
                        <p className="text-xs text-muted-foreground">{booking.groupName || BOOKING_TYPES[booking.bookingType]} | {booking.partySizeExpected} pax</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-medium">${(booking.totalPrice || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : ""}</p>
                      </div>
                      <Badge variant={booking.status === "confirmed" ? "default" : booking.status === "cancelled" ? "destructive" : "secondary"} className="text-[10px] px-2 py-0">
                        {BOOKING_STATUSES[booking.status || "submitted"]}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-sm text-muted-foreground">No recent booking activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
