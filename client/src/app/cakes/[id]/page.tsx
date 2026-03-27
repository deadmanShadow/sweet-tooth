'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, ArrowLeft, CheckCircle2, Info } from 'lucide-react';
import { Cake } from '@/types';
import { cakeService } from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/providers/cart-provider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!cake) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Cake not found</h2>
        <Button onClick={() => router.push('/')}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cakes
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border bg-muted shadow-sm">
          {cake.image ? (
            <Image
              src={cake.image}
              alt={cake.name}
              fill
              className="object-cover transition-transform hover:scale-105 duration-500"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground italic">
              No image available
            </div>
          )}
          {!cake.availability && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-6 py-2">Currently Unavailable</Badge>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <div className="mb-2">
            <Badge variant="outline" className="text-xs uppercase tracking-wider">{cake.type || 'Bakery Item'}</Badge>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">{cake.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-primary">${cake.price.toFixed(2)}</span>
            {cake.pounds && (
              <span className="text-muted-foreground">Approx. {cake.pounds} lbs</span>
            )}
          </div>

          <div className="prose prose-sm dark:prose-invert mb-8">
            <p className="text-lg text-muted-foreground leading-relaxed">{cake.description}</p>
          </div>

          <Separator className="my-6" />

          <div className="space-y-8">
            {/* Flavor Info */}
            {cake.flavor && (
              <div className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4 text-primary" />
                <span className="font-semibold">Flavor:</span>
                <span className="text-muted-foreground">{cake.flavor}</span>
              </div>
            )}

            {/* Size Options */}
            {cake.sizeOptions && cake.sizeOptions.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-bold">Select Size</Label>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-3">
                  {cake.sizeOptions.map((size) => (
                    <div key={size}>
                      <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
                      <Label
                        htmlFor={`size-${size}`}
                        className="flex items-center justify-center rounded-md border-2 border-muted bg-popover px-4 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
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
              <div className="space-y-3">
                <Label className="text-base font-bold">Special Features</Label>
                <div className="flex flex-wrap gap-3">
                  {cake.specialFeatures.map((feature) => (
                    <Button
                      key={feature}
                      variant={selectedFeatures.includes(feature) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleFeature(feature)}
                      className="rounded-full"
                    >
                      {selectedFeatures.includes(feature) && <CheckCircle2 className="mr-2 h-4 w-4" />}
                      {feature}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex items-center border rounded-md h-12">
                <button
                  className="px-4 h-full hover:bg-muted transition-colors disabled:opacity-50"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 font-bold w-12 text-center">{quantity}</span>
                <button
                  className="px-4 h-full hover:bg-muted transition-colors"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  +
                </button>
              </div>
              <Button 
                size="lg" 
                className="flex-1 h-12 text-lg gap-2" 
                onClick={handleAddToCart}
                disabled={!cake.availability}
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
