import { ErrorGuard } from './error-guard';

interface RequestOptions extends RequestInit {
  requiresProject?: boolean;
}

export class ApiClient {
  private static getHeaders(options: RequestOptions): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (options.requiresProject) {
      const projectId = localStorage.getItem('currentProjectId');
      if (projectId) {
        headers['x-project-id'] = projectId;
      }
    }

    return headers;
  }

  static async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(options),
      });

      if (!await ErrorGuard.validateApiResponse(response)) {
        throw new Error('API request failed');
      }

      return response.json();
    } catch (error) {
      ErrorGuard.handleError(error);
      throw error;
    }
  }

  static async post<T>(url: string, data: any, options: RequestOptions = {}): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(options),
        body: JSON.stringify(data),
      });

      if (!await ErrorGuard.validateApiResponse(response)) {
        throw new Error('API request failed');
      }

      return response.json();
    } catch (error) {
      ErrorGuard.handleError(error);
      throw error;
    }
  }

  static async put<T>(url: string, data: any, options: RequestOptions = {}): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(options),
        body: JSON.stringify(data),
      });

      if (!await ErrorGuard.validateApiResponse(response)) {
        throw new Error('API request failed');
      }

      return response.json();
    } catch (error) {
      ErrorGuard.handleError(error);
      throw error;
    }
  }

  static async delete(url: string, options: RequestOptions = {}): Promise<void> {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(options),
      });

      if (!await ErrorGuard.validateApiResponse(response)) {
        throw new Error('API request failed');
      }
    } catch (error) {
      ErrorGuard.handleError(error);
      throw error;
    }
  }
}