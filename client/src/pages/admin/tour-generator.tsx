import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, ArrowLeft, Wand2, Calendar, MapPin, Info } from "lucide-react";
import { useLocation } from "wouter";
import type { Tour, TourDay, Country, City, Sight } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function TourGenerator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTourId, setSelectedTourId] = useState<string>("new");
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(1);
  const [category, setCategory] = useState("cultural");
  const [days, setDays] = useState<Partial<TourDay>[]>([]);

  // Queries
  const { data: tours, isLoading: loadingTours } = useQuery<Tour[]>({ queryKey: ["/api/tours"] });
  const { data: countries } = useQuery<Country[]>({ queryKey: ["/api/master/countries"] });
  const { data: cities } = useQuery<City[]>({ queryKey: ["/api/master/cities"] });
  const { data: sights } = useQuery<Sight[]>({ queryKey: ["/api/master/sights"] });

  const { data: existingDays, isLoading: loadingDays } = useQuery<TourDay[]>({
    queryKey: [`/api/tours/${selectedTourId}/days`],
    enabled: selectedTourId !== "new",
  });

  // Effects
  useEffect(() => {
    if (selectedTourId === "new") {
      setTitle("");
      setDescription("");
      setDuration(1);
      setDays([{ dayNumber: 1, title: "Arrival", description: "", activities: "" }]);
    } else {
      const tour = tours?.find(t => t.id === selectedTourId);
      if (tour) {
        setTitle(tour.title);
        setDescription(tour.description || "");
        setDuration(tour.duration);
      }
    }
  }, [selectedTourId, tours]);

  useEffect(() => {
    if (selectedTourId !== "new" && existingDays) {
      setDays(existingDays.sort((a, b) => a.dayNumber - b.dayNumber));
    }
  }, [existingDays, selectedTourId]);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      const tourData = { title, description, duration, category, isPublished: false };
      let tourId = selectedTourId;

      if (selectedTourId === "new") {
        const res = await apiRequest("POST", "/api/tours", tourData);
        const newTour = await res.json();
        tourId = newTour.id;
      } else {
        await apiRequest("PATCH", `/api/tours/${selectedTourId}`, tourData);
      }

      // Sync Days
      // For simplicity, we delete all existing days and recreate them
      // In a production app, you'd want to use PATCH for existing days
      if (selectedTourId !== "new") {
        const oldDays = await (await apiRequest("GET", `/api/tours/${selectedTourId}/days`)).json() as TourDay[];
        for (const d of oldDays) {
          await apiRequest("DELETE", `/api/tour-days/${d.id}`);
        }
      }

      for (const day of days) {
        await apiRequest("POST", `/api/tours/${tourId}/days`, { ...day, tourId });
      }

      return tourId;
    },
    onSuccess: (tourId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      toast({ title: "Tour saved successfully" });
      setLocation("/admin");
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const handleAddDay = () => {
    const nextDay = days.length + 1;
    setDays([...days, { dayNumber: nextDay, title: `Day ${nextDay}`, description: "", activities: "" }]);
    setDuration(nextDay);
  };

  const handleRemoveDay = (index: number) => {
    const newDays = days.filter((_, i) => i !== index).map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setDays(newDays);
    setDuration(newDays.length);
  };

  const updateDay = (index: number, field: keyof TourDay, value: any) => {
    const newDays = [...days];
    newDays[index] = { ...newDays[index], [field]: value };
    setDays(newDays);
  };

  if (loadingTours) return <div className="p-8"><Skeleton className="h-12 w-full" /></div>;

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/admin")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tour Generator</h1>
            <p className="text-muted-foreground">Design your perfect itinerary day-by-day.</p>
          </div>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {saveMutation.isPending ? "Saving..." : "Save Tour"}
        </Button>
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            General Information
          </CardTitle>
          <CardDescription>Select a template or start from scratch.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Template / Existing Tour</Label>
              <Select value={selectedTourId} onValueChange={setSelectedTourId}>
                <SelectTrigger>
                  <SelectValue placeholder="New Tour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Start New Tour</SelectItem>
                  {tours?.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tour Title</Label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Wonders of Indonesia" 
                className="font-semibold"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Overall Description</Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Describe the magic of this tour..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Duration (Days)</Label>
              <Input 
                type="number" 
                value={duration} 
                readOnly 
                className="bg-muted font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="adventure">Adventure</SelectItem>
                  <SelectItem value="religious">Religious</SelectItem>
                  <SelectItem value="leisure">Leisure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Itinerary
          </h2>
          <Button variant="outline" onClick={handleAddDay} className="gap-2 border-primary/30 hover:bg-primary/5">
            <Plus className="h-4 w-4" />
            Add Day
          </Button>
        </div>

        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          {days.map((day, index) => (
            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <span className="font-bold text-sm">{day.dayNumber}</span>
              </div>
              {/* Content */}
              <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 shadow-md hover:shadow-lg transition-shadow border-primary/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 mr-4">
                    <Input 
                      value={day.title || ""} 
                      onChange={(e) => updateDay(index, "title", e.target.value)}
                      placeholder="Day Title"
                      className="text-lg font-bold border-none p-0 focus-visible:ring-0 placeholder:text-muted-foreground/30"
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveDay(index)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-muted-foreground">Location</Label>
                      <Select 
                        value={day.city || ""} 
                        onValueChange={(v) => updateDay(index, "city", v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="City" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities?.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-muted-foreground">Country</Label>
                      <Select 
                        value={day.countryCode || ""} 
                        onValueChange={(v) => updateDay(index, "countryCode", v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries?.map(c => <SelectItem key={c.id} value={c.code}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">Description</Label>
                    <Textarea 
                      value={day.description || ""} 
                      onChange={(e) => updateDay(index, "description", e.target.value)}
                      placeholder="What happens today?"
                      className="text-sm resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] uppercase text-muted-foreground">Activities & Sights</Label>
                      {day.city && (
                        <Select 
                          onValueChange={(v) => {
                            const current = day.activities || "";
                            updateDay(index, "activities", current ? `${current}, ${v}` : v);
                          }}
                        >
                          <SelectTrigger className="h-6 w-[120px] text-[10px] bg-primary/10 border-none">
                            <SelectValue placeholder="+ Add Sight" />
                          </SelectTrigger>
                          <SelectContent>
                            {sights?.filter(s => {
                              const city = cities?.find(c => c.name === day.city);
                              return s.cityId === city?.id;
                            }).map(s => (
                              <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                            ))}
                            {(!sights || sights.filter(s => {
                              const city = cities?.find(c => c.name === day.city);
                              return s.cityId === city?.id;
                            }).length === 0) && (
                              <SelectItem value="none" disabled>No sights found</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <Textarea 
                      value={day.activities || ""} 
                      onChange={(e) => updateDay(index, "activities", e.target.value)}
                      placeholder="Lunch at..., Visit to..."
                      className="text-sm bg-primary/5 italic"
                      rows={2}
                    />
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={handleAddDay} className="gap-2 border-dashed border-2 h-16 w-full max-w-md hover:bg-primary/5 hover:border-primary/50">
            <Plus className="h-5 w-5" />
            Add Next Day
          </Button>
        </div>
      </div>
    </div>
  );
}
