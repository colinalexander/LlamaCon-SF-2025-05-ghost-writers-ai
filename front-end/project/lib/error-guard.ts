import { toast } from 'sonner';

export class ErrorGuard {
  static validateProjectId(projectId: string | null): boolean {
    if (!projectId) {
      toast.error('Project ID is required');
      return false;
    }
    return true;
  }

  static validateFormData(data: Record<string, any>, requiredFields: string[]): boolean {
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }
    return true;
  }

  static async validateApiResponse(response: Response): Promise<boolean> {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const message = data.error || 'An error occurred';
      toast.error(message);
      return false;
    }
    return true;
  }

  static handleError(error: unknown, fallbackMessage: string = 'An error occurred'): void {
    const message = error instanceof Error ? error.message : fallbackMessage;
    toast.error(message);
    console.error(error);
  }
}