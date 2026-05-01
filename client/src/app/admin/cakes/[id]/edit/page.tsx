import { cakeService } from "@/services/api.service";
import { CakeForm } from "@/components/admin/cake-form";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCakePage({ params }: PageProps) {
  const { id } = await params;
  
  try {
    const cake = await cakeService.getById(id);
    
    if (!cake) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Info className="h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-2xl font-bold">Cake not found</h2>
          <Button asChild className="mt-4">
            <Link href="/admin/cakes">Back to Cakes</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Cake</h2>
          <p className="text-muted-foreground">Update the details for &quot;{cake.name}&quot;.</p>
        </div>
        <CakeForm initialData={cake} />
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch cake:', error);
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Info className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <Button asChild className="mt-4">
          <Link href="/admin/cakes">Back to Cakes</Link>
        </Button>
      </div>
    );
  }
}
