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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { customRequestService } from "@/services/api.service";
import { CustomRequest } from "@/types";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Phone,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminCustomRequestsPage() {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // State for confirmation dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmingRequestId, setConfirmingRequestId] = useState<string | null>(
    null,
  );
  const [confirmData, setConfirmData] = useState({
    price: "",
    cost: "",
  });

  // State for delete alert dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingRequestId, setDeletingRequestId] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRequests = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true);
        const params: { page: number; limit: number; status?: string } = {
          page,
          limit: 10,
        };
        if (statusFilter !== "all") params.status = statusFilter;

        const data = await customRequestService.getAll(params);
        setRequests(data.items);
        setMeta(data.meta);
      } catch (error) {
        console.error("Failed to fetch custom requests:", error);
        toast.error("Failed to load requests");
      } finally {
        setIsLoading(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    fetchRequests(1);
  }, [fetchRequests]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (newStatus === "CONFIRMED") {
      setConfirmingRequestId(id);
      setConfirmData({ price: "", cost: "" });
      setIsConfirmDialogOpen(true);
      return;
    }

    try {
      await customRequestService.updateStatus(
        id,
        newStatus as CustomRequest["status"],
      );
      toast.success(`Status updated to ${newStatus}`);
      fetchRequests(meta.page);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const submitConfirmation = async () => {
    if (!confirmingRequestId) return;

    if (!confirmData.price || !confirmData.cost) {
      toast.error("Please fill in both price and cost");
      return;
    }

    try {
      await customRequestService.updateStatus(
        confirmingRequestId,
        "CONFIRMED",
        parseFloat(confirmData.price),
        parseFloat(confirmData.cost),
      );
      toast.success("Request confirmed with financial details");
      setIsConfirmDialogOpen(false);
      setConfirmingRequestId(null);
      fetchRequests(meta.page);
    } catch (error) {
      console.error("Failed to confirm request:", error);
      toast.error("Failed to confirm request");
    }
  };

  const handleDelete = async () => {
    if (!deletingRequestId) return;

    try {
      setIsDeleting(true);
      await customRequestService.delete(deletingRequestId);
      toast.success("Request deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingRequestId(null);
      fetchRequests(meta.page);
    } catch (error) {
      console.error("Failed to delete request:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete request";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeletingRequestId(id);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading && requests.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-primary">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-muted-foreground/80">
              This action cannot be undone. This will permanently delete the
              custom request from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-xl font-bold border-primary/10 hover:bg-primary/5"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="rounded-xl font-black bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, delete request"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Confirm Custom Request
            </DialogTitle>
            <DialogDescription>
              Please enter the financial details to confirm this request. These
              values will be added to your total revenue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right font-bold">
                Selling Price
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="৳0.00"
                className="col-span-3 rounded-xl border-primary/20"
                value={confirmData.price}
                onChange={(e) =>
                  setConfirmData((prev) => ({ ...prev, price: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="cost"
                className="text-right font-bold text-muted-foreground"
              >
                Cost Price
              </Label>
              <Input
                id="cost"
                type="number"
                placeholder="৳0.00"
                className="col-span-3 rounded-xl border-primary/10"
                value={confirmData.cost}
                onChange={(e) =>
                  setConfirmData((prev) => ({ ...prev, cost: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsConfirmDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={submitConfirmation}
              className="rounded-xl bg-primary shadow-lg shadow-primary/20"
            >
              Confirm & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-primary uppercase">
              Custom Cake Requests
            </h2>
            <p className="text-muted-foreground font-medium">
              Manage and review custom cake design requests from customers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border-none bg-transparent h-7 focus:ring-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>
            Showing {requests.length} of {meta.total} custom requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Cake Details</TableHead>
                <TableHead>Financials</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No custom requests found.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {format(new Date(request.createdAt), "MMM d, yyyy")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(request.createdAt), "h:mm a")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-1">
                          <User className="h-3 w-3" /> {request.customerName}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {request.customerPhone}
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge
                            variant="outline"
                            className="text-[8px] h-4 px-1"
                          >
                            {request.location === "INSIDE"
                              ? "Inside"
                              : "Outside"}
                          </Badge>
                          {request.customerAddress && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                              {request.customerAddress}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col max-w-[200px]">
                        <span className="font-medium truncate">
                          {request.type} - {request.flavor}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {request.pounds} Pounds, {request.size}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.price ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-primary">
                            ৳{request.price.toFixed(2)}
                          </span>
                          {request.cost && (
                            <span className="text-[10px] font-bold text-muted-foreground">
                              Cost: ৳{request.cost.toFixed(2)}
                            </span>
                          )}
                          <span className="text-[10px] font-black text-green-600 uppercase tracking-tighter">
                            Profit: ৳
                            {(request.price - (request.cost || 0)).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Not set
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {request.images
                          .slice(0, 3)
                          .map((img: string, i: number) => (
                            <div
                              key={i}
                              className="relative h-8 w-8 rounded-full border-2 border-background overflow-hidden bg-muted"
                            >
                              <Image
                                src={img}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        {request.images.length > 3 && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold">
                            +{request.images.length - 3}
                          </div>
                        )}
                        {request.images.length === 0 && (
                          <span className="text-xs text-muted-foreground italic">
                            None
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={request.status}
                        onValueChange={(val) =>
                          handleStatusUpdate(request.id, val)
                        }
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Request Details</DialogTitle>
                              <DialogDescription>
                                Submitted on{" "}
                                {format(new Date(request.createdAt), "PPP p")}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-primary">
                                    Customer Info
                                  </h4>
                                  <p className="text-sm font-medium">
                                    {request.customerName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {request.customerPhone}
                                  </p>
                                  {request.customerAddress && (
                                    <p className="text-xs text-muted-foreground mt-1 bg-muted p-2 rounded">
                                      {request.customerAddress}
                                    </p>
                                  )}
                                  <p className="text-[10px] mt-1 font-bold uppercase text-primary/60">
                                    {request.location === "INSIDE"
                                      ? "Inside Cumilla"
                                      : "Outside Cumilla"}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-primary">
                                    Cake Specifications
                                  </h4>
                                  <ul className="text-sm space-y-1">
                                    <li>
                                      <span className="text-muted-foreground">
                                        Type:
                                      </span>{" "}
                                      {request.type}
                                    </li>
                                    <li>
                                      <span className="text-muted-foreground">
                                        Flavor:
                                      </span>{" "}
                                      {request.flavor}
                                    </li>
                                    <li>
                                      <span className="text-muted-foreground">
                                        Pounds:
                                      </span>{" "}
                                      {request.pounds}
                                    </li>
                                    <li>
                                      <span className="text-muted-foreground">
                                        Size:
                                      </span>{" "}
                                      {request.size}
                                    </li>
                                    <li>
                                      <span className="text-muted-foreground">
                                        Features:
                                      </span>{" "}
                                      {request.features || "None"}
                                    </li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-primary">
                                    Description
                                  </h4>
                                  <p className="text-sm bg-muted p-3 rounded-md italic">
                                    {request.description ||
                                      "No description provided."}
                                  </p>
                                </div>
                                {request.price && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-primary">
                                      Financial Details
                                    </h4>
                                    <div className="flex flex-col gap-1 text-sm bg-primary/5 p-3 rounded-md">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground font-bold">
                                          Selling Price:
                                        </span>
                                        <span className="font-black">
                                          ৳{request.price.toFixed(2)}
                                        </span>
                                      </div>
                                      {request.cost && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground font-bold">
                                            Cost Price:
                                          </span>
                                          <span className="font-bold">
                                            ৳{request.cost.toFixed(2)}
                                          </span>
                                        </div>
                                      )}
                                      <Separator className="my-1" />
                                      <div className="flex justify-between">
                                        <span className="text-green-600 font-black uppercase">
                                          Net Profit:
                                        </span>
                                        <span className="text-green-600 font-black">
                                          ৳
                                          {(
                                            request.price - (request.cost || 0)
                                          ).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-primary">
                                  Reference Images
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {request.images.map(
                                    (img: string, i: number) => (
                                      <a
                                        key={i}
                                        href={img}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="relative aspect-square rounded-md overflow-hidden border hover:opacity-80 transition-opacity"
                                      >
                                        <Image
                                          src={img}
                                          alt=""
                                          fill
                                          className="object-cover"
                                        />
                                      </a>
                                    ),
                                  )}
                                  {request.images.length === 0 && (
                                    <div className="col-span-2 aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-md text-muted-foreground">
                                      <ImageIcon className="h-8 w-8 mb-2" />
                                      <span className="text-xs">No images</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-6">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openDeleteDialog(request.id)}
                                className="gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Request
                              </Button>
                              <Button asChild className="gap-2">
                                <a
                                  href={request.whatsappUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  Open WhatsApp
                                </a>
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline" size="icon" asChild>
                          <a
                            href={request.whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchRequests(meta.page - 1)}
                disabled={meta.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchRequests(meta.page + 1)}
                disabled={meta.page === meta.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
