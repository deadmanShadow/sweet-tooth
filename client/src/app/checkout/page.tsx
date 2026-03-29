"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/providers/cart-provider";
import { orderService } from "@/services/api.service";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z
    .string()
    .min(11, "Phone number must be at least 11 characters"),
  customerAddress: z.string().min(5, "Address must be at least 5 characters"),
  location: z.enum(["INSIDE", "OUTSIDE"]),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<{
    orderId: string;
    whatsappUrl?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: user?.name || "",
      customerPhone: user?.phone || "",
      customerAddress: "",
      location: "INSIDE",
    },
  });

  const currentLocation = watch("location");

  // Update info if user changes (logs in/out)
  useEffect(() => {
    if (user) {
      setValue("customerName", user.name || "");
      setValue("customerPhone", user.phone || "");
    }
  }, [user, setValue]);

  const deliveryFee = currentLocation === "INSIDE" ? 60 : 120;
  const finalTotal = totalPrice + deliveryFee;

  const handlePlaceOrder = async (data: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setIsPlacingOrder(true);

      const orderData = {
        items: items.map((item) => ({
          cakeId: item.cakeId,
          quantity: item.quantity,
        })),
        ...data,
      };

      const response = await orderService.create(orderData);

      if (response) {
        setOrderPlaced({
          orderId: response.orderId || response.id,
          whatsappUrl: response.whatsappUrl,
        });
        clearCart();
        toast.success("Order placed! Redirecting to WhatsApp...");

        // Redirect to WhatsApp URL as requested
        if (response.whatsappUrl) {
          setTimeout(() => {
            window.location.href = response.whatsappUrl!;
          }, 2000); // 2 second delay for better visibility
        }
      }
    } catch (_error: unknown) {
      console.error("Order error:", _error);
      let errorMessage = "Failed to place order. Please try again.";
      if (_error instanceof Error && "response" in _error) {
        const axiosError = _error as {
          response: { data: { message: string } };
        };
        errorMessage =
          axiosError.response?.data?.message || "Failed to place order.";
      }
      toast.error(errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">No items to checkout</h1>
        <Button asChild>
          <Link href="/cart">Back to Cart</Link>
        </Button>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-2xl mx-auto text-center p-8 border-none shadow-xl bg-primary/5 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-green-100 text-green-600 animate-bounce">
              <CheckCircle2 className="h-16 w-16" />
            </div>
          </div>
          <CardHeader>
            <CardTitle className="text-4xl font-extrabold text-primary">
              Order Confirmed!
            </CardTitle>
            <CardDescription className="text-lg mt-2 font-medium">
              Order ID:{" "}
              <span className="text-primary">
                #{orderPlaced.orderId.slice(-8).toUpperCase()}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            <div className="space-y-2">
              <p className="text-muted-foreground text-lg">
                Thank you for your purchase. We&apos;ve received your order and
                are starting to bake your delicious cakes!
              </p>
              <p className="text-muted-foreground">
                You will be redirected to WhatsApp to confirm your order details
                with us shortly.
              </p>
            </div>

            {orderPlaced.whatsappUrl && (
              <div className="pt-4 flex flex-col items-center gap-4">
                <p className="text-sm font-bold text-muted-foreground animate-pulse">
                  Redirecting in a few seconds...
                </p>
                <Button
                  variant="outline"
                  asChild
                  className="gap-2 rounded-full border-primary/20 hover:bg-primary/5"
                >
                  <a
                    href={orderPlaced.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Click here if not redirected automatically
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-primary/5 pt-8 mt-4">
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="rounded-full px-12 h-12 text-muted-foreground hover:text-primary"
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <Link
          href="/cart"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Checkout Info */}
        <div className="lg:col-span-7 space-y-8">
          {/* Delivery Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold">Delivery Information</h2>
            </div>
            <Card className="border-none shadow-sm bg-muted/30">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="customerName"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"
                    >
                      <User className="h-3 w-3" /> Full Name
                    </Label>
                    <Input
                      id="customerName"
                      placeholder="Enter your full name"
                      {...register("customerName")}
                      className={`bg-background border-none shadow-sm h-12 rounded-xl focus-visible:ring-primary/20 ${
                        errors.customerName ? "ring-2 ring-destructive" : ""
                      }`}
                    />
                    {errors.customerName && (
                      <p className="text-xs font-medium text-destructive">
                        {errors.customerName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="customerPhone"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"
                    >
                      <Phone className="h-3 w-3" /> Phone Number
                    </Label>
                    <Input
                      id="customerPhone"
                      placeholder="e.g. 018XXXXXXXX"
                      {...register("customerPhone")}
                      className={`bg-background border-none shadow-sm h-12 rounded-xl focus-visible:ring-primary/20 ${
                        errors.customerPhone ? "ring-2 ring-destructive" : ""
                      }`}
                    />
                    {errors.customerPhone && (
                      <p className="text-xs font-medium text-destructive">
                        {errors.customerPhone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Delivery Area
                  </Label>
                  <RadioGroup
                    value={currentLocation}
                    onValueChange={(value) =>
                      setValue("location", value as "INSIDE" | "OUTSIDE")
                    }
                    className="grid grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="INSIDE"
                      className={`flex flex-col items-center justify-between rounded-xl border-2 bg-background p-4 hover:bg-primary/5 hover:text-primary cursor-pointer transition-all ${
                        currentLocation === "INSIDE"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-muted"
                      }`}
                    >
                      <RadioGroupItem
                        value="INSIDE"
                        id="INSIDE"
                        className="sr-only"
                      />
                      <span className="text-sm font-bold">Inside Cumilla</span>
                      <span className="text-xs opacity-70 mt-1">
                        ৳60 Charge
                      </span>
                    </Label>
                    <Label
                      htmlFor="OUTSIDE"
                      className={`flex flex-col items-center justify-between rounded-xl border-2 bg-background p-4 hover:bg-primary/5 hover:text-primary cursor-pointer transition-all ${
                        currentLocation === "OUTSIDE"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-muted"
                      }`}
                    >
                      <RadioGroupItem
                        value="OUTSIDE"
                        id="OUTSIDE"
                        className="sr-only"
                      />
                      <span className="text-sm font-bold">Outside Cumilla</span>
                      <span className="text-xs opacity-70 mt-1">
                        ৳120 Charge
                      </span>
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="customerAddress"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"
                  >
                    <Truck className="h-3 w-3" /> Delivery Address
                  </Label>
                  <Textarea
                    id="customerAddress"
                    placeholder="Enter your detailed delivery address (House, Road, Area...)"
                    {...register("customerAddress")}
                    className={`bg-background border-none shadow-sm min-h-[100px] rounded-xl focus-visible:ring-primary/20 ${
                      errors.customerAddress ? "ring-2 ring-destructive" : ""
                    }`}
                  />
                  {errors.customerAddress && (
                    <p className="text-xs font-medium text-destructive">
                      {errors.customerAddress.message}
                    </p>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-primary/5 text-primary text-xs flex gap-3 items-start leading-relaxed">
                  <div className="mt-0.5 p-1 rounded-full bg-primary/20">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-bold">WhatsApp Confirmation:</span>
                    <br />
                    After placing the order, you will be redirected to WhatsApp
                    to confirm your details and delivery time with us directly.
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Order Summary Summary Summary */}
        <div className="lg:col-span-5">
          <Card className="border-none shadow-xl bg-primary/5 overflow-hidden">
            <CardHeader className="bg-primary/10">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <ShoppingBag className="h-6 w-6" />
                Your Order
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto px-6 py-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 py-4 border-b last:border-0"
                  >
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted border">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px]">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.selectedSize || "Standard"} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-bold">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-6 space-y-4 bg-primary/5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-bold text-foreground">
                    ৳{totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    Delivery (
                    {currentLocation === "INSIDE"
                      ? "Inside Cumilla"
                      : "Outside Cumilla"}
                    )
                  </span>
                  <span className="font-bold text-foreground">
                    ৳{deliveryFee.toFixed(2)}
                  </span>
                </div>
                <Separator className="bg-primary/10" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Payment Method
                  </span>
                  <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                    Cash on Delivery
                  </span>
                </div>
                <Separator className="bg-primary/10" />
                <div className="flex justify-between text-2xl font-extrabold pt-2">
                  <span>Total</span>
                  <span className="text-primary">৳{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6">
              <Button
                size="lg"
                className="w-full h-16 text-xl font-extrabold rounded-xl shadow-lg gap-2"
                disabled={isPlacingOrder || items.length === 0}
                onClick={handleSubmit(handlePlaceOrder)}
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  "Place My Order"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
