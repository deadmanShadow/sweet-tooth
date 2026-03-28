"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orderService } from "@/services/api.service";
import gsap from "gsap";
import {
  Cake,
  DollarSign,
  Loader2,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

const COLORS = ["#8b5cf6", "#a78bfa", "#7c3aed", "#6d28d9", "#4c1d95"];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<{
    overview: {
      totalRevenue: number;
      totalOrders: number;
      totalCakes: number;
      totalUsers: number;
      totalCustomRequests?: number;
    };
    revenueByMonth: { month: string; revenue: number }[];
    orderStatusDistribution: { status: string; count: number }[];
    customRequestStatusDistribution: { status: string; count: number }[];
    customRequestsByMonth: { month: string; count: number }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const cardsRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getStats();
      setStats(data);
    } catch (_error) {
      console.error("Failed to fetch admin stats:", _error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (stats) {
      const cards = cardsRef.current?.children;
      const charts = chartsRef.current?.children;

      if (cards) {
        gsap.fromTo(
          cards,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.7)",
          },
        );
      }
      if (charts) {
        gsap.fromTo(
          charts,
          { scale: 0.95, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            delay: 0.4,
            ease: "power2.out",
          },
        );
      }
    }
  }, [stats]);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      await orderService.resetOrders();
      toast.success("Analytics data has been wiped.");
      setIsResetDialogOpen(false);
      fetchStats();
    } catch {
      toast.error("Failed to reset analytics.");
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">
          Brewing your dashboard...
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="font-bold">Failed to load dashboard data.</p>
        <Button onClick={fetchStats} variant="outline" className="rounded-xl">
          Retry
        </Button>
      </div>
    );
  }

  const {
    overview,
    revenueByMonth,
    orderStatusDistribution,
    customRequestStatusDistribution,
    customRequestsByMonth,
  } = stats;

  return (
    <div className="space-y-10">
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-primary uppercase">
              Wipe Analytics?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-muted-foreground/80">
              This will permanently delete all orders and revenue data. You
              cannot undo this action!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={isResetting}
              className="rounded-xl font-bold uppercase tracking-widest text-[10px] border-primary/10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleReset();
              }}
              disabled={isResetting}
              className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20"
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wiping...
                </>
              ) : (
                "Yes, reset everything!"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-primary uppercase">
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground font-medium">
            Real-time analytics for my sweet tooth kingdom.
          </p>
        </div>
        <Button
          onClick={() => setIsResetDialogOpen(true)}
          disabled={isResetting}
          variant="outline"
          className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-6 border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all shadow-lg shadow-destructive/5"
        >
          {isResetting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Reset Analytics
        </Button>
      </div>

      {/* Overview Cards */}
      <div
        ref={cardsRef}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        <Card className="border-none shadow-xl shadow-primary/5 bg-gradient-to-br from-card to-primary/5 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">
              ৳{overview.totalRevenue.toFixed(2)}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-500 font-bold">
              <TrendingUp className="h-3 w-3" />
              <span>Confirmed Earnings</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5 bg-gradient-to-br from-card to-primary/5 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Total Orders
            </CardTitle>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">
              {overview.totalOrders}
            </div>
            <p className="mt-2 text-xs text-muted-foreground font-medium">
              Orders processed
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5 bg-gradient-to-br from-card to-primary/5 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Custom Requests
            </CardTitle>
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500 group-hover:scale-110 transition-transform">
              <Sparkles className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">
              {overview.totalCustomRequests || 0}
            </div>
            <p className="mt-2 text-xs text-muted-foreground font-medium">
              Pending designs
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5 bg-gradient-to-br from-card to-primary/5 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Customers
            </CardTitle>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500 group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">
              {overview.totalUsers}
            </div>
            <p className="mt-2 text-xs text-muted-foreground font-medium">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5 bg-gradient-to-br from-card to-primary/5 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Active Cakes
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
              <Cake className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">
              {overview.totalCakes}
            </div>
            <p className="mt-2 text-xs text-muted-foreground font-medium">
              Menu inventory
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div ref={chartsRef} className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-xl font-black text-primary">
              Revenue Growth
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground/80">
              Monthly successful revenue distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByMonth}>
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="oklch(0.65 0.16 280)"
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor="oklch(0.65 0.16 280)"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="oklch(0.88 0.03 280)"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "oklch(0.45 0.08 280)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "oklch(0.45 0.08 280)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: "oklch(0.65 0.16 280 / 0.05)" }}
                    formatter={(value: unknown) => [
                      `$${Number(value || 0).toFixed(2)}`,
                      "Revenue",
                    ]}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      backgroundColor: "oklch(0.99 0.005 280)",
                      padding: "12px",
                      fontWeight: 700,
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-xl font-black text-primary">
              Order Lifecycle
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground/80">
              Breakdown of regular order statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="count"
                    nameKey="status"
                    stroke="none"
                  >
                    {orderStatusDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      backgroundColor: "oklch(0.99 0.005 280)",
                      padding: "12px",
                      fontWeight: 700,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-xl font-black text-primary">
              Custom Request Stats
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground/80">
              Breakdown of design request statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customRequestStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="count"
                    nameKey="status"
                    stroke="none"
                  >
                    {customRequestStatusDistribution.map((_, index) => (
                      <Cell
                        key={`cell-custom-${index}`}
                        fill={COLORS[(index + 2) % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      backgroundColor: "oklch(0.99 0.005 280)",
                      padding: "12px",
                      fontWeight: 700,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-xl font-black text-primary">
              Monthly Custom Cravings
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground/80">
              Number of design requests per month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customRequestsByMonth}>
                  <defs>
                    <linearGradient
                      id="customBarGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#ec4899" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#ec4899"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="oklch(0.88 0.03 280)"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "oklch(0.45 0.08 280)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "oklch(0.45 0.08 280)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "oklch(0.65 0.16 280 / 0.05)" }}
                    formatter={(value: unknown) => [
                      `${Number(value || 0)} requests`,
                      "Volume",
                    ]}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      backgroundColor: "oklch(0.99 0.005 280)",
                      padding: "12px",
                      fontWeight: 700,
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#customBarGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
