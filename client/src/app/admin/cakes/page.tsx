"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cakeService } from "@/services/api.service";
import { Cake } from "@/types";
import gsap from "gsap";
import {
  CheckCircle2,
  Edit,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function AdminCakesPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchCakes = async () => {
    try {
      setIsLoading(true);
      const data = await cakeService.getAll();
      setCakes(data);
    } catch (_error) {
      console.error("Failed to fetch cakes:", _error);
      toast.error("Failed to load cakes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCakes();
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

  const handleDelete = async (id: string, name: string) => {
    const result = await MySwal.fire({
      title: (
        <p className="text-xl font-black uppercase tracking-tight text-primary">
          Destroy Recipe?
        </p>
      ),
      html: (
        <p className="text-sm font-medium text-muted-foreground">
          Are you sure you want to remove <b>{name}</b>? This cannot be undone!
        </p>
      ),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, save it",
      confirmButtonColor: "oklch(0.55 0.18 280)",
      cancelButtonColor: "oklch(0.45 0.08 280)",
      background: "oklch(0.99 0.005 280)",
      customClass: {
        popup: "rounded-3xl border-none shadow-2xl",
        confirmButton:
          "rounded-xl font-bold uppercase tracking-widest text-xs px-6 py-3",
        cancelButton:
          "rounded-xl font-bold uppercase tracking-widest text-xs px-6 py-3",
      },
    });

    if (result.isConfirmed) {
      try {
        await cakeService.delete(id);
        MySwal.fire({
          title: "Deleted!",
          text: "The cake has been removed from inventory.",
          icon: "success",
          confirmButtonColor: "oklch(0.55 0.18 280)",
        });
        fetchCakes();
      } catch {
        MySwal.fire({
          title: "Error!",
          text: "Failed to delete cake.",
          icon: "error",
          confirmButtonColor: "oklch(0.55 0.18 280)",
        });
      }
    }
  };

  return (
    <div ref={containerRef} className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-primary uppercase">
            Menu Vault
          </h2>
          <p className="text-muted-foreground font-medium">
            Manage your signature recipes and stock availability.
          </p>
        </div>
        <Button
          asChild
          className="rounded-xl font-bold shadow-lg shadow-primary/20 h-12 px-6 hover:scale-105 transition-transform"
        >
          <Link href="/admin/cakes/new">
            <Plus className="mr-2 h-5 w-5" />
            Add New Creation
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl border-none shadow-2xl shadow-primary/5 overflow-x-auto bg-card">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="bg-primary/5">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[100px] font-black uppercase tracking-widest text-[10px] text-primary h-14 pl-6">
                  Image
                </TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-primary h-14">
                  Cake Identity
                </TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-primary h-14">
                  Type & Flavor
                </TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-primary h-14 text-right">
                  Price
                </TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-primary h-14 text-center">
                  Weight
                </TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-primary h-14 text-center">
                  Availability
                </TableHead>
                <TableHead className="text-right font-black uppercase tracking-widest text-[10px] text-primary h-14 pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-60 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground font-bold animate-pulse uppercase tracking-widest">
                        Entering the kitchen...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : cakes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-60 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-12 w-12 opacity-20 mb-2" />
                      <p className="font-bold">No cakes found in your vault.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                cakes.map((cake) => (
                  <TableRow
                    key={cake.id}
                    className="hover:bg-primary/[0.02] transition-colors border-b border-primary/5 group"
                  >
                    <TableCell className="py-5 pl-6">
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl border-2 border-primary/10 shadow-sm group-hover:scale-110 transition-transform">
                        {cake.image ? (
                          <Image
                            src={cake.image}
                            alt={cake.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
                            <ImageIcon className="h-6 w-6 opacity-30" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <span className="font-black text-primary text-base uppercase tracking-tight">
                        {cake.name}
                      </span>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-tighter">
                          {cake.type || "-"}
                        </span>
                        <span className="text-xs text-muted-foreground/60 italic">
                          {cake.flavor || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-right font-black text-lg text-primary">
                      ${cake.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-5 text-center font-bold text-muted-foreground">
                      {cake.pounds || "-"}{" "}
                      <span className="text-[10px] opacity-50">LBS</span>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex justify-center">
                        {cake.availability ? (
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 className="h-3 w-3" />
                            In Stock
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20 text-[10px] font-black uppercase tracking-widest">
                            <XCircle className="h-3 w-3" />
                            Depleted
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          className="h-9 w-9 rounded-xl border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all shadow-sm"
                        >
                          <Link href={`/admin/cakes/${cake.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-xl border-destructive/20 text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-all shadow-sm"
                          onClick={() => handleDelete(cake.id, cake.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
