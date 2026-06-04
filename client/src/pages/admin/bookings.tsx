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
import { Search, BookOpen, Filter, ArrowRight, Users, Calendar, MapPin, CheckSquare, Square, Plus, Trash2 } from "lucide-react";
import { BOOKING_TYPES, BOOKING_STATUSES, FULFILLMENT_STATUSES } from "@/lib/constants";
import type { Booking } from "@shared/schema";
import * as XLSX from "xlsx";
import { Download, Zap } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminBookings() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedTourId, setSelectedTourId] = useState("");
  const [selectedDepartureId, setSelectedDepartureId] = useState("");
  const [bookingType, setBookingType] = useState("join_public_group");
  const [groupName, setGroupName] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [notes, setNotes] = useState("");

  const { data: bookings, isLoading } = useQuery<Booking[]>({ queryKey: ["/api/bookings"] });

  const { data: profiles } = useQuery<any[]>({
    queryKey: ["/api/user-profiles"],
    enabled: isCreateOpen,
  });

  const { data: tours } = useQuery<any[]>({
    queryKey: ["/api/tours"],
    enabled: isCreateOpen,
  });

  const { data: departures } = useQuery<any[]>({
    queryKey: ["/api/tours", selectedTourId, "departures"],
    enabled: isCreateOpen && !!selectedTourId,
  });

  const customers = profiles?.filter(p => p.role === "customer") || [];

  const createBookingMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/bookings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setIsCreateOpen(false);
      toast({ title: "Success", description: "Booking created successfully!" });
      // Reset form fields
      setSelectedCustomerId("");
      setSelectedTourId("");
      setSelectedDepartureId("");
      setBookingType("join_public_group");
      setGroupName("");
      setPartySize(1);
      setNotes("");
    },
    onError: (err: any) => {
      toast({ title: "Error creating booking", description: err.message || "Something went wrong", variant: "destructive" });
    }
  });

  const handleCreateBooking = () => {
    if (!selectedCustomerId) {
      toast({ title: "Validation Error", description: "Please select a customer.", variant: "destructive" });
      return;
    }
    if (!selectedTourId) {
      toast({ title: "Validation Error", description: "Please select a tour.", variant: "destructive" });
      return;
    }
    if (!selectedDepartureId) {
      toast({ title: "Validation Error", description: "Please select a departure date.", variant: "destructive" });
      return;
    }

    const tour = tours?.find(t => t.id === selectedTourId);
    const dep = departures?.find(d => d.id === selectedDepartureId);
    const pricePerPerson = dep?.pricePerPerson || parseInt(tour?.basePrice || "0");
    const totalPrice = pricePerPerson * partySize;

    createBookingMutation.mutate({
      customerId: selectedCustomerId,
      tourId: selectedTourId,
      departureId: selectedDepartureId,
      bookingType,
      groupName: bookingType === "leader_group" ? groupName : undefined,
      partySizeExpected: partySize,
      notes,
      totalPrice,
    });
  };

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif">Bookings</h1>
          <p className="text-muted-foreground text-sm">Manage all customer bookings</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" data-testid="button-create-booking">
                <Plus className="h-4 w-4 mr-2" />
                Create Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Customer Selection */}
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger data-testid="select-create-customer">
                      <SelectValue placeholder="Select a Customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.userId} value={c.userId}>
                          {c.user?.firstName ? `${c.user.firstName} ${c.user.lastName || ""}` : c.user?.username} (@{c.user?.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tour Selection */}
                <div className="space-y-2">
                  <Label>Tour</Label>
                  <Select value={selectedTourId} onValueChange={(val) => { setSelectedTourId(val); setSelectedDepartureId(""); }}>
                    <SelectTrigger data-testid="select-create-tour">
                      <SelectValue placeholder="Select a Tour" />
                    </SelectTrigger>
                    <SelectContent>
                      {tours?.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Departure Selection */}
                <div className="space-y-2">
                  <Label>Departure Date</Label>
                  <Select 
                    value={selectedDepartureId} 
                    onValueChange={setSelectedDepartureId}
                    disabled={!selectedTourId}
                  >
                    <SelectTrigger data-testid="select-create-departure">
                      <SelectValue placeholder={selectedTourId ? "Select a Departure" : "Select a tour first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departures?.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.startDate} to {d.endDate} ({d.pricePerPerson ? `$${d.pricePerPerson}` : "Base price"} / person)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Booking Type */}
                <div className="space-y-2">
                  <Label>Booking Type</Label>
                  <Select value={bookingType} onValueChange={setBookingType}>
                    <SelectTrigger data-testid="select-create-booking-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="join_public_group">Join Public Group</SelectItem>
                      <SelectItem value="leader_group">Create Leader Group</SelectItem>
                      <SelectItem value="private_family">Private Family</SelectItem>
                      <SelectItem value="custom_leader">Custom Leader</SelectItem>
                      <SelectItem value="custom_family">Custom Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Group Name (Conditional) */}
                {bookingType === "leader_group" && (
                  <div className="space-y-2">
                    <Label>Group Name</Label>
                    <Input 
                      value={groupName} 
                      onChange={(e) => setGroupName(e.target.value)} 
                      placeholder="My Travel Group" 
                      data-testid="input-create-group-name"
                    />
                  </div>
                )}

                {/* Party Size */}
                <div className="space-y-2">
                  <Label>Party Size</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    value={partySize} 
                    onChange={(e) => setPartySize(parseInt(e.target.value) || 1)} 
                    data-testid="input-create-party-size"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Any special requests or details..." 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateBooking}
                  disabled={createBookingMutation.isPending}
                  data-testid="button-submit-create-booking"
                >
                  {createBookingMutation.isPending ? "Creating..." : "Create Booking"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {selectedIds.length > 0 && (
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => { e.preventDefault(); toast({ title: "Success", description: "Booking deleted", variant: "destructive" }); }} 
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
