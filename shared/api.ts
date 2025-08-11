export interface DemoResponse {
  message: string;
}

// Database models matching Prisma schema
export interface Employee {
  id: string;
  name: string;
  ratePerHour: number;
  hours: number;
  total: number;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  customerName: string;
  customerAddress: string;
  contactPerson: string;
  email: string;
  invoiceNumber: string;
  invoiceDate: string;
  paymentDueDate: string;
  workPeriod: string;
  sowRef: string;
  poNumber?: string;
  invoicePurpose: string;
  currency: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  employees: Employee[];
}

// API Request/Response types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  customerName: string;
  customerAddress: string;
  contactPerson: string;
  email: string;
  invoiceNumber: string;
  invoiceDate: string;
  paymentDueDate: string;
  workPeriod: string;
  sowRef: string;
  poNumber?: string;
  invoicePurpose: string;
  currency?: string;
  totalAmount?: number;
  status?: string;
  employees?: {
    name: string;
    ratePerHour: number;
    hours: number;
    total: number;
  }[];
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

export interface CreateEmployeeRequest {
  name: string;
  ratePerHour: number;
  hours: number;
  total: number;
}

export interface APIError {
  error: string;
  details?: any;
}
