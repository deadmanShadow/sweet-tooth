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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { userService } from "@/services/api.service";
import { User } from "@/types";
import { format } from "date-fns";
import gsap from "gsap";
import {
  Calendar,
  Loader2,
  Mail,
  Phone,
  ShoppingCart,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (_error) {
      console.error("Failed to fetch users:", _error);
      toast.error("Failed to load users list!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      gsap.fromTo(
        containerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      );
    }
  }, [isLoading]);

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      await userService.deleteUser(userToDelete.id);
      toast.success("User banished from the kingdom.");
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch {
      toast.error("Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (id: string, name: string) => {
    setUserToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  };

  return (
    <div ref={containerRef} className="space-y-10">
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-primary uppercase">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-muted-foreground/80">
              You are about to banish{" "}
              <b className="text-primary">{userToDelete?.name}</b> from the
              kingdom!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-xl font-bold uppercase tracking-widest text-[10px] border-primary/10"
            >
              No, keep them
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Banishing...
                </>
              ) : (
                "Yes, delete them!"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-primary uppercase">
            User Directory
          </h2>
          <p className="text-muted-foreground font-medium">
            Manage your community of sweet-toothed enthusiasts.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 text-primary border border-primary/20">
          <Users className="h-5 w-5" />
          <span className="font-black text-lg">{users.length}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 ml-1">
            Total Souls
          </span>
        </div>
      </div>

      <div className="rounded-2xl border-none shadow-2xl shadow-primary/5 overflow-x-auto bg-card">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="bg-primary/5">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-primary h-14 pl-6">
                  Identity
                </TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-primary h-14">
                  Contact
                </TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-primary h-14">
                  Joined
                </TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-primary h-14 text-center">
                  Role
                </TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-primary h-14 text-center">
                  Orders
                </TableHead>
                <TableHead className="text-right font-black uppercase tracking-widest text-[10px] text-primary h-14 pr-6">
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
                      <p className="text-sm text-muted-foreground font-bold animate-pulse uppercase tracking-widest">
                        Reading the scrolls...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="h-12 w-12 opacity-20 mb-2" />
                      <p className="font-bold">
                        No users found in the kingdom.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-primary/[0.02] transition-colors border-b border-primary/5 group"
                  >
                    <TableCell className="py-5 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-black shadow-sm border border-primary/5 group-hover:scale-110 transition-transform">
                          {user.name?.[0] || "U"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-primary text-base uppercase tracking-tight">
                            {user.name}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                            #{user.id.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">
                          <Mail className="h-3 w-3 opacity-50" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/60">
                          <Phone className="h-3 w-3 opacity-50" />
                          {user.phone || "No signal"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                        <Calendar className="h-3 w-3 opacity-50" />
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-black rounded-full px-3 py-1 uppercase tracking-widest text-[9px] border-2",
                          user.role === "ADMIN"
                            ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-indigo-500/5 shadow-inner"
                            : "bg-primary/10 text-primary border-primary/20",
                        )}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted/50 font-black text-primary text-sm group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <ShoppingCart className="h-3 w-3" />
                        {user._count?.orders || 0}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 pr-6 text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={user.role === "ADMIN"}
                        className={cn(
                          "h-9 w-9 rounded-xl border-destructive/20 text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-all shadow-sm",
                          user.role === "ADMIN" &&
                            "opacity-20 cursor-not-allowed",
                        )}
                        onClick={() => openDeleteDialog(user.id, user.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
