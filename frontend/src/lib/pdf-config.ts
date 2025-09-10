import { pdfjs } from 'react-pdf';

// Configure PDF.js worker for Vercel deployment
const configurePDFWorker = () => {
  if (typeof window !== 'undefined') {
    // Always use CDN for better reliability
    const workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    
    console.log('PDF Worker configured:', workerSrc);
    console.log('PDF.js version:', pdfjs.version);
  }
};

// Configure immediately
configurePDFWorker();

export { pdfjs, configurePDFWorker };
