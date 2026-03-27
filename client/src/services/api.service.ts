import api from "@/lib/api";
import { Cake, Order, User } from "@/types";

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
    const response = await api.post<{ accessToken: string }>("/auth/login", credentials);
    return response.data;
  },
  register: async (data: Partial<User> & { password?: string }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },
};

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get("/users/profile");
    return response.data;
  },
  updateProfile: async (
    data: Partial<User & { password?: string }>,
  ): Promise<User> => {
    const response = await api.patch("/users/profile", data);
    return response.data;
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
  }): Promise<Order> => {
    const response = await api.post("/orders", data);
    return response.data;
  },
  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get("/orders/my");
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
    totalRevenue: number;
    totalOrders: number;
    totalCakes: number;
    totalUsers: number;
    revenueByMonth: { month: string; revenue: number }[];
    statusDistribution: { status: string; count: number }[];
  }> => {
    const response = await api.get("/orders/stats");
    return response.data;
  },
  resetOrders: async (): Promise<{ message: string }> => {
    const response = await api.post("/orders/reset");
    return response.data;
  },
};
