"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useCart } from "@/providers/cart-provider";
import { Cake } from "@/types";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Heart,
  Info,
  ShieldCheck,
  ShoppingCart,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface CakeDetailsClientProps {
  cake: Cake;
}

export default function CakeDetailsClient({ cake }: CakeDetailsClientProps) {
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] = useState<string>(
    cake.sizeOptions && cake.sizeOptions.length > 0 ? cake.sizeOptions[0] : "",
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature],
    );
  };

  const handleAddToCart = () => {
    addItem(cake, quantity, {
      size: selectedSize,
      features: selectedFeatures,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="container mx-auto px-4 py-8 lg:py-16 max-w-7xl">
        {/* Breadcrumbs / Back */}
        <div className="mb-8 lg:mb-12">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-2 text-sm font-bold text-slate-500 shadow-sm transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Collection
          </Link>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left Column: Image Section */}
          <div className="space-y-6">
            <div className="group relative mx-auto aspect-square w-full max-w-[550px] overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-2xl shadow-slate-200 lg:mx-0">
              {cake.image ? (
                <Image
                  src={cake.image}
                  alt={cake.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100 italic text-slate-400">
                  No reference image
                </div>
              )}

              {/* Badge Overlay */}
              {!cake.availability && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                  <Badge
                    variant="destructive"
                    className="rounded-full px-8 py-3 text-lg font-black uppercase tracking-widest shadow-xl"
                  >
                    Out of Stock
                  </Badge>
                </div>
              )}

              {/* Action Overlays */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={cn(
                  "absolute right-6 top-6 z-20 rounded-2xl p-4 shadow-xl transition-all active:scale-95",
                  isFavorite
                    ? "bg-rose-500 text-white"
                    : "bg-white/80 text-slate-400 backdrop-blur-md hover:text-rose-500",
                )}
              >
                <Heart
                  className={cn(
                    "h-6 w-6 transition-transform",
                    isFavorite && "fill-current scale-110",
                  )}
                />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid max-w-[550px] grid-cols-3 gap-4">
              {[
                {
                  icon: Clock,
                  label: "Fresh Daily",
                  color: "text-emerald-500",
                  bg: "bg-emerald-50",
                },
                {
                  icon: Star,
                  label: "Top Rated",
                  color: "text-amber-500",
                  bg: "bg-amber-50",
                },
                {
                  icon: ShieldCheck,
                  label: "Quality Gear",
                  color: "text-blue-500",
                  bg: "bg-blue-50",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className={cn("p-2 rounded-xl", item.bg, item.color)}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Details Section */}
          <div className="flex flex-col space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="rounded-full border-none bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary"
                >
                  {cake.type || "Bakery Selection"}
                </Badge>
                {cake.availability && (
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                    Available Now
                  </span>
                )}
              </div>

              <h1 className="text-5xl font-black tracking-tighter text-slate-900 lg:text-6xl leading-[0.95]">
                {cake.name}
              </h1>

              <div className="flex items-baseline gap-4 pt-2">
                <span className="text-5xl font-black tracking-tighter text-primary">
                  ৳{cake.price.toFixed(2)}
                </span>
                {cake.pounds && (
                  <span className="text-lg font-bold text-slate-400">
                    / {cake.pounds} lbs approx.
                  </span>
                )}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-100/50 bg-white p-8 shadow-xl shadow-slate-200/50">
              <div className="absolute right-0 top-0 p-8 opacity-[0.03]">
                <Info className="h-24 w-24" />
              </div>
              <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-400">
                Description
              </h3>
              <p className="text-lg font-medium leading-relaxed text-slate-600">
                {cake.description}
              </p>
            </div>

            <div className="space-y-8 pt-4">
              {/* Flavor Selector (Read-only for now) */}
              {cake.flavor && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                    <Star className="h-4 w-4 text-amber-500" />
                    Signature Flavor
                  </Label>
                  <div className="inline-flex items-center rounded-2xl border border-amber-100 bg-amber-50 px-6 py-3 font-bold text-amber-700">
                    {cake.flavor}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {cake.sizeOptions && cake.sizeOptions.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-sm font-black uppercase tracking-widest text-slate-400">
                    Select Dimensions
                  </Label>
                  <RadioGroup
                    value={selectedSize}
                    onValueChange={setSelectedSize}
                    className="flex flex-wrap gap-3"
                  >
                    {cake.sizeOptions.map((size) => (
                      <div key={size}>
                        <RadioGroupItem
                          value={size}
                          id={`size-${size}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`size-${size}`}
                          className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-slate-100 bg-white px-6 py-4 font-bold text-slate-600 shadow-sm transition-all hover:border-primary/30 hover:bg-slate-50 active:scale-95 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary"
                        >
                          {size}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Special Features */}
              {cake.specialFeatures && cake.specialFeatures.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-sm font-black uppercase tracking-widest text-slate-400">
                    Special Customizations
                  </Label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {cake.specialFeatures.map((feature) => (
                      <button
                        key={feature}
                        onClick={() => toggleFeature(feature)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98]",
                          selectedFeatures.includes(feature)
                            ? "border-primary bg-primary/5 text-primary shadow-inner"
                            : "border-slate-100 bg-white text-slate-600 hover:border-slate-200",
                        )}
                      >
                        <span className="font-bold">{feature}</span>
                        {selectedFeatures.includes(feature) && (
                          <CheckCircle2 className="h-5 w-5 fill-current" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="bg-slate-100" />

              {/* Quantity and Add to Cart */}
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex h-16 items-center rounded-2xl border-2 border-slate-100 bg-white p-2 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-12 w-12 items-center justify-center rounded-xl font-black text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-xl font-black text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl font-black text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    +
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={!cake.availability}
                  className="h-16 flex-grow rounded-[1.25rem] text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all active:scale-95"
                >
                  <ShoppingCart className="mr-3 h-6 w-6" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
