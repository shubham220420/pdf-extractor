import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExtractResponse } from '../types';

export class AIService {
  private geminiClient?: GoogleGenerativeAI;

  constructor() {
    // Don't initialize here - do it lazily when needed
  }

  private getGeminiClient(): GoogleGenerativeAI {
    if (!this.geminiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      console.log('Getting Gemini client...');
      console.log('GEMINI_API_KEY exists:', !!apiKey);
      
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }
      
      this.geminiClient = new GoogleGenerativeAI(apiKey);
      console.log('✅ Gemini client initialized successfully');
    }
    return this.geminiClient;
  }

  private getExtractionPrompt(): string {
    return `
You are an AI assistant that extracts structured data from invoice PDFs. Please extract the following information and return it as a JSON object:

{
  "vendor": {
    "name": "vendor company name",
    "address": "vendor address (optional)",
    "taxId": "tax ID or VAT number (optional)"
  },
  "invoice": {
    "number": "invoice number",
    "date": "invoice date (YYYY-MM-DD format)",
    "currency": "currency code (optional)",
    "subtotal": 0.00,
    "taxPercent": 0.00,
    "total": 0.00,
    "poNumber": "purchase order number (optional)",
    "poDate": "PO date (optional)",
    "lineItems": [
      {
        "description": "item description",
        "unitPrice": 0.00,
        "quantity": 1,
        "total": 0.00
      }
    ]
  }
}

Please ensure all numeric values are numbers (not strings) and dates are in YYYY-MM-DD format. Extract only the information that is clearly visible in the document.

Output requirements:
- Return ONLY valid JSON (no prose, no markdown, no code fences).
- Do not wrap the JSON in triple backticks.
`;
  }

  async extractWithGemini(pdfText: string): Promise<ExtractResponse> {
    const geminiClient = this.getGeminiClient();
    const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
  const prompt = `${this.getExtractionPrompt()}\n\nPDF Content (first ${Math.min(pdfText.length, 100000)} chars):\n${pdfText}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
  const text = response.text();
  console.log('[AIService] Raw Gemini response length:', text.length);
    
    try {
      // Extract JSON from response
      // Strip code fences if present
      const cleaned = text
        .replace(/^```(json)?/i, '')
        .replace(/```$/i, '')
        .trim();
      // Attempt direct parse first
      try {
        return JSON.parse(cleaned);
      } catch (_) {
        // Fallback: extract first JSON object in text
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  async extractData(pdfText: string): Promise<ExtractResponse> {
    return this.extractWithGemini(pdfText);
  }
}
