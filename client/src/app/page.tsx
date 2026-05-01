import { CakeCard } from "@/components/cake-card";
import { cakeService } from "@/services/api.service";
import { Cake } from "@/types";

// This is a Server Component by default (no "use client")
export default async function HomePage() {
  let cakes: Cake[] = [];
  let error: string | null = null;

  try {
    // Fetch data on the server
    cakes = await cakeService.getAll();
  } catch (_err: unknown) {
    console.error("Failed to fetch cakes:", _err);
    error = "Failed to load cakes. Please try again later.";
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Delicious Cakes for Every Occasion
        </h1>
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
          Handcrafted with love using the finest ingredients. Order your
          favorite cake today and satisfy your sweet tooth!
        </p>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-xl font-semibold text-destructive">{error}</p>
        </div>
      ) : cakes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-xl font-semibold text-muted-foreground">
            No cakes found. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cakes.map((cake) => (
            <CakeCard key={cake.id} cake={cake} />
          ))}
        </div>
      )}
    </div>
  );
}
