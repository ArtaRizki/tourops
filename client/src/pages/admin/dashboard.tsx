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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Bookings" value={totalBookings} icon={BookOpen} />
        <StatCard title="Pending Review" value={pendingBookings} icon={Clock} color="bg-amber-500" />
        <StatCard title="Confirmed" value={confirmedBookings} icon={CheckCircle} color="bg-green-600" />
        <StatCard title="Open Departures" value={upcomingDepartures} icon={Calendar} />
        <StatCard title="Tours" value={totalTours} icon={MapPin} />
        <StatCard title="Blocked" value={blockedFulfillments} icon={AlertTriangle} color={blockedFulfillments > 0 ? "bg-destructive" : "bg-muted"} />
      </div>

      {(pendingDocs > 0 || blockedWorkflows > 0 || pendingPayments > 0) && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <p className="font-medium text-sm mb-2">Needs Attention</p>
            <div className="flex flex-wrap gap-4">
              {pendingDocs > 0 && (
                <Link href="/admin/documents">
                  <span className="text-sm text-amber-700 dark:text-amber-300 underline cursor-pointer">{pendingDocs} documents pending review</span>
                </Link>
              )}
              {blockedWorkflows > 0 && (
                <span className="text-sm text-destructive">{blockedWorkflows} workflows blocked</span>
              )}
              {pendingPayments > 0 && (
                <Link href="/admin/payments">
                  <span className="text-sm text-amber-700 dark:text-amber-300 underline cursor-pointer">{pendingPayments} payments pending</span>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
            <Link href="/admin/bookings">
              <Button variant="ghost" size="sm">View All <ArrowRight className="ml-1 h-3 w-3" /></Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {bookings && bookings.length > 0 ? (
              <div className="divide-y">
                {bookings.slice(0, 6).map((booking) => (
                  <Link key={booking.id} href={`/admin/bookings/${booking.id}`}>
                    <div className="flex items-center justify-between gap-4 px-5 py-3 hover-elevate cursor-pointer" data-testid={`booking-row-${booking.id}`}>
                      <div>
                        <p className="font-medium text-sm">{booking.bookingCode}</p>
                        <p className="text-xs text-muted-foreground">{booking.groupName || booking.bookingType} | {booking.partySizeExpected} pax</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                          {BOOKING_STATUSES[booking.status || "submitted"]}
                        </Badge>
                        <Badge variant={booking.fulfillmentStatus === "completed" ? "default" : booking.fulfillmentStatus === "blocked" ? "destructive" : "outline"}>
                          {FULFILLMENT_STATUSES[booking.fulfillmentStatus || "pending"]}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No bookings yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
            <CardTitle className="text-base">Fulfillment Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Pending", count: bookings?.filter((b) => b.fulfillmentStatus === "pending").length || 0, color: "bg-muted" },
                { label: "In Progress", count: bookings?.filter((b) => b.fulfillmentStatus === "in_progress").length || 0, color: "bg-primary" },
                { label: "Blocked", count: blockedFulfillments, color: "bg-destructive" },
                { label: "Completed", count: bookings?.filter((b) => b.fulfillmentStatus === "completed").length || 0, color: "bg-green-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="font-semibold text-sm">{item.count}</span>
                </div>
              ))}
            </div>
            {blockedFulfillments > 0 && (
              <div className="mt-4 p-3 rounded-md bg-destructive/10 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                <p className="text-xs text-destructive">{blockedFulfillments} booking(s) have blocked fulfillment workflows</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
