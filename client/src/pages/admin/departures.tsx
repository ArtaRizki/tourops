import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Users, MapPin } from "lucide-react";
import type { TourDeparture, Tour } from "@shared/schema";

export default function AdminDepartures() {
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);

  const { data: departures, isLoading } = useQuery<TourDeparture[]>({ queryKey: ["/api/departures"] });
  const { data: tours } = useQuery<Tour[]>({ queryKey: ["/api/tours"] });

  const [tourId, setTourId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [capacity, setCapacity] = useState(20);
  const [price, setPrice] = useState(0);
  const [publicJoin, setPublicJoin] = useState(true);

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/departures", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departures"] });
      setShowCreate(false);
      toast({ title: "Departure created" });
    },
    onError: () => toast({ title: "Failed to create departure", variant: "destructive" }),
  });

  const statusColors: Record<string, string> = {
    open: "default",
    closed: "secondary",
    sold_out: "destructive",
    cancelled: "outline",
  };

  if (isLoading) return <div className="p-6"><Skeleton className="h-8 w-48 mb-4" />{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 mb-2" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif">Departures</h1>
          <p className="text-muted-foreground text-sm">Manage tour departure dates</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-departure"><Plus className="h-4 w-4 mr-2" />Create Departure</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Departure</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tour</Label>
                <Select value={tourId} onValueChange={setTourId}>
                  <SelectTrigger data-testid="select-departure-tour"><SelectValue placeholder="Select tour" /></SelectTrigger>
                  <SelectContent>
                    {tours?.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} data-testid="input-start-date" /></div>
                <div><Label>End Date</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} data-testid="input-end-date" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Capacity</Label><Input type="number" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || 0)} /></div>
                <div><Label>Price/Person</Label><Input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value) || 0)} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={publicJoin} onCheckedChange={setPublicJoin} />
                <Label>Allow public join</Label>
              </div>
              <Button
                className="w-full"
                onClick={() => createMutation.mutate({ tourId, startDate, endDate, capacityTotal: capacity, pricePerPerson: price, publicJoinEnabled: publicJoin })}
                disabled={!tourId || !startDate || !endDate || createMutation.isPending}
                data-testid="button-save-departure"
              >{createMutation.isPending ? "Creating..." : "Create Departure"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!departures || departures.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-16"><Calendar className="h-12 w-12 text-muted-foreground/40 mb-4" /><h3 className="font-semibold mb-1">No departures</h3><p className="text-sm text-muted-foreground">Create a departure for one of your tours</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {departures.map((dep) => {
            const tour = tours?.find((t) => t.id === dep.tourId);
            return (
              <Card key={dep.id} data-testid={`card-departure-${dep.id}`}>
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-sm">{tour?.title || "Unknown Tour"}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{dep.startDate} to {dep.endDate}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{dep.capacityBooked}/{dep.capacityTotal} booked</span>
                      {dep.pricePerPerson && <span>${dep.pricePerPerson}/person</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dep.publicJoinEnabled && <Badge variant="outline">Public</Badge>}
                    <Badge variant={statusColors[dep.status || "open"] as any}>{dep.status || "open"}</Badge>
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
