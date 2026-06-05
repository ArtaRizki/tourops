import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Search, BookOpen, Filter, ArrowRight, Users, Calendar, MapPin, CheckSquare, Square } from "lucide-react";
import { BOOKING_TYPES, BOOKING_STATUSES, FULFILLMENT_STATUSES } from "@/lib/constants";
import type { Booking, UserProfile } from "@shared/schema";
import * as XLSX from "xlsx";
import { Download, Zap } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { canWrite } from "@/lib/permissions";
import { PermissionBanner } from "@/components/permission-banner";

export default function AdminBookings() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: profile } = useQuery<UserProfile>({ queryKey: ["/api/user-profile"] });
  const role = profile?.role;
  const isWritable = canWrite(role, "bookings");

  const { data: bookings, isLoading } = useQuery<Booking[]>({ queryKey: ["/api/bookings"] });

  const filtered = bookings?.filter((b) => {
    const matchSearch = !search || b.bookingCode.toLowerCase().includes(search.toLowerCase()) || b.groupName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchType = typeFilter === "all" || b.bookingType === typeFilter;
    return matchSearch && matchStatus && matchType;
  }) || [];

  const bulkInitMutation = useMutation({
    mutationFn: (ids: string[]) => apiRequest("POST", "/api/bookings/bulk-initialize", { bookingIds: ids }),
    onSuccess: (res) => {
      res.json().then(data => {
        queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
        setSelectedIds([]);
        toast({ title: `Success`, description: `Initialized workflows for ${data.initialized} bookings.` });
      });
    },
    onError: () => toast({ title: "Bulk operation failed", variant: "destructive" }),
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(b => b.id));
    }
  };

  const handleExport = () => {
    const data = (selectedIds.length > 0 ? filtered.filter(b => selectedIds.includes(b.id)) : filtered).map((b) => ({
      "Booking Code": b.bookingCode,
      "Type": BOOKING_TYPES[b.bookingType],
      "Status": BOOKING_STATUSES[b.status || "submitted"],
      "Fulfillment": FULFILLMENT_STATUSES[b.fulfillmentStatus || "pending"],
      "Group Name": b.groupName || "-",
      "Party Size": b.partySizeExpected,
      "Total Price": b.totalPrice || 0,
      "Created At": b.createdAt ? new Date(b.createdAt).toLocaleString() : "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, `bookings_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {!isWritable && <PermissionBanner role={role} feature="bookings" featureLabel="Kelola Booking" />}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif">Bookings</h1>
          <p className="text-muted-foreground text-sm">Manage all customer bookings</p>
        </div>
        <div className="flex gap-2">
          {isWritable && selectedIds.length > 0 && (
            <Button 
              variant="default" 
              size="sm" 
              className="bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20"
              onClick={() => bulkInitMutation.mutate(selectedIds)}
              disabled={bulkInitMutation.isPending}
            >
              <Zap className="h-4 w-4 mr-2" />
              {bulkInitMutation.isPending ? "Initializing..." : `Initialize ${selectedIds.length} Workflows`}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            {selectedIds.length > 0 ? `Export Selected (${selectedIds.length})` : "Export All"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 mr-2">
          <Checkbox 
            checked={selectedIds.length === filtered.length && filtered.length > 0} 
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select All</span>
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by code or name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-bookings" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(BOOKING_STATUSES).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(BOOKING_TYPES).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold mb-1">No bookings found</h3>
            <p className="text-sm text-muted-foreground">Adjust your filters or wait for customer bookings</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((booking) => (
            <div key={booking.id} className="flex items-center gap-3">
              <Checkbox 
                checked={selectedIds.includes(booking.id)} 
                onCheckedChange={() => toggleSelect(booking.id)}
              />
              <Link href={`/admin/bookings/${booking.id}`} className="flex-1">
                <Card className={`hover-elevate cursor-pointer transition-all ${selectedIds.includes(booking.id) ? 'border-primary bg-primary/5 shadow-md' : ''}`} data-testid={`card-booking-${booking.id}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm">{booking.bookingCode}</span>
                          <Badge variant="outline" className="text-xs">{BOOKING_TYPES[booking.bookingType]}</Badge>
                        </div>
                        {booking.groupName && <p className="text-sm text-muted-foreground">{booking.groupName}</p>}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{booking.partySizeExpected} travelers</span>
                          {booking.createdAt && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(booking.createdAt).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={booking.status === "confirmed" ? "default" : booking.status === "cancelled" ? "destructive" : "secondary"}>
                          {BOOKING_STATUSES[booking.status || "submitted"]}
                        </Badge>
                        <Badge variant={booking.fulfillmentStatus === "completed" ? "default" : booking.fulfillmentStatus === "blocked" ? "destructive" : "outline"}>
                          {FULFILLMENT_STATUSES[booking.fulfillmentStatus || "pending"]}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
