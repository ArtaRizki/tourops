import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Search, FileText, CheckCircle, XCircle, Clock, ArrowRight, ExternalLink, Download } from "lucide-react";
import type { Document, Booking } from "@shared/schema";
import { useState } from "react";
import { DocumentPreview } from "@/components/DocumentPreview";

const DOC_TYPES: Record<string, string> = {
  passport: "Passport", id_doc: "ID Document", visa: "Visa",
  eticket: "E-Ticket", pnr: "PNR", hotel_confirm: "Hotel Confirmation",
  voucher: "Voucher", transport_confirm: "Transport Confirmation",
  guide_confirm: "Guide Confirmation", sight_ticket: "Sight Ticket",
  quote: "Quote", receipt: "Receipt", other: "Other",
};

export default function AdminDocuments() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: documents, isLoading } = useQuery<Document[]>({ queryKey: ["/api/documents"] });
  const { data: bookings } = useQuery<Booking[]>({ queryKey: ["/api/bookings"] });

  const updateDoc = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PATCH", `/api/documents/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Document updated" });
    },
  });

  const filtered = (documents || []).filter((d) => {
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchType = typeFilter === "all" || d.docType === typeFilter;
    const booking = bookings?.find(b => b.id === d.bookingId);
    const matchSearch = !search || 
      (d.fileName || "").toLowerCase().includes(search.toLowerCase()) || 
      (booking?.bookingCode || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const pendingDocs = documents ? documents.filter(d => d.status === "uploaded").length : 0;

  if (isLoading) return <div className="p-6"><Skeleton className="h-8 w-48 mb-4" />{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 mb-2" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif" data-testid="text-documents-title">Documents</h1>
        <p className="text-muted-foreground text-sm">Review and manage all booking documents</p>
      </div>

      {pendingDocs > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{pendingDocs} document(s) pending review</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by file name or booking..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-documents" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]" data-testid="select-doc-status-filter"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="uploaded">Uploaded</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-doc-type-filter"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(DOC_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-16"><FileText className="h-12 w-12 text-muted-foreground/40 mb-4" /><h3 className="font-semibold mb-1">No documents found</h3><p className="text-sm text-muted-foreground">Documents will appear as they are uploaded</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => {
            const booking = bookings?.find(b => b.id === doc.bookingId);
            return (
              <Card key={doc.id} data-testid={`card-document-${doc.id}`}>
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doc.fileName}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{DOC_TYPES[doc.docType] || doc.docType}</span>
                        <Link href={`/admin/bookings/${doc.bookingId}`}>
                          <span className="underline cursor-pointer">{booking?.bookingCode || "View Booking"}</span>
                        </Link>
                        {doc.createdAt && <span>{new Date(doc.createdAt).toLocaleDateString()}</span>}
                      </div>
                      {doc.reviewNotes && <p className="text-xs text-muted-foreground mt-1">Review: {doc.reviewNotes}</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={doc.status === "approved" ? "default" : doc.status === "rejected" ? "destructive" : "secondary"}>
                      {doc.status === "approved" ? "Approved" : doc.status === "rejected" ? "Rejected" : "Pending"}
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
                        <Button size="sm" variant="outline" onClick={() => updateDoc.mutate({ id: doc.id, status: "approved" })} data-testid={`button-approve-doc-${doc.id}`}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateDoc.mutate({ id: doc.id, status: "rejected" })} data-testid={`button-reject-doc-${doc.id}`}>
                          <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
