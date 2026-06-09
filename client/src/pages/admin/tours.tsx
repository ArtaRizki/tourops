import { useState, useMemo } from "react";
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
import { Plus, Search, MapPin, Calendar, Eye, EyeOff, Pencil, Trash2, ListOrdered, X, FileDown, Clock, Utensils, Plane, Hotel, Activity, ChevronDown, ChevronUp, DollarSign, Sparkles, Loader2, Upload } from "lucide-react";
import type { Tour, TourDay, TourDayItem } from "@shared/schema";

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
    onError: (err: any) => toast({ title: "Failed to create tour", description: err.message, variant: "destructive" }),
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
    const [inclusions, setInclusions] = useState(tour?.inclusions || "");
    const [exclusions, setExclusions] = useState(tour?.exclusions || "");
    const [imageUrl, setImageUrl] = useState(tour?.imageUrl || "");
    const [galleryUrls, setGalleryUrls] = useState((tour?.galleryUrls || []).join(", "));
    const [duration, setDuration] = useState(tour?.duration || 7);
    const [basePrice, setBasePrice] = useState(tour?.basePrice || 0);
    const [childPrice, setChildPrice] = useState(tour?.childPrice || 0);
    const [singleSupplement, setSingleSupplement] = useState(tour?.singleSupplement || 0);
    const [countries, setCountries] = useState((tour?.countries || []).join(", "));
    const [tags, setTags] = useState((tour?.tags || []).join(", "));
    const [category, setCategory] = useState(tour?.category || "");
    const [internalNotes, setInternalNotes] = useState(tour?.internalNotes || "");
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) throw new Error("Upload failed");
        
        const data = await res.json();
        setImageUrl(data.url);
        toast({ title: "Image uploaded successfully" });
      } catch (error) {
        toast({ title: "Failed to upload image", variant: "destructive" });
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
        {/* Row 1: Title full width */}
        <div>
          <Label>Tour Title *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Ancient Greece Explorer" data-testid="input-tour-title" />
        </div>

        {/* Row 2: Category | Duration | Base Price | Child Price | Single Supp */}
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2">
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Adventure, Cultural, Religious" />
          </div>
          <div>
            <Label>Duration (days)</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 1)} data-testid="input-tour-duration" />
          </div>
          <div>
            <Label>Base Price ($)</Label>
            <Input type="number" value={basePrice} onChange={(e) => setBasePrice(parseInt(e.target.value) || 0)} data-testid="input-tour-price" />
          </div>
          <div>
            <Label>Child Price ($)</Label>
            <Input type="number" value={childPrice} onChange={(e) => setChildPrice(parseInt(e.target.value) || 0)} />
          </div>
        </div>

        {/* Row 3: Description | Highlights */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tour description..." rows={3} data-testid="input-tour-description" />
          </div>
          <div>
            <Label>Highlights</Label>
            <Textarea value={highlights} onChange={(e) => setHighlights(e.target.value)} placeholder="Key highlights..." rows={3} />
          </div>
        </div>

        {/* Row 4: Inclusions | Exclusions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Inclusions</Label>
            <Textarea value={inclusions} onChange={(e) => setInclusions(e.target.value)} placeholder="What's included..." rows={2} />
          </div>
          <div>
            <Label>Exclusions</Label>
            <Textarea value={exclusions} onChange={(e) => setExclusions(e.target.value)} placeholder="What's not included..." rows={2} />
          </div>
        </div>

        {/* Row 5: Internal Notes | Single Supplement + Countries */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Internal Notes</Label>
            <Textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Admin-only notes..." rows={2} />
          </div>
          <div className="space-y-3">
            <div>
              <Label>Single Supplement ($)</Label>
              <Input type="number" value={singleSupplement} onChange={(e) => setSingleSupplement(parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Countries (comma separated)</Label>
              <Input value={countries} onChange={(e) => setCountries(e.target.value)} placeholder="GR, IT, ES" />
            </div>
          </div>
        </div>

        {/* Row 6: Image Upload + Tags */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cover Image URL</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="/images/tour.png" />
            <Label>Or Upload Image</Label>
            <div className="flex gap-2 items-center">
              <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="cursor-pointer" />
              {isUploading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <Label>Tags (comma separated)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="adventure, cultural, family" />
            </div>
            <div>
              <Label>Gallery URLs (comma separated)</Label>
              <Input value={galleryUrls} onChange={(e) => setGalleryUrls(e.target.value)} placeholder="url1, url2, url3" />
            </div>
            {imageUrl && (
              <div className="border rounded-md overflow-hidden bg-muted h-24">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="object-cover w-full h-full"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                  onLoad={(e) => (e.currentTarget.style.display = 'block')}
                />
              </div>
            )}
          </div>
        </div>

        <Button
          className="w-full"
          onClick={() => onSubmit({
            ...(tour?.id ? { id: tour.id } : {}),
            title, description, highlights, inclusions, exclusions, imageUrl,
            duration, basePrice: String(basePrice), childPrice: String(childPrice),
            singleSupplement: String(singleSupplement), category, internalNotes,
            galleryUrls: galleryUrls.split(",").map((t) => t.trim()).filter(Boolean),
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
        <div className="flex gap-2">
          <AIGeneratorDialog onGenerated={(data) => {
            setShowCreate(false);
            setEditTour(data);
            toast({ title: "Itinerary generated! Please review the details below." });
          }} />

          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-tour"><Plus className="h-4 w-4 mr-2" />Create Tour</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader><DialogTitle>Create New Tour</DialogTitle></DialogHeader>
              <TourForm onSubmit={(data) => createMutation.mutate(data)} isPending={createMutation.isPending} />
            </DialogContent>
          </Dialog>
        </div>
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
                  <TourMarginBadge tourId={tour.id} />
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
                    <DialogContent className="max-w-3xl">
                      <DialogHeader><DialogTitle>Edit Tour</DialogTitle></DialogHeader>
                      <TourForm tour={editTour} onSubmit={(data) => updateMutation.mutate(data)} isPending={updateMutation.isPending} />
                    </DialogContent>
                  </Dialog>
                  <Button size="icon" variant="ghost" onClick={() => setItineraryTour(tour)} data-testid={`button-itinerary-${tour.id}`}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" asChild data-testid={`button-pdf-${tour.id}`}>
                    <a href={`/api/tours/${tour.id}/pdf`} target="_blank" rel="noreferrer">
                      <FileDown className="h-4 w-4 text-primary" />
                    </a>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Itinerary & Analytics: {itineraryTour?.title}</DialogTitle></DialogHeader>
          {itineraryTour && (
            <Tabs defaultValue="schedule">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
                <TabsTrigger value="financials">Financial Analytics</TabsTrigger>
                <TabsTrigger value="history">Change History</TabsTrigger>
              </TabsList>
              <TabsContent value="schedule">
                <ItineraryEditor tourId={itineraryTour.id} duration={itineraryTour.duration} />
              </TabsContent>
              <TabsContent value="financials">
                <FinancialAnalytics tourId={itineraryTour.id} />
              </TabsContent>
              <TabsContent value="history">
                <TourHistory tourId={itineraryTour.id} />
              </TabsContent>
            </Tabs>
          )}
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
  const [imageUrl, setImageUrl] = useState("");
  const [editDay, setEditDay] = useState<TourDay | null>(null);

  const createDay = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/tours/${tourId}/days`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours", tourId, "days"] });
      setTitle(""); setDescription(""); setCountryCode(""); setCity(""); setActivities(""); setImageUrl("");
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Athens" />
          </div>
          <div>
            <Label>Image URL (Optional)</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>
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
          onClick={() => createDay.mutate({ dayNumber, title, description, countryCode: countryCode || undefined, city: city || undefined, activities: activities || undefined, imageUrl: imageUrl || undefined })}
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
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">Day {day.dayNumber}</Badge>
                          <span className="font-medium text-sm">{day.title}</span>
                          {day.countryCode && <Badge variant="secondary" className="text-xs">{day.countryCode}</Badge>}
                          {day.city && <span className="text-xs text-muted-foreground">{day.city}</span>}
                        </div>
                        {day.description && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{day.description}</p>}
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
                    
                    <div className="border-t pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Schedule & Items</p>
                      <DayItemsEditor dayId={day.id} />
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

function DayItemsEditor({ dayId }: { dayId: string }) {
  const { toast } = useToast();
  const { data: items, isLoading } = useQuery<TourDayItem[]>({ queryKey: [`/api/tour-days/${dayId}/items`] });
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const { data: sights } = useQuery<any[]>({ 
    queryKey: ["/api/master/sights"], 
    enabled: searchQuery.length > 2 
  });
  const { data: hotels } = useQuery<any[]>({ 
    queryKey: ["/api/hotels"], 
    enabled: searchQuery.length > 2 
  });

  const [showAdd, setShowAdd] = useState(false);
  const [type, setType] = useState("custom");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cost, setCost] = useState("0");
  const [time, setTime] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const sResults = (sights || []).filter(s => s.name.toLowerCase().includes(q)).map(s => ({ ...s, type: 'sight' }));
    const hResults = (hotels || []).filter(h => h.name.toLowerCase().includes(q)).map(h => ({ ...h, type: 'hotel' }));
    return [...sResults, ...hResults].slice(0, 10);
  }, [searchQuery, sights, hotels]);

  const handleSelectResult = (res: any) => {
    setTitle(res.name);
    setDesc(res.description || "");
    setCost(res.individualTicketCost?.toString() || res.basePrice?.toString() || "0");
    setType(res.type);
    setSelectedId(res.id);
    setSearchQuery("");
  };

  const createItem = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/tour-days/${dayId}/items`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tour-days/${dayId}/items`] });
      setShowAdd(false); setTitle(""); setDesc(""); setCost("0"); setTime(""); setSelectedId(null);
    },
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tour-day-items/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/tour-days/${dayId}/items`] }),
  });

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'meal': return <Utensils className="h-3 w-3" />;
      case 'flight': return <Plane className="h-3 w-3" />;
      case 'hotel': return <Hotel className="h-3 w-3" />;
      case 'sight': return <MapPin className="h-3 w-3" />;
      case 'transport': return <Activity className="h-3 w-3" />;
      case 'arrival': return <Plane className="h-3 w-3 rotate-45" />;
      case 'departure': return <Plane className="h-3 w-3 -rotate-45" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (isLoading) return <Skeleton className="h-20 w-full" />;

  return (
    <div className="space-y-2">
      {items?.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 p-2 bg-white rounded border border-dashed text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-muted rounded-full">{getItemIcon(item.itemType)}</div>
            <div>
              <div className="flex items-center gap-2">
                {item.startTime && <span className="font-mono text-muted-foreground">{item.startTime}</span>}
                <span className="font-medium">{item.title}</span>
              </div>
              {item.description && <p className="text-muted-foreground truncate max-w-[200px]">{item.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {parseFloat(item.cost.toString()) > 0 && (
              <Badge variant="outline" className="font-mono font-normal">
                ${item.cost}
              </Badge>
            )}
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => deleteItem.mutate(item.id)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}

      {showAdd ? (
        <div className="p-3 bg-muted/50 rounded-md space-y-3 mt-2 border border-primary/20">
          <div className="relative">
            <Label className="text-[10px]">Search Master Data (Sights/Hotels)</Label>
            <div className="flex gap-1">
              <Input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search database..." 
                className="h-7 text-xs" 
              />
              <Search className="h-4 w-4 mt-1.5 text-muted-foreground" />
            </div>
            {filteredResults.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded shadow-lg mt-1 max-h-40 overflow-auto">
                {filteredResults.map((res: any) => (
                  <div 
                    key={res.id} 
                    className="p-2 text-[10px] hover:bg-muted cursor-pointer flex justify-between items-center"
                    onClick={() => handleSelectResult(res)}
                  >
                    <span>{res.name} ({res.type})</span>
                    <Badge variant="outline" className="text-[8px] h-4">Select</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Type</Label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full text-xs p-1 rounded border bg-white"
              >
                <option value="sight">Sight</option>
                <option value="meal">Meal</option>
                <option value="hotel">Hotel</option>
                <option value="transport">Transport</option>
                <option value="flight">Flight</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <Label className="text-[10px]">Time</Label>
              <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="09:00" className="h-7 text-xs" />
            </div>
          </div>
          <div>
            <Label className="text-[10px]">Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Item name" className="h-7 text-xs" />
          </div>
          <div>
            <Label className="text-[10px]">Description</Label>
            <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short note..." className="h-7 text-xs" />
          </div>
          <div>
            <Label className="text-[10px]">Base Cost ($)</Label>
            <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="h-7 text-xs" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-[10px]" onClick={() => createItem.mutate({ 
              itemType: type, title, description: desc, cost, startTime: time,
              sightId: type === 'sight' ? selectedId : null,
              hotelId: type === 'hotel' ? selectedId : null
            })}>Add</Button>
            <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button 
          variant="outline" 
          className="w-full h-8 text-[10px] border-dashed" 
          onClick={() => setShowAdd(true)}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Schedule Item
        </Button>
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
  const [imageUrl, setImageUrl] = useState(day.imageUrl || "");
  const [dayNumber, setDayNumber] = useState(day.dayNumber);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Day Number</Label><Input type="number" value={dayNumber} onChange={(e) => setDayNumber(parseInt(e.target.value) || 1)} /></div>
        <div><Label>Country</Label><Input value={countryCode} onChange={(e) => setCountryCode(e.target.value)} /></div>
      </div>
      <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
      <div><Label>Image URL (Optional)</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." /></div>
      <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <div><Label>Activities</Label><Textarea value={activities} onChange={(e) => setActivities(e.target.value)} /></div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => onSave({ dayNumber, title, description, countryCode: countryCode || undefined, city: city || undefined, activities: activities || undefined, imageUrl: imageUrl || undefined })} disabled={!title || isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function AIGeneratorDialog({ onGenerated }: { onGenerated: (data: any) => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dest, setDest] = useState("");
  const [days, setDays] = useState("5");
  const [pace, setPace] = useState("moderate");

  const generate = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/ai/generate-itinerary", {
        destination: dest,
        duration: parseInt(days),
        pace,
        travelerType: "general",
        interests: ["cultural", "leisure"],
        budget: "mid-range"
      });
      const data = await res.json();
      
      // Step 2: Save the generated tour to DB
      const createRes = await apiRequest("POST", "/api/tours", {
        title: data.title,
        description: data.description,
        duration: parseInt(days),
        category: data.category,
        isPublished: false
      });
      const tour = await createRes.json();

      // Step 3: Create days and items
      for (const day of data.days) {
        const dayRes = await apiRequest("POST", `/api/tours/${tour.id}/days`, {
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description
        });
        const createdDay = await dayRes.json();

        for (const item of day.items) {
          await apiRequest("POST", `/api/tour-days/${createdDay.id}/items`, {
            itemType: item.itemType,
            title: item.title,
            description: item.description,
            cost: item.cost.toString(),
            startTime: item.startTime,
            sightId: item.sightId,
            hotelId: item.hotelId
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      onGenerated(tour);
      setOpen(false);
      toast({ title: "Tour generated and saved as draft!" });
    } catch (e: any) {
      toast({ title: "AI Generation failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/50 hover:bg-primary/5">
          <Sparkles className="h-4 w-4 text-primary" /> AI Generator
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Magic Tour Generator</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Destination City/Country</Label>
            <Input value={dest} onChange={(e) => setDest(e.target.value)} placeholder="e.g. Bali, Indonesia" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (Days)</Label>
              <Input type="number" value={days} onChange={(e) => setDays(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Pace</Label>
              <select 
                value={pace} 
                onChange={(e) => setPace(e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="slow">Slow & Relaxed</option>
                <option value="moderate">Moderate</option>
                <option value="fast">Fast (Action-packed)</option>
              </select>
            </div>
          </div>
          <Button className="w-full gap-2" onClick={generate} disabled={loading || !dest}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate Professional Itinerary
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            Note: This will create a draft tour with structured schedule items using verified data where available.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FinancialAnalytics({ tourId }: { tourId: string }) {
  const { data: pricing, isLoading } = useQuery<any>({ queryKey: [`/api/tours/${tourId}/price-breakdown`] });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="text-[10px] uppercase text-muted-foreground font-semibold">Total Price</div>
            <div className="text-2xl font-bold">${pricing?.totalPrice?.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="text-[10px] uppercase text-green-600 font-semibold">Net Profit</div>
            <div className="text-2xl font-bold text-green-700">${pricing?.netProfit?.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className={pricing?.marginPercentage < 10 ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}>
          <CardContent className="pt-4">
            <div className="text-[10px] uppercase text-muted-foreground font-semibold">Margin</div>
            <div className="text-2xl font-bold">{pricing?.marginPercentage?.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-xs">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Item / Category</th>
              <th className="p-2 text-right">Cost</th>
              <th className="p-2 text-right">Markup</th>
              <th className="p-2 text-right">Selling</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pricing?.breakdown.map((b: any, idx: number) => (
              <tr key={idx} className="hover:bg-muted/50">
                <td className="p-2">{b.item}</td>
                <td className="p-2 text-right">${b.cost?.toFixed(2) || "0.00"}</td>
                <td className="p-2 text-right text-green-600">+{b.markup?.toFixed(2) || b.amount?.toFixed(2) || "0.00"}</td>
                <td className="p-2 text-right font-medium">${((b.cost || 0) + (b.markup || b.amount || 0)).toFixed(2)}</td>
              </tr>
            ))}
            <tr className="bg-muted/30 font-semibold">
              <td className="p-2">Totals</td>
              <td className="p-2 text-right">${pricing?.baseCost?.toFixed(2)}</td>
              <td className="p-2 text-right text-green-600">+${(pricing?.markupAmount + pricing?.serviceFee)?.toFixed(2)}</td>
              <td className="p-2 text-right">${pricing?.totalPrice?.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-muted rounded-md text-[10px] text-muted-foreground flex justify-between">
        <span>Estimated Sales Tax ({((pricing?.tax / pricing?.totalPrice) * 100 || 0).toFixed(1)}%):</span>
        <span className="font-mono">${pricing?.tax?.toFixed(2)}</span>
      </div>
    </div>
  );
}

function TourHistory({ tourId }: { tourId: string }) {
  const { data: auditLogs, isLoading } = useQuery<any[]>({ 
    queryKey: ["/api/audit-logs", "tour", tourId] 
  });

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  return (
    <div className="space-y-4">
      {auditLogs && auditLogs.length > 0 ? (
        <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
          {auditLogs.map((log) => (
            <div key={log.id} className="relative">
              <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-primary border-4 border-background" />
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold">{log.action?.toUpperCase()}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  By: <span className="font-medium text-foreground">{log.changedByName || "System"}</span>
                </p>
                {log.note && <p className="text-xs italic text-muted-foreground mt-1">"{log.note}"</p>}
                <div className="mt-2 text-[10px] text-muted-foreground bg-muted/30 p-2 rounded border border-dashed">
                  <p className="uppercase font-bold text-[8px] mb-1">Raw Diff (Internal)</p>
                  <pre className="whitespace-pre-wrap">{log.note.includes("Fields changed") ? log.note : "Initial creation or major update"}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-12 text-center">
          <Clock className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No history found for this tour</p>
        </div>
      )}
    </div>
  );
}

function TourMarginBadge({ tourId }: { tourId: string }) {
  const { data: pricing } = useQuery<any>({ queryKey: [`/api/tours/${tourId}/price-breakdown`] });
  if (!pricing) return null;
  
  if (pricing.marginPercentage < 10) {
    return <Badge variant="destructive" className="h-4 text-[8px]">Low Margin</Badge>;
  }
  return <Badge variant="outline" className="h-4 text-[8px] text-green-600 border-green-200">{pricing.marginPercentage.toFixed(0)}% Margin</Badge>;
}
