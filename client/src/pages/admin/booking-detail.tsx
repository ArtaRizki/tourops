import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Users, FileText, Workflow, MessageSquare, CreditCard,
  ClipboardList, ArrowLeft, CheckCircle, Clock, AlertTriangle,
  Send, Plane, Hotel, Bus, UserCheck, Ticket, Plus, Pencil,
  Trash2, Eye, ShieldCheck, ShieldX, Info, DollarSign,
  ExternalLink, Download
} from "lucide-react";
import { Link } from "wouter";
import { BOOKING_TYPES, BOOKING_STATUSES, FULFILLMENT_STATUSES, SERVICE_TYPES, WORKFLOW_STATUSES, SERVICE_WORKFLOW_STEPS } from "@/lib/constants";
import type { Booking, Traveler, BookingAssignment, BookingWorkflow, WorkflowStep, Document, Message, Payment, UserProfile } from "@shared/schema";
import { useState } from "react";
import { DocumentPreview } from "@/components/DocumentPreview";

const serviceIcons: Record<string, any> = {
  airline: Plane, hotel: Hotel, transport: Bus, guide: UserCheck, sights: Ticket,
};

const DOC_TYPES: Record<string, string> = {
  passport: "Passport",
  id_doc: "ID Document",
  visa: "Visa",
  eticket: "E-Ticket",
  pnr: "PNR",
  hotel_confirm: "Hotel Confirmation",
  voucher: "Voucher",
  transport_confirm: "Transport Confirmation",
  guide_confirm: "Guide Confirmation",
  sight_ticket: "Sight Ticket",
  quote: "Quote",
  receipt: "Receipt",
  other: "Other",
};

const PAYMENT_METHODS: Record<string, string> = {
  bank_transfer: "Bank Transfer",
  card: "Card",
  cash: "Cash",
  other: "Other",
};

const PAYMENT_STATUSES: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export default function AdminBookingDetail() {
  const [, params] = useRoute("/admin/bookings/:id");
  const { toast } = useToast();
  const bookingId = params?.id;

  const [internalNotes, setInternalNotes] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [msgVisibility, setMsgVisibility] = useState("customer_visible");
  const [assignService, setAssignService] = useState("");
  const [assignCountry, setAssignCountry] = useState("");
  const [assignUser, setAssignUser] = useState("");

  const [showAddTraveler, setShowAddTraveler] = useState(false);
  const [editTravelerId, setEditTravelerId] = useState<string | null>(null);
  const [travelerForm, setTravelerForm] = useState({
    firstName: "", lastName: "", dob: "", nationality: "", passportNumber: "",
    passportExpiry: "", gender: "", specialNeeds: "",
  });

  const [docForm, setDocForm] = useState({ docType: "", fileName: "", fileUrl: "", travelerId: "", workflowStepId: "" });
  const [showAddDoc, setShowAddDoc] = useState(false);

  const [paymentForm, setPaymentForm] = useState({ amount: "", currency: "USD", method: "bank_transfer", notes: "" });
  const [showAddPayment, setShowAddPayment] = useState(false);

  const { data: booking, isLoading } = useQuery<Booking>({ queryKey: ["/api/bookings", bookingId] });
  const { data: travelers } = useQuery<Traveler[]>({ queryKey: ["/api/bookings", bookingId, "travelers"] });
  const { data: assignments } = useQuery<BookingAssignment[]>({ queryKey: ["/api/bookings", bookingId, "assignments"] });
  const { data: workflows } = useQuery<BookingWorkflow[]>({ queryKey: ["/api/bookings", bookingId, "workflows"] });
  const { data: documents } = useQuery<Document[]>({ queryKey: ["/api/bookings", bookingId, "documents"] });
  const { data: messages } = useQuery<Message[]>({ queryKey: ["/api/bookings", bookingId, "messages"] });
  const { data: payments } = useQuery<Payment[]>({ queryKey: ["/api/bookings", bookingId, "payments"] });
  const { data: allUsers } = useQuery<UserProfile[]>({ queryKey: ["/api/user-profiles"] });

  const updateBooking = useMutation({
    mutationFn: (data: Record<string, any>) => apiRequest("PATCH", `/api/bookings/${bookingId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Booking updated" });
    },
  });

  const createTraveler = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/bookings/${bookingId}/travelers`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId, "travelers"] });
      toast({ title: "Traveler added" });
      setShowAddTraveler(false);
      resetTravelerForm();
    },
  });

  const updateTraveler = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PATCH", `/api/travelers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId, "travelers"] });
      toast({ title: "Traveler updated" });
      setEditTravelerId(null);
      resetTravelerForm();
    },
  });

  const deleteTraveler = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/travelers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId, "travelers"] });
      toast({ title: "Traveler removed" });
    },
  });

  const createAssignment = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/bookings/${bookingId}/assignments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId, "assignments"] });
      toast({ title: "Assignment created" });
    },
  });

  const deleteAssignment = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/assignments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId, "assignments"] });
      toast({ title: "Assignment removed" });
    },
  });

  const createDocument = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/bookings/${bookingId}/documents`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId, "documents"] });
      toast({ title: "Document added" });
      setShowAddDoc(false);
      setDocForm({ docType: "", fileName: "", fileUrl: "", travelerId: "", workflowStepId: "" });
    },
  });

  const updateDocument = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiRequest("PATCH", `/api/documents/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId, "documents"] });
      toast({ title: "Document status updated" });
    },
  });

  const sendMessage = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/bookings/${bookingId}/messages`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId, "messages"] });
      toast({ title: "Message sent" });
    },
  });

  const createPayment = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/bookings/${bookingId}/payments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId, "payments"] });
      toast({ title: "Payment added" });
      setShowAddPayment(false);
      setPaymentForm({ amount: "", currency: "USD", method: "bank_transfer", notes: "" });
    },
  });

  const updatePayment = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiRequest("PATCH", `/api/payments/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId, "payments"] });
      toast({ title: "Payment status updated" });
    },
  });

  function resetTravelerForm() {
    setTravelerForm({
      firstName: "", lastName: "", dob: "", nationality: "", passportNumber: "",
      passportExpiry: "", gender: "", specialNeeds: "",
    });
  }

  function openEditTraveler(t: Traveler) {
    setEditTravelerId(t.id);
    setTravelerForm({
      firstName: t.firstName || "",
      lastName: t.lastName || "",
      dob: t.dob || "",
      nationality: t.nationality || "",
      passportNumber: t.passportNumber || "",
      passportExpiry: t.passportExpiry || "",
      gender: t.gender || "",
      specialNeeds: t.specialNeeds || "",
    });
  }

  function getUserName(userId: string | null) {
    if (!userId || !allUsers) return "Unassigned";
    const u = allUsers.find((x) => x.userId === userId);
    return u?.companyName || u?.userId || userId;
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!booking) {
    return <div className="p-6"><p className="text-muted-foreground">Booking not found</p></div>;
  }

  const missingDocsCount = travelers?.filter((t) => {
    const travelerDocs = documents?.filter((d) => d.travelerId === t.id);
    return !travelerDocs || travelerDocs.length === 0;
  }).length || 0;

  const blockedWorkflowsCount = workflows?.filter((wf) => wf.status === "blocked").length || 0;

  const notesValue = internalNotes !== null ? internalNotes : (booking.internalNotes || "");

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/bookings">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
          {booking.groupName && <p className="text-muted-foreground text-sm" data-testid="text-group-name">{booking.groupName}</p>}
        </div>
        <div className="flex gap-2 no-print">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="h-8 shadow-sm">
            <Printer className="h-4 w-4 mr-2" />
            Print Summary
          </Button>
        </div>
      </div>

      {/* Printable Header */}
      <div className="hidden print:block border-b-2 border-[#116bb0] pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Globe className="h-10 w-10 text-[#116bb0]" />
            <div>
              <h1 className="text-3xl font-bold font-serif text-[#116bb0]">TourOps Booking Summary</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans">Official Operational Document</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-2xl">{booking.bookingCode}</p>
            <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={booking.status || "submitted"} onValueChange={(v) => updateBooking.mutate({ status: v })}>
            <SelectTrigger className="w-[140px]" data-testid="select-booking-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(BOOKING_STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={booking.fulfillmentStatus || "pending"} onValueChange={(v) => updateBooking.mutate({ fulfillmentStatus: v })}>
            <SelectTrigger className="w-[160px]" data-testid="select-fulfillment-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(FULFILLMENT_STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Party Size</p>
            <p className="text-xl font-bold" data-testid="text-party-size">{booking.partySizeExpected}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge variant={booking.status === "confirmed" ? "default" : "secondary"} data-testid="badge-status">
              {BOOKING_STATUSES[booking.status || "submitted"]}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Fulfillment</p>
            <Badge variant={booking.fulfillmentStatus === "completed" ? "default" : "outline"} data-testid="badge-fulfillment">
              {FULFILLMENT_STATUSES[booking.fulfillmentStatus || "pending"]}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Join Code</p>
            <p className="font-mono text-sm" data-testid="text-join-code">{booking.joinCode || "N/A"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="summary" data-testid="tab-summary"><Info className="h-3.5 w-3.5 mr-1" />Summary</TabsTrigger>
          <TabsTrigger value="travelers" data-testid="tab-travelers"><Users className="h-3.5 w-3.5 mr-1" />Travelers</TabsTrigger>
          <TabsTrigger value="assignments" data-testid="tab-assignments"><ClipboardList className="h-3.5 w-3.5 mr-1" />Assignments</TabsTrigger>
          <TabsTrigger value="fulfillment" data-testid="tab-fulfillment"><Workflow className="h-3.5 w-3.5 mr-1" />Fulfillment</TabsTrigger>
          <TabsTrigger value="documents" data-testid="tab-documents"><FileText className="h-3.5 w-3.5 mr-1" />Documents</TabsTrigger>
          <TabsTrigger value="messages" data-testid="tab-messages"><MessageSquare className="h-3.5 w-3.5 mr-1" />Messages</TabsTrigger>
          <TabsTrigger value="payments" data-testid="tab-payments"><CreditCard className="h-3.5 w-3.5 mr-1" />Payments</TabsTrigger>
        </TabsList>

        {/* TAB A: Summary */}
        <TabsContent value="summary" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Booking Info</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Booking Code</p>
                    <p className="font-medium" data-testid="summary-booking-code">{booking.bookingCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-medium" data-testid="summary-booking-type">{BOOKING_TYPES[booking.bookingType]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-medium" data-testid="summary-status">{BOOKING_STATUSES[booking.status || "submitted"]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fulfillment</p>
                    <p className="font-medium" data-testid="summary-fulfillment">{FULFILLMENT_STATUSES[booking.fulfillmentStatus || "pending"]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tour ID</p>
                    <p className="font-medium font-mono text-xs" data-testid="summary-tour-id">{booking.tourId || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Departure ID</p>
                    <p className="font-medium font-mono text-xs" data-testid="summary-departure-id">{booking.departureId || "N/A"}</p>
                  </div>
                  {booking.leaderUserId && (
                    <div>
                      <p className="text-xs text-muted-foreground">Leader User</p>
                      <p className="font-medium" data-testid="summary-leader">{getUserName(booking.leaderUserId)}</p>
                    </div>
                  )}
                  {booking.joinCode && (
                    <div>
                      <p className="text-xs text-muted-foreground">Join Code</p>
                      <p className="font-medium font-mono" data-testid="summary-join-code">{booking.joinCode}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Internal Notes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={notesValue}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  className="min-h-[120px]"
                  data-testid="input-internal-notes"
                />
                <Button
                  onClick={() => {
                    updateBooking.mutate({ internalNotes: notesValue });
                    setInternalNotes(null);
                  }}
                  disabled={updateBooking.isPending}
                  data-testid="button-save-notes"
                >Save Notes</Button>
              </CardContent>
            </Card>
          </div>

          {(missingDocsCount > 0 || blockedWorkflowsCount > 0) && (
            <Card>
              <CardHeader><CardTitle className="text-base">Alerts</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {missingDocsCount > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-sm" data-testid="alert-missing-docs">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>{missingDocsCount} traveler(s) missing documents</span>
                  </div>
                )}
                {blockedWorkflowsCount > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-sm" data-testid="alert-blocked-workflows">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span>{blockedWorkflowsCount} workflow(s) blocked</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB B: Travelers */}
        <TabsContent value="travelers" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {travelers?.length || 0} traveler(s)
            </h3>
            <Dialog open={showAddTraveler} onOpenChange={(open) => { setShowAddTraveler(open); if (!open) resetTravelerForm(); }}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-traveler"><Plus className="h-4 w-4 mr-2" />Add Traveler</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Traveler</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>First Name</Label>
                      <Input value={travelerForm.firstName} onChange={(e) => setTravelerForm({ ...travelerForm, firstName: e.target.value })} data-testid="input-traveler-first-name" />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input value={travelerForm.lastName} onChange={(e) => setTravelerForm({ ...travelerForm, lastName: e.target.value })} data-testid="input-traveler-last-name" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Date of Birth</Label>
                      <Input type="date" value={travelerForm.dob} onChange={(e) => setTravelerForm({ ...travelerForm, dob: e.target.value })} data-testid="input-traveler-dob" />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <Select value={travelerForm.gender} onValueChange={(v) => setTravelerForm({ ...travelerForm, gender: v })}>
                        <SelectTrigger data-testid="select-traveler-gender"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Nationality</Label>
                      <Input value={travelerForm.nationality} onChange={(e) => setTravelerForm({ ...travelerForm, nationality: e.target.value })} data-testid="input-traveler-nationality" />
                    </div>
                    <div>
                      <Label>Passport Number</Label>
                      <Input value={travelerForm.passportNumber} onChange={(e) => setTravelerForm({ ...travelerForm, passportNumber: e.target.value })} data-testid="input-traveler-passport" />
                    </div>
                  </div>
                  <div>
                    <Label>Special Needs</Label>
                    <Input value={travelerForm.specialNeeds} onChange={(e) => setTravelerForm({ ...travelerForm, specialNeeds: e.target.value })} data-testid="input-traveler-special-needs" />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (travelerForm.firstName && travelerForm.lastName) {
                        createTraveler.mutate({ bookingId, ...travelerForm });
                      }
                    }}
                    disabled={!travelerForm.firstName || !travelerForm.lastName || createTraveler.isPending}
                    data-testid="button-submit-traveler"
                  >Add Traveler</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {travelers && travelers.length > 0 ? (
            <div className="space-y-2">
              {travelers.map((t) => (
                <Card key={t.id} data-testid={`card-traveler-${t.id}`}>
                  <CardContent className="p-4">
                    {editTravelerId === t.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>First Name</Label>
                            <Input value={travelerForm.firstName} onChange={(e) => setTravelerForm({ ...travelerForm, firstName: e.target.value })} data-testid="input-edit-first-name" />
                          </div>
                          <div>
                            <Label>Last Name</Label>
                            <Input value={travelerForm.lastName} onChange={(e) => setTravelerForm({ ...travelerForm, lastName: e.target.value })} data-testid="input-edit-last-name" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>DOB</Label>
                            <Input type="date" value={travelerForm.dob} onChange={(e) => setTravelerForm({ ...travelerForm, dob: e.target.value })} data-testid="input-edit-dob" />
                          </div>
                          <div>
                            <Label>Gender</Label>
                            <Select value={travelerForm.gender} onValueChange={(v) => setTravelerForm({ ...travelerForm, gender: v })}>
                              <SelectTrigger data-testid="select-edit-gender"><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Nationality</Label>
                            <Input value={travelerForm.nationality} onChange={(e) => setTravelerForm({ ...travelerForm, nationality: e.target.value })} data-testid="input-edit-nationality" />
                          </div>
                          <div>
                            <Label>Passport</Label>
                            <Input value={travelerForm.passportNumber} onChange={(e) => setTravelerForm({ ...travelerForm, passportNumber: e.target.value })} data-testid="input-edit-passport" />
                          </div>
                        </div>
                        <div>
                          <Label>Special Needs</Label>
                          <Input value={travelerForm.specialNeeds} onChange={(e) => setTravelerForm({ ...travelerForm, specialNeeds: e.target.value })} data-testid="input-edit-special-needs" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            onClick={() => updateTraveler.mutate({ id: t.id, data: travelerForm })}
                            disabled={updateTraveler.isPending}
                            data-testid="button-save-traveler"
                          >Save</Button>
                          <Button variant="outline" onClick={() => { setEditTravelerId(null); resetTravelerForm(); }} data-testid="button-cancel-edit">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="font-medium" data-testid={`text-traveler-name-${t.id}`}>{t.firstName} {t.lastName}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                            {t.dob && <span data-testid={`text-traveler-dob-${t.id}`}>DOB: {t.dob}</span>}
                            {t.nationality && <span data-testid={`text-traveler-nationality-${t.id}`}>{t.nationality}</span>}
                            {t.passportNumber && <span data-testid={`text-traveler-passport-${t.id}`}>Passport: {t.passportNumber}</span>}
                            {t.gender && <span data-testid={`text-traveler-gender-${t.id}`}>{t.gender}</span>}
                          </div>
                          {t.specialNeeds && <p className="text-xs text-muted-foreground mt-1" data-testid={`text-traveler-special-${t.id}`}>Needs: {t.specialNeeds}</p>}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditTraveler(t)}
                            data-testid={`button-edit-traveler-${t.id}`}
                          ><Pencil className="h-4 w-4" /></Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTraveler.mutate(t.id)}
                            data-testid={`button-delete-traveler-${t.id}`}
                          ><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No travelers added yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB C: Assignments */}
        <TabsContent value="assignments" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Assign Service</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Select value={assignService} onValueChange={setAssignService}>
                  <SelectTrigger className="w-[180px]" data-testid="select-assign-service"><SelectValue placeholder="Service Type" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SERVICE_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input
                  value={assignCountry}
                  onChange={(e) => setAssignCountry(e.target.value)}
                  placeholder="Country Code"
                  className="w-[130px]"
                  data-testid="input-assign-country"
                />
                <Select value={assignUser} onValueChange={setAssignUser}>
                  <SelectTrigger className="w-[200px]" data-testid="select-assign-user"><SelectValue placeholder="Assign to..." /></SelectTrigger>
                  <SelectContent>
                    {allUsers?.filter((u) => u.role !== "customer").map((u) => (
                      <SelectItem key={u.id} value={u.userId}>{u.companyName || u.userId}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    if (assignService && assignUser) {
                      createAssignment.mutate({
                        serviceType: assignService,
                        assignedUserId: assignUser,
                        countryCode: assignCountry || undefined,
                      });
                      setAssignService("");
                      setAssignUser("");
                      setAssignCountry("");
                    }
                  }}
                  disabled={!assignService || !assignUser || createAssignment.isPending}
                  data-testid="button-create-assignment"
                >Assign</Button>
              </div>
            </CardContent>
          </Card>

          {assignments && assignments.length > 0 ? (
            <div className="space-y-2">
              {assignments.map((a) => {
                const Icon = serviceIcons[a.serviceType] || ClipboardList;
                return (
                  <Card key={a.id} data-testid={`card-assignment-${a.id}`}>
                    <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm" data-testid={`text-assignment-type-${a.id}`}>{SERVICE_TYPES[a.serviceType]}</p>
                          <p className="text-xs text-muted-foreground" data-testid={`text-assignment-country-${a.id}`}>
                            {a.countryCode ? `Country: ${a.countryCode}` : "Global"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-muted-foreground" data-testid={`text-assignment-user-${a.id}`}>
                          {getUserName(a.assignedUserId)}
                        </span>
                        <Badge data-testid={`badge-assignment-status-${a.id}`}>{a.status || "assigned"}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAssignment.mutate(a.id)}
                          data-testid={`button-delete-assignment-${a.id}`}
                        ><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <ClipboardList className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No assignments yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB D: Fulfillment */}
        <TabsContent value="fulfillment" className="mt-4">
          {workflows && workflows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workflows.map((wf) => {
                const Icon = serviceIcons[wf.serviceType] || Workflow;
                const steps = SERVICE_WORKFLOW_STEPS[wf.serviceType] || [];
                const currentIdx = steps.findIndex((s) => s.code === wf.currentStep);
                return (
                  <Link href={`/admin/workflows/${wf.id}`} key={wf.id}>
                    <Card className="hover-elevate cursor-pointer" data-testid={`card-workflow-${wf.id}`}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm" data-testid={`text-workflow-type-${wf.id}`}>{SERVICE_TYPES[wf.serviceType]}</span>
                          </div>
                          <Badge
                            variant={wf.status === "completed" ? "default" : wf.status === "blocked" ? "destructive" : "outline"}
                            data-testid={`badge-workflow-status-${wf.id}`}
                          >
                            {WORKFLOW_STATUSES[wf.status || "not_assigned"]}
                          </Badge>
                        </div>
                        {wf.countryCode && (
                          <p className="text-xs text-muted-foreground" data-testid={`text-workflow-country-${wf.id}`}>Country: {wf.countryCode}</p>
                        )}
                        <p className="text-xs text-muted-foreground" data-testid={`text-workflow-assigned-${wf.id}`}>
                          Assigned: {getUserName(wf.assignedUserId)}
                        </p>
                        {wf.currentStep && (
                          <p className="text-xs text-muted-foreground" data-testid={`text-workflow-step-${wf.id}`}>
                            Step: {steps.find((s) => s.code === wf.currentStep)?.name || wf.currentStep}
                          </p>
                        )}
                        {steps.length > 0 && (
                          <div className="flex items-center gap-1">
                            {steps.map((step, i) => (
                              <div
                                key={step.code}
                                className={`h-1.5 flex-1 rounded-full ${
                                  i <= currentIdx
                                    ? wf.status === "blocked" ? "bg-destructive" : "bg-primary"
                                    : "bg-muted"
                                }`}
                                title={step.name}
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <ExternalLink className="h-3 w-3" />
                          <span>View workflow</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <Workflow className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No workflows started yet. Assign services to begin fulfillment.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB E: Documents */}
        <TabsContent value="documents" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {documents?.length || 0} document(s)
            </h3>
            <Dialog open={showAddDoc} onOpenChange={setShowAddDoc}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-document"><Plus className="h-4 w-4 mr-2" />Add Document</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Document</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Document Type</Label>
                    <Select value={docForm.docType} onValueChange={(v) => setDocForm({ ...docForm, docType: v })}>
                      <SelectTrigger data-testid="select-doc-type"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(DOC_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>File Name</Label>
                    <Input
                      value={docForm.fileName}
                      onChange={(e) => setDocForm({ ...docForm, fileName: e.target.value })}
                      placeholder="document.pdf"
                      data-testid="input-doc-filename"
                    />
                  </div>
                  <div>
                    <Label>File URL / Path</Label>
                    <Input
                      value={docForm.fileUrl}
                      onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
                      placeholder="https://example.com/doc.pdf"
                      data-testid="input-doc-fileurl"
                    />
                  </div>
                  <div>
                    <Label>Traveler (optional)</Label>
                    <Select value={docForm.travelerId} onValueChange={(v) => setDocForm({ ...docForm, travelerId: v })}>
                      <SelectTrigger data-testid="select-doc-traveler"><SelectValue placeholder="Select traveler" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {travelers?.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Workflow Step (optional)</Label>
                    <Input
                      value={docForm.workflowStepId}
                      onChange={(e) => setDocForm({ ...docForm, workflowStepId: e.target.value })}
                      placeholder="Step ID"
                      data-testid="input-doc-workflow-step"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (docForm.docType && docForm.fileName) {
                        createDocument.mutate({
                          bookingId,
                          docType: docForm.docType,
                          fileName: docForm.fileName,
                          fileUrl: docForm.fileUrl || undefined,
                          travelerId: docForm.travelerId && docForm.travelerId !== "none" ? docForm.travelerId : undefined,
                          workflowStepId: docForm.workflowStepId || undefined,
                        });
                      }
                    }}
                    disabled={!docForm.docType || !docForm.fileName || createDocument.isPending}
                    data-testid="button-submit-document"
                  >Add Document</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {documents && documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <Card key={doc.id} data-testid={`card-document-${doc.id}`}>
                  <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm" data-testid={`text-doc-type-${doc.id}`}>{DOC_TYPES[doc.docType] || doc.docType}</p>
                        <p className="text-xs text-muted-foreground" data-testid={`text-doc-filename-${doc.id}`}>{doc.fileName}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={doc.status === "approved" ? "default" : doc.status === "rejected" ? "destructive" : "secondary"}
                        data-testid={`badge-doc-status-${doc.id}`}
                      >
                        {doc.status || "uploaded"}
                      </Badge>
                      {doc.fileUrl && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => window.open(doc.fileUrl!, "_blank")} title="View Document">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" asChild title="Download Document">
                            <a href={doc.fileUrl} download={doc.fileName}>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </>
                      )}
                      {doc.status === "uploaded" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateDocument.mutate({ id: doc.id, status: "approved" })}
                            data-testid={`button-approve-doc-${doc.id}`}
                          >
                            <ShieldCheck className="h-3.5 w-3.5 mr-1" />Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateDocument.mutate({ id: doc.id, status: "rejected" })}
                            data-testid={`button-reject-doc-${doc.id}`}
                          >
                            <ShieldX className="h-3.5 w-3.5 mr-1" />Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB F: Messages */}
        <TabsContent value="messages" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                data-testid="input-message"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Select value={msgVisibility} onValueChange={setMsgVisibility}>
                  <SelectTrigger className="w-[180px]" data-testid="select-message-visibility"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_visible">Customer Visible</SelectItem>
                    <SelectItem value="internal_only">Internal Only</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    if (newMessage.trim()) {
                      sendMessage.mutate({ messageText: newMessage, visibility: msgVisibility });
                      setNewMessage("");
                    }
                  }}
                  disabled={!newMessage.trim() || sendMessage.isPending}
                  data-testid="button-send-message"
                ><Send className="h-4 w-4 mr-2" />Send</Button>
              </div>
            </CardContent>
          </Card>

          {messages && messages.length > 0 ? (
            <div className="space-y-2">
              {messages.map((msg) => (
                <Card key={msg.id} data-testid={`card-message-${msg.id}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm" data-testid={`text-message-sender-${msg.id}`}>{msg.senderName || "System"}</span>
                        <Badge variant={msg.visibility === "internal_only" ? "secondary" : "outline"} className="text-xs">
                          {msg.visibility === "internal_only" ? "Internal" : "Customer"}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground" data-testid={`text-message-time-${msg.id}`}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}
                      </span>
                    </div>
                    <p className="text-sm" data-testid={`text-message-body-${msg.id}`}>{msg.messageText}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB G: Payments */}
        <TabsContent value="payments" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {payments?.length || 0} payment(s)
            </h3>
            <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-payment"><Plus className="h-4 w-4 mr-2" />Add Payment</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Payment</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        placeholder="0"
                        data-testid="input-payment-amount"
                      />
                    </div>
                    <div>
                      <Label>Currency</Label>
                      <Input
                        value={paymentForm.currency}
                        onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value })}
                        placeholder="USD"
                        data-testid="input-payment-currency"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Method</Label>
                    <Select value={paymentForm.method} onValueChange={(v) => setPaymentForm({ ...paymentForm, method: v })}>
                      <SelectTrigger data-testid="select-payment-method"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(PAYMENT_METHODS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                      placeholder="Payment notes..."
                      data-testid="input-payment-notes"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (paymentForm.amount) {
                        createPayment.mutate({
                          bookingId,
                          amount: parseInt(paymentForm.amount),
                          currency: paymentForm.currency,
                          method: paymentForm.method,
                          notes: paymentForm.notes || undefined,
                        });
                      }
                    }}
                    disabled={!paymentForm.amount || createPayment.isPending}
                    data-testid="button-submit-payment"
                  >Add Payment</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {payments && payments.length > 0 ? (
            <div className="space-y-2">
              {payments.map((p) => (
                <Card key={p.id} data-testid={`card-payment-${p.id}`}>
                  <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm" data-testid={`text-payment-amount-${p.id}`}>
                          {p.currency} {p.amount}
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid={`text-payment-method-${p.id}`}>
                          {PAYMENT_METHODS[p.method || "bank_transfer"] || p.method}
                        </p>
                        {p.notes && <p className="text-xs text-muted-foreground mt-0.5">{p.notes}</p>}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={p.status === "paid" ? "default" : p.status === "failed" ? "destructive" : "secondary"}
                        data-testid={`badge-payment-status-${p.id}`}
                      >
                        {PAYMENT_STATUSES[p.status || "pending"] || p.status}
                      </Badge>
                      {p.receiptUrl && (
                        <Button size="sm" variant="ghost" onClick={() => window.open(p.receiptUrl!, "_blank")} title="View Receipt">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {p.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePayment.mutate({ id: p.id, status: "paid" })}
                          data-testid={`button-mark-paid-${p.id}`}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />Mark Paid
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <CreditCard className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No payments recorded yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
