import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Search, MapPin, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { useState } from "react";
import type { Tour } from "@shared/schema";

export default function BrowseTours() {
  const [search, setSearch] = useState("");
  const { data: tours, isLoading } = useQuery<Tour[]>({ queryKey: ["/api/tours/public"] });

  const filtered = tours?.filter((t) =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.countries?.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  ) || [];

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
        <p className="text-muted-foreground text-sm">Discover your next adventure</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search tours or destinations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-public-tours" />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <MapPin className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold mb-1">No tours available</h3>
            <p className="text-sm text-muted-foreground">Check back soon for new destinations</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tour) => (
            <Link key={tour.id} href={`/tours/${tour.id}`}>
              <Card className="overflow-visible hover-elevate cursor-pointer group" data-testid={`card-public-tour-${tour.id}`}>
                {tour.imageUrl && (
                  <div className="aspect-video overflow-hidden rounded-t-md">
                    <img
                      src={tour.imageUrl}
                      alt={tour.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg leading-tight">{tour.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{tour.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{tour.duration} days</span>
                    {tour.countries && tour.countries.length > 0 && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{tour.countries.join(", ")}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-1">
                    {tour.basePrice ? (
                      <span className="text-lg font-bold flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />{tour.basePrice}
                        <span className="text-xs font-normal text-muted-foreground">/person</span>
                      </span>
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
