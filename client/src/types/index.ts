export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
  };
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
  userId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  location?: "INSIDE" | "OUTSIDE";
  deliveryFee?: number;
  user?: User;
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

export interface CustomRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  location: "INSIDE" | "OUTSIDE";
  type: string;
  flavor: string;
  pounds: number;
  size?: string;
  features: string;
  description: string;
  images: string[];
  whatsappUrl?: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  price?: number;
  cost?: number;
  createdAt: string;
  updatedAt: string;
}
