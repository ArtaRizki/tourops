import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, DollarSign, ExternalLink, Mail, Code } from "lucide-react";
import type { Affiliate, AffiliatePayout, UserProfile } from "@shared/schema";
import { canWrite } from "@/lib/permissions";
import { PermissionBanner } from "@/components/permission-banner";

export default function AffiliatesPage() {
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  
  const { data: affiliates, isLoading } = useQuery<Affiliate[]>({ 
    queryKey: ["/api/admin/affiliates"] 
  });
  const { data: profile } = useQuery<UserProfile>({ queryKey: ["/api/user-profile"] });
  const role = profile?.role;
  const isWritable = canWrite(role, "affiliates");

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/affiliates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
      setShowCreate(false);
      toast({ title: "Affiliate partner added successfully" });
    },
  });

  if (isLoading) return <div className="p-6 space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="p-6 space-y-6">
      {!isWritable && <PermissionBanner role={role} feature="affiliates" featureLabel="Kelola Afiliasi" />}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-serif">Affiliate Partners</h1>
          <p className="text-muted-foreground text-sm">Manage your referral network and commissions</p>
        </div>
        {isWritable && (
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Partner</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Affiliate Partner</DialogTitle></DialogHeader>
            <AffiliateForm onSubmit={(data) => createMutation.mutate(data)} isPending={createMutation.isPending} />
          </DialogContent>
        </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {affiliates?.map((aff) => (
          <Card key={aff.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{aff.name}</CardTitle>
                <Badge variant={aff.isActive ? "default" : "secondary"}>
                  {aff.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Code className="h-4 w-4" />
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-primary font-bold">{aff.code}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{aff.email || "No email provided"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>Commission Rate: <strong>{aff.commissionRate}%</strong></span>
              </div>
              <div className="pt-2 border-t">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" /> View Performance
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {affiliates?.length === 0 && (
          <div className="col-span-full py-12 text-center bg-muted/20 rounded-lg border border-dashed">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No affiliate partners yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AffiliateForm({ onSubmit, isPending }: { onSubmit: (data: any) => void; isPending: boolean }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [rate, setRate] = useState("10");

  return (
    <div className="space-y-4">
      <div>
        <Label>Partner Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Agency Name or Individual" />
      </div>
      <div>
        <Label>Unique Referral Code</Label>
        <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))} placeholder="e.g. AGENT001" />
      </div>
      <div>
        <Label>Contact Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="partner@example.com" />
      </div>
      <div>
        <Label>Commission Percentage (%)</Label>
        <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
      </div>
      <Button className="w-full" onClick={() => onSubmit({ name, code, email, commissionRate: rate })} disabled={isPending || !name || !code}>
        {isPending ? "Creating..." : "Save Partner"}
      </Button>
    </div>
  );
}
