'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Cake } from '@/types';
import { cakeService } from '@/services/api.service';
import { CakeForm } from '@/components/admin/cake-form';
import { toast } from 'sonner';

export default function EditCakePage() {
  const { id } = useParams<{ id: string }>();
  const [cake, setCake] = useState<Cake | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCake = async () => {
      try {
        const data = await cakeService.getById(id);
        setCake(data);
      } catch (error) {
        console.error('Failed to fetch cake:', error);
        toast.error('Failed to load cake details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchCake();
  }, [id]);

  if (isLoading) return <div>Loading cake details...</div>;
  if (!cake) return <div>Cake not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Cake</h2>
        <p className="text-muted-foreground">Update the details for &quot;{cake.name}&quot;.</p>
      </div>
      <CakeForm initialData={cake} />
    </div>
  );
}
