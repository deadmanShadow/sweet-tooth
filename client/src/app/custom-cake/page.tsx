"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { customRequestService } from "@/services/api.service";
import { CustomRequest } from "@/types";
import {
  ArrowLeft,
  Cake,
  Camera,
  FileText,
  Loader2,
  Maximize,
  Phone,
  Sparkles,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CustomCakePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    location: "INSIDE" as "INSIDE" | "OUTSIDE",
    type: "",
    flavor: "",
    pounds: "",
    size: "",
    features: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const remainingSlots = 5 - images.length;
      const filesToAdd = newFiles.slice(0, remainingSlots);

      if (newFiles.length > remainingSlots) {
        toast.warning("You can only upload up to 5 images");
      }

      setImages((prev) => [...prev, ...filesToAdd]);

      const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.type ||
      !formData.flavor ||
      !formData.pounds ||
      !formData.size
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      images.forEach((image) => {
        submitData.append("images", image);
      });

      const response: CustomRequest =
        await customRequestService.create(submitData);

      toast.success("Request submitted successfully!");

      if (response.whatsappUrl) {
        window.open(response.whatsappUrl, "_blank");
      }

      router.push("/");
    } catch (error: any) {
      console.error("Error submitting custom request:", error);
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Gallery
      </Link>

      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Cake className="h-8 w-8 text-primary" />
            Custom Cake Request
          </CardTitle>
          <CardDescription className="text-base">
            Tell us about your dream cake and we'll make it happen!
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-primary">
                  <User className="h-4 w-4" /> Customer Details
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    placeholder="John Doe"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    placeholder="017xxxxxxxx"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Delivery Address</Label>
                  <Textarea
                    id="customerAddress"
                    placeholder="Your full delivery address"
                    value={formData.customerAddress}
                    onChange={handleInputChange}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <RadioGroup
                    value={formData.location}
                    onValueChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: val as "INSIDE" | "OUTSIDE",
                      }))
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="INSIDE" id="inside" />
                      <Label htmlFor="inside" className="font-normal">
                        Inside Cumilla
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="OUTSIDE" id="outside" />
                      <Label htmlFor="outside" className="font-normal">
                        Outside Cumilla
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-[10px] font-bold text-primary animate-in fade-in slide-in-from-left-1 duration-300">
                    {formData.location === "INSIDE"
                      ? "✨ Delivery fee: 60 BDT (Inside Cumilla)"
                      : "🚀 Delivery fee: 120 BDT (Outside Cumilla)"}
                  </p>
                </div>
              </div>

              {/* Cake Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-primary">
                  <Cake className="h-4 w-4" /> Cake Basic Info
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="type">Cake Type *</Label>
                  <Input
                    id="type"
                    placeholder="e.g. Birthday, Wedding"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flavor">Flavor *</Label>
                  <Input
                    id="flavor"
                    placeholder="e.g. Chocolate, Vanilla"
                    value={formData.flavor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-primary">
                  <Maximize className="h-4 w-4" /> Size & Weight
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pounds">Pounds *</Label>
                    <Input
                      id="pounds"
                      type="number"
                      step="0.5"
                      placeholder="1.5"
                      value={formData.pounds}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Dimensions *</Label>
                    <Input
                      id="size"
                      placeholder='e.g. 8"'
                      value={formData.size}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" /> Special Features
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="features">Features</Label>
                  <Input
                    id="features"
                    placeholder="e.g. Eggless, Less Sugar"
                    value={formData.features}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Design Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe how you want your cake to look like..."
                className="min-h-[100px]"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Camera className="h-4 w-4" /> Reference Images (Max 5)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-md overflow-hidden border"
                  >
                    <Image
                      src={preview}
                      alt={`Preview ${index}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm hover:bg-destructive/90 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {previews.length < 5 && (
                  <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-md cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground font-medium">
                      Add Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            <Separator />

            <Button
              type="submit"
              className="w-full text-lg h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-5 w-5" />
                  Submit & Chat on WhatsApp
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-primary/5 border-t border-primary/10 text-xs text-center justify-center text-muted-foreground py-4">
          By submitting, you&apos;ll be redirected to WhatsApp to finalize your
          order details with us.
        </CardFooter>
      </Card>
    </div>
  );
}
