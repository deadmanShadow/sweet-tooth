"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCart } from "@/providers/cart-provider";
import { Cake } from "@/types";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CakeCardProps {
  cake: Cake;
}

export function CakeCard({ cake }: CakeCardProps) {
  const { addItem } = useCart();

  return (
    <Card className="relative mx-auto w-full max-w-md pt-0 overflow-hidden group hover:shadow-xl transition-shadow duration-300">
      <Link href={`/cakes/${cake.id}`} className="block relative z-20">
        {cake.image ? (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={cake.image}
              alt={cake.name}
              fill
              className="relative z-20 object-cover transition-all duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="relative z-20 aspect-video w-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground italic text-xs">
              No image available
            </span>
          </div>
        )}
      </Link>
      <CardHeader>
        <CardAction>
          <Badge variant="secondary" className="font-bold uppercase tracking-wider text-[10px]">
            {cake.type || "Cake"}
          </Badge>
        </CardAction>
        <Link href={`/cakes/${cake.id}`}>
          <CardTitle className="hover:text-primary transition-colors flex items-center justify-between">
            <span>{cake.name}</span>
            <span className="text-primary font-black">৳{cake.price}</span>
          </CardTitle>
        </Link>
        <CardDescription className="line-clamp-2">
          {cake.description || "A delicious handcrafted cake for your special occasion."}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          onClick={(e) => {
            e.preventDefault();
            addItem(cake);
          }}
          className="w-full gap-2 font-bold"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
