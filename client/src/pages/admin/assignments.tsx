import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Search, ClipboardList, Plane, Hotel, Bus, UserCheck, Ticket, ArrowRight } from "lucide-react";
import { SERVICE_TYPES } from "@/lib/constants";
import type { BookingAssignment, Booking, UserProfile } from "@shared/schema";
import { useState } from "react";

const serviceIcons: Record<string, any> = {
  airline: Plane, hotel: Hotel, transport: Bus, guide: UserCheck, sights: Ticket,
};

export default function AdminAssignments() {
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: assignments, isLoading } = useQuery<BookingAssignment[]>({ queryKey: ["/api/assignments"] });
  const { data: bookings } = useQuery<Booking[]>({ queryKey: ["/api/bookings"] });
  const { data: users } = useQuery<UserProfile[]>({ queryKey: ["/api/user-profiles"] });

  const filtered = (assignments || []).filter((a) => {
    const matchService = serviceFilter === "all" || a.serviceType === serviceFilter;
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const booking = bookings?.find(b => b.id === a.bookingId);
    const matchSearch = !search || 
      (booking?.bookingCode || "").toLowerCase().includes(search.toLowerCase()) || 
      (a.countryCode || "").toLowerCase().includes(search.toLowerCase());
    return matchService && matchStatus && matchSearch;
  });

  const unassigned = (assignments || []).filter(a => !a.assignedUserId || a.status === "unassigned");

  if (isLoading) return <div className="p-6"><Skeleton className="h-8 w-48 mb-4" />{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 mb-2" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif" data-testid="text-assignments-title">Assignments</h1>
        <p className="text-muted-foreground text-sm">Global view of all service assignments</p>
      </div>

      {unassigned.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{unassigned.length} assignment(s) need attention</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by booking code or country..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-assignments" />
        </div>
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-[170px]" data-testid="select-service-filter"><SelectValue placeholder="Service" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            {Object.entries(SERVICE_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]" data-testid="select-assignment-status-filter"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="reassigned">Reassigned</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-16"><ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-4" /><h3 className="font-semibold mb-1">No assignments found</h3><p className="text-sm text-muted-foreground">Assignments are created from booking detail pages</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => {
            const booking = bookings?.find(b => b.id === a.bookingId);
            const user = users?.find(u => u.userId === a.assignedUserId);
            const Icon = serviceIcons[a.serviceType] || ClipboardList;
            return (
              <Link key={a.id} href={`/admin/bookings/${a.bookingId}`}>
                <Card className="hover-elevate cursor-pointer" data-testid={`card-assignment-${a.id}`}>
                  <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-sm">{SERVICE_TYPES[a.serviceType]}</p>
                          {a.countryCode && <Badge variant="outline" className="text-xs">{a.countryCode}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {booking?.bookingCode || "Unknown"} | {user?.companyName || user?.userId || "Unassigned"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={a.status === "assigned" ? "default" : a.status === "unassigned" ? "destructive" : "secondary"}>
                        {a.status || "assigned"}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
