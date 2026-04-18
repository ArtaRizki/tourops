import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, MapPin, Calendar, Eye, EyeOff, Pencil, Trash2, ListOrdered, X } from "lucide-react";
import type { Tour, TourDay } from "@shared/schema";

export default function AdminTours() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTour, setEditTour] = useState<Tour | null>(null);
  const [itineraryTour, setItineraryTour] = useState<Tour | null>(null);

  const { data: tours, isLoading } = useQuery<Tour[]>({ queryKey: ["/api/tours"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/tours", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      setShowCreate(false);
      toast({ title: "Tour created successfully" });
    },
    onError: () => toast({ title: "Failed to create tour", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PATCH", `/api/tours/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      setEditTour(null);
      toast({ title: "Tour updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tours/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      toast({ title: "Tour deleted" });
    },
  });

  const togglePublish = useMutation({
    mutationFn: (tour: Tour) => apiRequest("PATCH", `/api/tours/${tour.id}`, { isPublished: !tour.isPublished }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tours"] }),
  });

  const filteredTours = tours?.filter((t) => t.title.toLowerCase().includes(search.toLowerCase())) || [];

  function TourForm({ tour, onSubmit, isPending }: { tour?: Tour | null; onSubmit: (data: any) => void; isPending: boolean }) {
    const [title, setTitle] = useState(tour?.title || "");
    const [description, setDescription] = useState(tour?.description || "");
    const [highlights, setHighlights] = useState(tour?.highlights || "");
    const [imageUrl, setImageUrl] = useState(tour?.imageUrl || "");
    const [duration, setDuration] = useState(tour?.duration || 7);
    const [basePrice, setBasePrice] = useState(tour?.basePrice || 0);
    const [countries, setCountries] = useState((tour?.countries || []).join(", "));
    const [tags, setTags] = useState((tour?.tags || []).join(", "));
    const [internalNotes, setInternalNotes] = useState(tour?.internalNotes || "");

    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <Label>Tour Title *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Ancient Greece Explorer" data-testid="input-tour-title" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tour description..." data-testid="input-tour-description" />
        </div>
        <div>
          <Label>Highlights</Label>
          <Textarea value={highlights} onChange={(e) => setHighlights(e.target.value)} placeholder="Key highlights..." />
        </div>
        <div>
          <Label>Image URL</Label>
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="/images/tour.png" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Duration (days)</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 1)} data-testid="input-tour-duration" />
          </div>
          <div>
            <Label>Base Price (USD cents)</Label>
            <Input type="number" value={basePrice} onChange={(e) => setBasePrice(parseInt(e.target.value) || 0)} data-testid="input-tour-price" />
          </div>
        </div>
        <div>
          <Label>Countries (comma separated)</Label>
          <Input value={countries} onChange={(e) => setCountries(e.target.value)} placeholder="GR, IT, ES" />
        </div>
        <div>
          <Label>Tags (comma separated)</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="adventure, cultural, family" />
        </div>
        <div>
          <Label>Internal Notes</Label>
          <Textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Admin-only notes..." />
        </div>
        <Button
          className="w-full"
          onClick={() => onSubmit({
            ...(tour?.id ? { id: tour.id } : {}),
            title, description, highlights, imageUrl, duration, basePrice, internalNotes,
            countries: countries.split(",").map((c) => c.trim()).filter(Boolean),
            tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          })}
          disabled={isPending || !title}
          data-testid="button-save-tour"
        >
          {isPending ? "Saving..." : tour ? "Update Tour" : "Create Tour"}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif">Tours</h1>
          <p className="text-muted-foreground text-sm">Manage your tour catalog</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-tour"><Plus className="h-4 w-4 mr-2" />Create Tour</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create New Tour</DialogTitle></DialogHeader>
            <TourForm onSubmit={(data) => createMutation.mutate(data)} isPending={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search tours..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-tours" />
      </div>

      {filteredTours.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MapPin className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold mb-1">No tours found</h3>
            <p className="text-sm text-muted-foreground">Create your first tour to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTours.map((tour) => (
            <Card key={tour.id} className="overflow-visible" data-testid={`card-tour-${tour.id}`}>
              {tour.imageUrl && (
                <div className="aspect-video overflow-hidden rounded-t-md">
                  <img src={tour.imageUrl} alt={tour.title} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{tour.title}</h3>
                  <Badge variant={tour.isPublished ? "default" : "secondary"}>
                    {tour.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{tour.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{tour.duration} days</span>
                  {tour.countries && tour.countries.length > 0 && (
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{tour.countries.join(", ")}</span>
                  )}
                  {tour.basePrice ? <span className="font-medium text-foreground">${tour.basePrice}</span> : null}
                </div>
                {tour.tags && tour.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tour.tags.map((tag) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                  </div>
                )}
                <div className="flex items-center gap-1 pt-1">
                  <Button size="icon" variant="ghost" onClick={() => togglePublish.mutate(tour)} data-testid={`button-toggle-publish-${tour.id}`}>
                    {tour.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Dialog open={editTour?.id === tour.id} onOpenChange={(open) => !open && setEditTour(null)}>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" onClick={() => setEditTour(tour)} data-testid={`button-edit-tour-${tour.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader><DialogTitle>Edit Tour</DialogTitle></DialogHeader>
                      <TourForm tour={editTour} onSubmit={(data) => updateMutation.mutate(data)} isPending={updateMutation.isPending} />
                    </DialogContent>
                  </Dialog>
                  <Button size="icon" variant="ghost" onClick={() => setItineraryTour(tour)} data-testid={`button-itinerary-${tour.id}`}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(tour.id)} data-testid={`button-delete-tour-${tour.id}`}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!itineraryTour} onOpenChange={(open) => !open && setItineraryTour(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Itinerary: {itineraryTour?.title}</DialogTitle></DialogHeader>
          {itineraryTour && <ItineraryEditor tourId={itineraryTour.id} duration={itineraryTour.duration} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ItineraryEditor({ tourId, duration }: { tourId: string; duration: number }) {
  const { toast } = useToast();
  const { data: days, isLoading } = useQuery<TourDay[]>({ queryKey: ["/api/tours", tourId, "days"] });

  const [dayNumber, setDayNumber] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [city, setCity] = useState("");
  const [activities, setActivities] = useState("");
  const [editDay, setEditDay] = useState<TourDay | null>(null);

  const createDay = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/tours/${tourId}/days`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours", tourId, "days"] });
      setTitle(""); setDescription(""); setCountryCode(""); setCity(""); setActivities("");
      setDayNumber((prev) => prev + 1);
      toast({ title: "Day added" });
    },
    onError: () => toast({ title: "Failed to add day", variant: "destructive" }),
  });

  const updateDay = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PATCH", `/api/tour-days/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours", tourId, "days"] });
      setEditDay(null);
      toast({ title: "Day updated" });
    },
  });

  const deleteDay = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tour-days/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours", tourId, "days"] });
      toast({ title: "Day removed" });
    },
  });

  const sortedDays = days?.sort((a, b) => a.dayNumber - b.dayNumber) || [];

  if (isLoading) return <Skeleton className="h-40" />;

  return (
    <div className="space-y-4">
      <div className="space-y-3 border rounded-md p-4">
        <p className="font-medium text-sm">Add Day</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Day Number</Label>
            <Input type="number" value={dayNumber} onChange={(e) => setDayNumber(parseInt(e.target.value) || 1)} min={1} max={duration} data-testid="input-day-number" />
          </div>
          <div>
            <Label>Country Code</Label>
            <Input value={countryCode} onChange={(e) => setCountryCode(e.target.value)} placeholder="GR" data-testid="input-day-country" />
          </div>
        </div>
        <div>
          <Label>Day Title *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Athens Arrival" data-testid="input-day-title" />
        </div>
        <div>
          <Label>City</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Athens" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What happens this day..." />
        </div>
        <div>
          <Label>Activities</Label>
          <Textarea value={activities} onChange={(e) => setActivities(e.target.value)} placeholder="Activities for this day..." />
        </div>
        <Button
          onClick={() => createDay.mutate({ dayNumber, title, description, countryCode: countryCode || undefined, city: city || undefined, activities: activities || undefined })}
          disabled={!title || createDay.isPending}
          data-testid="button-add-day"
        >
          {createDay.isPending ? "Adding..." : "Add Day"}
        </Button>
      </div>

      {sortedDays.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No itinerary days yet. Add your first day above.</p>
      ) : (
        <div className="space-y-2">
          {sortedDays.map((day) => (
            <Card key={day.id} data-testid={`card-day-${day.id}`}>
              <CardContent className="p-4">
                {editDay?.id === day.id ? (
                  <EditDayForm day={editDay} onSave={(data) => updateDay.mutate({ id: day.id, ...data })} onCancel={() => setEditDay(null)} isPending={updateDay.isPending} />
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Day {day.dayNumber}</Badge>
                        <span className="font-medium text-sm">{day.title}</span>
                        {day.countryCode && <Badge variant="secondary" className="text-xs">{day.countryCode}</Badge>}
                        {day.city && <span className="text-xs text-muted-foreground">{day.city}</span>}
                      </div>
                      {day.description && <p className="text-xs text-muted-foreground mt-1">{day.description}</p>}
                      {day.activities && <p className="text-xs text-muted-foreground mt-1">Activities: {day.activities}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditDay(day)} data-testid={`button-edit-day-${day.id}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteDay.mutate(day.id)} data-testid={`button-delete-day-${day.id}`}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function EditDayForm({ day, onSave, onCancel, isPending }: { day: TourDay; onSave: (data: any) => void; onCancel: () => void; isPending: boolean }) {
  const [title, setTitle] = useState(day.title);
  const [description, setDescription] = useState(day.description || "");
  const [countryCode, setCountryCode] = useState(day.countryCode || "");
  const [city, setCity] = useState(day.city || "");
  const [activities, setActivities] = useState(day.activities || "");
  const [dayNumber, setDayNumber] = useState(day.dayNumber);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Day Number</Label><Input type="number" value={dayNumber} onChange={(e) => setDayNumber(parseInt(e.target.value) || 1)} /></div>
        <div><Label>Country</Label><Input value={countryCode} onChange={(e) => setCountryCode(e.target.value)} /></div>
      </div>
      <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
      <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <div><Label>Activities</Label><Textarea value={activities} onChange={(e) => setActivities(e.target.value)} /></div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => onSave({ dayNumber, title, description, countryCode: countryCode || undefined, city: city || undefined, activities: activities || undefined })} disabled={!title || isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
