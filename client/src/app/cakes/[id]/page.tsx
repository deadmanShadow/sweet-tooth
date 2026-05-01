import { cakeService } from "@/services/api.service";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import Link from "next/link";
import CakeDetailsClient from "./cake-details-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CakeDetailsPage({ params }: PageProps) {
  const { id } = await params;
  
  try {
    const cake = await cakeService.getById(id);
    
    if (!cake) {
      return (
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="mb-6 inline-flex rounded-full bg-rose-50 p-6 text-rose-500">
            <Info className="h-12 w-12" />
          </div>
          <h2 className="mb-4 text-3xl font-black tracking-tight text-slate-800">
            Cake Not Found
          </h2>
          <p className="mx-auto mb-8 max-w-md text-slate-500">
            The cake you&apos;re looking for might have been moved or is no longer
            available in our kitchen.
          </p>
          <Button asChild className="h-12 rounded-full px-8 font-bold">
            <Link href="/">Return to Bakery</Link>
          </Button>
        </div>
      );
    }

    return <CakeDetailsClient cake={cake} />;
  } catch (error) {
    console.error("Failed to fetch cake:", error);
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="mb-6 inline-flex rounded-full bg-rose-50 p-6 text-rose-500">
          <Info className="h-12 w-12" />
        </div>
        <h2 className="mb-4 text-3xl font-black tracking-tight text-slate-800">
          Something went wrong
        </h2>
        <p className="mx-auto mb-8 max-w-md text-slate-500">
          We couldn&apos;t load the cake details. Please try again later.
        </p>
        <Button asChild className="h-12 rounded-full px-8 font-bold">
          <Link href="/">Return to Bakery</Link>
        </Button>
      </div>
    );
  }
}
