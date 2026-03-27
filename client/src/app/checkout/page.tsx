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
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/providers/cart-provider";
import { orderService } from "@/services/api.service";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to place an order");
      router.push("/login?redirect=/checkout");
      return;
    }

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
      };

      const response = await orderService.create(orderData);

      if (response) {
        setOrderPlaced(true);
        clearCart();
        toast.success("Order placed! Redirecting to WhatsApp...");

        // Redirect to WhatsApp URL as requested
        if (response.whatsappUrl) {
          setTimeout(() => {
            window.location.href = response.whatsappUrl;
          }, 1500); // Small delay to let user see success message
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
        <Card className="max-w-2xl mx-auto text-center p-8 border-none shadow-xl bg-primary/5">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-16 w-16" />
            </div>
          </div>
          <CardHeader>
            <CardTitle className="text-4xl font-extrabold text-primary">
              Order Confirmed!
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Thank you for your purchase. We&apos; received your order and are
              starting to bake your delicious cakes!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 py-6">
            <p className="text-muted-foreground">
              You will receive a WhatsApp notification with your order details
              and delivery updates shortly.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-full px-8"
            >
              <Link href="/dashboard/orders">View My Orders</Link>
            </Button>
            <Button size="lg" asChild className="rounded-full px-8">
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
              <CardContent className="p-6">
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                        Full Name
                      </div>
                      <div className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                        Email Address
                      </div>
                      <div className="font-semibold text-base">
                        {user?.name}
                      </div>
                      <div className="font-semibold text-base">
                        {user?.email}
                      </div>
                    </div>
                    <Separator className="bg-primary/5" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                        Phone Number
                      </div>
                      <div className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                        Delivery Area
                      </div>
                      <div className="font-semibold text-base">
                        {user?.phone || "Not provided"}
                      </div>
                      <div className="font-semibold text-base">
                        Local Area Delivery
                      </div>
                    </div>
                    {!user?.phone && (
                      <div className="mt-4 p-3 rounded-lg bg-yellow-50 text-yellow-800 text-xs flex gap-2 items-center">
                        <span className="font-bold">Note:</span>
                        We recommend adding a phone number in your profile for
                        delivery updates.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="mb-4 text-muted-foreground">
                      Please log in to see your delivery information.
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/login?redirect=/checkout">
                        Login to Continue
                      </Link>
                    </Button>
                  </div>
                )}
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
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-6 space-y-4 bg-primary/5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-bold text-foreground">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <Separator className="bg-primary/10" />
                <div className="flex justify-between text-2xl font-extrabold pt-2">
                  <span>Total</span>
                  <span className="text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6">
              <Button
                size="lg"
                className="w-full h-16 text-xl font-extrabold rounded-xl shadow-lg gap-2"
                disabled={isPlacingOrder || items.length === 0}
                onClick={handlePlaceOrder}
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
