import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plane, Search, TrendingDown, DollarSign } from "lucide-react";
import type { City } from "@shared/schema";

export default function AirlineSearch() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [searching, setSearching] = useState(false);

  const { data: cities } = useQuery<City[]>({ queryKey: ["/api/master/cities"] });

  const { data: results, refetch, isFetching } = useQuery<any[]>({
    queryKey: ["/api/flights/search", { origin, destination, date }],
    enabled: false,
  });

  const handleSearch = () => {
    if (!origin || !destination || !date) return;
    setSearching(true);
    refetch().finally(() => setSearching(false));
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-serif flex items-center gap-2">
          <Plane className="h-6 w-6 text-primary" />
          Airline Ticket Price Generator
        </h1>
        <p className="text-muted-foreground text-sm">Search for the lowest prices and generate ticket parameters.</p>
      </div>

      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Search Parameters</CardTitle>
          <CardDescription>Enter flight details to find the best available rates.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Origin City</Label>
              <Select value={origin} onValueChange={setOrigin}>
                <SelectTrigger>
                  <SelectValue placeholder="Select origin" />
                </SelectTrigger>
                <SelectContent>
                  {cities?.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Destination City</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {cities?.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Departure Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <Button onClick={handleSearch} disabled={searching || isFetching} className="gap-2">
              <Search className="h-4 w-4" />
              {searching ? "Searching..." : "Search Lowest Prices"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {(isFetching || results) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-500" />
              Available Offers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : results && results.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Airline</TableHead>
                    <TableHead>Flight No</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Arrival</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((flight, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{flight.airline}</TableCell>
                      <TableCell>{flight.flightNumber}</TableCell>
                      <TableCell>{flight.departureTime}</TableCell>
                      <TableCell>{flight.arrivalTime}</TableCell>
                      <TableCell className="font-bold text-primary">
                        {flight.price} {flight.currency}
                      </TableCell>
                      <TableCell>
                        {i === 0 ? (
                          <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                            <DollarSign className="h-3 w-3" />
                            Lowest Price
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Available</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No flights found for the selected criteria.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
