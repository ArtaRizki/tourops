import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { Search, MapPin, Calendar, DollarSign, ArrowRight, Filter, Tag, X } from "lucide-react";
import { useState, useMemo } from "react";
import type { Tour } from "@shared/schema";

const TOUR_CATEGORIES = ["Adventure", "Cultural", "Beach", "City Break", "Wildlife", "Religious", "Historical", "Nature"];
const DURATION_OPTIONS = [
  { label: "Any Duration", value: "any" },
  { label: "1–5 days", value: "1-5" },
  { label: "6–10 days", value: "6-10" },
  { label: "11–15 days", value: "11-15" },
  { label: "16+ days", value: "16+" },
];

export default function BrowseTours() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("any");
  const [durationFilter, setDurationFilter] = useState("any");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [showFilters, setShowFilters] = useState(false);

  const { data: tours, isLoading } = useQuery<Tour[]>({ queryKey: ["/api/tours/public"] });

  const filtered = useMemo(() => {
    return (tours || []).filter((t) => {
      // Search
      const matchesSearch = !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.countries?.some((c) => c.toLowerCase().includes(search.toLowerCase())) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      // Category
      const matchesCategory = categoryFilter === "any" || t.category === categoryFilter ||
        t.tags?.includes(categoryFilter);

      // Duration
      const matchesDuration = durationFilter === "any" ||
        (durationFilter === "1-5" && t.duration <= 5) ||
        (durationFilter === "6-10" && t.duration >= 6 && t.duration <= 10) ||
        (durationFilter === "11-15" && t.duration >= 11 && t.duration <= 15) ||
        (durationFilter === "16+" && t.duration >= 16);

      // Price
      const price = t.basePrice || 0;
      const matchesPrice = price <= maxPrice;

      return matchesSearch && matchesCategory && matchesDuration && matchesPrice;
    });
  }, [tours, search, categoryFilter, durationFilter, maxPrice]);

  const hasActiveFilters = categoryFilter !== "any" || durationFilter !== "any" || maxPrice < 10000;

  const clearFilters = () => {
    setCategoryFilter("any");
    setDurationFilter("any");
    setMaxPrice(10000);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-72" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif" data-testid="text-browse-title">Explore Tours</h1>
        <p className="text-muted-foreground text-sm">Discover your next adventure — {tours?.length || 0} tours available</p>
      </div>

      {/* Search + Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tours, destinations, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-public-tours"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">!</Badge>}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Category</p>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">All Categories</SelectItem>
                      {TOUR_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Duration</p>
                  <Select value={durationFilter} onValueChange={setDurationFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Max Price: ${maxPrice.toLocaleString()}</p>
                  <Slider
                    min={0}
                    max={10000}
                    step={100}
                    value={[maxPrice]}
                    onValueChange={([v]) => setMaxPrice(v)}
                    className="mt-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tour Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <MapPin className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold mb-1">No tours found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tour) => (
            <Link key={tour.id} href={`/tours/${tour.id}`}>
              <Card className="overflow-hidden hover-elevate cursor-pointer group h-full flex flex-col" data-testid={`card-public-tour-${tour.id}`}>
                {tour.imageUrl ? (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={tour.imageUrl}
                      alt={tour.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-primary/30" />
                  </div>
                )}
                <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-1">
                    {tour.category && (
                      <Badge variant="secondary" className="text-xs">
                        <Tag className="h-2.5 w-2.5 mr-1" />{tour.category}
                      </Badge>
                    )}
                    {tour.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <h3 className="font-semibold text-lg leading-tight">{tour.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{tour.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{tour.duration} days</span>
                    {tour.countries && tour.countries.length > 0 && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{tour.countries.join(", ")}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-1">
                    {tour.basePrice ? (
                      <div>
                        <span className="text-lg font-bold flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />{tour.basePrice.toLocaleString()}
                          <span className="text-xs font-normal text-muted-foreground">/person</span>
                        </span>
                        {tour.childPrice && (
                          <p className="text-xs text-muted-foreground">Child: ${tour.childPrice.toLocaleString()}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Contact for pricing</span>
                    )}
                    <Button variant="ghost" size="sm">
                      View Details <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
