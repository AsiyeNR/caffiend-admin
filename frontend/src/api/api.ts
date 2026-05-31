import axios from "axios";

const BASE_URL = "http://localhost:5004/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export interface User {
  id: number;
  fullName: string;
  email: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  pricePerUnit: number;
  stock: number;
}

export interface SubscriptionItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
}

export interface Subscription {
  id: number;
  userId: number;
  user: User;
  status: "Active" | "Paused";
  frequencyWeeks: number;
  nextDeliveryDate: string;
  items: SubscriptionItem[];
}

export interface ErrorLog {
  id: number;
  source: "Frontend" | "Backend";
  message: string;
  stackTrace?: string;
  timestamp: string;
  aiAnalysis?: string;
}

export const subscriptionService = {
  getAll: () => api.get<Subscription[]>("/subscriptions").then((r) => r.data),
  pause: (id: number) => api.post<Subscription>(`/subscriptions/${id}/pause`).then((r) => r.data),
  activate: (id: number) => api.post<Subscription>(`/subscriptions/${id}/activate`).then((r) => r.data),
  delayOneWeek: (id: number) => api.post<Subscription>(`/subscriptions/${id}/delay-one-week`).then((r) => r.data),
};

export const productService = {
  getAll: () => api.get<Product[]>("/products").then((r) => r.data),
  create: (product: Omit<Product, "id">) => api.post<Product>("/products", product).then((r) => r.data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

export const errorLogService = {
  getAll: () => api.get<ErrorLog[]>("/errorlogs").then((r) => r.data),
  create: (log: Omit<ErrorLog, "id" | "timestamp" | "aiAnalysis">) => api.post<ErrorLog>("/errorlogs", log).then((r) => r.data),
  delete: (id: number) => api.delete(`/errorlogs/${id}`),
};