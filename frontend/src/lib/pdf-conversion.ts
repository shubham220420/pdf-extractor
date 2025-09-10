const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL
  : 'http://localhost:3001';

export class PDFConversionService {
  /**
   * Convert a problematic PDF to a more compatible format
   */
  static async convertPDF(file: File): Promise<Blob> {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await fetch(`${API_BASE_URL}/api/pdf-convert/convert`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Conversion failed: ${response.statusText}`);
    }

    return await response.blob();
  }

  /**
   * Check if the PDF conversion service is available
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pdf-convert/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
