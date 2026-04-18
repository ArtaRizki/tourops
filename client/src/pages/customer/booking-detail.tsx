import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Users, FileText, Workflow, MessageSquare, Plus, Send,
  CheckCircle, Clock, Link2, CreditCard, Upload, Copy, AlertTriangle,
  Plane, Hotel, Bus, UserCheck, Ticket, Eye, XCircle, ExternalLink, Download,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { BOOKING_TYPES, BOOKING_STATUSES, FULFILLMENT_STATUSES, SERVICE_TYPES, WORKFLOW_STATUSES } from "@/lib/constants";
import type { Booking, Traveler, BookingWorkflow, Message, Document, Payment } from "@shared/schema";

const SERVICE_ICONS: Record<string, any> = {
  airline: Plane, hotel: Hotel, transport: Bus, guide: UserCheck, sights: Ticket,
};

const DOC_STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  uploaded: "outline", approved: "default", rejected: "destructive",
};

export default function CustomerBookingDetail() {
  const [, params] = useRoute("/my-bookings/:id");
  const { toast } = useToast();
  const bookingId = params?.id;

  const { data: booking, isLoading } = useQuery<Booking>({ queryKey: ["/api/my-bookings", bookingId] });
  const { data: travelers } = useQuery<Traveler[]>({ queryKey: ["/api/my-bookings", bookingId, "travelers"] });
  const { data: workflows } = useQuery<BookingWorkflow[]>({ queryKey: ["/api/my-bookings", bookingId, "workflows"] });
  const { data: messages } = useQuery<Message[]>({ queryKey: ["/api/my-bookings", bookingId, "messages"] });
  const { data: docs } = useQuery<Document[]>({ queryKey: ["/api/my-bookings", bookingId, "documents"] });
  const { data: pmts } = useQuery<Payment[]>({ queryKey: ["/api/my-bookings", bookingId, "payments"] });
  const { data: participants } = useQuery<Booking[]>({
    queryKey: ["/api/my-bookings", bookingId, "participants"],
    enabled: booking?.bookingType === "leader_group",
  });

  const isLeaderGroup = booking?.bookingType === "leader_group";
  const isPrivateFamily = booking?.bookingType === "private_family";

  const [showAddTraveler, setShowAddTraveler] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportExpiry, setPassportExpiry] = useState("");
  const [gender, setGender] = useState("");
  const [specialNeeds, setSpecialNeeds] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [docTravelerId, setDocTravelerId] = useState("");
  const [docType, setDocType] = useState("passport");
  const [docFileName, setDocFileName] = useState("");
  const [docFileUrl, setDocFileUrl] = useState("");
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [addTravelerForBookingId, setAddTravelerForBookingId] = useState<string | null>(null);
  const [ptFirstName, setPtFirstName] = useState("");
  const [ptLastName, setPtLastName] = useState("");
  const [ptDob, setPtDob] = useState("");
  const [ptNationality, setPtNationality] = useState("");
  const [ptPassportNumber, setPtPassportNumber] = useState("");
  const [ptPassportExpiry, setPtPassportExpiry] = useState("");
  const [ptGender, setPtGender] = useState("");

  const addTraveler = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/bookings/${bookingId}/travelers`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-bookings", bookingId, "travelers"] });
      setShowAddTraveler(false);
      setFirstName(""); setLastName(""); setDob(""); setNationality("");
      setPassportNumber(""); setPassportExpiry(""); setGender(""); setSpecialNeeds("");
      toast({ title: "Traveler added" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const addTravelerToParticipant = useMutation({
    mutationFn: (data: { bookingId: string; body: any }) =>
      apiRequest("POST", `/api/bookings/${data.bookingId}/travelers`, data.body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-bookings", bookingId, "participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-bookings", bookingId, "travelers"] });
      setAddTravelerForBookingId(null);
      setPtFirstName(""); setPtLastName(""); setPtDob(""); setPtNationality("");
      setPtPassportNumber(""); setPtPassportExpiry(""); setPtGender("");
      toast({ title: variables.bookingId === bookingId ? "Passenger added to your booking" : "Passenger added to participant booking" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const sendMessage = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/bookings/${bookingId}/messages`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-bookings", bookingId, "messages"] });
      setNewMessage("");
    },
  });

  const uploadDoc = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/my-bookings/${bookingId}/documents`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-bookings", bookingId, "documents"] });
      setShowUploadDoc(false);
      setDocTravelerId(""); setDocType("passport"); setDocFileName(""); setDocFileUrl("");
      toast({ title: "Document uploaded" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const cancelParticipant = useMutation({
    mutationFn: (participantBookingId: string) =>
      apiRequest("POST", `/api/my-bookings/${bookingId}/participants/${participantBookingId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-bookings", bookingId, "participants"] });
      setConfirmCancelId(null);
      toast({ title: "Participant removed from group" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const copyJoinCode = () => {
    if (booking?.joinCode) {
      navigator.clipboard.writeText(booking.joinCode);
      toast({ title: "Join code copied!" });
    }
  };

  if (isLoading) return <div className="p-6"><Skeleton className="h-64" /></div>;
  if (!booking) return <div className="p-6"><p className="text-muted-foreground">Booking not found</p></div>;

  const travelerDocs = docs?.filter((d) => ["passport", "id_doc", "visa"].includes(d.docType)) || [];
  const fulfillmentDocs = docs?.filter((d) => !["passport", "id_doc", "visa"].includes(d.docType)) || [];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Link href="/my-bookings">
        <Button variant="ghost" size="sm" data-testid="button-back-bookings"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-serif" data-testid="text-customer-booking-code">{booking.bookingCode}</h1>
            <Badge variant="outline">{BOOKING_TYPES[booking.bookingType]}</Badge>
          </div>
          {booking.groupName && <p className="text-muted-foreground">{booking.groupName}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
            {BOOKING_STATUSES[booking.status || "submitted"]}
          </Badge>
          <Badge variant={booking.fulfillmentStatus === "completed" ? "default" : "outline"}>
            {FULFILLMENT_STATUSES[booking.fulfillmentStatus || "pending"]}
          </Badge>
        </div>
      </div>

      {booking.joinCode && (
        <Card>
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            <Link2 className="h-4 w-4 text-primary" />
            <span className="text-sm">Share this code with your group:</span>
            <code className="font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-md" data-testid="text-join-code">{booking.joinCode}</code>
            <Button size="sm" variant="outline" onClick={copyJoinCode} data-testid="button-copy-join-code">
              <Copy className="h-3 w-3 mr-1" />Copy
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview" data-testid="tab-overview"><Eye className="h-3.5 w-3.5 mr-1" />Overview</TabsTrigger>
          {isLeaderGroup && (
            <TabsTrigger value="group" data-testid="tab-group"><Users className="h-3.5 w-3.5 mr-1" />Group</TabsTrigger>
          )}
          <TabsTrigger value="travelers" data-testid="tab-customer-travelers"><Users className="h-3.5 w-3.5 mr-1" />Travelers</TabsTrigger>
          <TabsTrigger value="documents" data-testid="tab-documents"><FileText className="h-3.5 w-3.5 mr-1" />Documents</TabsTrigger>
          <TabsTrigger value="messages" data-testid="tab-customer-messages"><MessageSquare className="h-3.5 w-3.5 mr-1" />Messages</TabsTrigger>
          <TabsTrigger value="payments" data-testid="tab-payments"><CreditCard className="h-3.5 w-3.5 mr-1" />Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-sm">Trip Summary</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Booking Code</span>
                    <span className="font-medium">{booking.bookingCode}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Type</span>
                    <span>{BOOKING_TYPES[booking.bookingType]}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Party Size</span>
                    <span>{booking.partySizeExpected}</span>
                  </div>
                  {booking.totalPrice != null && (
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Total Price</span>
                      <span className="font-medium">${booking.totalPrice}</span>
                    </div>
                  )}
                  {booking.notes && (
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Notes</span>
                      <span className="text-right max-w-[200px]">{booking.notes}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-sm">Alerts</h3>
                {travelers && travelers.length < (booking.partySizeExpected || 1) && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span>{(booking.partySizeExpected || 1) - travelers.length} traveler(s) still need to be added</span>
                  </div>
                )}
                {travelers && travelers.some((t) => !t.passportNumber) && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span>Some travelers are missing passport details</span>
                  </div>
                )}
                {pmts && pmts.some((p) => p.status === "pending") && (
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span>Payment pending</span>
                  </div>
                )}
                {(!travelers || travelers.length >= (booking.partySizeExpected || 1)) &&
                  (!pmts || !pmts.some((p) => p.status === "pending")) &&
                  (!travelers || !travelers.some((t) => !t.passportNumber)) && (
                  <p className="text-sm text-muted-foreground">No alerts at this time</p>
                )}
              </CardContent>
            </Card>
          </div>

          {workflows && workflows.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-3">Service Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {workflows.map((wf) => {
                  const Icon = SERVICE_ICONS[wf.serviceType] || Workflow;
                  return (
                    <Card key={wf.id}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{SERVICE_TYPES[wf.serviceType]}</p>
                          {wf.currentStep && <p className="text-xs text-muted-foreground truncate">{wf.currentStep}</p>}
                        </div>
                        <Badge variant={wf.status === "completed" ? "default" : "outline"} className="flex-shrink-0">
                          {wf.status === "completed" ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                          {wf.status === "completed" ? "Done" : WORKFLOW_STATUSES[wf.status || "not_assigned"]}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {isLeaderGroup && (
          <TabsContent value="group" className="mt-4 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <Link2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Join Code:</span>
                  <code className="font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-md" data-testid="text-group-join-code">{booking.joinCode}</code>
                  <Button size="sm" variant="outline" onClick={copyJoinCode} data-testid="button-copy-group-code">
                    <Copy className="h-3 w-3 mr-1" />Copy
                  </Button>
                </div>
                {booking.groupName && <p className="text-sm text-muted-foreground">Group: {booking.groupName}</p>}
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-sm">Participants ({(participants?.length || 0) + 1} total)</h3>
              <Button
                size="sm"
                onClick={() => {
                  setAddTravelerForBookingId(booking.id);
                  setPtFirstName(""); setPtLastName(""); setPtDob(""); setPtNationality("");
                  setPtPassportNumber(""); setPtPassportExpiry(""); setPtGender("");
                }}
                data-testid="button-add-passenger-leader"
              >
                <Plus className="h-3 w-3 mr-1" />Add Passenger
              </Button>
            </div>

            <Card>
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">You (Leader)</p>
                  <p className="text-xs text-muted-foreground">{booking.bookingCode}</p>
                </div>
                <Badge variant="default">Leader</Badge>
              </CardContent>
            </Card>

            {participants && participants.length > 0 ? (
              participants.map((p) => (
                <Card key={p.id} data-testid={`card-participant-${p.id}`}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">{p.bookingCode}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.partySizeExpected} traveler(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={p.status === "cancelled" ? "destructive" : p.status === "confirmed" ? "default" : "secondary"}>
                          {BOOKING_STATUSES[p.status || "submitted"]}
                        </Badge>
                        {p.status !== "cancelled" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAddTravelerForBookingId(p.id);
                                setPtFirstName(""); setPtLastName(""); setPtDob(""); setPtNationality("");
                                setPtPassportNumber(""); setPtPassportExpiry(""); setPtGender("");
                              }}
                              data-testid={`button-add-passenger-${p.id}`}
                            >
                              <Plus className="h-3 w-3 mr-1" />Add Passenger
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmCancelId(p.id)}
                              data-testid={`button-remove-participant-${p.id}`}
                            >
                              <XCircle className="h-3 w-3 mr-1" />Remove
                            </Button>
                            <Dialog open={confirmCancelId === p.id} onOpenChange={(v) => !v && setConfirmCancelId(null)}>
                              <DialogContent>
                                <DialogHeader><DialogTitle>Remove Participant?</DialogTitle></DialogHeader>
                                <p className="text-sm text-muted-foreground">
                                  This will cancel booking {p.bookingCode}. This action cannot be undone easily.
                                </p>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setConfirmCancelId(null)}>Cancel</Button>
                                  <Button variant="destructive" onClick={() => cancelParticipant.mutate(p.id)} disabled={cancelParticipant.isPending}>
                                    {cancelParticipant.isPending ? "Removing..." : "Remove"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center py-12">
                  <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No participants have joined yet. Share your join code to invite others.</p>
                </CardContent>
              </Card>
            )}

            <Dialog open={!!addTravelerForBookingId} onOpenChange={(v) => !v && setAddTravelerForBookingId(null)}>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Passenger{addTravelerForBookingId === booking.id ? " to Your Booking" : " to Participant"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>First Name *</Label><Input value={ptFirstName} onChange={(e) => setPtFirstName(e.target.value)} data-testid="input-pt-first-name" /></div>
                    <div><Label>Last Name *</Label><Input value={ptLastName} onChange={(e) => setPtLastName(e.target.value)} data-testid="input-pt-last-name" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Date of Birth</Label><Input type="date" value={ptDob} onChange={(e) => setPtDob(e.target.value)} data-testid="input-pt-dob" /></div>
                    <div><Label>Gender</Label>
                      <Select value={ptGender} onValueChange={setPtGender}>
                        <SelectTrigger data-testid="select-pt-gender"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Nationality</Label><Input value={ptNationality} onChange={(e) => setPtNationality(e.target.value)} data-testid="input-pt-nationality" /></div>
                    <div><Label>Passport Number</Label><Input value={ptPassportNumber} onChange={(e) => setPtPassportNumber(e.target.value)} data-testid="input-pt-passport" /></div>
                  </div>
                  <div><Label>Passport Expiry</Label><Input type="date" value={ptPassportExpiry} onChange={(e) => setPtPassportExpiry(e.target.value)} data-testid="input-pt-passport-expiry" /></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddTravelerForBookingId(null)}>Cancel</Button>
                  <Button
                    onClick={() => addTravelerForBookingId && addTravelerToParticipant.mutate({
                      bookingId: addTravelerForBookingId,
                      body: { firstName: ptFirstName, lastName: ptLastName, dateOfBirth: ptDob || null, nationality: ptNationality || null, passportNumber: ptPassportNumber || null, passportExpiry: ptPassportExpiry || null, gender: ptGender || null }
                    })}
                    disabled={addTravelerToParticipant.isPending || !ptFirstName || !ptLastName}
                    data-testid="button-submit-participant-traveler"
                  >
                    {addTravelerToParticipant.isPending ? "Adding..." : "Add Passenger"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        )}

        <TabsContent value="travelers" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">{travelers?.length || 0} of {booking.partySizeExpected} travelers added</p>
            <Dialog open={showAddTraveler} onOpenChange={setShowAddTraveler}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-traveler"><Plus className="h-4 w-4 mr-1" />Add Traveler</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Traveler</DialogTitle></DialogHeader>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>First Name *</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} data-testid="input-traveler-first" /></div>
                    <div><Label>Last Name *</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} data-testid="input-traveler-last" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Date of Birth</Label><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} data-testid="input-traveler-dob" /></div>
                    <div><Label>Nationality</Label><Input value={nationality} onChange={(e) => setNationality(e.target.value)} data-testid="input-traveler-nationality" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Passport Number</Label><Input value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} data-testid="input-traveler-passport" /></div>
                    <div><Label>Passport Expiry</Label><Input type="date" value={passportExpiry} onChange={(e) => setPassportExpiry(e.target.value)} data-testid="input-traveler-passport-expiry" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Gender</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger data-testid="select-traveler-gender"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Special Needs</Label><Input value={specialNeeds} onChange={(e) => setSpecialNeeds(e.target.value)} placeholder="Dietary, medical..." data-testid="input-traveler-special-needs" /></div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => addTraveler.mutate({
                      firstName, lastName, dob: dob || undefined, nationality: nationality || undefined,
                      passportNumber: passportNumber || undefined, passportExpiry: passportExpiry || undefined,
                      gender: gender || undefined, specialNeeds: specialNeeds || undefined,
                    })}
                    disabled={!firstName || !lastName || addTraveler.isPending}
                    data-testid="button-save-traveler"
                  >
                    {addTraveler.isPending ? "Adding..." : "Add Traveler"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {travelers && travelers.length > 0 ? (
            <div className="space-y-2">
              {travelers.map((t) => (
                <Card key={t.id} data-testid={`card-traveler-${t.id}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{t.firstName} {t.lastName}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                          {t.dob && <span>DOB: {t.dob}</span>}
                          {t.nationality && <span>{t.nationality}</span>}
                          {t.gender && <span>{t.gender}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {t.passportNumber ? (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />Passport: {t.passportNumber}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />No Passport
                          </Badge>
                        )}
                      </div>
                    </div>
                    {t.specialNeeds && (
                      <p className="text-xs text-muted-foreground mt-2">Special needs: {t.specialNeeds}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Add your travelers to complete the booking</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-semibold text-sm">Traveler Documents</h3>
            <Dialog open={showUploadDoc} onOpenChange={setShowUploadDoc}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-upload-doc"><Upload className="h-4 w-4 mr-1" />Upload Document</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Traveler</Label>
                    <Select value={docTravelerId} onValueChange={setDocTravelerId}>
                      <SelectTrigger data-testid="select-doc-traveler"><SelectValue placeholder="Select traveler" /></SelectTrigger>
                      <SelectContent>
                        {travelers?.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Document Type</Label>
                    <Select value={docType} onValueChange={setDocType}>
                      <SelectTrigger data-testid="select-doc-type"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="id_doc">ID Document</SelectItem>
                        <SelectItem value="visa">Visa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>File Name / Reference</Label>
                    <Input value={docFileName} onChange={(e) => setDocFileName(e.target.value)} placeholder="passport_john.pdf" data-testid="input-doc-filename" />
                  </div>
                  <div>
                    <Label>File URL / Path</Label>
                    <Input value={docFileUrl} onChange={(e) => setDocFileUrl(e.target.value)} placeholder="https://example.com/doc.pdf" data-testid="input-doc-fileurl" />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => uploadDoc.mutate({
                      bookingId,
                      travelerId: docTravelerId || undefined,
                      docType,
                      fileName: docFileName,
                      fileUrl: docFileUrl || undefined,
                    })}
                    disabled={!docFileName || uploadDoc.isPending}
                    data-testid="button-submit-doc"
                  >
                    {uploadDoc.isPending ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {travelerDocs.length > 0 ? (
            <div className="space-y-2">
              {travelerDocs.map((doc) => {
                const traveler = travelers?.find((t) => t.id === doc.travelerId);
                return (
                  <Card key={doc.id} data-testid={`card-doc-${doc.id}`}>
                    <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{doc.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {traveler ? `${traveler.firstName} ${traveler.lastName}` : "General"} - {doc.docType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                          {doc.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                          {doc.status || "Uploaded"}
                        </Badge>
                        {doc.fileUrl && (
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => window.open(doc.fileUrl!, "_blank")} title="View Document">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" asChild title="Download Document">
                              <a href={doc.fileUrl} download={doc.fileName}>
                                <Download className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          </div>
                        )}
                        {doc.reviewNotes && <span className="text-xs text-muted-foreground">{doc.reviewNotes}</span>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-8">
                <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No traveler documents uploaded yet</p>
              </CardContent>
            </Card>
          )}

          {fulfillmentDocs.length > 0 && (
            <>
              <h3 className="font-semibold text-sm pt-2">Fulfillment Documents</h3>
              <div className="space-y-2">
                {fulfillmentDocs.map((doc) => (
                  <Card key={doc.id} data-testid={`card-fulfillment-doc-${doc.id}`}>
                    <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{doc.fileName}</p>
                          <p className="text-xs text-muted-foreground">{doc.docType.replace(/_/g, " ")}</p>
                        </div>
                      </div>
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />Available
                      </Badge>
                      {doc.fileUrl && (
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="text-white" onClick={() => window.open(doc.fileUrl!, "_blank")} title="View Document">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-white" asChild title="Download Document">
                            <a href={doc.fileUrl} download={doc.fileName}>
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="messages" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send a message..."
                className="flex-1"
                data-testid="input-customer-message"
                onKeyDown={(e) => { if (e.key === "Enter" && newMessage.trim()) sendMessage.mutate({ messageText: newMessage, visibility: "customer_visible" }); }}
              />
              <Button
                size="icon"
                onClick={() => { if (newMessage.trim()) sendMessage.mutate({ messageText: newMessage, visibility: "customer_visible" }); }}
                disabled={!newMessage.trim()}
                data-testid="button-customer-send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {messages && messages.filter((m) => m.visibility === "customer_visible").length > 0 ? (
            <div className="space-y-2">
              {messages.filter((m) => m.visibility === "customer_visible").map((msg) => (
                <Card key={msg.id} data-testid={`card-message-${msg.id}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className="font-medium text-sm">{msg.senderName || "Support"}</span>
                      <span className="text-xs text-muted-foreground">{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}</span>
                    </div>
                    <p className="text-sm">{msg.messageText}</p>
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

        <TabsContent value="payments" className="mt-4 space-y-4">
          {booking.totalPrice != null && (
            <Card>
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">${booking.totalPrice}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  {pmts && pmts.length > 0 ? (
                    <Badge variant={pmts.every((p) => p.status === "paid") ? "default" : "secondary"}>
                      {pmts.every((p) => p.status === "paid") ? "Paid" : "Partially Paid"}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Unpaid</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {pmts && pmts.length > 0 ? (
            <div className="space-y-2">
              {pmts.map((pmt) => (
                <Card key={pmt.id} data-testid={`card-payment-${pmt.id}`}>
                  <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">${pmt.amount} {pmt.currency}</p>
                      <p className="text-xs text-muted-foreground">
                        {pmt.method?.replace(/_/g, " ")} - {pmt.createdAt ? new Date(pmt.createdAt).toLocaleDateString() : ""}
                      </p>
                      {pmt.notes && <p className="text-xs text-muted-foreground mt-1">{pmt.notes}</p>}
                    </div>
                      {pmt.status === "paid" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {pmt.status || "Pending"}
                    </Badge>
                    {pmt.receiptUrl && (
                      <Button size="sm" variant="ghost" onClick={() => window.open(pmt.receiptUrl!, "_blank")} title="View Receipt">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <CreditCard className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No payment records yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
