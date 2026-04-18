import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Hotel, Bus, UserCheck, Ticket, Clock, CheckCircle, AlertTriangle, ClipboardList } from "lucide-react";
import { SERVICE_TYPES, WORKFLOW_STATUSES } from "@/lib/constants";
import type { BookingWorkflow } from "@shared/schema";

const serviceIcons: Record<string, any> = {
  airline: ClipboardList, hotel: Hotel, transport: Bus, guide: UserCheck, sights: Ticket,
};

export default function OpsDashboard() {
  const { toast } = useToast();
  const { data: workflows, isLoading } = useQuery<BookingWorkflow[]>({
    queryKey: ["/api/ops/workflows"],
  });

  const updateWorkflow = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PATCH", `/api/workflows/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ops/workflows"] });
      toast({ title: "Task updated" });
    },
  });

  const active = workflows?.filter((w) => w.status !== "completed" && w.status !== "cancelled").length || 0;
  const completed = workflows?.filter((w) => w.status === "completed").length || 0;

  if (isLoading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-64" />{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif" data-testid="text-ops-title">Operations Dashboard</h1>
        <p className="text-muted-foreground text-sm">Manage your assigned service tasks</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm text-muted-foreground">Active Tasks</p><p className="text-2xl font-bold">{active}</p></div>
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center"><Clock className="h-5 w-5 text-primary" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold">{completed}</p></div>
              <div className="w-10 h-10 rounded-md bg-green-600/10 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-green-600" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Your Tasks</h2>
        {!workflows || workflows.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center py-16"><ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-4" /><h3 className="font-semibold mb-1">No tasks assigned</h3><p className="text-sm text-muted-foreground">Tasks will appear here when assigned by your country manager or admin</p></CardContent></Card>
        ) : (
          <div className="space-y-2">
            {workflows.map((wf) => {
              const Icon = serviceIcons[wf.serviceType] || ClipboardList;
              return (
                <Card key={wf.id} data-testid={`card-ops-task-${wf.id}`}>
                  <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{SERVICE_TYPES[wf.serviceType]}</p>
                        <p className="text-xs text-muted-foreground">
                          {wf.currentStep || "Awaiting action"} {wf.countryCode ? `| ${wf.countryCode}` : ""}
                        </p>
                      </div>
                    </div>
                    <Select
                      value={wf.status || "assigned"}
                      onValueChange={(v) => updateWorkflow.mutate({ id: wf.id, status: v })}
                    >
                      <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(WORKFLOW_STATUSES).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
