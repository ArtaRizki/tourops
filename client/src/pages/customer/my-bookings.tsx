import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { BookOpen, Calendar, Users, ArrowRight, Link2, MapPin } from "lucide-react";
import { BOOKING_TYPES, BOOKING_STATUSES, FULFILLMENT_STATUSES } from "@/lib/constants";
import type { Booking } from "@shared/schema";

export default function MyBookings() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("joinCode");
    if (code) {
      setJoinCode(code);
      setShowJoin(true);
      // Clear the query param from URL without refreshing
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const { data: bookings, isLoading } = useQuery<Booking[]>({ queryKey: ["/api/my-bookings"] });

  const joinMutation = useMutation({
    mutationFn: (code: string) => apiRequest("POST", "/api/bookings/join", { joinCode: code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-bookings"] });
      setShowJoin(false);
      setJoinCode("");
      toast({ title: "Successfully joined the group!" });
    },
    onError: () => toast({ title: "Invalid join code", variant: "destructive" }),
  });

  if (isLoading) {
    return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" />{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif" data-testid="text-my-bookings-title">My Bookings</h1>
          <p className="text-muted-foreground text-sm">View and manage your tour bookings</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={showJoin} onOpenChange={setShowJoin}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-join-group"><Link2 className="h-4 w-4 mr-2" />Join Group</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Join a Group Tour</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Enter the invite code shared by your tour leader</p>
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter join code..."
                  data-testid="input-join-code"
                />
                <Button
                  className="w-full"
                  onClick={() => joinMutation.mutate(joinCode)}
                  disabled={!joinCode.trim() || joinMutation.isPending}
                  data-testid="button-submit-join"
                >
                  {joinMutation.isPending ? "Joining..." : "Join Group"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Link href="/tours">
            <Button data-testid="button-browse-tours"><MapPin className="h-4 w-4 mr-2" />Browse Tours</Button>
          </Link>
        </div>
      </div>

      {!bookings || bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold mb-1">No bookings yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Browse our tours and book your next adventure</p>
            <Link href="/tours">
              <Button>Explore Tours</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Link key={booking.id} href={`/my-bookings/${booking.id}`}>
              <Card className="hover-elevate cursor-pointer" data-testid={`card-my-booking-${booking.id}`}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{booking.bookingCode}</span>
                        <Badge variant="outline" className="text-xs">{BOOKING_TYPES[booking.bookingType]}</Badge>
                      </div>
                      {booking.groupName && <p className="text-sm text-muted-foreground">{booking.groupName}</p>}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{booking.partySizeExpected} travelers</span>
                        {booking.createdAt && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(booking.createdAt).toLocaleDateString()}</span>}
                        {booking.joinCode && (
                          <span className="flex items-center gap-1 font-mono"><Link2 className="h-3 w-3" />{booking.joinCode}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={booking.status === "confirmed" ? "default" : booking.status === "cancelled" ? "destructive" : "secondary"}>
                        {BOOKING_STATUSES[booking.status || "submitted"]}
                      </Badge>
                      <Badge variant={booking.fulfillmentStatus === "completed" ? "default" : "outline"}>
                        {FULFILLMENT_STATUSES[booking.fulfillmentStatus || "pending"]}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
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
