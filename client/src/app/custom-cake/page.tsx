"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { customRequestService } from "@/services/api.service";
import { CustomRequest } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Cake,
  Camera,
  Loader2,
  Phone,
  Sparkles,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  customerName: z.string().min(1, "Full Name is required"),
  customerPhone: z
    .string()
    .length(11, "Phone number must be exactly 11 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  customerAddress: z.string().min(1, "Delivery Address is required"),
  location: z.enum(["INSIDE", "OUTSIDE"]),
  type: z.string().min(1, "Cake Type is required"),
  flavor: z.string().min(1, "Flavor is required"),
  pounds: z
    .string()
    .min(1, "Pounds is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Pounds must be a positive number",
    ),
  size: z.string().optional(),
  features: z.string().min(1, "Special Features is required"),
  description: z.string().min(1, "Design Description is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CustomCakePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "INSIDE",
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      type: "",
      flavor: "",
      pounds: "",
      size: "",
      features: "",
      description: "",
    },
  });

  const location = watch("location");

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

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      const submitData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
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
    } catch (error) {
      console.error("Error submitting custom request:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit request";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 font-sans">
      <div className="container mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary mb-8 transition-all group"
        >
          <div className="bg-white p-2 rounded-full shadow-sm mr-3 group-hover:bg-primary/5 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Sweet Gallery
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-black text-slate-900 mb-4 tracking-tight">
            Create Your <span className="text-primary italic">Dream Cake</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
            Fill out the details below and we&apos;ll bring your vision to life.
            Every cake is a unique masterpiece.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Form Sections */}
            <div className="lg:col-span-2 space-y-8">
              {/* Section 1: Customer Details */}
              <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-violet-50 p-3 rounded-2xl">
                    <User className="h-6 w-6 text-violet-500" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-800">
                    Customer Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="customerName"
                      className="text-sm font-bold text-slate-700 ml-1"
                    >
                      Full Name *
                    </Label>
                    <Input
                      id="customerName"
                      {...register("customerName")}
                      className={cn(
                        "h-12 px-4 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all",
                        errors.customerName &&
                          "border-destructive bg-destructive/5",
                      )}
                    />
                    {errors.customerName && (
                      <p className="text-[11px] font-bold text-destructive ml-1">
                        {errors.customerName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="customerPhone"
                      className="text-sm font-bold text-slate-700 ml-1"
                    >
                      Phone Number *
                    </Label>
                    <Input
                      id="customerPhone"
                      placeholder="017xxxxxxxx"
                      {...register("customerPhone")}
                      className={cn(
                        "h-12 px-4 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all",
                        errors.customerPhone &&
                          "border-destructive bg-destructive/5",
                      )}
                    />
                    {errors.customerPhone && (
                      <p className="text-[11px] font-bold text-destructive ml-1">
                        {errors.customerPhone.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label
                      htmlFor="customerAddress"
                      className="text-sm font-bold text-slate-700 ml-1"
                    >
                      Delivery Address *
                    </Label>
                    <Textarea
                      id="customerAddress"
                      placeholder="Street name, House #, Apartment #"
                      {...register("customerAddress")}
                      className={cn(
                        "min-h-[100px] px-4 py-3 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all resize-none",
                        errors.customerAddress &&
                          "border-destructive bg-destructive/5",
                      )}
                    />
                    {errors.customerAddress && (
                      <p className="text-[11px] font-bold text-destructive ml-1">
                        {errors.customerAddress.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-4 pt-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">
                      Delivery Location *
                    </Label>
                    <RadioGroup
                      value={location}
                      onValueChange={(val) =>
                        setValue("location", val as "INSIDE" | "OUTSIDE")
                      }
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <Label
                        htmlFor="inside"
                        className={cn(
                          "flex items-center justify-between px-6 py-4 rounded-2xl border-2 cursor-pointer transition-all",
                          location === "INSIDE"
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-slate-100 bg-slate-50/30 hover:bg-slate-50",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem
                            value="INSIDE"
                            id="inside"
                            className="sr-only"
                          />
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                              location === "INSIDE"
                                ? "border-primary"
                                : "border-slate-300",
                            )}
                          >
                            {location === "INSIDE" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-in zoom-in-50" />
                            )}
                          </div>
                          <span className="font-bold">Inside Cumilla</span>
                        </div>
                        <span className="text-xs font-black text-primary">
                          60 BDT
                        </span>
                      </Label>

                      <Label
                        htmlFor="outside"
                        className={cn(
                          "flex items-center justify-between px-6 py-4 rounded-2xl border-2 cursor-pointer transition-all",
                          location === "OUTSIDE"
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-slate-100 bg-slate-50/30 hover:bg-slate-50",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem
                            value="OUTSIDE"
                            id="outside"
                            className="sr-only"
                          />
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                              location === "OUTSIDE"
                                ? "border-primary"
                                : "border-slate-300",
                            )}
                          >
                            {location === "OUTSIDE" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-in zoom-in-50" />
                            )}
                          </div>
                          <span className="font-bold">Outside Cumilla</span>
                        </div>
                        <span className="text-xs font-black text-primary">
                          120 BDT
                        </span>
                      </Label>
                    </RadioGroup>
                  </div>
                </div>
              </section>

              {/* Section 2: Cake Basic Info */}
              <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-amber-50 p-3 rounded-2xl">
                    <Cake className="h-6 w-6 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-800">
                    Cake Specifications
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="type"
                      className="text-sm font-bold text-slate-700 ml-1"
                    >
                      Cake Type *
                    </Label>
                    <Input
                      id="type"
                      placeholder="e.g. Birthday, Wedding"
                      {...register("type")}
                      className={cn(
                        "h-12 px-4 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all",
                        errors.type && "border-destructive bg-destructive/5",
                      )}
                    />
                    {errors.type && (
                      <p className="text-[11px] font-bold text-destructive ml-1">
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="flavor"
                      className="text-sm font-bold text-slate-700 ml-1"
                    >
                      Flavor *
                    </Label>
                    <Input
                      id="flavor"
                      placeholder="e.g. Belgian Chocolate"
                      {...register("flavor")}
                      className={cn(
                        "h-12 px-4 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all",
                        errors.flavor && "border-destructive bg-destructive/5",
                      )}
                    />
                    {errors.flavor && (
                      <p className="text-[11px] font-bold text-destructive ml-1">
                        {errors.flavor.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="pounds"
                      className="text-sm font-bold text-slate-700 ml-1"
                    >
                      Weight (Pounds) *
                    </Label>
                    <div className="relative">
                      <Input
                        id="pounds"
                        type="number"
                        step="0.5"
                        min="0.5"
                        placeholder="1.5"
                        {...register("pounds")}
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
                        className={cn(
                          "h-12 px-4 pr-16 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all",
                          errors.pounds &&
                            "border-destructive bg-destructive/5",
                        )}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 uppercase tracking-wider">
                        Lbs
                      </span>
                    </div>
                    {errors.pounds && (
                      <p className="text-[11px] font-bold text-destructive ml-1">
                        {errors.pounds.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="size"
                      className="text-sm font-bold text-slate-700 ml-1"
                    >
                      Dimensions (Optional)
                    </Label>
                    <Input
                      id="size"
                      placeholder='e.g. 8" Diameter'
                      {...register("size")}
                      className="h-12 px-4 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Section 3: Design Details */}
              <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-emerald-50 p-3 rounded-2xl">
                    <Sparkles className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-800">
                    Design & Vision
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="features"
                      className="text-sm font-bold text-slate-700 ml-1"
                    >
                      Special Features *
                    </Label>
                    <Input
                      id="features"
                      placeholder="e.g. Eggless, Less Sugar, Heart Shaped"
                      {...register("features")}
                      className={cn(
                        "h-12 px-4 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all",
                        errors.features &&
                          "border-destructive bg-destructive/5",
                      )}
                    />
                    {errors.features && (
                      <p className="text-[11px] font-bold text-destructive ml-1">
                        {errors.features.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-bold text-slate-700 ml-1"
                    >
                      Design Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Tell us about the theme, colors, and decorations..."
                      {...register("description")}
                      className={cn(
                        "min-h-[120px] px-4 py-3 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all resize-none",
                        errors.description &&
                          "border-destructive bg-destructive/5",
                      )}
                    />
                    {errors.description && (
                      <p className="text-[11px] font-bold text-destructive ml-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Sticky Image Upload & Submit */}
            <div className="lg:sticky lg:top-8 space-y-8">
              {/* Image Upload Card */}
              <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-rose-50 p-3 rounded-2xl">
                    <Camera className="h-5 w-5 text-rose-500" />
                  </div>
                  <h2 className="text-xl font-heading font-bold text-slate-800">
                    Reference Photos
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {previews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-50 shadow-inner group"
                      >
                        <Image
                          src={preview}
                          alt={`Preview ${index}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-white/90 text-destructive rounded-full p-1.5 shadow-md hover:bg-destructive hover:text-white transition-all transform hover:scale-110 z-10"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {previews.length < 5 && (
                      <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                        <Camera className="h-6 w-6 text-slate-400 mb-2 group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-black text-slate-400 uppercase group-hover:text-primary tracking-wider">
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
                  <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-tighter">
                    Optional: Upload up to 5 reference images
                  </p>
                </div>
              </section>

              {/* Submit Card */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full -mr-16 -mt-16 opacity-50" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                    <div className="h-px flex-1 bg-slate-100" />
                    <span>Summary</span>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">
                        Delivery
                      </span>
                      <span className="text-slate-900 font-bold">
                        {location === "INSIDE" ? "60 BDT" : "120 BDT"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">
                        Cake Price
                      </span>
                      <span className="text-slate-400 italic">
                        Quoted on WhatsApp
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className={cn(
                      "w-full h-16 rounded-[1.25rem] text-lg font-black uppercase tracking-widest transition-all duration-300",
                      "bg-violet-400 hover:bg-violet-500 text-white shadow-lg shadow-violet-200",
                      "hover:scale-[1.02] active:scale-95",
                    )}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Phone className="mr-3 h-5 w-5" />
                        Submit
                      </>
                    )}
                  </Button>

                  <p className="mt-6 text-[10px] text-slate-400 font-bold text-center uppercase leading-relaxed tracking-tighter">
                    Clicking will open WhatsApp to discuss pricing & finalize
                    your custom order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
