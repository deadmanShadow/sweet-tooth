"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { orderService } from "@/services/api.service";
import { Order } from "@/types";
import { format } from "date-fns";
import gsap from "gsap";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  Search,
  ShoppingBag,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const statusOptions = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Filters
  const [status, setStatus] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: {
        page: number;
        limit: number;
        status?: string;
        startDate?: string;
        endDate?: string;
      } = {
        page,
        limit: 10,
      };

      if (status !== "ALL") params.status = status;
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();

      const response = await orderService.getAllAdmin(params);
      setOrders(response.items);
      setMeta(response.meta);
    } catch (_error) {
      console.error("Failed to fetch orders:", _error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [page, status, startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!isLoading) {
      gsap.fromTo(
        containerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      );
    }
  }, [isLoading]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await orderService.updateStatus(id, status as Order["status"]);
      toast.success("Order status updated");
      fetchOrders();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const clearFilters = () => {
    setStatus("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const getStatusBadge = (status: Order["status"]) => {
    const variants: Record<Order["status"], string> = {
      PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      CONFIRMED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      SHIPPED: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      DELIVERED: "bg-green-500/10 text-green-500 border-green-500/20",
      CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return (
      <Badge
        variant="outline"
        className={`${variants[status]} font-bold rounded-full px-3 py-1 uppercase tracking-tighter text-[10px]`}
      >
        {status}
      </Badge>
    );
  };

  return (
    <div ref={containerRef} className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-primary uppercase">
            Order Command
          </h2>
          <p className="text-muted-foreground font-medium">
            Manage customer cravings and delivery status.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-card p-6 rounded-2xl shadow-xl shadow-primary/5 border border-primary/10">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            Status
          </label>
          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="bg-muted/30 border-none rounded-xl font-bold h-11">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Statuses</SelectItem>
              {statusOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="h-2 w-2 rounded-full p-0"
                    />
                    {opt}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            From Date
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="bg-muted/30 border-none rounded-xl font-bold h-11"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            To Date
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="bg-muted/30 border-none rounded-xl font-bold h-11"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            className="flex-1 rounded-xl font-bold h-11 hover:bg-primary/5 hover:text-primary"
            onClick={clearFilters}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button
            className="flex-1 rounded-xl font-bold h-11 shadow-lg shadow-primary/20"
            onClick={fetchOrders}
          >
            <Search className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border-none shadow-2xl shadow-primary/5 overflow-x-auto bg-card">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader className="bg-primary/5">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-primary h-14">
                  Order ID
                </TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-primary h-14">
                  Customer
                </TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-primary h-14">
                  Location & Fee
                </TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-primary h-14">
                  Date
                </TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-primary h-14 text-right">
                  Total
                </TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-primary h-14">
                  Status
                </TableHead>
                <TableHead className="text-right font-black uppercase tracking-widest text-[10px] text-primary h-14 px-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground font-bold animate-pulse">
                        Fetching orders...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ShoppingBag className="h-12 w-12 opacity-20 mb-2" />
                      <p className="font-bold">
                        No orders found matching your criteria.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-primary/[0.02] transition-colors border-b border-primary/5 group"
                  >
                    <TableCell className="font-mono text-xs uppercase text-primary font-black py-5">
                      #{order.id.slice(-8)}
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-sm">
                          {order.user?.name || order.customerName || "Guest"}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {order.user?.phone ||
                            order.customerPhone ||
                            "No contact"}
                        </span>
                        {order.customerAddress && (
                          <span className="text-[10px] text-muted-foreground/60 mt-0.5 max-w-[150px] truncate">
                            {order.customerAddress}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col">
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-bold uppercase tracking-tighter w-fit mb-1"
                        >
                          {order.location === "INSIDE"
                            ? "Inside Cumilla"
                            : "Outside Cumilla"}
                        </Badge>
                        <span className="text-xs font-black text-muted-foreground">
                          Fee: ${order.deliveryFee?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-medium py-5">
                      {format(new Date(order.createdAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="text-right font-black text-lg py-5 text-primary">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-5">
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-right py-5 px-6">
                      <Select
                        defaultValue={order.status}
                        onValueChange={(value) =>
                          handleStatusChange(order.id, value)
                        }
                      >
                        <SelectTrigger className="w-[150px] ml-auto h-10 bg-muted/50 border-none rounded-xl font-bold group-hover:bg-white group-hover:shadow-md transition-all">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {statusOptions.map((status) => (
                            <SelectItem
                              key={status}
                              value={status}
                              className="font-bold uppercase tracking-tighter text-xs"
                            >
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-6 bg-muted/20 rounded-2xl p-6">
          <p className="text-sm text-muted-foreground font-bold uppercase tracking-tight">
            Showing <span className="text-primary">{orders.length}</span> of{" "}
            <span className="text-primary">{meta.total}</span> delicious orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl border-primary/20 hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-10 h-10 rounded-xl p-0 font-black text-xs transition-all",
                      p === page
                        ? "shadow-lg shadow-primary/20 scale-110"
                        : "text-muted-foreground hover:bg-primary/10",
                    )}
                  >
                    {p}
                  </Button>
                ),
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              disabled={page === meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border-primary/20 hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
