'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, ArrowLeft, CheckCircle2, Info, Star, Clock, ShieldCheck, Heart } from 'lucide-react';
import { Cake } from '@/types';
import { cakeService } from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/providers/cart-provider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CakeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  
  const [cake, setCake] = useState<Cake | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchCake = async () => {
      try {
        setIsLoading(true);
        const data = await cakeService.getById(id);
        setCake(data);
        if (data.sizeOptions && data.sizeOptions.length > 0) {
          setSelectedSize(data.sizeOptions[0]);
        }
      } catch (error) {
        console.error('Failed to fetch cake:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchCake();
  }, [id]);

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const handleAddToCart = () => {
    if (cake) {
      addItem(cake, quantity, {
        size: selectedSize,
        features: selectedFeatures,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <Skeleton className="aspect-square w-full max-w-[500px] mx-auto lg:mx-0 rounded-[2.5rem]" />
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!cake) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="inline-flex p-6 rounded-full bg-rose-50 text-rose-500 mb-6">
          <Info className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Cake Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">The cake you're looking for might have been moved or is no longer available in our kitchen.</p>
        <Button onClick={() => router.push('/')} className="rounded-full px-8 h-12 font-bold">
          Return to Bakery
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="container mx-auto px-4 py-8 lg:py-16 max-w-7xl">
        {/* Breadcrumbs / Back */}
        <div className="mb-8 lg:mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors group bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Collection
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Column: Image Section */}
          <div className="space-y-6">
            <div className="relative aspect-square w-full max-w-[550px] mx-auto lg:mx-0 overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-slate-200 border border-white group">
              {cake.image ? (
                <Image
                  src={cake.image}
                  alt={cake.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400 italic">
                  No reference image
                </div>
              )}
              
              {/* Badge Overlay */}
              {!cake.availability && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <Badge variant="destructive" className="text-lg px-8 py-3 rounded-full font-black uppercase tracking-widest shadow-xl">
                    Out of Stock
                  </Badge>
                </div>
              )}

              {/* Action Overlays */}
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={cn(
                  "absolute top-6 right-6 p-4 rounded-2xl shadow-xl transition-all active:scale-95 z-20",
                  isFavorite ? "bg-rose-500 text-white" : "bg-white/80 backdrop-blur-md text-slate-400 hover:text-rose-500"
                )}
              >
                <Heart className={cn("h-6 w-6 transition-transform", isFavorite && "fill-current scale-110")} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 max-w-[550px]">
              {[
                { icon: Clock, label: 'Fresh Daily', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { icon: Star, label: 'Top Rated', color: 'text-amber-500', bg: 'bg-amber-50' },
                { icon: ShieldCheck, label: 'Quality Gear', color: 'text-blue-500', bg: 'bg-blue-50' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-white border border-slate-100 shadow-sm">
                  <div className={cn("p-2 rounded-xl", item.bg, item.color)}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Details Section */}
          <div className="flex flex-col space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] bg-primary/10 text-primary border-none">
                  {cake.type || 'Bakery Selection'}
                </Badge>
                {cake.availability && (
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Available Now
                  </span>
                )}
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-[0.95]">
                {cake.name}
              </h1>

              <div className="flex items-baseline gap-4 pt-2">
                <span className="text-5xl font-black text-primary tracking-tighter">৳{cake.price.toFixed(2)}</span>
                {cake.pounds && (
                  <span className="text-slate-400 font-bold text-lg">/ {cake.pounds} lbs approx.</span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                <Info className="h-24 w-24" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Description</h3>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                {cake.description}
              </p>
            </div>

            <div className="space-y-8 pt-4">
              {/* Flavor Selector (Read-only for now) */}
              {cake.flavor && (
                <div className="space-y-3">
                  <Label className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    Signature Flavor
                  </Label>
                  <div className="inline-flex items-center px-6 py-3 rounded-2xl bg-amber-50 text-amber-700 font-bold border border-amber-100">
                    {cake.flavor}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {cake.sizeOptions && cake.sizeOptions.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Select Dimensions</Label>
                  <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-3">
                    {cake.sizeOptions.map((size) => (
                      <div key={size}>
                        <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
                        <Label
                          htmlFor={`size-${size}`}
                          className="flex items-center justify-center rounded-2xl border-2 border-slate-100 bg-white px-6 py-4 font-bold text-slate-600 hover:border-primary/30 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer transition-all shadow-sm active:scale-95"
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
                  <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Personalize Your Order</Label>
                  <div className="flex flex-wrap gap-3">
                    {cake.specialFeatures.map((feature) => (
                      <button
                        key={feature}
                        onClick={() => toggleFeature(feature)}
                        className={cn(
                          "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all border-2 active:scale-95",
                          selectedFeatures.includes(feature) 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/30" 
                            : "bg-white text-slate-500 border-slate-100 hover:border-primary/20"
                        )}
                      >
                        {selectedFeatures.includes(feature) && <CheckCircle2 className="h-4 w-4" />}
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase Section */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <div className="flex items-center bg-white border-2 border-slate-100 rounded-3xl h-16 p-2 shadow-sm">
                  <button
                    className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-primary transition-all active:scale-90 disabled:opacity-30"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <span className="text-2xl font-black">−</span>
                  </button>
                  <span className="w-12 text-center font-black text-xl text-slate-800">{quantity}</span>
                  <button
                    className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-primary transition-all active:scale-90"
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    <span className="text-2xl font-black">+</span>
                  </button>
                </div>
                
                <Button 
                  size="lg" 
                  className="flex-1 h-16 text-xl font-black rounded-3xl gap-3 shadow-2xl shadow-primary/40 active:scale-[0.98] transition-all" 
                  onClick={handleAddToCart}
                  disabled={!cake.availability}
                >
                  <ShoppingCart className="h-6 w-6" />
                  Add to My Bag
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
