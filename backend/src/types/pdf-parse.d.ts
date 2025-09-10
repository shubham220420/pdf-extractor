declare module 'pdf-parse' {
  interface PDFParseOptions {
    version?: string;
    max?: number;
    [key: string]: any;
  }

  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
    text: string;
  }

  function pdfParse(buffer: Buffer, options?: PDFParseOptions): Promise<PDFParseResult>;
  
  export = pdfParse;
}
