import { CakeForm } from "@/components/admin/cake-form";

export default function NewCakePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Add New Cake</h2>
        <p className="text-muted-foreground">
          Fill in the details to add a new cake to the inventory.
        </p>
      </div>
      <CakeForm />
    </div>
  );
}
