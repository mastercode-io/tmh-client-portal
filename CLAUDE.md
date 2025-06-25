# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start development server on port 3847
- `npm run build` - Build for production
- `npm run start` - Start production server on port 3847
- `npm run export` - Build and export static files

### Testing
- `npm test` - Run Jest tests
- `npm run test:watch` - Run Jest tests in watch mode
- `npm run test:e2e` - Run Playwright end-to-end tests

### Code Quality
- `npm run lint` - Run ESLint linting
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Project Architecture

### Core Stack
- **Next.js 14** with app router for full-stack React development
- **TypeScript** with strict mode enabled
- **Mantine v7.12.2** as the primary UI component library
- **Tailwind CSS** for utility-first styling
- **Netlify Functions** for serverless API endpoints

### Key Directories
- `src/app/` - Next.js 14 app router pages and API routes
- `src/components/` - Reusable React components organized by type (ui/, layout/, providers/)
- `src/lib/` - Core utilities, types, and business logic
- `src/hooks/` - Custom React hooks for data fetching and state management
- `netlify/functions/` - Serverless functions for production API endpoints

### Data Flow
1. URL parameters (`id` or `request_id`) determine client data to load
2. `useClientData` hook handles API requests to either Next.js API routes (dev) or Netlify Functions (prod)
3. Data is transformed through `responseDataAdapter` to match internal types
4. `DataTable` component renders client search results with sorting, filtering, and image display

### Important Type Definitions
Central type definitions are in `src/lib/types.ts`:
- `ClientData` - Main data structure for client information and search results
- `RowItem` - Flexible row structure supporting dynamic properties
- `TableConfig` - Configuration for table display and behavior

### Mantine v7 Specific Notes
- Uses Mantine v7 API (significant changes from v6)
- Key component prop changes: `position` → `justify`, `icon` → `leftSection`
- Always reference official Mantine v7 documentation for component usage
- Theme system integrated with Tailwind CSS custom colors

### UI Component Patterns
- Always use Mantine v7 component APIs (leftSection/rightSection, justify vs position)
- Horizontal scroll detection: Use refs with scrollWidth vs clientWidth comparison
- Table modifications: Preserve existing sorting/filtering while updating layout
- Responsive indicators: Show UI hints when content extends beyond viewport

### Development Environment Detection
The application automatically detects environment:
- Development: Uses Next.js API routes at `/api/client-data`
- Production: Uses Netlify Functions at `/.netlify/functions/client-data`

### TypeScript Configuration
- Strict mode enabled with `isolatedModules` for production builds
- Path alias `@/*` maps to `src/*`
- All type definitions should be centralized in `src/lib/types.ts`
- Use `export type` when re-exporting types due to `isolatedModules`

### Testing Setup
- Jest for unit testing with React Testing Library
- Playwright for end-to-end testing
- Tests located in `__tests__/` directory
- Pre-commit hooks with Husky and lint-staged ensure code quality