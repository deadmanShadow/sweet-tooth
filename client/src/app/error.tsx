"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
      <h2 className="mb-4 text-3xl font-black tracking-tight text-slate-900">
        Oops! Something went wrong
      </h2>
      <p className="mx-auto mb-8 max-w-md text-slate-500">
        We apologize for the inconvenience. An unexpected error has occurred.
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          className="h-12 rounded-full px-8 font-bold"
        >
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/")}
          className="h-12 rounded-full px-8 font-bold"
        >
          Go home
        </Button>
      </div>
    </div>
  );
}
