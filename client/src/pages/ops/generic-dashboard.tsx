import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function GenericRoleDashboard() {
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/user-profile"],
  });
  const { toast } = useToast();
  
  const role = profile?.role || "customer";
  
  const dashboardMap: Record<string, { title: string, subtitle: string, entity: string }> = {
    city_manager: { title: "City Dashboard", subtitle: "Manage city-level tours and operations", entity: "City Record" },
    content_editor: { title: "Editor Dashboard", subtitle: "Manage platform content and articles", entity: "Content Article" },
    flight_agent: { title: "Flight Dashboard", subtitle: "Manage flight routes and ticketing", entity: "Flight Route" },
    tour_builder: { title: "Builder Dashboard", subtitle: "Manage tour itineraries and builders", entity: "Itinerary" },
    supplier: { title: "Supplier Dashboard", subtitle: "Manage general supply and inventory", entity: "Supply Item" },
    travel_agent: { title: "Agent Dashboard", subtitle: "Manage client bookings and commissions", entity: "Agent Client" },
  };

  const config = dashboardMap[role] || { title: "Dashboard", subtitle: "Welcome to your portal", entity: "Item" };
  const [items, setItems] = useState([
    { id: 1, name: `Sample ${config.entity} 1`, status: "Active" },
    { id: 2, name: `Sample ${config.entity} 2`, status: "Pending" }
  ]);

  const handleCreate = () => {
    setItems([...items, { id: Date.now(), name: `New ${config.entity} ${items.length + 1}`, status: "Draft" }]);
    toast({ title: "Success", description: `${config.entity} created successfully.` });
  };

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    toast({ title: "Deleted", description: `${config.entity} deleted successfully.`, variant: "destructive" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif">{config.title}</h1>
          <p className="text-muted-foreground text-sm">{config.subtitle}</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Create {config.entity}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent {config.entity}s</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No records found. Click Create to add one.</div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{item.status}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
