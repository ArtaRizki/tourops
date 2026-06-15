import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, ArrowLeft, Wand2, Calendar, MapPin, Info, Sparkles, Languages, ChevronDown, Loader2, X } from "lucide-react";
import { useLocation } from "wouter";
import type { Tour, TourDay, Country, City, Sight } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { getFullImageUrl } from "@/lib/utils";

export default function TourGenerator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTourId, setSelectedTourId] = useState<string>(() => {
    return new URLSearchParams(window.location.search).get("id") || "new-tour";
  });
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState("");
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  const [childPrice, setChildPrice] = useState(0);
  const [singleSupplement, setSingleSupplement] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [tags, setTags] = useState("");
  const [galleryUrls, setGalleryUrls] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  const [duration, setDuration] = useState(1);
  const [category, setCategory] = useState("cultural");
  const [days, setDays] = useState<Partial<TourDay>[]>([]);
  const [translations, setTranslations] = useState<any>({});
  const [activeLang, setActiveLang] = useState("en");
  const [uploadingDayIndex, setUploadingDayIndex] = useState<number | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
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
      toast({ title: "Cover image uploaded successfully" });
    } catch (error) {
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleDayImageUpload = async (index: number, file: File) => {
    setUploadingDayIndex(index);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      updateDay(index, "imageUrl", data.url);
      toast({ title: "Image uploaded successfully" });
    } catch (error) {
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploadingDayIndex(null);
    }
  };

  // AI Parameters
  const [aiOpen, setAiOpen] = useState(false);
  const [aiParams, setAiParams] = useState({
    destination: "",
    duration: 5,
    travelerType: "family",
    interests: ["culture", "history"],
    budget: "medium",
    pace: "normal"
  });

  const aiInterests = ["culture", "history", "nature", "adventure", "food", "shopping", "beach", "religion"];

  // Queries
  const { data: tours, isLoading: loadingTours } = useQuery<Tour[]>({ queryKey: ["/api/tours"] });
  console.log("RENDER_TOUR_GENERATOR - tours:", tours === undefined ? "undefined" : Array.isArray(tours) ? `Array(${tours.length})` : typeof tours, "isLoading:", loadingTours);
  const { data: countries } = useQuery<Country[]>({ queryKey: ["/api/master/countries"] });
  const { data: cities } = useQuery<City[]>({ queryKey: ["/api/master/cities"] });
  const { data: sights } = useQuery<Sight[]>({ queryKey: ["/api/master/sights"] });

  const { data: existingDays, isLoading: loadingDays } = useQuery<TourDay[]>({
    queryKey: [`/api/tours/${selectedTourId}/days`],
    enabled: selectedTourId !== "new-tour",
  });

  useEffect(() => {
    if (selectedTourId === "new-tour") {
      setTitle("");
      setDescription("");
      setHighlights("");
      setInclusions("");
      setExclusions("");
      setInternalNotes("");
      setBasePrice(0);
      setChildPrice(0);
      setSingleSupplement(0);
      setSelectedCountry("");
      setTags("");
      setGalleryUrls("");
      setImageUrl("");
      setDuration(1);
      setCategory("cultural");
      setDays([{ dayNumber: 1, title: "Arrival", description: "", activities: "" }]);
    } else {
      const tour = tours?.find(t => t.id === selectedTourId);
      if (tour) {
        setTitle(tour.title);
        setDescription(tour.description || "");
        setHighlights(tour.highlights || "");
        setInclusions(tour.inclusions || "");
        setExclusions(tour.exclusions || "");
        setInternalNotes(tour.internalNotes || "");
        setBasePrice(Number(tour.basePrice) || 0);
        setChildPrice(Number(tour.childPrice) || 0);
        setSingleSupplement(Number(tour.singleSupplement) || 0);
        setSelectedCountry(tour.countries?.[0] || "");
        setTags((tour.tags || []).join(", "));
        setGalleryUrls((tour.galleryUrls || []).join(", "));
        setImageUrl(tour.imageUrl || "");
        setDuration(tour.duration);
        setCategory(typeof tour.category === "string" ? (tour.category === "null" || tour.category === "NULL" ? "" : tour.category) : "");
        setTranslations((tour as any).translations || {});
      }
    }
  }, [selectedTourId, tours]);

  useEffect(() => {
    if (selectedTourId !== "new-tour" && existingDays) {
      setDays(existingDays.sort((a, b) => a.dayNumber - b.dayNumber));
    }
  }, [existingDays, selectedTourId]);

  // Draft System
  const [hasDraft, setHasDraft] = useState(false);
  const skipDraftRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Reset refs on tour change
    skipDraftRef.current = false;
    initializedRef.current = false;
    setHasDraft(false);

    const draftKey = `tour-draft-${selectedTourId}`;
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      setHasDraft(true);
    } else {
      skipDraftRef.current = true;
    }
  }, [selectedTourId]);

  useEffect(() => {
    if (!loadingTours && !loadingDays && skipDraftRef.current && !initializedRef.current) {
       // Just marking that the initial server load is done, so we can start autosaving
       initializedRef.current = true;
    }
  }, [loadingTours, loadingDays]);

  const restoreDraft = () => {
    const draftKey = `tour-draft-${selectedTourId}`;
    const draftStr = localStorage.getItem(draftKey);
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        setTitle(draft.title || "");
        setDescription(draft.description || "");
        setHighlights(draft.highlights || "");
        setInclusions(draft.inclusions || "");
        setExclusions(draft.exclusions || "");
        setInternalNotes(draft.internalNotes || "");
        setBasePrice(Number(draft.basePrice) || 0);
        setChildPrice(Number(draft.childPrice) || 0);
        setSingleSupplement(Number(draft.singleSupplement) || 0);
        setSelectedCountry(draft.selectedCountry || "");
        setTags(draft.tags || "");
        setGalleryUrls(draft.galleryUrls || "");
        setImageUrl(draft.imageUrl || "");
        setDuration(draft.duration || 1);
        setCategory(draft.category || "cultural");
        if (draft.days && Array.isArray(draft.days)) {
           setDays(draft.days);
        }
        toast({ title: "Draft restored successfully." });
      } catch (e) {
        toast({ title: "Failed to restore draft", variant: "destructive" });
      }
    }
    setHasDraft(false);
    skipDraftRef.current = true;
    initializedRef.current = true;
  };

  const discardDraft = () => {
    localStorage.removeItem(`tour-draft-${selectedTourId}`);
    setHasDraft(false);
    skipDraftRef.current = true;
    initializedRef.current = true;
    toast({ title: "Draft discarded." });
  };

  useEffect(() => {
    if (hasDraft || !skipDraftRef.current || !initializedRef.current) return;
    
    // Don't autosave empty new tours
    if (selectedTourId === "new-tour" && !title && !description) return;

    const timeoutId = setTimeout(() => {
      const draftKey = `tour-draft-${selectedTourId}`;
      const draftData = {
        title, description, duration, category,
        highlights, inclusions, exclusions, internalNotes,
        basePrice, childPrice, singleSupplement,
        selectedCountry, tags, galleryUrls, imageUrl, days
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [
    selectedTourId, title, description, duration, category,
    highlights, inclusions, exclusions, internalNotes,
    basePrice, childPrice, singleSupplement,
    selectedCountry, tags, galleryUrls, imageUrl, days,
    hasDraft
  ]);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      const baseTourData = { 
        title, description, duration, category, translations,
        highlights, inclusions, exclusions, internalNotes,
        basePrice: String(basePrice), childPrice: String(childPrice), singleSupplement: String(singleSupplement),
        countries: selectedCountry ? [selectedCountry] : [],
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        galleryUrls: galleryUrls.split(",").map((t) => t.trim()).filter(Boolean),
        imageUrl
      };
      
      const payload = {
        tour: baseTourData,
        days: days
      };

      const res = await apiRequest("PUT", `/api/tours/${selectedTourId}/full`, payload);
      const newTour = await res.json();
      return newTour.id;
    },
    onSuccess: (tourId) => {
      localStorage.removeItem(`tour-draft-${selectedTourId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      queryClient.invalidateQueries({ queryKey: ["/api/master/cities"] });
      toast({ title: "Tour saved successfully" });
      setLocation("/admin");
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const addCityMutation = useMutation({
    mutationFn: async ({ name, countryCode }: { name: string; countryCode?: string }) => {
      const selectedCountry = countries?.find(c => c.code === countryCode);
      const countryId = selectedCountry?.id || countries?.[0]?.id;
      if (!countryId) {
        throw new Error("No country found in the system. Please ensure countries are loaded.");
      }
      const res = await apiRequest("POST", "/api/master/cities", {
        name,
        countryId,
        isActive: true
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create city");
      }
      return res.json();
    },
    onSuccess: (newCity) => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/cities"] });
      toast({
        title: "City added successfully",
        description: `"${newCity.name}" has been added to the master list.`
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to add city",
        description: err.message,
        variant: "destructive"
      });
    }
  });

  const handleAddCity = async (name: string, countryCode: string | undefined | null, dayIndex: number) => {
    try {
      const selectedCountry = countries?.find(c => c.code === countryCode);
      const countryId = selectedCountry?.id || countries?.[0]?.id;
      if (!countryId) {
        toast({ title: "Error", description: "No country found in the system.", variant: "destructive" });
        return;
      }
      
      const newCity = await addCityMutation.mutateAsync({ name, countryCode: countryCode || undefined });
      const matchedCountry = countries?.find(c => c.id === newCity.countryId);
      if (matchedCountry) {
        updateDay(dayIndex, "countryCode", matchedCountry.code);
      }
      updateDay(dayIndex, "city", newCity.name);
    } catch (e) {
      // Error handled by mutation
    }
  };

  const aiMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/ai/generate-tour", aiParams);
      return res.json();
    },
    onSuccess: (data) => {
      setTitle(data.title || "");
      setDescription(data.description || "");
      setCategory(typeof data.category === "string" ? data.category : "cultural");
      
      if (data.highlights) setHighlights(data.highlights);
      if (data.inclusions) setInclusions(data.inclusions);
      if (data.exclusions) setExclusions(data.exclusions);
      if (data.internalNotes) setInternalNotes(data.internalNotes);
      if (data.basePrice) setBasePrice(Number(data.basePrice));
      if (data.childPrice) setChildPrice(Number(data.childPrice));
      if (data.singleSupplement) setSingleSupplement(Number(data.singleSupplement));
      if (data.tags && Array.isArray(data.tags)) setTags(data.tags.join(", "));
      if (data.countryCode) {
        const c = countries?.find(c => c.code === data.countryCode);
        if (c) setSelectedCountry(c.name);
      }
      if (data.imageUrl) {
        setImageUrl(`https://image.pollinations.ai/prompt/${encodeURIComponent(data.imageUrl)}?width=1200&height=800&nologo=true`);
      }
      
      const enrichedDays = data.days?.map((d: any, i: number) => {
        let dayImageUrl = d.imageUrl;
        if (dayImageUrl) {
            dayImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(dayImageUrl)}?width=800&height=600&nologo=true`;
        }
        return {
          ...d,
          dayNumber: i + 1,
          imageUrl: dayImageUrl || ""
        };
      }) || [];

      setDuration(enrichedDays.length);
      setDays(enrichedDays);
      setAiOpen(false);
      toast({ title: "Itinerary generated by AI!" });
    },
    onError: (e: Error) => toast({ title: "AI Generation failed", description: e.message, variant: "destructive" }),
  });

  
  const translateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        description,
        days: days.map(d => ({ title: d.title, description: d.description, activities: d.activities }))
      };
      const res = await apiRequest("POST", "/api/ai/translate-content", payload);
      return res.json();
    },
    onSuccess: (data) => {
      setTranslations({
        es: { title: data.es.title, description: data.es.description },
        id: { title: data.id.title, description: data.id.description }
      });
      setDays(prevDays => prevDays.map((d, i) => ({
        ...d,
        translations: {
          es: data.es.days?.[i] || {},
          id: data.id.days?.[i] || {}
        }
      })));
      toast({ title: "Auto-translated successfully!" });
    },
    onError: (e: Error) => toast({ title: "Translation failed", description: e.message, variant: "destructive" }),
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
      <div className="flex flex-col gap-4">
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
          
          <div className="flex gap-2">
            <div className="flex bg-muted p-1 rounded-md">
              {["en", "es", "id"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${
                    activeLang === lang 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          <Button 
            variant="outline" 
            onClick={() => translateMutation.mutate()} 
            disabled={translateMutation.isPending || selectedTourId === "new-tour"}
            className="gap-2"
          >
            <Languages className="h-4 w-4" />
            {translateMutation.isPending ? "Translating..." : "Auto Translate"}
          </Button>

          <Dialog open={aiOpen} onOpenChange={setAiOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10 shadow-sm transition-all duration-300">
                <Wand2 className="h-4 w-4" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Tour Generator
                </DialogTitle>
                <DialogDescription>
                  Tell us what you're looking for, and our AI will build a custom itinerary for you.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dest" className="text-right">Destination</Label>
                  <Input 
                    id="dest" 
                    className="col-span-3" 
                    placeholder="e.g. Bali, Indonesia" 
                    value={aiParams.destination}
                    onChange={(e) => setAiParams({...aiParams, destination: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Duration</Label>
                  <Input 
                    type="number" 
                    className="col-span-3" 
                    value={aiParams.duration}
                    onChange={(e) => setAiParams({...aiParams, duration: parseInt(e.target.value)})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Travelers</Label>
                  <Select value={aiParams.travelerType} onValueChange={(v) => setAiParams({...aiParams, travelerType: v})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solo">Solo</SelectItem>
                      <SelectItem value="couple">Couple</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="group">Large Group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4 pt-2">
                  <Label className="text-right pt-2">Interests</Label>
                  <div className="col-span-3 grid grid-cols-2 gap-2">
                    {aiInterests.map(interest => (
                      <div key={interest} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`interest-${interest}`} 
                          checked={aiParams.interests.includes(interest)}
                          onCheckedChange={(checked) => {
                            const newInterests = checked 
                              ? [...aiParams.interests, interest]
                              : aiParams.interests.filter(i => i !== interest);
                            setAiParams({...aiParams, interests: newInterests});
                          }}
                        />
                        <label htmlFor={`interest-${interest}`} className="text-xs capitalize cursor-pointer">{interest}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground">Budget</Label>
                    <Select value={aiParams.budget} onValueChange={(v) => setAiParams({...aiParams, budget: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">Budget</SelectItem>
                        <SelectItem value="medium">Standard</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground">Pace</Label>
                    <Select value={aiParams.pace} onValueChange={(v) => setAiParams({...aiParams, pace: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relaxed">Relaxed</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => aiMutation.mutate()} 
                  disabled={aiMutation.isPending || !aiParams.destination}
                  className="w-full gap-2"
                >
                  {aiMutation.isPending ? "Generating..." : "Generate Itinerary"}
                  <Sparkles className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2 shadow-md">
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : "Save Tour"}
          </Button>
        </div>
      </div>

      {hasDraft && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-amber-500" />
            <p className="font-medium text-sm">We found an unsaved draft from your last session.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={discardDraft} className="text-amber-700 hover:text-amber-900 hover:bg-amber-100">Discard</Button>
            <Button size="sm" onClick={restoreDraft} className="bg-amber-500 hover:bg-amber-600 text-white">Restore Draft</Button>
          </div>
        </div>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="details">Pricing & Details</TabsTrigger>
          <TabsTrigger value="media">Media & Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
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
              <div className="relative">
                <select 
                  value={selectedTourId} 
                  onChange={(e) => setSelectedTourId(e.target.value)}
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8 font-medium cursor-pointer"
                >
                  <option value="new-tour">Start New Tour</option>
                  {tours?.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tour Title</Label>
              <Input 
                value={activeLang === 'en' ? title : (translations?.[activeLang]?.title || '')} 
                onChange={(e) => {
                  if (activeLang === 'en') setTitle(e.target.value);
                  else setTranslations({ ...translations, [activeLang]: { ...translations?.[activeLang], title: e.target.value } });
                }} 
                placeholder="e.g. Wonders of Indonesia" 
                className="font-semibold"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Overall Description</Label>
            <Textarea 
              value={activeLang === 'en' ? description : (translations?.[activeLang]?.description || '')} 
              onChange={(e) => {
                  if (activeLang === 'en') setDescription(e.target.value);
                  else setTranslations({ ...translations, [activeLang]: { ...translations?.[activeLang], description: e.target.value } });
              }} 
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
              <Select value={category || "none"} onValueChange={(val) => setCategory(val === "none" ? "" : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Category</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="adventure">Adventure</SelectItem>
                  <SelectItem value="religious">Religious</SelectItem>
                  <SelectItem value="leisure">Leisure</SelectItem>
                  {category && !["cultural", "adventure", "religious", "leisure", "null", "NULL", "none"].includes(category) && (
                    <SelectItem value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="details">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Pricing & Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Base Price ($)</Label>
                <Input type="number" value={basePrice} onChange={(e) => setBasePrice(parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label>Child Price ($)</Label>
                <Input type="number" value={childPrice} onChange={(e) => setChildPrice(parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label>Single Supplement ($)</Label>
                <Input type="number" value={singleSupplement} onChange={(e) => setSingleSupplement(parseInt(e.target.value) || 0)} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Highlights</Label>
                <Textarea value={highlights} onChange={(e) => setHighlights(e.target.value)} placeholder="Key highlights..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Internal Notes</Label>
                <Textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Admin-only notes..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Inclusions</Label>
                <Textarea value={inclusions} onChange={(e) => setInclusions(e.target.value)} placeholder="What's included..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Exclusions</Label>
                <Textarea value={exclusions} onChange={(e) => setExclusions(e.target.value)} placeholder="What's not included..." rows={3} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country..." />
                  </SelectTrigger>
                  <SelectContent>
                    {countries?.map((c) => (
                      <SelectItem key={c.code} value={c.name}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="media">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Media & Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div className="flex gap-2 items-center">
                    <Input type="file" accept="image/*" onChange={handleCoverUpload} disabled={isUploadingCover} className="cursor-pointer" />
                    {isUploadingCover && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                  </div>
                  {imageUrl && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs max-w-[200px] truncate">{imageUrl}</Badge>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => setImageUrl("")}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {imageUrl && (
                  <div className="border rounded-md overflow-hidden bg-muted h-32 w-full max-w-sm relative group">
                    <img
                      src={getFullImageUrl(imageUrl)}
                      alt="Cover Preview"
                      className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(getFullImageUrl(imageUrl), '_blank')}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      onLoad={(e) => (e.currentTarget.style.display = 'block')}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="text-white text-xs font-medium">Click to view</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="adventure, cultural, family" />
                </div>
                <div className="space-y-2">
                  <Label>Gallery URLs (comma separated)</Label>
                  <Input value={galleryUrls} onChange={(e) => setGalleryUrls(e.target.value)} placeholder="url1, url2, url3" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>

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
                      value={activeLang === 'en' ? (day.title || "") : ((day as any).translations?.[activeLang]?.title || "")} 
                      onChange={(e) => {
                        if (activeLang === 'en') updateDay(index, "title", e.target.value);
                        else {
                          const trans = (day as any).translations || {};
                          updateDay(index, "translations", { ...trans, [activeLang]: { ...trans[activeLang], title: e.target.value } });
                        }
                      }}
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
                      <Input
                        value={day.city || ""}
                        onChange={(e) => updateDay(index, "city", e.target.value)}
                        placeholder="City"
                        list="cities-datalist"
                        className="h-8 text-xs"
                      />
                      {(() => {
                        const typedCity = day.city?.trim();
                        const cityExists = cities?.some(c => c.name.toLowerCase() === typedCity?.toLowerCase());
                        const showAddCityButton = typedCity && !cityExists && countries && countries.length > 0;
                        if (!showAddCityButton) return null;
                        return (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleAddCity(typedCity, day.countryCode, index)}
                            disabled={addCityMutation.isPending}
                            className="mt-1.5 h-7 px-2 text-[10px] text-primary bg-primary/10 hover:bg-primary/20 flex items-center gap-1 w-full justify-start rounded border border-primary/20 transition-all"
                          >
                            <Plus className="h-3 w-3" />
                            Add "{typedCity}" as new city
                          </Button>
                        );
                      })()}
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
                      value={activeLang === 'en' ? (day.description || "") : ((day as any).translations?.[activeLang]?.description || "")} 
                      onChange={(e) => {
                        if (activeLang === 'en') updateDay(index, "description", e.target.value);
                        else {
                          const trans = (day as any).translations || {};
                          updateDay(index, "translations", { ...trans, [activeLang]: { ...trans[activeLang], description: e.target.value } });
                        }
                      }}
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
                      value={activeLang === 'en' ? (day.activities || "") : ((day as any).translations?.[activeLang]?.activities || "")} 
                      onChange={(e) => {
                        if (activeLang === 'en') updateDay(index, "activities", e.target.value);
                        else {
                          const trans = (day as any).translations || {};
                          updateDay(index, "translations", { ...trans, [activeLang]: { ...trans[activeLang], activities: e.target.value } });
                        }
                      }}
                      placeholder="Lunch at..., Visit to..."
                      className="text-sm bg-primary/5 italic"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">Day Image (Optional)</Label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDayImageUpload(index, file);
                        }} 
                        disabled={uploadingDayIndex === index} 
                        className="cursor-pointer h-8 text-xs file:text-xs file:h-full file:py-0 file:my-0" 
                      />
                      {uploadingDayIndex === index && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                    </div>
                    {day.imageUrl && (
                      <div className="flex items-start gap-2 mt-2">
                        <div className="border rounded overflow-hidden h-12 w-16 bg-muted shrink-0 relative group">
                          <img 
                            src={getFullImageUrl(day.imageUrl)} 
                            alt="Preview" 
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(getFullImageUrl(day.imageUrl), '_blank')}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="text-white text-[8px] font-medium">View</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-1 overflow-hidden">
                          <Badge variant="outline" className="text-[10px] truncate max-w-[200px] cursor-pointer hover:bg-secondary" onClick={() => window.open(getFullImageUrl(day.imageUrl), '_blank')}>
                            {day.imageUrl.split('/').pop() || day.imageUrl}
                          </Badge>
                          <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive shrink-0" onClick={() => updateDay(index, "imageUrl", "")}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
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
      <datalist id="cities-datalist">
        {cities?.map((c) => (
          <option key={c.id} value={c.name} />
        ))}
      </datalist>
    </div>
    </div>
  );
}
