import { Cake, CustomRequest, Order, User } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;


async function fetchWithCache<T>(
  endpoint: string,
  options: RequestInit = {},
  tags: string[] = [],
  revalidate: number | false = 3600,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const res = await fetch(url, {
    ...options,
    next: {
      tags,
      revalidate,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }

  return res.json();
}

export const cakeService = {
  getAll: async (): Promise<Cake[]> => {
    // Cache for 1 hour, tag as 'cakes'
    return fetchWithCache<Cake[]>("/cakes", {}, ["cakes"], 3600);
  },
  getById: async (id: string): Promise<Cake> => {
    // Cache for 1 hour, tag with specific id and general 'cakes'
    return fetchWithCache<Cake>(`/cakes/${id}`, {}, ["cakes", `cake-${id}`], 3600);
  },
  create: async (data: Partial<Cake>): Promise<Cake> => {
    const response = await fetch(`${API_BASE_URL}/cakes`, {
      method: 'POST',
      body: data as unknown as FormData, // FormData for images
    });
    return response.json();
  },
  update: async (id: string, data: Partial<Cake>): Promise<Cake> => {
    const response = await fetch(`${API_BASE_URL}/cakes/${id}`, {
      method: 'PATCH',
      body: data as unknown as FormData,
    });
    return response.json();
  },
  delete: async (id: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/cakes/${id}`, {
      method: 'DELETE',
    });
  },
};

export const authService = {
  login: async (credentials: { email: string; password?: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },
};

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      cache: 'no-store',
    });
    const data = await response.json();
    return data.user;
  },
  getAll: async (): Promise<User[]> => {
    return fetchWithCache<User[]>("/users/admin/all", {}, ["users"], 0);
  },
  deleteUser: async (id: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
  },
};

export const orderService = {
  create: async (data: {
    items: { cakeId: string; quantity: number }[];
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    location: "INSIDE" | "OUTSIDE";
  }): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  getOrder: async (id: string): Promise<Order> => {
    return fetchWithCache<Order>(`/orders/${id}`, {}, [`order-${id}`], 0);
  },
  getAllAdmin: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Order[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> => {
    const searchParams = new URLSearchParams(params as Record<string, string>).toString();
    return fetchWithCache(`/orders/admin?${searchParams}`, {}, ["orders"], 0);
  },
  updateStatus: async (id: string, status: Order["status"]): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },
  getStats: async (): Promise<{
    overview: {
      totalRevenue: number;
      totalOrders: number;
      totalCakes: number;
      totalUsers: number;
      totalCustomRequests?: number;
    };
    revenueByMonth: { month: string; revenue: number }[];
    orderStatusDistribution: { status: string; count: number }[];
    customRequestStatusDistribution: { status: string; count: number }[];
    customRequestsByMonth: { month: string; count: number }[];
  }> => {
    return fetchWithCache("/orders/stats", {}, ["stats"], 300);
  },
  resetOrders: async (): Promise<void> => {
    await fetch(`${API_BASE_URL}/orders/admin/reset`, {
      method: 'DELETE',
    });
  },
};

export interface CustomRequestQuery {
  status?: string;
  page?: number;
  limit?: number;
}

export const customRequestService = {
  getAll: async (params?: CustomRequestQuery): Promise<{ items: CustomRequest[], meta: { total: number; page: number; limit: number; totalPages: number } }> => {
    const searchParams = new URLSearchParams(params as unknown as Record<string, string>).toString();
    return fetchWithCache(`/custom-requests?${searchParams}`, {}, ["custom-requests"], 0);
  },
  create: async (data: FormData): Promise<CustomRequest> => {
    const response = await fetch(`${API_BASE_URL}/custom-requests`, {
      method: 'POST',
      body: data,
    });
    return response.json();
  },
  updateStatus: async (id: string, status: CustomRequest["status"], price?: number, cost?: number): Promise<CustomRequest> => {
    const response = await fetch(`${API_BASE_URL}/custom-requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, price, cost }),
    });
    return response.json();
  },
  delete: async (id: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/custom-requests/${id}`, {
      method: 'DELETE',
    });
  },
};
