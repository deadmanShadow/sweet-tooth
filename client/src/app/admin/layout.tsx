"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import {
  ArrowLeft,
  Cake,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBag,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const adminSidebarItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Cakes",
    href: "/admin/cakes",
    icon: Cake,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Custom Requests",
    href: "/admin/custom-requests",
    icon: Sparkles,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user?.role === "ADMIN") {
      gsap.fromTo(
        mainRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" },
      );
    }
  }, [isLoading, user]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <span className="text-lg font-bold text-primary">
            Sweet Tooth Admin
          </span>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Home
          </Button>
        </Link>
      </header>

      <div className="flex w-full h-[calc(100vh-4rem)] lg:h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r shadow-xl transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 lg:opacity-100 lg:visible lg:pointer-events-auto",
            isSidebarOpen
              ? "translate-x-0 opacity-100 visible pointer-events-auto"
              : "-translate-x-full opacity-0 invisible pointer-events-none lg:translate-x-0 lg:opacity-100 lg:visible lg:pointer-events-auto",
          )}
        >
          <div className="flex h-full flex-col p-6">
            <div className="mb-8 flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Cake className="h-6 w-6" />
                </div>
                <span className="text-xl font-black tracking-tight text-primary uppercase">
                  Sweet Tooth
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <nav className="flex-1 space-y-2">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">
                Main Menu
              </p>
              {adminSidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 translate-x-1"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                      pathname === item.href
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-primary",
                    )}
                  />
                  {item.title}
                </Link>
              ))}
            </nav>

            <div className="mt-auto space-y-4 pt-6">
              <Separator className="bg-primary/10" />
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  {user.name?.[0] || "A"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-sm font-bold">
                    {user.name}
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary font-bold"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Backdrop mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main ref={mainRef} className="flex-1 bg-muted/20 overflow-y-auto">
            <div className="container mx-auto p-4 md:p-6 lg:p-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
