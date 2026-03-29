import api from "@/lib/api";
import { Cake, CustomRequest, Order, User } from "@/types";

export const cakeService = {
  getAll: async (): Promise<Cake[]> => {
    const response = await api.get("/cakes");
    return response.data;
  },
  getById: async (id: string): Promise<Cake> => {
    const response = await api.get(`/cakes/${id}`);
    return response.data;
  },
  create: async (data: Partial<Cake>): Promise<Cake> => {
    const response = await api.post("/cakes", data);
    return response.data;
  },
  update: async (id: string, data: Partial<Cake>): Promise<Cake> => {
    const response = await api.patch(`/cakes/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/cakes/${id}`);
  },
};

export const authService = {
  login: async (credentials: { email: string; password?: string }) => {
    const response = await api.post<{ accessToken: string }>(
      "/auth/login",
      credentials,
    );
    return response.data;
  },
};

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<{ user: User }>("/auth/me");
    return response.data.user;
  },
  getAll: async (): Promise<User[]> => {
    const response = await api.get("/users/admin/all");
    return response.data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
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
    const response = await api.post("/orders", data);
    return response.data;
  },
  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
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
    const response = await api.get("/orders/admin", { params });
    return response.data;
  },
  updateStatus: async (id: string, status: Order["status"]): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
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
    const response = await api.get("/orders/stats");
    return response.data;
  },
  resetOrders: async (): Promise<{ message: string }> => {
    const response = await api.post("/orders/reset");
    return response.data;
  },
};

export const customRequestService = {
  create: async (formData: FormData): Promise<CustomRequest> => {
    const response = await api.post("/custom-requests", formData);
    return response.data;
  },
  getAll: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: CustomRequest[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> => {
    const response = await api.get("/custom-requests", { params });
    return response.data;
  },
  getById: async (id: string): Promise<CustomRequest> => {
    const response = await api.get(`/custom-requests/${id}`);
    return response.data;
  },
  updateStatus: async (
    id: string,
    status: CustomRequest["status"],
    price?: number,
    cost?: number,
  ): Promise<CustomRequest> => {
    const response = await api.patch(`/custom-requests/${id}/status`, {
      status,
      price,
      cost,
    });
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/custom-requests/${id}`);
  },
};
