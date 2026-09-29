export interface SystemInfo {
  status: string;
  name: string;
  version: string;
  environment: string;
  docs: string;
  timestamp: string;
}

export interface HealthInfo {
  status: string;
  uptime: number;
  timestamp: string;
}

export type Role = 'USER' | 'ADMIN';
export type UserRole = Role;

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export type User = SafeUser;

export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
  message?: string;
}

export interface AuthContextType {
  currentUser: SafeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<SafeUser>;
  register: (name: string, email: string, pass: string) => Promise<SafeUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<SafeUser | null>;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TicketPriority = Priority;

export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type TicketStatus = Status;

export interface TicketUserSummary {
  id: string;
  name: string;
  email: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: TicketUserSummary;
}

export interface TicketPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedTicketsResponse {
  data: Ticket[];
  meta: TicketPaginationMeta;
}

export interface TicketQueryParams {
  page?: number;
  limit?: number;
  status?: Status | '';
  priority?: Priority | '';
  category?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTicketInput {
  title: string;
  description: string;
  category: string;
  priority: Priority;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  category?: string;
  priority?: Priority;
  status?: Status;
}

export interface AdminTicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

export interface AdminTicketQueryParams {
  page?: number;
  limit?: number;
  status?: Status | '';
  priority?: Priority | '';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

