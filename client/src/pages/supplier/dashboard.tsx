import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, Clock, AlertCircle, FileText, 
  Users, MessageSquare, Upload, ArrowRight,
  Hotel, Bus, MapPin, Camera, Plane,
  ChevronRight, Calendar, User, Search, Globe,
  UserCheck, Ticket, Download, FileCheck, AlertTriangle,
  DollarSign, ClipboardList, Bell, Plus, Trash2
} from "lucide-react";
import { WORKFLOW_STATUSES } from "@/lib/constants";
import type { BookingWorkflow, Booking, UserProfile, Traveler, Document } from "@shared/schema";
import { Link } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const ROLE_CONFIG: Record<string, { title: string; subtitle: string; icon: any }> = {
  airline_supplier: { title: "Airline Dashboard", subtitle: "Manage your ticketing assignments", icon: Plane },
  hotel_manager: { title: "Hotel Dashboard", subtitle: "Manage your accommodation bookings", icon: Hotel },
  transport_manager: { title: "Transport Dashboard", subtitle: "Manage your vehicle and fleet tasks", icon: Bus },
  guide_manager: { title: "Guide Dashboard", subtitle: "Manage your tour guide assignments", icon: UserCheck },
  sights_manager: { title: "Sights Dashboard", subtitle: "Manage your tickets and entry permits", icon: Ticket },
  admin: { title: "Supplier Overview (Admin)", subtitle: "Viewing all supplier tasks", icon: Globe },
  super_admin: { title: "Supplier Overview (Super Admin)", subtitle: "Viewing all supplier tasks", icon: Globe },
};

export default function SupplierDashboard() {
  const { toast } = useToast();
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/user-profile"],
  });

  const { data: workflows, isLoading } = useQuery<(BookingWorkflow & { booking?: Booking })[]>({
    queryKey: ["/api/supplier/workflows"],
  });

  const updateWorkflow = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PATCH", `/api/workflows/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier/workflows"] });
      toast({ title: "Workflow updated" });
    },
  });

  const { data: hotelRates } = useQuery<any[]>({ queryKey: ["/api/rates/hotel"] });
  const { data: guideRates } = useQuery<any[]>({ queryKey: ["/api/rates/guide"] });
  const { data: sightsRates } = useQuery<any[]>({ queryKey: ["/api/rates/sights"] });

  const saveRate = useMutation({
    mutationFn: ({ type, id, data }: { type: string, id?: string, data: any }) => {
      if (id) return apiRequest("PATCH", `/api/rates/${type}/${id}`, data);
      return apiRequest("POST", `/api/rates/${type}`, data);
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/rates/${type}`] });
      toast({ title: "Rate saved successfully" });
      setRateDialogOpen(false);
    },
  });

  const deleteRate = useMutation({
    mutationFn: ({ type, id }: { type: string, id: string }) => apiRequest("DELETE", `/api/rates/${type}/${id}`),
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/rates/${type}`] });
      toast({ title: "Rate deleted", variant: "destructive" });
    },
  });

  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [rateType, setRateType] = useState<"hotel" | "guide" | "sights">("hotel");
  const [editingRate, setEditingRate] = useState<any>(null);

  const openRateDialog = (type: "hotel" | "guide" | "sights", rate?: any) => {
    setRateType(type);
    setEditingRate(rate || null);
    setRateDialogOpen(true);
  };


  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [uploadWorkflowId, setUploadWorkflowId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileUrl, setUploadFileUrl] = useState("");
  const [uploadDocType, setUploadDocType] = useState("voucher");
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const { data: bookingManifest, isLoading: manifestLoading } = useQuery<Booking & { travelers: Traveler[], documents: Document[] }>({
    queryKey: [`/api/supplier/bookings/${selectedBookingId}`],
    enabled: !!selectedBookingId,
  });

  const { data: messages } = useQuery<any[]>({
    queryKey: [`/api/supplier/bookings/${selectedBookingId}/messages`],
    enabled: !!selectedBookingId,
  });

  const sendMessage = useMutation({
    mutationFn: (text: string) => apiRequest("POST", `/api/supplier/bookings/${selectedBookingId}/messages`, { messageText: text }),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/supplier/bookings/${selectedBookingId}/messages`] });
    },
  });

  const uploadDocument = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/supplier/workflows/${uploadWorkflowId}/documents`, data),
    onSuccess: () => {
      setUploadWorkflowId(null);
      setUploadFileName("");
      setUploadFileUrl("");
      queryClient.invalidateQueries({ queryKey: ["/api/supplier/workflows"] });
      if (selectedBookingId) {
        queryClient.invalidateQueries({ queryKey: [`/api/supplier/bookings/${selectedBookingId}`] });
      }
      toast({ title: "Document uploaded successfully" });
    },
  });

  const config = ROLE_CONFIG[profile?.role || ""] || ROLE_CONFIG.admin;
  const DashboardIcon = config.icon;

  const pending = (workflows || []).filter((w) => w.status === "assigned" || w.status === "in_progress").length;
  const completed = (workflows || []).filter((w) => w.status === "completed").length;
  const blocked = (workflows || []).filter((w) => w.status === "blocked").length;

  if (isLoading) {
    return <div className="p-6 space-y-4"><Skeleton className="h-8 w-64" /><div className="grid grid-cols-3 gap-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif" data-testid="text-supplier-title">{config.title}</h1>
        <p className="text-muted-foreground text-sm">{config.subtitle}</p>
      </div>

      <SupplierNotifications />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-none shadow-sm bg-amber-500/5 border-l-4 border-l-amber-500">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-sm text-amber-700 dark:text-amber-400 font-medium">Active Tasks</p><p className="text-3xl font-bold text-amber-900 dark:text-amber-200">{pending}</p></div>
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center"><Clock className="h-6 w-6 text-amber-600" /></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-none shadow-sm bg-emerald-500/5 border-l-4 border-l-emerald-500">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Completed</p><p className="text-3xl font-bold text-emerald-900 dark:text-emerald-200">{completed}</p></div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center"><CheckCircle2 className="h-6 w-6 text-emerald-600" /></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-none shadow-sm bg-rose-500/5 border-l-4 border-l-rose-500">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-sm text-rose-700 dark:text-rose-400 font-medium">Blocked</p><p className="text-3xl font-bold text-rose-900 dark:text-rose-200">{blocked}</p></div>
                <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-rose-600" /></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="tasks" className="mt-8">
        <TabsList className="mb-6 bg-white/50 backdrop-blur-sm border shadow-sm p-1">
          <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md px-6 py-2 transition-all">
            <ClipboardList className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          {(profile?.role === "hotel_manager" || profile?.role === "admin" || profile?.role === "super_admin") && (
            <TabsTrigger value="hotel_rates" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md px-6 py-2 transition-all">
              <Hotel className="h-4 w-4 mr-2" />
              Hotel Rates
            </TabsTrigger>
          )}
          {(profile?.role === "guide_manager" || profile?.role === "admin" || profile?.role === "super_admin") && (
            <TabsTrigger value="guide_rates" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md px-6 py-2 transition-all">
              <UserCheck className="h-4 w-4 mr-2" />
              Guide Rates
            </TabsTrigger>
          )}
          {(profile?.role === "sights_manager" || profile?.role === "admin" || profile?.role === "super_admin") && (
            <TabsTrigger value="sights_rates" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md px-6 py-2 transition-all">
              <Ticket className="h-4 w-4 mr-2" />
              Sights Rates
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="tasks">
          <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold tracking-tight">Assigned Workflows</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-slate-200" />
              ))}
            </div>
            <span>{workflows?.length || 0} tasks assigned</span>
          </div>
        </div>

        {!workflows || workflows.length === 0 ? (
          <Card className="border-dashed border-2 bg-muted/30">
            <CardContent className="flex flex-col items-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plane className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-semibold">No assignments found</h3>
              <p className="text-muted-foreground max-w-xs">You don't have any bookings assigned to you yet. New tasks will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {workflows.map((wf, index) => {
                const Icon = ROLE_CONFIG[wf.serviceType + "_manager"]?.icon || Plane;
                return (
                  <motion.div
                    key={wf.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none shadow-md group">
                      <div className={`h-1 w-full ${
                        wf.status === 'completed' ? 'bg-emerald-500' : 
                        wf.status === 'blocked' ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className={`capitalize font-bold border-none px-2 py-0.5 ${
                            wf.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                            wf.status === 'blocked' ? 'bg-rose-100 text-rose-700' : 
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {(wf.status || 'pending').replace('_', ' ')}
                          </Badge>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">
                            BK-{wf.bookingId?.slice(0, 8)}
                          </span>
                        </div>
                        <CardTitle className="text-lg flex items-center gap-2 group-hover:text-primary transition-colors">
                          <Icon className="h-5 w-5 text-primary/70" />
                          {wf.serviceType.toUpperCase()}
                        </CardTitle>
                        <CardDescription className="font-medium text-slate-900 dark:text-slate-200 truncate">
                          {wf.booking?.groupName || "Thailand Expedition"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border">
                            <div>
                              <p className="text-muted-foreground font-bold uppercase tracking-tighter mb-0.5">Participants</p>
                              <p className="font-bold flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {wf.booking?.partySizeExpected || 2} Pax
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground font-bold uppercase tracking-tighter mb-0.5">Step</p>
                              <p className="font-bold truncate">{wf.currentStep || "Awaiting Action"}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 rounded-full hover:bg-primary hover:text-white transition-colors"
                              onClick={() => setSelectedBookingId(wf.bookingId || null)}
                            >
                              Manifest
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1 rounded-full shadow-sm"
                              onClick={() => setUploadWorkflowId(wf.id)}
                            >
                              Upload
                            </Button>
                          </div>
                          
                          <div className="pt-2 border-t">
                            <Select
                              value={wf.status || "assigned"}
                              onValueChange={(v) => updateWorkflow.mutate({ id: wf.id, status: v })}
                            >
                              <SelectTrigger className="h-8 text-xs rounded-full border-none bg-slate-100 dark:bg-slate-800">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(WORKFLOW_STATUSES).map(([k, v]) => (
                                  <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </TabsContent>

      <TabsContent value="hotel_rates">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Hotel Rates Management</CardTitle>
              <CardDescription>Manage your room types and pricing</CardDescription>
            </div>
            <Button size="sm" onClick={() => openRateDialog("hotel")}><Plus className="h-4 w-4 mr-2" /> Create Rate</Button>
          </CardHeader>
          <CardContent>
             <div className="border rounded-md">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Hotel Name</TableHead>
                     <TableHead>Room Type</TableHead>
                     <TableHead>Rate</TableHead>
                     <TableHead>Validity</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {hotelRates?.map(r => (
                     <TableRow key={r.id}>
                       <TableCell className="font-medium">{r.hotelName}</TableCell>
                       <TableCell>{r.roomType}</TableCell>
                       <TableCell>{r.currency} {r.pricePerRoomPerNight}</TableCell>
                       <TableCell>{r.validFrom} to {r.validTo}</TableCell>
                       <TableCell><Badge variant="outline" className="capitalize">{r.status}</Badge></TableCell>
                       <TableCell className="text-right flex justify-end gap-2">
                         <Button variant="ghost" size="icon" onClick={() => openRateDialog("hotel", r)}><Plus className="h-4 w-4 rotate-45" /></Button>
                         <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                           if(confirm("Delete this rate?")) deleteRate.mutate({ type: "hotel", id: r.id });
                         }}><Trash2 className="h-4 w-4" /></Button>
                       </TableCell>
                     </TableRow>
                   ))}
                   {(!hotelRates || hotelRates.length === 0) && (
                     <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No rates found. Click create to add your first rate.</TableCell></TableRow>
                   )}
                 </TableBody>
               </Table>
             </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="guide_rates">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Guide Rates Management</CardTitle>
              <CardDescription>Manage your service rates and availability</CardDescription>
            </div>
            <Button size="sm" onClick={() => openRateDialog("guide")}><Plus className="h-4 w-4 mr-2" /> Create Rate</Button>
          </CardHeader>
          <CardContent>
             <div className="border rounded-md">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Guide Name</TableHead>
                     <TableHead>Language</TableHead>
                     <TableHead>Rate</TableHead>
                     <TableHead>Validity</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {guideRates?.map(r => (
                     <TableRow key={r.id}>
                       <TableCell className="font-medium">{r.guideName}</TableCell>
                       <TableCell>{r.language}</TableCell>
                       <TableCell>{r.currency} {r.price}</TableCell>
                       <TableCell>{r.validFrom} to {r.validTo}</TableCell>
                       <TableCell><Badge variant="outline" className="capitalize">{r.status}</Badge></TableCell>
                       <TableCell className="text-right flex justify-end gap-2">
                         <Button variant="ghost" size="icon" onClick={() => openRateDialog("guide", r)}><Plus className="h-4 w-4 rotate-45" /></Button>
                         <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                           if(confirm("Delete this rate?")) deleteRate.mutate({ type: "guide", id: r.id });
                         }}><Trash2 className="h-4 w-4" /></Button>
                       </TableCell>
                     </TableRow>
                   ))}
                   {(!guideRates || guideRates.length === 0) && (
                     <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No rates found. Click create to add your first rate.</TableCell></TableRow>
                   )}
                 </TableBody>
               </Table>
             </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sights_rates">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sights & Attractions Rates</CardTitle>
              <CardDescription>Manage ticket prices and slot requirements</CardDescription>
            </div>
            <Button size="sm" onClick={() => openRateDialog("sights")}><Plus className="h-4 w-4 mr-2" /> Create Rate</Button>
          </CardHeader>
          <CardContent>
             <div className="border rounded-md">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Attraction</TableHead>
                     <TableHead>Ticket Type</TableHead>
                     <TableHead>Price</TableHead>
                     <TableHead>Validity</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {sightsRates?.map(r => (
                     <TableRow key={r.id}>
                       <TableCell className="font-medium">{r.attractionName}</TableCell>
                       <TableCell>{r.ticketType}</TableCell>
                       <TableCell>{r.currency} {r.pricePerPerson}</TableCell>
                       <TableCell>{r.validFrom} to {r.validTo}</TableCell>
                       <TableCell><Badge variant="outline" className="capitalize">{r.status}</Badge></TableCell>
                       <TableCell className="text-right flex justify-end gap-2">
                         <Button variant="ghost" size="icon" onClick={() => openRateDialog("sights", r)}><Plus className="h-4 w-4 rotate-45" /></Button>
                         <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                           if(confirm("Delete this rate?")) deleteRate.mutate({ type: "sights", id: r.id });
                         }}><Trash2 className="h-4 w-4" /></Button>
                       </TableCell>
                     </TableRow>
                   ))}
                   {(!sightsRates || sightsRates.length === 0) && (
                     <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No rates found. Click create to add your first rate.</TableCell></TableRow>
                   )}
                 </TableBody>
               </Table>
             </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

      {/* Manifest Modal */}
      <Dialog open={!!selectedBookingId} onOpenChange={(v) => !v && setSelectedBookingId(null)}>
        <DialogContent className="max-w-3xl border-none shadow-2xl overflow-hidden p-0 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-xl">
          <div className="bg-primary/5 p-6 border-b">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Booking Details & Manifest
              </DialogTitle>
              <DialogDescription>
                Detailed overview of travelers, documents, and internal communication.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6">
            {manifestLoading ? (
              <div className="space-y-4 py-8">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <Tabs defaultValue="travelers" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="travelers"><Users className="h-4 w-4 mr-2" /> Travelers</TabsTrigger>
                <TabsTrigger value="documents"><FileCheck className="h-4 w-4 mr-2" /> Documents</TabsTrigger>
                <TabsTrigger value="messages"><MessageSquare className="h-4 w-4 mr-2" /> Messages</TabsTrigger>
              </TabsList>
              
              <TabsContent value="travelers" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm border rounded-md p-3 bg-muted/30">
                  <div><p className="text-muted-foreground">Booking Code</p><p className="font-semibold">{bookingManifest?.bookingCode}</p></div>
                  <div><p className="text-muted-foreground">Total Pax</p><p className="font-semibold">{bookingManifest?.partySizeExpected} Pax</p></div>
                </div>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Passport</th>
                        <th className="p-2 text-left">Nationality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingManifest?.travelers.map((t) => (
                        <tr key={t.id} className="border-t">
                          <td className="p-2">{t.firstName} {t.lastName}</td>
                          <td className="p-2">{t.passportNumber || "-"}</td>
                          <td className="p-2">{t.nationality || "-"}</td>
                        </tr>
                      ))}
                      {(!bookingManifest?.travelers || bookingManifest.travelers.length === 0) && (
                        <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">No travelers found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Document</th>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingManifest?.documents?.map((d) => (
                        <tr key={d.id} className="border-t">
                          <td className="p-2 font-medium">{d.fileName}</td>
                          <td className="p-2 capitalize">{d.docType}</td>
                          <td className="p-2">
                            <Badge variant={d.status === 'approved' ? 'default' : d.status === 'rejected' ? 'destructive' : 'outline'}>
                              {d.status}
                            </Badge>
                          </td>
                          <td className="p-2 text-right">
                            {d.fileUrl && (
                              <Button size="icon" variant="ghost" asChild>
                                <a href={d.fileUrl} target="_blank" rel="noreferrer"><Download className="h-4 w-4" /></a>
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {(!bookingManifest?.documents || bookingManifest.documents?.length === 0) && (
                        <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No documents uploaded by you yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-center">
                   <Button size="sm" onClick={() => {
                     // Find the workflow ID for this booking
                     const wf = workflows?.find(w => w.bookingId === selectedBookingId);
                     if (wf) setUploadWorkflowId(wf.id);
                   }}>
                     <Upload className="h-4 w-4 mr-2" /> Upload New Document
                   </Button>
                </div>
              </TabsContent>

              <TabsContent value="messages" className="space-y-4">
                <div className="border rounded-md p-3 h-64 overflow-y-auto space-y-3 bg-muted/20 flex flex-col">
                  {messages?.map((m) => (
                    <div key={m.id} className={`flex flex-col mb-2 ${m.senderUserId === profile?.userId ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-2 text-sm ${
                        m.senderUserId === profile?.userId ? 'bg-primary text-primary-foreground' : 'bg-card border'
                      }`}>
                        <p className="font-semibold text-[10px] opacity-70 mb-1">
                          {m.senderUserId === profile?.userId ? 'You' : m.senderName} • {new Date(m.createdAt).toLocaleTimeString()}
                        </p>
                        <p className="whitespace-pre-wrap">{m.messageText}</p>
                      </div>
                    </div>
                  ))}
                  {(!messages || messages.length === 0) && (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                      No internal messages yet.
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type a message to admin..." 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && newMessage && sendMessage.mutate(newMessage)}
                  />
                  <Button size="icon" disabled={!newMessage || sendMessage.isPending} onClick={() => sendMessage.mutate(newMessage)}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>

      {/* Upload Document Modal */}
      <Dialog open={!!uploadWorkflowId} onOpenChange={(v) => !v && setUploadWorkflowId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document / Voucher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={uploadDocType} onValueChange={setUploadDocType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="voucher">Voucher</SelectItem>
                  <SelectItem value="hotel_confirm">Hotel Confirmation</SelectItem>
                  <SelectItem value="eticket">E-Ticket</SelectItem>
                  <SelectItem value="pnr">PNR Details</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>File Name / Description</Label>
              <Input 
                placeholder="e.g. Hotel Voucher - Booking X" 
                value={uploadFileName} 
                onChange={(e) => setUploadFileName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>File Upload (Optional)</Label>
              <Input 
                type="file" 
                disabled={isUploadingFile}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsUploadingFile(true);
                  try {
                    const formData = new FormData();
                    formData.append("image", file);
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: formData,
                    });
                    if (!res.ok) throw new Error("Upload failed");
                    const data = await res.json();
                    setUploadFileUrl(data.url);
                    if (!uploadFileName) setUploadFileName(file.name);
                    toast({ title: "File uploaded temporarily", description: "Click Upload Document to save." });
                  } catch (err: any) {
                    toast({ title: err.message, variant: "destructive" });
                  } finally {
                    setIsUploadingFile(false);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>File URL</Label>
              <Input 
                placeholder="https://..." 
                value={uploadFileUrl} 
                onChange={(e) => setUploadFileUrl(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadWorkflowId(null)}>Cancel</Button>
            <Button onClick={() => uploadDocument.mutate({ fileName: uploadFileName, fileUrl: uploadFileUrl, docType: uploadDocType })} disabled={!uploadFileName || !uploadFileUrl || uploadDocument.isPending}>
                {uploadDocument.isPending ? "Uploading..." : "Upload Document"}
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rate Dialog Form */}
      <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRate ? "Edit Rate" : "Create New Rate"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const data: any = {
              validFrom: fd.get("validFrom"),
              validTo: fd.get("validTo"),
              status: "active",
            };
            if (rateType === "hotel") {
              data.hotelName = fd.get("hotelName");
              data.roomType = fd.get("roomType");
              data.pricePerRoomPerNight = parseInt(fd.get("price") as string);
            } else if (rateType === "guide") {
              data.guideName = fd.get("guideName");
              data.language = fd.get("language");
              data.price = parseInt(fd.get("price") as string);
            } else {
              data.attractionName = fd.get("attractionName");
              data.ticketType = fd.get("ticketType");
              data.pricePerPerson = parseInt(fd.get("price") as string);
            }
            saveRate.mutate({ type: rateType, id: editingRate?.id, data });
          }} className="space-y-4 pt-4">
            {rateType === "hotel" && (
              <>
                <div className="space-y-2"><Label>Hotel Name</Label><Input name="hotelName" defaultValue={editingRate?.hotelName} required /></div>
                <div className="space-y-2"><Label>Room Type</Label><Input name="roomType" defaultValue={editingRate?.roomType} required /></div>
                <div className="space-y-2"><Label>Price Per Night</Label><Input type="number" name="price" defaultValue={editingRate?.pricePerRoomPerNight} required /></div>
              </>
            )}
            {rateType === "guide" && (
              <>
                <div className="space-y-2"><Label>Guide Name</Label><Input name="guideName" defaultValue={editingRate?.guideName} required /></div>
                <div className="space-y-2"><Label>Language</Label><Input name="language" defaultValue={editingRate?.language} required /></div>
                <div className="space-y-2"><Label>Price</Label><Input type="number" name="price" defaultValue={editingRate?.price} required /></div>
              </>
            )}
            {rateType === "sights" && (
              <>
                <div className="space-y-2"><Label>Attraction Name</Label><Input name="attractionName" defaultValue={editingRate?.attractionName} required /></div>
                <div className="space-y-2"><Label>Ticket Type</Label><Input name="ticketType" defaultValue={editingRate?.ticketType} required /></div>
                <div className="space-y-2"><Label>Price</Label><Input type="number" name="price" defaultValue={editingRate?.pricePerPerson} required /></div>
              </>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Valid From</Label><Input type="date" name="validFrom" defaultValue={editingRate?.validFrom?.split("T")[0] || format(new Date(), "yyyy-MM-dd")} required /></div>
              <div className="space-y-2"><Label>Valid To</Label><Input type="date" name="validTo" defaultValue={editingRate?.validTo?.split("T")[0]} required /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveRate.isPending}>
                {saveRate.isPending ? "Saving..." : "Save Rate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function SupplierNotifications() {
  const { data: notifications, isLoading } = useQuery<any[]>({ queryKey: ["/api/notifications"] });
  const { toast } = useToast();

  const markRead = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/notifications/${id}/read`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const unread = notifications?.filter(n => !n.read) || [];
  if (unread.length === 0) return null;

  return (
    <div className="space-y-3">
      {unread.map((n) => (
        <motion.div key={n.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Bell className="h-4 w-4 text-primary animate-bounce" />
              </div>
              <div>
                <p className="text-sm font-bold">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.message}</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => markRead.mutate(n.id)}>Dismiss</Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
