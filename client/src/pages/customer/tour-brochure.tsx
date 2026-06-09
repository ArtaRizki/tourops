import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Printer, Calendar, MapPin, DollarSign, Upload, Image, Eye } from "lucide-react";
import { Link } from "wouter";
import { useState, useRef } from "react";
import type { Tour, TourDeparture, TourDay } from "@shared/schema";

type TemplateId = "classic" | "modern" | "elegant";

const TEMPLATES: { id: TemplateId; name: string; description: string }[] = [
  { id: "classic", name: "Classic", description: "Clean layout with traditional styling" },
  { id: "modern", name: "Modern", description: "Bold headers with accent colors" },
  { id: "elegant", name: "Elegant", description: "Refined design with serif typography" },
];

export default function TourBrochure() {
  const [, params] = useRoute("/tours/:id/brochure");
  const preselectedTourId = params?.id;

  const { data: allTours, isLoading: toursLoading } = useQuery<Tour[]>({
    queryKey: ["/api/tours/public"],
  });

  const [selectedTourId, setSelectedTourId] = useState<string>(preselectedTourId || "");
  const [template, setTemplate] = useState<TemplateId>("classic");
  const [customTitle, setCustomTitle] = useState("");
  const [leaderPhotoUrl, setLeaderPhotoUrl] = useState<string>("");
  const [leaderName, setLeaderName] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tourId = selectedTourId || preselectedTourId;

  const { data: tour } = useQuery<Tour>({
    queryKey: ["/api/tours", tourId],
    enabled: !!tourId,
  });
  const { data: departures } = useQuery<TourDeparture[]>({
    queryKey: ["/api/tours", tourId, "departures"],
    enabled: !!tourId,
  });
  const { data: days } = useQuery<TourDay[]>({
    queryKey: ["/api/tours", tourId, "days"],
    enabled: !!tourId,
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLeaderPhotoUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (toursLoading) {
    return <div className="p-6"><Skeleton className="h-64" /></div>;
  }

  const sortedDays = days?.slice().sort((a, b) => a.dayNumber - b.dayNumber) || [];
  const openDepartures = departures?.filter((d) => d.status === "open") || [];
  const highlightLines = tour?.highlights ? tour.highlights.split("\n").filter((l: string) => l.trim()) : [];
  const displayTitle = customTitle || tour?.title || "Tour Brochure";

  const templateStyles: Record<TemplateId, { headerBg: string; headerText: string; accent: string; font: string; dayBadge: string }> = {
    classic: {
      headerBg: "bg-primary",
      headerText: "text-primary-foreground",
      accent: "text-primary",
      font: "font-serif",
      dayBadge: "bg-primary text-primary-foreground",
    },
    modern: {
      headerBg: "bg-foreground",
      headerText: "text-background",
      accent: "text-foreground",
      font: "font-sans",
      dayBadge: "bg-foreground text-background",
    },
    elegant: {
      headerBg: "bg-muted",
      headerText: "text-foreground",
      accent: "text-muted-foreground",
      font: "font-serif italic",
      dayBadge: "bg-muted-foreground text-muted",
    },
  };

  const ts = templateStyles[template];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="p-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link href={tourId ? `/tours/${tourId}` : "/tours"}>
          <Button variant="ghost" size="sm" data-testid="button-back-from-brochure">
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold font-serif">Create Tour Brochure</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            data-testid="button-toggle-preview"
          >
            <Eye className="h-4 w-4 mr-1" />{showPreview ? "Edit Settings" : "Preview"}
          </Button>
          <Button
            onClick={() => window.print()}
            disabled={!tour}
            data-testid="button-print-brochure"
          >
            <Printer className="h-4 w-4 mr-1" />Print / Save as PDF
          </Button>
        </div>
      </div>

      <div className="px-6 pb-6 print:hidden">
        {!showPreview && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tour Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Tour *</Label>
                  <Select value={selectedTourId} onValueChange={setSelectedTourId}>
                    <SelectTrigger data-testid="select-brochure-tour">
                      <SelectValue placeholder="Choose a tour..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allTours?.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Custom Brochure Title</Label>
                  <Input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder={tour?.title || "Enter a custom title..."}
                    data-testid="input-brochure-title"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave blank to use the tour name</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Brochure Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {TEMPLATES.map((t) => (
                  <div
                    key={t.id}
                    className={`border rounded-md p-3 cursor-pointer transition-colors ${template === t.id ? "border-primary bg-primary/5" : "hover-elevate"}`}
                    onClick={() => setTemplate(t.id)}
                    data-testid={`template-${t.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-4 w-4 rounded-full border-2 ${template === t.id ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Tour Leader Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-start gap-6">
                  <div className="flex flex-col items-center gap-3">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={leaderPhotoUrl} alt="Leader" />
                      <AvatarFallback className="text-2xl">
                        {leaderName ? leaderName.charAt(0).toUpperCase() : <Image className="h-8 w-8" />}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      data-testid="input-leader-photo-file"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="button-upload-leader-photo"
                    >
                      <Upload className="h-3 w-3 mr-1" />Upload Photo
                    </Button>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <Label>Leader Name</Label>
                    <Input
                      value={leaderName}
                      onChange={(e) => setLeaderName(e.target.value)}
                      placeholder="Your name as tour leader"
                      data-testid="input-leader-name"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Displayed on the brochure as the group leader</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {tour ? (
        <div className="p-6 print:p-0 space-y-8" data-testid="brochure-content">
          <div className={`text-center space-y-4 pb-8 border-b rounded-md p-8 ${ts.headerBg} ${ts.headerText}`}>
            {tour.imageUrl && (
              <div className="aspect-video overflow-hidden rounded-md max-h-72 mx-auto">
                <img src={tour.imageUrl} alt={displayTitle} className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className={`text-4xl font-bold ${ts.font}`} data-testid="text-brochure-title">{displayTitle}</h1>
            <div className="flex flex-wrap items-center justify-center gap-6 opacity-90">
              <span className="flex items-center gap-1"><Calendar className="h-5 w-5" />{tour.duration} days</span>
              {tour.countries && tour.countries.length > 0 && (
                <span className="flex items-center gap-1"><MapPin className="h-5 w-5" />{tour.countries.join(", ")}</span>
              )}
              {tour.basePrice ? (
                <span className="flex items-center gap-1"><DollarSign className="h-5 w-5" />From ${Number(tour.basePrice).toLocaleString()}</span>
              ) : null}
            </div>
            {(leaderName || leaderPhotoUrl) && (
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-current/20">
                {leaderPhotoUrl && (
                  <Avatar className="h-12 w-12 border-2 border-current/20">
                    <AvatarImage src={leaderPhotoUrl} alt={leaderName} />
                    <AvatarFallback>{leaderName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                {leaderName && (
                  <div className="text-left">
                    <p className="text-xs opacity-75">Your Tour Leader</p>
                    <p className="font-semibold">{leaderName}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {tour.description && (
            <div className="space-y-2">
              <h2 className={`text-2xl font-bold ${ts.font} ${ts.accent}`}>About This Tour</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{tour.description}</p>
            </div>
          )}

          {highlightLines.length > 0 && (
            <div className="space-y-3">
              <h2 className={`text-2xl font-bold ${ts.font} ${ts.accent}`}>Highlights</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {highlightLines.map((h: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sortedDays.length > 0 && (
            <div className="space-y-4">
              <h2 className={`text-2xl font-bold ${ts.font} ${ts.accent}`}>Day-by-Day Itinerary</h2>
              <div className="space-y-4">
                {sortedDays.map((day) => (
                  <div key={day.id} className="border rounded-md p-4 space-y-1 break-inside-avoid" data-testid={`brochure-day-${day.dayNumber}`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${ts.dayBadge}`}>Day {day.dayNumber}</span>
                      <h3 className="font-semibold">{day.title}</h3>
                      {day.city && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{day.city}</span>
                      )}
                    </div>
                    {day.description && <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{day.description}</p>}
                    {day.activities && <p className="text-xs text-muted-foreground">Activities: {day.activities}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {openDepartures.length > 0 && (
            <div className="space-y-3">
              <h2 className={`text-2xl font-bold ${ts.font} ${ts.accent}`}>Available Departures</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-2 pr-4 font-semibold">Start Date</th>
                      <th className="py-2 pr-4 font-semibold">End Date</th>
                      <th className="py-2 pr-4 font-semibold">Price / Person</th>
                      <th className="py-2 pr-4 font-semibold">Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openDepartures.map((dep) => (
                      <tr key={dep.id} className="border-b" data-testid={`brochure-departure-${dep.id}`}>
                        <td className="py-2 pr-4">{dep.startDate ? new Date(dep.startDate).toLocaleDateString() : "TBA"}</td>
                        <td className="py-2 pr-4">{dep.endDate ? new Date(dep.endDate).toLocaleDateString() : "TBA"}</td>
                        <td className="py-2 pr-4">{dep.pricePerPerson ? `$${Number(dep.pricePerPerson).toLocaleString()}` : "Contact us"}</td>
                        <td className="py-2 pr-4">{dep.capacityTotal ? `${dep.capacityBooked || 0}/${dep.capacityTotal}` : "Open"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground border-t pt-4 print:mt-8">
            {leaderName && <p className="mb-1">Led by {leaderName}</p>}
            <p>Generated on {new Date().toLocaleDateString()} | Contact us for more details and bookings</p>
          </div>
        </div>
      ) : (
        <div className="px-6 pb-6">
          <Card>
            <CardContent className="flex flex-col items-center py-16">
              <Image className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-sm">Select a tour above to preview your brochure</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
