"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cakeService } from "@/services/api.service";
import { Cake } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const cakeSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  type: z.string().min(2, { message: "Type must be at least 2 characters" }),
  flavor: z
    .string()
    .min(2, { message: "Flavor must be at least 2 characters" }),
  price: z.number().min(0, { message: "Price must be positive" }),
  pounds: z.number().min(0, { message: "Pounds must be positive" }),
  availability: z.boolean(),
  description: z.string().optional(),
  sizeOptions: z.string(),
  specialFeatures: z.string().optional(),
});

interface CakeFormProps {
  initialData?: Cake;
}

interface CakeFormValues {
  name: string;
  type: string;
  flavor: string;
  price: number;
  pounds: number;
  availability: boolean;
  description?: string;
  sizeOptions: string;
  specialFeatures?: string;
}

export function CakeForm({ initialData }: CakeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CakeFormValues>({
    resolver: zodResolver(cakeSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "",
      flavor: initialData?.flavor || "",
      price: initialData?.price || 0,
      pounds: initialData?.pounds || 1,
      availability: initialData?.availability ?? true,
      description: initialData?.description || "",
      sizeOptions: initialData?.sizeOptions?.join(", ") || "",
      specialFeatures: initialData?.specialFeatures?.join(", ") || "",
    },
  });

  const availability = watch("availability");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: CakeFormValues) => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      // Transform strings to arrays
      const sizeOptions = values.sizeOptions
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      const specialFeatures =
        values.specialFeatures
          ?.split(",")
          .map((s: string) => s.trim())
          .filter(Boolean) || [];

      // Append all fields to FormData
      formData.append("name", values.name);
      formData.append("type", values.type);
      formData.append("flavor", values.flavor);
      formData.append("price", values.price.toString());
      formData.append("pounds", values.pounds.toString());
      formData.append("availability", values.availability.toString());
      formData.append("description", values.description || "");

      sizeOptions.forEach((opt) => formData.append("sizeOptions[]", opt));
      specialFeatures.forEach((feat) =>
        formData.append("specialFeatures[]", feat),
      );

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = initialData
        ? await cakeService.update(
            initialData.id,
            formData as unknown as Partial<Cake>,
          )
        : await cakeService.create(formData as unknown as Partial<Cake>);

      toast.success(`Cake ${initialData ? "updated" : "created"} successfully`);
      if (response) {
        router.push("/admin/cakes");
        router.refresh();
      }
    } catch (_error) {
      console.error("Cake form error:", _error);
      toast.error("Failed to save cake. Please check your inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Cake" : "Add New Cake"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Image Upload */}
            <div className="space-y-2 md:col-span-2">
              <Label>Cake Image</Label>
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="relative h-40 w-40 overflow-hidden rounded-lg border bg-muted">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Upload className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: Square image, max 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="name">Cake Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g. Dreamy Chocolate"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Cake Type</Label>
              <Input
                id="type"
                {...register("type")}
                placeholder="e.g. Birthday, Wedding"
              />
              {errors.type && (
                <p className="text-sm text-destructive">
                  {errors.type.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="flavor">Flavor</Label>
              <Input
                id="flavor"
                {...register("flavor")}
                placeholder="e.g. Vanilla, Dark Chocolate"
              />
              {errors.flavor && (
                <p className="text-sm text-destructive">
                  {errors.flavor.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (৳)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") {
                    e.preventDefault();
                  }
                }}
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-destructive">
                  {errors.price.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pounds">Weight (Pounds)</Label>
              <Input
                id="pounds"
                type="number"
                step="0.1"
                min="0.5"
                {...register("pounds", { valueAsNumber: true })}
                onKeyDown={(e) => {
                  if (["-", "e", "E", "+"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value && Number(target.value) < 0.5) {
                    if (target.value.startsWith("-")) {
                      target.value = target.value.replace("-", "");
                    }
                  }
                }}
                onPaste={(e) => {
                  const data = e.clipboardData.getData("text");
                  if (data.includes("-") || isNaN(Number(data))) {
                    e.preventDefault();
                  }
                }}
              />
              {errors.pounds && (
                <p className="text-sm text-destructive">
                  {errors.pounds.message as string}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="availability"
                checked={availability}
                onCheckedChange={(checked) => setValue("availability", checked)}
              />
              <Label htmlFor="availability">Available for order</Label>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <Label htmlFor="sizeOptions">
                Size Options (comma separated)
              </Label>
              <Input
                id="sizeOptions"
                {...register("sizeOptions")}
                placeholder="e.g. Small, Medium, Large"
              />
              <p className="text-xs text-muted-foreground">
                Separate options with commas.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialFeatures">
                Special Features (comma separated)
              </Label>
              <Input
                id="specialFeatures"
                {...register("specialFeatures")}
                placeholder="e.g. Eggless, Sugar-free"
              />
              <p className="text-xs text-muted-foreground">
                Separate features with commas.
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Tell customers about this cake..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : initialData
                  ? "Update Cake"
                  : "Create Cake"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
