import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Clock, CheckCircle, Printer } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import type { Tour, TourDeparture, TourDay } from "@shared/schema";

function PublicGroupsList({ departureId }: { departureId: string }) {
  const { data: groups, isLoading } = useQuery<any[]>({
    queryKey: ["/api/departures", departureId, "public-groups"],
  });

  if (isLoading) return <Skeleton className="h-10 w-full mt-2" />;
  if (!groups || groups.length === 0) return null;

  return (
    <div className="mt-3 space-y-2 border-t pt-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Join an existing group:</p>
      {groups.map((group) => (
        <div key={group.id} className="flex items-center justify-between p-2 bg-primary/5 rounded-md border border-primary/10">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{group.groupName}</span>
            <Badge variant="outline" className="text-[10px] h-4">{group.partySizeExpected} pax</Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
            <Link href={`${window.location.pathname}?joinCode=${group.joinCode}`}>Join Group</Link>
          </Button>
        </div>
      ))}
    </div>
  );
}

export default function TourDetail() {
  const [, params] = useRoute("/tours/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const tourId = params?.id;

  const { data: tour, isLoading } = useQuery<Tour>({ queryKey: ["/api/tours", tourId] });
  const { data: departures } = useQuery<TourDeparture[]>({ queryKey: ["/api/tours", tourId, "departures"] });
  const { data: days } = useQuery<TourDay[]>({ queryKey: ["/api/tours", tourId, "days"] });

  const [showBooking, setShowBooking] = useState(false);
  const [bookingType, setBookingType] = useState("join_public_group");
  const [departureId, setDepartureId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [notes, setNotes] = useState("");
  const [joinedGroup, setJoinedGroup] = useState<any>(null);

  // Handle Join Code from URL
  const searchParams = new URLSearchParams(window.location.search);
  const urlJoinCode = searchParams.get("joinCode");

  const { data: joinedGroupData, isLoading: joiningLoading } = useQuery({
    queryKey: ["/api/bookings/by-code", urlJoinCode?.toUpperCase()],
    queryFn: () => apiRequest("GET", `/api/bookings/by-code/${urlJoinCode?.toUpperCase()}`).then(res => res.json()),
    enabled: !!urlJoinCode,
  });

  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const bookMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/bookings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-bookings"] });
      setShowBooking(false);
      toast({ title: "Booking created successfully!" });
      navigate("/my-bookings");
    },
    onError: () => toast({ title: "Booking failed", variant: "destructive" }),
  });

  if (isLoading) {
    return <div className="p-6"><Skeleton className="h-64" /></div>;
  }

  if (!tour) {
    return <div className="p-6"><p className="text-muted-foreground">Tour not found</p></div>;
  }

  const openDepartures = departures?.filter((d) => d.status === "open") || [];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Join Group Dialog (Automatic) */}
      <Dialog open={!!urlJoinCode && !!joinedGroupData && !bookingConfirmed} onOpenChange={(v) => !v && navigate(`/tours/${tourId}`)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Join Group: {joinedGroupData?.groupName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
              <p className="text-sm text-muted-foreground">You are joining a group for:</p>
              <p className="font-bold text-lg mt-1">{tour.title}</p>
              <p className="text-xs text-muted-foreground mt-1">Departure: {joinedGroupData?.departureId}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Party Size (Including you)</Label>
              <Input 
                type="number" 
                min={1} 
                value={partySize} 
                onChange={(e) => setPartySize(parseInt(e.target.value) || 1)} 
              />
            </div>

            <Button 
              className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
              onClick={() => bookMutation.mutate({
                tourId: tour.id,
                departureId: joinedGroupData.departureId,
                bookingType: "join_leader_group",
                leaderUserId: joinedGroupData.customerId,
                partySizeExpected: partySize,
                totalPrice: Number(tour.basePrice || 0) * partySize,
              }, {
                onSuccess: () => {
                   setBookingConfirmed(true);
                   navigate("/my-bookings");
                }
              })}
              disabled={bookMutation.isPending}
            >
              {bookMutation.isPending ? "Joining..." : "Confirm & Join Group"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/tours">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back to Tours</Button>
        </Link>
        <Link href={`/tours/${tourId}/brochure`}>
          <Button variant="outline" size="sm" data-testid="button-view-brochure">
            <Printer className="h-4 w-4 mr-1" />View Brochure
          </Button>
        </Link>
      </div>

      {tour.imageUrl && (
        <div className="aspect-video overflow-hidden rounded-md">
          <img src={tour.imageUrl} alt={tour.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif" data-testid="text-tour-title">{tour.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{tour.duration} days</span>
              {tour.countries && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{tour.countries.join(", ")}</span>}
            </div>
          </div>
          <div className="text-right">
            {tour.basePrice ? (
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Starting from</p>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-3xl font-bold text-primary">${tour.basePrice.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">/person</span>
                </div>
                {(tour.childPrice || tour.singleSupplement) && (
                  <div className="mt-2 pt-2 border-t border-primary/10 text-xs text-muted-foreground space-y-1">
                    {tour.childPrice && <p>Child: ${tour.childPrice.toLocaleString()}</p>}
                    {tour.singleSupplement && <p>Single Supp: +${tour.singleSupplement.toLocaleString()}</p>}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed">{tour.description}</p>

        {tour.galleryUrls && tour.galleryUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tour.galleryUrls.map((url, i) => (
              <div key={i} className="aspect-square rounded-md overflow-hidden border shadow-sm">
                <img src={url} alt={`${tour.title} gallery ${i+1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tour.highlights && (
            <Card className="md:col-span-1 border-none shadow-sm bg-slate-50 dark:bg-slate-900">
              <CardContent className="p-5">
                <h3 className="font-bold mb-3 flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Highlights</h3>
                <ul className="space-y-2">
                  {tour.highlights.split('\n').filter(Boolean).map((h, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      {h.trim()}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tour.inclusions && (
              <Card className="border-none shadow-sm bg-emerald-50/50 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500">
                <CardContent className="p-5">
                  <h3 className="font-bold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Inclusions</h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{tour.inclusions}</div>
                </CardContent>
              </Card>
            )}
            {tour.exclusions && (
              <Card className="border-none shadow-sm bg-rose-50/50 dark:bg-rose-950/20 border-l-4 border-l-rose-500">
                <CardContent className="p-5">
                  <h3 className="font-bold text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-2"><ArrowLeft className="h-4 w-4 rotate-45" /> Exclusions</h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{tour.exclusions}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {days && days.length > 0 && (
        <div>
          <h2 className="text-xl font-bold font-serif mb-4">Itinerary</h2>
          <div className="space-y-3">
            {days.sort((a, b) => a.dayNumber - b.dayNumber).map((day) => (
              <Card key={day.id} data-testid={`card-day-${day.dayNumber}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{day.dayNumber}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{day.title}</h3>
                      {day.city && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{day.city}{day.countryCode ? `, ${day.countryCode}` : ""}</p>}
                      {day.description && <p className="text-sm text-muted-foreground mt-1">{day.description}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold font-serif mb-4">Available Departures</h2>
        {openDepartures.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center py-12"><Calendar className="h-10 w-10 text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">No departures available at the moment</p></CardContent></Card>
        ) : (
          <div className="space-y-2">
            {openDepartures.map((dep) => (
              <Card key={dep.id} data-testid={`card-departure-${dep.id}`}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="font-medium">{dep.startDate} - {dep.endDate}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{(dep.capacityTotal || 0) - (dep.capacityBooked || 0)} spots left</span>
                          {dep.pricePerPerson && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{dep.pricePerPerson}/person</span>}
                        </div>
                      </div>
                    </div>
                    {isAuthenticated ? (
                      <Dialog open={showBooking && departureId === dep.id} onOpenChange={(open) => { setShowBooking(open); if (open) setDepartureId(dep.id); }}>
                        <DialogTrigger asChild>
                          <Button data-testid={`button-book-${dep.id}`}>Book Now</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Book This Tour</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Booking Type</Label>
                              <Select value={bookingType} onValueChange={setBookingType}>
                                <SelectTrigger data-testid="select-booking-type"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="join_public_group">Join Public Group</SelectItem>
                                  <SelectItem value="leader_group">Create Leader Group</SelectItem>
                                  <SelectItem value="private_family">Private Family</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {bookingType === "leader_group" && (
                              <div><Label>Group Name</Label><Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="My Travel Group" data-testid="input-group-name" /></div>
                            )}
                            <div><Label>Party Size</Label><Input type="number" min={1} value={partySize} onChange={(e) => setPartySize(parseInt(e.target.value) || 1)} data-testid="input-party-size" /></div>
                            <div><Label>Notes (optional)</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requests..." /></div>
                            <Button
                              className="w-full"
                              onClick={() => bookMutation.mutate({
                                tourId: tour.id,
                                departureId: dep.id,
                                bookingType,
                                groupName: bookingType === "leader_group" ? groupName : undefined,
                                partySizeExpected: partySize,
                                notes,
                                totalPrice: Number(dep.pricePerPerson || tour.basePrice || 0) * partySize,
                              })}
                              disabled={bookMutation.isPending}
                              data-testid="button-confirm-booking"
                            >
                              {bookMutation.isPending ? "Booking..." : "Confirm Booking"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <a href="/#login"><Button data-testid="button-sign-in-to-book">Sign In to Book</Button></a>
                    )}
                  </div>
                  <PublicGroupsList departureId={dep.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
