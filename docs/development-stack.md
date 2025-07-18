# Development Stack - Modern Business Portal

## Core Framework

- **Next.js 14** - React-based full-stack framework with app router, server-side rendering, and API routes for optimal performance and SEO
- **TypeScript** - Strongly typed JavaScript for enhanced code quality, developer experience, and maintainable codebase
- **React 18** - Latest version with concurrent features and improved performance

## UI Component Library

- **Mantine v7.12.2** - Comprehensive React component library with 100+ modern, accessible components including:
  - Advanced tables with sorting and filtering
  - File upload with drag-and-drop functionality
  - Form components with built-in validation
  - Data visualization and charts
  - Navigation and layout components
  - Modal dialogs, notifications, and feedback components
- **MIT Licensed** - Free for commercial use with optional premium components for enterprise features
- **Important API Notes**:
  - Mantine v7 has significant API changes from v6
  - Key changes: `position` → `justify`, `icon`/`rightIcon` → `leftSection`/`rightSection`, removal of `compact` prop
  - Always refer to [official Mantine v7 documentation](https://mantine.dev/) when implementing components

## Styling & Design

- **Tailwind CSS** - Utility-first CSS framework for rapid UI development and consistent design system
- **CSS Modules** - Component-scoped styling for maintainable and conflict-free styles
- **Responsive Design** - Mobile-first approach with breakpoint-based layouts
- **Dark/Light Theme Support** - Built-in theme switching capabilities

## TypeScript Configuration & Best Practices

- **Strict Mode** - TypeScript is configured with strict type checking for production builds
- **isolatedModules** - Enabled by default in Next.js, requires using `export type` when re-exporting types
- **Type Organization**:
  - Central type definitions are located in `src/lib/types.ts`
  - Avoid duplicate interface definitions across files
  - Use type aliases when importing to avoid naming conflicts (e.g., `import { Type as AliasType }`)
- **Common Pitfalls**:
  - Always provide explicit type annotations for function parameters to avoid "implicit any" errors
  - When handling complex object structures like images, ensure proper type narrowing before assignment
  - Exclude unused files from the build process by moving them to a separate directory outside of `src`
  - Maintain a single source of truth for interfaces and types

## Development Tools

- **ESLint & Prettier** - Code quality and formatting enforcement
- **Husky & lint-staged** - Pre-commit hooks for code quality assurance
- **PostCSS** - CSS processing and optimization

## Deployment & Infrastructure

- **Vercel/Netlify Ready** - Optimized for serverless deployment platforms
- **Static Site Generation (SSG)** - Pre-built pages for optimal performance
- **Server-Side Rendering (SSR)** - Dynamic content rendering when needed
- **API Routes** - Built-in backend functionality for data handling

## Key Benefits

- **Developer Productivity** - Comprehensive component library reduces development time by 60-70%
- **Performance Optimized** - Lightweight bundle size (~120kb) with tree-shaking and code splitting
- **Accessibility First** - WCAG 2.1 compliant components out of the box
- **Scalable Architecture** - Grows from single page to comprehensive portal
- **Modern Design** - Contemporary UI that competes with premium solutions
- **Type Safety** - Full TypeScript integration prevents runtime errors
- **Maintainable** - Single, well-documented component system vs. multiple third-party integrations

## Technical Specifications

- **Bundle Size** - ~120kb gzipped (optimized for serverless cold starts)
- **Browser Support** - Modern browsers (ES2020+)
- **Performance** - Core Web Vitals optimized, sub-second loading times
- **Accessibility** - Screen reader compatible, keyboard navigation support
- **Responsive Breakpoints** - Mobile (320px+), Tablet (768px+), Desktop (1024px+)

---

_This stack provides enterprise-grade functionality with startup-level agility, delivering professional business portals without the complexity and cost of traditional enterprise solutions._
