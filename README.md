# 📄 PDF Invoice Dashboard

A modern, AI-powered PDF invoice extraction and management system built with Next.js and Node.js.

![PDF Invoice Dashboard](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)

## 🚀 Live Demo

- **Frontend**: [Deploy to Vercel](https://vercel.com)
- **Backend**: [Deploy to Render](https://render.com)

## 🏗️ Project Structure

```
pdf-invoice-dashboard/
├── frontend/          # Next.js App (TypeScript + Tailwind + ShadCN)
├── backend/           # Node.js API (TypeScript + Express + MongoDB)
├── DEPLOYMENT.md      # Deployment guide
└── README.md         # This file
```

## ✨ Features

### 🤖 AI-Powered Extraction
- **Google Gemini AI Integration** - Intelligent data extraction from PDF invoices
- **Smart Field Recognition** - Automatically identifies vendor details, amounts, dates, and line items
- **Real-time Processing** - Live progress tracking with 0-100% animation

### 📋 Invoice Management
- **Complete CRUD Operations** - Create, read, update, and delete invoices
- **Advanced Search & Filter** - Find invoices by vendor name, invoice number, or amount
- **Export Capabilities** - Download and manage invoice data

### 🎨 Modern UI/UX
- **Dark Theme Design** - Stunning gradient backgrounds with glassmorphism effects
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Interactive PDF Viewer** - Built-in PDF display with zoom and navigation
- **Progress Animations** - Visual feedback for all operations

### 🔧 Technical Features
- **Type-Safe Development** - Full TypeScript implementation
- **Form Validation** - Zod schema validation with React Hook Form
- **File Upload** - Secure PDF upload with size validation (25MB limit)
- **Database Integration** - MongoDB with Mongoose ODM
- **API Architecture** - RESTful API with proper error handling

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.2** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - Modern component library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide React** - Beautiful icons
- **React PDF** - PDF viewing capabilities

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe backend
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Multer** - File upload handling
- **Google Generative AI** - Gemini AI integration
- **PDF Parse** - PDF text extraction
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Gemini API key OR Groq API key
- Vercel account (for deployment)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with API URL
npm run dev
```

### 3. Environment Variables

#### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pdf-dashboard
GEMINI_API_KEY=your-gemini-api-key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📡 API Documentation

### Endpoints

#### Upload
- `POST /api/upload` - Upload PDF file
  - Body: multipart/form-data with 'pdf' field
  - Response: `{ success: true, data: { fileId, fileName, fileUrl? } }`

#### Extraction
- `POST /api/extract` - Extract data using AI
  - Body: `{ fileId: string }`
  - Response: `{ success: true, data: { vendor, invoice } }`

#### CRUD Operations
- `GET /api/invoices` - List invoices (supports ?q=search)
- `GET /api/invoices/:id` - Get specific invoice
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Sample Request/Response

**Create Invoice:**
```bash
curl -X POST http://localhost:3001/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "file123",
    "fileName": "invoice.pdf",
    "vendor": {
      "name": "ABC Corp",
      "address": "123 Business St",
      "taxId": "TAX123"
    },
    "invoice": {
      "number": "INV-001",
      "date": "2024-03-15",
      "currency": "USD",
      "total": 1000,
      "lineItems": [
        {
          "description": "Service",
          "unitPrice": 100,
          "quantity": 10,
          "total": 1000
        }
      ]
    }
  }'
```

## 🚢 Deployment

### Vercel (Frontend)
1. Push code to GitHub
2. Connect repository to Vercel
3. Select `frontend` folder as root directory
4. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   ```
5. Deploy automatically

### Render (Backend)
1. Connect GitHub repository to Render
2. Create a Web Service
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Set environment variables:
   ```
   PORT=10000
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_api_key
   FRONTEND_URL=https://your-app.vercel.app
   CORS_ORIGIN=https://your-app.vercel.app
   ```

### Complete Deployment Guide
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed step-by-step instructions.

## 🧪 Testing the Application

### Demo Workflow
1. **Upload**: Select a PDF invoice file (≤25MB)
2. **View**: PDF renders in left panel with zoom/navigation
3. **Extract**: Click "Extract with Gemini AI" to process the document
4. **Edit**: Modify extracted data in the right panel form
5. **Save**: Click "Save Invoice" to store in MongoDB
6. **List**: Navigate to "View All Invoices"
7. **Search**: Use search box to find invoices
8. **Update**: Click edit button to modify existing invoice
9. **Delete**: Remove invoices with confirmation

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Run production build
```

### Frontend Development
```bash
cd frontend
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Run production build
```

## 📊 Data Schema

### Invoice Document (MongoDB)
```typescript
{
  fileId: string,
  fileName: string,
  vendor: {
    name: string,
    address?: string,
    taxId?: string
  },
  invoice: {
    number: string,
    date: string,
    currency?: string,
    subtotal?: number,
    taxPercent?: number,
    total?: number,
    poNumber?: string,
    poDate?: string,
    lineItems: Array<{
      description: string,
      unitPrice: number,
      quantity: number,
      total: number
    }>
  },
  createdAt: string,
  updatedAt?: string
}
```

## 🎯 Acceptance Criteria Status

✅ PDF uploads and renders in viewer  
✅ AI extraction works with Gemini/Groq  
✅ Data editing and MongoDB persistence  
✅ All required API endpoints working  
✅ Search functionality implemented  
✅ CRUD operations complete  
✅ Both apps deployable to Vercel  

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the console logs for error messages
- Verify environment variables are set correctly
- Ensure MongoDB connection is working
- Confirm AI API keys are valid

---

Built with ❤️ using Next.js, Node.js, and MongoDB
