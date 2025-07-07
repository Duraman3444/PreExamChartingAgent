# UI Concepts & Design System 🎨

*Comprehensive design concepts and interface guidelines for the Pre-Examination Charting Agent.*

---

## Overview

This document outlines the visual design concepts, component specifications, and design system for the medical charting application. It provides detailed guidance for creating intuitive, accessible, and professional healthcare interfaces.

## Design Philosophy

### Core Principles

1. **Clinical Efficiency**: Minimize cognitive load and maximize workflow efficiency
2. **Medical Accuracy**: Design supports precise data entry and reduces errors
3. **Accessibility First**: WCAG 2.1 AA compliance for all users
4. **Trust & Professionalism**: Clean, medical-grade aesthetic
5. **Responsive Flexibility**: Seamless experience across devices
6. **Data Clarity**: Clear information hierarchy and visual organization

---

## Color Palette

### Primary Colors

```css
/* Medical Blue Palette */
--primary-50: #e3f2fd;    /* Light background */
--primary-100: #bbdefb;   /* Card backgrounds */
--primary-200: #90caf9;   /* Disabled states */
--primary-300: #64b5f6;   /* Secondary actions */
--primary-400: #42a5f5;   /* Hover states */
--primary-500: #2196f3;   /* Primary brand */
--primary-600: #1e88e5;   /* Active states */
--primary-700: #1976d2;   /* Primary dark */
--primary-800: #1565c0;   /* Headers */
--primary-900: #0d47a1;   /* Text emphasis */
```

### Secondary Colors

```css
/* Clinical Green Palette */
--success-50: #e8f5e8;    /* Success backgrounds */
--success-500: #4caf50;   /* Success primary */
--success-700: #388e3c;   /* Success dark */

/* Alert Red Palette */
--error-50: #ffebee;      /* Error backgrounds */
--error-500: #f44336;     /* Error primary */
--error-700: #d32f2f;     /* Error dark */

/* Warning Orange Palette */
--warning-50: #fff3e0;    /* Warning backgrounds */
--warning-500: #ff9800;   /* Warning primary */
--warning-700: #f57c00;   /* Warning dark */
```

### Neutral Colors

```css
/* Medical Gray Palette */
--gray-50: #fafafa;       /* Page backgrounds */
--gray-100: #f5f5f5;      /* Card backgrounds */
--gray-200: #eeeeee;      /* Borders */
--gray-300: #e0e0e0;      /* Dividers */
--gray-400: #bdbdbd;      /* Disabled text */
--gray-500: #9e9e9e;      /* Secondary text */
--gray-600: #757575;      /* Body text */
--gray-700: #616161;      /* Headers */
--gray-800: #424242;      /* Titles */
--gray-900: #212121;      /* Primary text */
```

---

## Typography System

### Font Families

```css
/* Primary Font - Roboto */
--font-primary: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace Font - Data Display */
--font-mono: 'Roboto Mono', 'Monaco', 'Consolas', monospace;

/* Medical Font - Patient Data */
--font-medical: 'Inter', 'Roboto', sans-serif;
```

### Typography Scale

```css
/* Display Headings */
--text-display: 2.5rem;    /* 40px - Page titles */
--text-h1: 2rem;           /* 32px - Section headers */
--text-h2: 1.5rem;         /* 24px - Subsection headers */
--text-h3: 1.25rem;        /* 20px - Card titles */
--text-h4: 1.125rem;       /* 18px - Form labels */

/* Body Text */
--text-body: 1rem;         /* 16px - Primary body text */
--text-body-sm: 0.875rem;  /* 14px - Secondary text */
--text-caption: 0.75rem;   /* 12px - Captions, metadata */

/* Medical Data */
--text-vital: 1.5rem;      /* 24px - Vital signs display */
--text-data: 1.125rem;     /* 18px - Patient data */
```

### Font Weights

```css
--weight-light: 300;       /* Light text */
--weight-normal: 400;      /* Body text */
--weight-medium: 500;      /* Emphasis */
--weight-semibold: 600;    /* Form labels */
--weight-bold: 700;        /* Headers */
```

---

## Spacing System

### Grid System

```css
/* Base unit: 8px */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Component Spacing

```css
/* Form Elements */
--form-spacing: var(--space-4);    /* Between form fields */
--form-padding: var(--space-3);    /* Input padding */

/* Cards */
--card-padding: var(--space-6);    /* Card internal padding */
--card-margin: var(--space-4);     /* Between cards */

/* Layout */
--section-spacing: var(--space-12); /* Between sections */
--page-padding: var(--space-6);     /* Page margins */
```

---

## Component Specifications

### 1. Button Components

#### Primary Button
```css
.btn-primary {
  background: var(--primary-500);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: 6px;
  font-weight: var(--weight-medium);
  font-size: var(--text-body);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
}

.btn-primary:active {
  background: var(--primary-700);
  transform: translateY(0);
}

.btn-primary:disabled {
  background: var(--gray-300);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

#### Secondary Button
```css
.btn-secondary {
  background: white;
  color: var(--primary-500);
  border: 2px solid var(--primary-500);
  padding: calc(var(--space-3) - 2px) calc(var(--space-6) - 2px);
  border-radius: 6px;
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--primary-50);
  border-color: var(--primary-600);
}
```

#### Critical Action Button
```css
.btn-critical {
  background: var(--error-500);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: 6px;
  font-weight: var(--weight-semibold);
}

.btn-critical:hover {
  background: var(--error-700);
}
```

### 2. Form Components

#### Text Input
```css
.input-field {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--gray-300);
  border-radius: 6px;
  font-size: var(--text-body);
  font-family: var(--font-primary);
  transition: border-color 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.input-field.error {
  border-color: var(--error-500);
}

.input-field.error:focus {
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
}
```

#### Medical Data Input
```css
.input-medical {
  font-family: var(--font-medical);
  font-size: var(--text-data);
  font-weight: var(--weight-medium);
  text-align: center;
  background: var(--gray-50);
  border: 2px solid var(--gray-200);
}

.input-medical.vital-sign {
  font-size: var(--text-vital);
  font-weight: var(--weight-semibold);
  color: var(--gray-800);
}
```

#### Form Labels
```css
.form-label {
  font-size: var(--text-body-sm);
  font-weight: var(--weight-semibold);
  color: var(--gray-700);
  margin-bottom: var(--space-2);
  display: block;
}

.form-label.required::after {
  content: ' *';
  color: var(--error-500);
}
```

### 3. Card Components

#### Patient Card
```css
.patient-card {
  background: white;
  border-radius: 12px;
  padding: var(--card-padding);
  margin-bottom: var(--card-margin);
  border: 1px solid var(--gray-200);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.patient-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.patient-card-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-4);
}

.patient-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-100);
  margin-right: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--weight-semibold);
  color: var(--primary-700);
}
```

#### Vitals Card
```css
.vitals-card {
  background: white;
  border-radius: 8px;
  padding: var(--space-4);
  border-left: 4px solid var(--success-500);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.vitals-card.abnormal {
  border-left-color: var(--error-500);
  background: var(--error-50);
}

.vitals-card.borderline {
  border-left-color: var(--warning-500);
  background: var(--warning-50);
}

.vital-value {
  font-size: var(--text-vital);
  font-weight: var(--weight-bold);
  color: var(--gray-800);
  font-family: var(--font-medical);
}

.vital-label {
  font-size: var(--text-body-sm);
  color: var(--gray-600);
  font-weight: var(--weight-medium);
}
```

### 4. Navigation Components

#### Top Navigation
```css
.nav-header {
  background: white;
  border-bottom: 1px solid var(--gray-200);
  padding: var(--space-4) var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-logo {
  font-size: var(--text-h3);
  font-weight: var(--weight-bold);
  color: var(--primary-700);
}

.nav-user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
```

#### Sidebar Navigation
```css
.nav-sidebar {
  width: 280px;
  background: var(--gray-50);
  border-right: 1px solid var(--gray-200);
  padding: var(--space-6) 0;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-6);
  color: var(--gray-700);
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--primary-50);
  color: var(--primary-700);
}

.nav-item.active {
  background: var(--primary-100);
  color: var(--primary-800);
  border-right: 3px solid var(--primary-500);
}
```

### 5. Status & Alert Components

#### Status Badges
```css
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: 16px;
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: var(--success-100);
  color: var(--success-700);
}

.status-badge.critical {
  background: var(--error-100);
  color: var(--error-700);
}

.status-badge.pending {
  background: var(--warning-100);
  color: var(--warning-700);
}
```

#### Alert Components
```css
.alert {
  padding: var(--space-4);
  border-radius: 8px;
  margin-bottom: var(--space-4);
  display: flex;
  align-items: start;
  gap: var(--space-3);
}

.alert.success {
  background: var(--success-50);
  border: 1px solid var(--success-200);
  color: var(--success-800);
}

.alert.error {
  background: var(--error-50);
  border: 1px solid var(--error-200);
  color: var(--error-800);
}

.alert.warning {
  background: var(--warning-50);
  border: 1px solid var(--warning-200);
  color: var(--warning-800);
}

.alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
```

---

## Layout Patterns

### 1. Dashboard Layout

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
}

.main-content {
  padding: var(--space-6);
  background: var(--gray-50);
  overflow-y: auto;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}
```

### 2. Form Layout

```css
.form-container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  padding: var(--space-8);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.form-group {
  margin-bottom: var(--space-5);
}

.form-group.full-width {
  grid-column: 1 / -1;
}
```

### 3. Split Panel Layout

```css
.split-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  height: calc(100vh - 80px);
}

.panel {
  background: white;
  border-radius: 8px;
  padding: var(--space-6);
  overflow-y: auto;
  border: 1px solid var(--gray-200);
}

.panel-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--gray-200);
}
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
:root {
  --breakpoint-sm: 640px;    /* Small tablets */
  --breakpoint-md: 768px;    /* Tablets */
  --breakpoint-lg: 1024px;   /* Small desktops */
  --breakpoint-xl: 1280px;   /* Large desktops */
}
```

### Mobile Adaptations

```css
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .nav-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .nav-sidebar.open {
    transform: translateX(0);
  }
  
  .split-panel {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: var(--space-4);
  }
  
  .form-container {
    padding: var(--space-4);
    margin: var(--space-2);
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    margin-bottom: var(--space-2);
  }
}
```

---

## Accessibility Features

### Focus Management

```css
/* Focus Indicators */
.focusable:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Skip Links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-500);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
}

.skip-link:focus {
  top: 6px;
}
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  :root {
    --primary-500: #0000ff;
    --error-500: #ff0000;
    --success-500: #008000;
    --gray-600: #000000;
    --gray-300: #808080;
  }
  
  .btn-primary {
    border: 2px solid var(--primary-500);
  }
  
  .input-field {
    border-width: 3px;
  }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Animation Guidelines

### Micro-interactions

```css
/* Button Hover */
@keyframes button-hover {
  from { transform: translateY(0); }
  to { transform: translateY(-2px); }
}

/* Loading Spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Fade In */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fade-in 0.3s ease-out;
}
```

### Page Transitions

```css
.page-transition {
  transition: opacity 0.2s ease-in-out;
}

.page-enter {
  opacity: 0;
}

.page-enter-active {
  opacity: 1;
}

.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
}
```

---

## Dark Mode Support

```css
@media (prefers-color-scheme: dark) {
  :root {
    --gray-50: #1a1a1a;
    --gray-100: #2d2d2d;
    --gray-200: #404040;
    --gray-300: #595959;
    --gray-600: #a6a6a6;
    --gray-700: #cccccc;
    --gray-800: #e6e6e6;
    --gray-900: #ffffff;
  }
  
  .patient-card {
    background: var(--gray-100);
    border-color: var(--gray-200);
  }
  
  .nav-header {
    background: var(--gray-100);
    border-color: var(--gray-200);
  }
}
```

---

## Print Styles

```css
@media print {
  .nav-sidebar,
  .nav-header,
  .btn-primary,
  .btn-secondary {
    display: none !important;
  }
  
  .main-content {
    padding: 0;
    margin: 0;
  }
  
  .patient-card {
    break-inside: avoid;
    border: 1px solid #000;
    margin-bottom: 20px;
  }
  
  .vitals-card {
    border: 1px solid #000;
    margin: 10px 0;
  }
  
  body {
    font-size: 12pt;
    color: #000;
    background: white;
  }
}
```

---

## Implementation Guidelines

### CSS Architecture

1. **Use CSS Custom Properties** for consistent theming
2. **Follow BEM Methodology** for class naming
3. **Mobile-First Responsive Design**
4. **Component-Based Organization**
5. **Accessibility-First Approach**

### Design Token Structure

```
tokens/
├── colors.css
├── typography.css
├── spacing.css
├── shadows.css
├── borders.css
└── motion.css
```

### Component Library Structure

```
components/
├── buttons/
├── forms/
├── cards/
├── navigation/
├── alerts/
├── modals/
└── layouts/
```

This comprehensive UI concept guide provides the foundation for creating a consistent, accessible, and professional medical charting interface that meets healthcare industry standards while providing an excellent user experience. 