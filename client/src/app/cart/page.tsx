"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/providers/cart-provider";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="p-6 rounded-full bg-muted">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Looks like you haven&apos;t added any delicious cakes yet. Browse
            our selection and satisfy your sweet tooth!
          </p>
          <Button size="lg" asChild className="px-8 py-6 text-lg rounded-full">
            <Link href="/">Browse Cakes</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Your Cart</h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} {totalItems === 1 ? "item" : "items"} in your bag
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          {items.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Item Image */}
                  <div className="relative aspect-square w-full sm:w-32 rounded-xl overflow-hidden bg-muted border flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground italic text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <Link
                          href={`/cakes/${item.cakeId}`}
                          className="text-xl font-bold hover:text-primary transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="flex flex-wrap gap-2 items-center">
                          {item.selectedSize && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] py-0"
                            >
                              {item.selectedSize}
                            </Badge>
                          )}
                          {item.selectedFeatures &&
                            item.selectedFeatures.map((f) => (
                              <Badge
                                key={f}
                                variant="outline"
                                className="text-[10px] py-0"
                              >
                                {f}
                              </Badge>
                            ))}
                        </div>
                      </div>
                      <p className="text-xl font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center border rounded-lg h-10 overflow-hidden bg-muted/50">
                        <button
                          className="px-3 h-full hover:bg-muted transition-colors disabled:opacity-30"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-4 font-bold text-sm w-10 text-center">
                          {item.quantity}
                        </span>
                        <button
                          className="px-3 h-full hover:bg-muted transition-colors"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 rounded-full h-10 px-4"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary Summary */}
        <div className="lg:col-span-4">
          <Card className="sticky top-24 border-none shadow-lg bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground"></div>

              <Separator className="bg-primary/10" />
              <div className="flex justify-between text-xl font-bold pt-2">
                <span>Total</span>
                <span className="text-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col pt-6 pb-8 px-6">
              <Button
                size="lg"
                className="w-full h-14 text-lg font-bold rounded-xl gap-2 shadow-lg"
                asChild
              >
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Secure checkout powered by Sweet Tooth Payments
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
