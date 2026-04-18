import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CreditCard, DollarSign, Filter } from "lucide-react";
import { Link } from "wouter";
import { useState, useMemo } from "react";

type LeaderPayment = {
  id: string;
  bookingId: string;
  amount: string;
  currency: string;
  method: string | null;
  status: string;
  notes: string | null;
  createdAt: string | null;
  bookingCode: string;
  groupName: string | null;
  bookingType: string;
  travelers: string[];
  paidBy: string;
  isLeaderPayment: boolean;
};

const PAYMENT_STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  pending: "secondary",
  failed: "destructive",
  refunded: "outline",
};

export default function LeaderPayments() {
  const { data: payments, isLoading } = useQuery<LeaderPayment[]>({
    queryKey: ["/api/leader/payments"],
  });

  const [statusFilter, setStatusFilter] = useState("all");
  const [bookingFilter, setBookingFilter] = useState("");

  const filtered = useMemo(() => {
    if (!payments) return [];
    return payments.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (bookingFilter && !p.bookingCode.toLowerCase().includes(bookingFilter.toLowerCase())) return false;
      return true;
    });
  }, [payments, statusFilter, bookingFilter]);

  const safeAmount = (amt: string | null | undefined): number => {
    const n = Number(amt);
    return isNaN(n) ? 0 : n;
  };

  const totalsByStatus = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const p of filtered) {
      totals[p.status] = (totals[p.status] || 0) + safeAmount(p.amount);
    }
    return totals;
  }, [filtered]);

  const grandTotal = useMemo(() => filtered.reduce((sum, p) => sum + safeAmount(p.amount), 0), [filtered]);

  if (isLoading) {
    return <div className="p-6 space-y-4"><Skeleton className="h-32" /><Skeleton className="h-64" /></div>;
  }

  const uniqueBookingCodes = Array.from(new Set(payments?.map((p) => p.bookingCode) || []));

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/leader-dashboard">
            <Button variant="ghost" size="sm" data-testid="button-back-leader-payments">
              <ArrowLeft className="h-4 w-4 mr-1" />Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-serif" data-testid="text-leader-payments-title">Payment History Report</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Grand Total</p>
              <p className="text-xl font-bold" data-testid="text-grand-total">${grandTotal.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        {Object.entries(totalsByStatus).map(([status, total]) => (
          <Card key={status}>
            <CardContent className="p-4 flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground capitalize">{status}</p>
                <p className="text-lg font-bold">${total.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
          <CardTitle className="text-base">Filters</CardTitle>
          <Filter className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <div className="min-w-[180px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-payment-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder="Search by booking code..."
            value={bookingFilter}
            onChange={(e) => setBookingFilter(e.target.value)}
            className="max-w-xs"
            data-testid="input-booking-filter"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3 font-semibold">Booking</th>
                  <th className="p-3 font-semibold">Paid By</th>
                  <th className="p-3 font-semibold">Travelers</th>
                  <th className="p-3 font-semibold">Amount</th>
                  <th className="p-3 font-semibold">Method</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-b" data-testid={`row-payment-${p.id}`}>
                      <td className="p-3">
                        <p className="font-medium">{p.bookingCode}</p>
                        {p.groupName && <p className="text-xs text-muted-foreground">{p.groupName}</p>}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={p.isLeaderPayment ? "default" : "outline"} className="text-xs">
                            {p.paidBy || "N/A"}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-xs text-muted-foreground">{p.travelers.join(", ") || "N/A"}</p>
                      </td>
                      <td className="p-3 font-medium">${Number(p.amount).toLocaleString()} {p.currency}</td>
                      <td className="p-3 text-muted-foreground">{p.method || "N/A"}</td>
                      <td className="p-3">
                        <Badge variant={PAYMENT_STATUS_VARIANT[p.status] || "secondary"} className="capitalize">
                          {p.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">{p.notes || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Showing {filtered.length} of {payments?.length || 0} payments
      </p>
    </div>
  );
}
