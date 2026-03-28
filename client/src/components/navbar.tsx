"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/providers/cart-provider";
import { LayoutDashboard, LogOut, Menu, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo1.png"
              alt="Sweet Tooth Logo"
              width={90}
              height={100}
              className="object-contain mt-4"
              style={{ height: "auto" }}
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center space-x-6 ml-6">
            <Link
              href="/custom-cake"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Custom Cake
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full bg-muted"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full font-semibold">
                    {userInitials}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.role === "ADMIN" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin"
                        className="cursor-pointer font-bold text-primary"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link
                href="/login"
                className="text-xs text-muted-foreground hover:text-primary transition-colors opacity-50 hover:opacity-100"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b bg-background p-4 flex flex-col space-y-4 animate-in slide-in-from-top duration-300">
          <Link
            href="/custom-cake"
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Custom Cake
          </Link>
          <Separator />
          {isAuthenticated ? (
            <>
              <div className="flex flex-col space-y-1 py-2">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex items-center text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <Button asChild onClick={() => setIsMobileMenuOpen(false)}>
                <Link href="/login">Login</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
