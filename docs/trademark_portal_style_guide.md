# The Trademark Helpline Portal Style Guide

## Brand Overview
A professional, trustworthy trademark services portal that maintains visual consistency with The Trademark Helpline's main website while providing a streamlined user experience for client document submissions and order processing.

## Color Palette

### Primary Colors
- **Primary Blue**: `#1e40af` (Deep blue for trust and professionalism)
- **Secondary Blue**: `#3b82f6` (Lighter blue for interactive elements)
- **Accent Blue**: `#60a5fa` (Hover states and highlights)

### Header & Footer
- **Dark Background**: `#2c4459` (Dark blue for header and footer)
- **Header Text**: `#ffffff` (White text for contrast)

### Background & Content
- **Page Background**: `#f8fafc` (Light gray-blue)
- **Content Background**: `#ffffff` (Pure white)
- **Border Color**: `#e2e8f0` (Light gray for subtle borders)

### Status & Feedback
- **Success Green**: `#10b981`
- **Warning Orange**: `#f59e0b`
- **Error Red**: `#ef4444`
- **Info Blue**: `#3b82f6`

### Text Colors
- **Primary Text**: `#1f2937` (Dark gray for main content)
- **Secondary Text**: `#6b7280` (Medium gray for descriptions)
- **Muted Text**: `#9ca3af` (Light gray for labels)

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Font Weights & Sizes
- **Headings**: 
  - H1: `font-size: 2.25rem; font-weight: 700;` (36px, Bold)
  - H2: `font-size: 1.875rem; font-weight: 600;` (30px, Semi-bold)
  - H3: `font-size: 1.5rem; font-weight: 600;` (24px, Semi-bold)
  - H4: `font-size: 1.25rem; font-weight: 500;` (20px, Medium)

- **Body Text**:
  - Large: `font-size: 1.125rem; font-weight: 400;` (18px, Regular)
  - Normal: `font-size: 1rem; font-weight: 400;` (16px, Regular)
  - Small: `font-size: 0.875rem; font-weight: 400;` (14px, Regular)

- **UI Elements**:
  - Button Text: `font-size: 0.875rem; font-weight: 500;` (14px, Medium)
  - Label Text: `font-size: 0.75rem; font-weight: 500;` (12px, Medium)

## Layout & Spacing

### Container & Grid
- **Max Width**: `1200px` (centered container)
- **Side Padding**: `1rem` (mobile), `2rem` (tablet+)
- **Grid Gaps**: `1rem` (16px) for forms, `1.5rem` (24px) for sections

### Spacing Scale
- **XS**: `0.25rem` (4px)
- **SM**: `0.5rem` (8px)
- **MD**: `1rem` (16px)
- **LG**: `1.5rem` (24px)
- **XL**: `2rem` (32px)
- **2XL**: `3rem` (48px)

### Border Radius
- **Small**: `0.375rem` (6px) - inputs, small buttons
- **Medium**: `0.5rem` (8px) - cards, main buttons
- **Large**: `0.75rem` (12px) - modals, major containers

## Components

### Header
```css
background-color: #2c4459;
color: #ffffff;
padding: 1rem 0;
border-bottom: 1px solid #374151;
```

### Navigation
- **Link Color**: `#d1d5db` (inactive)
- **Link Hover**: `#ffffff` (active/hover)
- **Logo**: White version on dark background

### Cards & Containers
```css
background-color: #ffffff;
border: 1px solid #e2e8f0;
border-radius: 0.5rem;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
padding: 1.5rem;
```

### Buttons

#### Primary Button
```css
background-color: #1e40af;
color: #ffffff;
padding: 0.75rem 1.5rem;
border-radius: 0.375rem;
font-weight: 500;
border: none;
transition: background-color 0.2s;

&:hover {
  background-color: #1d4ed8;
}
```

#### Secondary Button
```css
background-color: transparent;
color: #1e40af;
border: 1px solid #1e40af;
padding: 0.75rem 1.5rem;
border-radius: 0.375rem;
font-weight: 500;

&:hover {
  background-color: #1e40af;
  color: #ffffff;
}
```

### Form Elements

#### Input Fields
```css
border: 1px solid #d1d5db;
border-radius: 0.375rem;
padding: 0.75rem 1rem;
font-size: 1rem;
transition: border-color 0.2s;

&:focus {
  border-color: #3b82f6;
  outline: 2px solid #3b82f610;
}
```

#### File Upload Areas
```css
border: 2px dashed #d1d5db;
border-radius: 0.5rem;
padding: 2rem;
text-align: center;
background-color: #f9fafb;
transition: border-color 0.2s;

&:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}
```

### Tables
```css
.table-container {
  background-color: #ffffff;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.table-header {
  background-color: #f8fafc;
  font-weight: 600;
  color: #374151;
}

.table-row {
  border-bottom: 1px solid #f3f4f6;
}

.table-row:hover {
  background-color: #f9fafb;
}
```

## Visual Elements

### Icons
- **Source**: Lucide React icons (consistent with modern design)
- **Size**: `1rem` (16px) for inline, `1.25rem` (20px) for buttons
- **Color**: Inherit from parent or `#6b7280` for neutral icons

### Logo Usage
- **Main Logo**: The Trademark Helpline bird logo in white for header
- **Favicon**: Simplified version of the bird icon
- **Alt Text**: "The Trademark Helpline"

### Shadows
```css
/* Card shadow */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);

/* Elevated shadow */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);

/* Modal shadow */
box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04);
```

## Responsive Design

### Breakpoints
- **Mobile**: `320px - 767px`
- **Tablet**: `768px - 1023px`
- **Desktop**: `1024px+`

### Mobile Adaptations
- Stack form elements vertically
- Reduce padding to `1rem`
- Use full-width buttons
- Simplify navigation (hamburger menu)

## Accessibility

### Focus States
```css
&:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

### Color Contrast
- All text maintains WCAG AA compliance
- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text

### Interactive Elements
- Minimum touch target size: 44px × 44px
- Clear visual feedback for all interactions
- Screen reader friendly labels

## Animation & Transitions

### Standard Transitions
```css
transition: all 0.2s ease-in-out;
```

### Loading States
- Subtle pulse animation for loading content
- Spinner for form submissions
- Progress bars for file uploads

## Content Guidelines

### Tone of Voice
- Professional yet approachable
- Clear and concise instructions
- Supportive error messages
- Confident success confirmations

### Microcopy
- **Form Labels**: Descriptive and helpful
- **Button Text**: Action-oriented ("Upload Documents", "Submit Order")
- **Error Messages**: Specific and actionable
- **Success Messages**: Reassuring and next-step focused

## Implementation Notes

### CSS Framework Integration
This style guide is designed to work seamlessly with:
- **Tailwind CSS**: Utility classes align with Tailwind's design tokens
- **Mantine Components**: Color scheme matches Mantine's theme structure
- **CSS Modules**: Component-scoped styles for maintainability

### Design Tokens (for Mantine)
```javascript
const theme = {
  primaryColor: 'blue',
  colors: {
    blue: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
    gray: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827']
  },
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  headings: { fontFamily: 'inherit' }
}
```

---

This style guide ensures visual consistency with The Trademark Helpline brand while creating a professional, user-friendly portal environment optimized for document handling and client interactions.