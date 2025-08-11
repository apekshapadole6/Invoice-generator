import { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectRequest, 
  CreateEmployeeRequest,
  APIError 
} from '@shared/api';

const API_BASE = '/api';

class APIService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error: APIError = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<void> {
    return this.request<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Employees
  async addEmployee(projectId: string, data: CreateEmployeeRequest): Promise<void> {
    return this.request<void>(`/projects/${projectId}/employees`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeEmployee(projectId: string, employeeId: string): Promise<void> {
    return this.request<void>(`/projects/${projectId}/employees/${employeeId}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async ping(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/ping');
  }
}

export const api = new APIService();
