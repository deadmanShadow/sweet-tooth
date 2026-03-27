export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: "ADMIN" | "USER";
}

export interface Cake {
  id: string;
  name: string;
  type?: string;
  flavor?: string;
  sizeOptions?: string[];
  specialFeatures?: string[];
  pounds?: number;
  availability: boolean;
  price: number;
  image?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderId?: string; // Add this to match the backend response for checkout
  userId: string;
  total: number;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  whatsappUrl?: string;
  whatsappMessage?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  cakeId: string;
  quantity: number;
  price: number;
  cake: Cake;
}
