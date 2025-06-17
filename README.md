# TMH Client Portal

A professional Next.js 14 client portal application for displaying trademark search results and client data in a modern, responsive table format.

## Features

- **Modern Tech Stack**: Next.js 14, React 18, TypeScript, Tailwind CSS, Mantine v7
- **Professional UI**: Responsive design with dark/light theme support
- **Data Visualization**: Interactive table with sorting, filtering, and image display
- **Mock Data**: 100 rows of realistic test data with 50% having base64 images
- **API Integration**: Netlify Functions for serverless API endpoints
- **Performance Optimized**: Code splitting, image optimization, and caching
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Security**: Secure headers, CORS handling, input validation

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tmh-client-portal
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3847
```

### Usage

The application accepts URL parameters for client identification:

- `?id=sample-client-123` - Loads sample client data
- `?id=demo-client-456` - Loads demo client data
- `?request_id=<id>` - Alternative parameter name

Example URLs:
- http://localhost:3847?id=sample-client-123
- http://localhost:3847?request_id=demo-client-456

## Project Structure

```
tmh-client-portal/
├── src/
│   ├── app/                    # Next.js 14 app router
│   │   ├── api/               # API routes for development
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Main page component
│   │   ├── loading.tsx        # Loading UI
│   │   ├── error.tsx          # Error UI
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── DataTable.tsx  # Main data table component
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   └── ImageCell.tsx
│   │   ├── layout/            # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── providers/         # Context providers
│   │       ├── MantineProvider.tsx
│   │       └── ThemeProvider.tsx
│   ├── lib/
│   │   ├── types.ts           # TypeScript definitions
│   │   ├── utils.ts           # Utility functions
│   │   ├── mockData.ts        # Mock data generation
│   │   └── api.ts             # API utilities
│   └── hooks/
│       ├── useClientData.ts   # Data fetching hook
│       └── useTable.ts        # Table functionality hook
├── netlify/
│   └── functions/
│       └── client-data.ts     # Netlify Function for API
├── public/                    # Static assets
└── Configuration files
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server on port 3847
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript type checking
```

## Data Structure

The application expects client data in the following format:

```typescript
interface ClientData {
  client_info: {
    client_name: string;
    search_type: string;
    gs_classes: string;
    sic_code: string;
    business_nature: string;
    countries: string;
  };
  search_data: SearchItem[];
}

interface SearchItem {
  id: string;
  search_term: string;
  search_criteria: 'Identical' | 'Similar' | 'Phonetic' | 'Broad';
  remarks: string;
  image?: string; // base64 encoded image
  classification: string;
  created_date: string;
}
```

## API Endpoints

### Development (Next.js API Routes)
- `GET /api/client-data?id=<client-id>` - Fetch client data

### Production (Netlify Functions)
- `GET /.netlify/functions/client-data?id=<client-id>` - Fetch client data

## Deployment

### Netlify Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to Netlify:
   - Connect your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `out`
   - Deploy

### Environment Variables

The application automatically detects the environment and uses appropriate API endpoints:
- Development: Uses Next.js API routes
- Production: Uses Netlify Functions

## Features in Detail

### Data Table
- **Sorting**: Click column headers to sort data
- **Filtering**: Search across multiple fields
- **Multi-select filters**: Filter by criteria and classification
- **Image display**: View images in expandable modal
- **Responsive design**: Horizontal scroll on mobile devices
- **Empty states**: Graceful handling of no data scenarios

### Theme Support
- **Light/Dark mode**: Toggle between themes
- **System preference**: Automatically detects system theme
- **Persistent**: Remembers user preference

### Performance
- **Code splitting**: Automatic code splitting by Next.js
- **Image optimization**: Optimized base64 image handling
- **Caching**: Proper cache headers for static assets
- **Bundle analysis**: Optimized bundle size

### Accessibility
- **ARIA labels**: Proper labeling for screen readers
- **Keyboard navigation**: Full keyboard support
- **High contrast**: Supports high contrast mode
- **Focus management**: Proper focus handling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support or questions, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Tech Stack**: Next.js 14, React 18, TypeScript, Tailwind CSS, Mantine v7