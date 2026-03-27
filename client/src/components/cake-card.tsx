"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
    <Card className="overflow-hidden transition-all hover:shadow-lg h-full flex flex-col group">
      <Link href={`/cakes/${cake.id}`} className="flex-1 flex flex-col">
        <div className="relative aspect-square w-full overflow-hidden">
          {cake.image ? (
            <Image
              src={cake.image}
              alt={cake.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-muted-foreground italic">
                No image available
              </span>
            </div>
          )}
        </div>
        <CardHeader className="p-4">
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-1 text-xl group-hover:text-primary transition-colors">
              {cake.name}
            </CardTitle>
            <span className="text-lg font-bold text-primary">
              ${cake.price}
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-2">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {cake.description}
          </p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-2 mt-auto">
        <Button
          onClick={() => addItem(cake)}
          className="w-full gap-2"
          variant="secondary"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
