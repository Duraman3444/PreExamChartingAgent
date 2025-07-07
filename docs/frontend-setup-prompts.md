# Frontend Setup Prompts 🎨

*Copy-paste these prompts into your AI assistant to scaffold the entire Pre-Examination Charting Agent frontend.*

---

## 1. Project Structure & Dependencies

```
Create a React TypeScript project structure for a medical charting application with the following requirements:

- Use Vite as the build tool
- TypeScript with strict mode
- Material-UI v5 for components
- Firebase v9 for auth and Firestore
- React Router v6 for navigation
- React Hook Form for form handling
- React Diff Viewer for note comparison
- React Hotkeys Hook for keyboard shortcuts
- Zustand for state management
- Date-fns for date handling

Set up the folder structure:
```
app/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── screening/
│   │   ├── vitals/
│   │   ├── verification/
│   │   ├── automation/
│   │   └── layout/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   │   ├── auth.ts
│   │   ├── firebase.ts
│   │   ├── automation.ts
│   │   └── ehr-integration.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── appStore.ts
│   │   └── automationStore.ts
│   ├── types/
│   ├── utils/
│   └── constants/
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

Include all necessary dependencies in package.json and create the basic configuration files.

---

## Figma Design System Prompts

Use these prompts with Figma to create a comprehensive design system for the medical charting application. Create component libraries, design tokens, and user interface mockups that can be implemented in React TypeScript.

### Authentication Components

#### Login Page Design
```
Design a modern medical charting application login page in Figma with the following specifications:
- Split-screen layout with medical imagery on the left panel
- Login form on the right with email and password input fields
- Toggle component for "Sign In" and "Create Account" modes
- Role selection dropdown component for new accounts (Doctor, Nurse, Admin)
- Healthcare-appropriate color palette with primary blues and clean whites
- Responsive design variants for desktop (1920px) and tablet (768px)
- Loading states and error message components
- Clean, professional medical aesthetic with proper typography hierarchy
- Include component variants for different states (default, hover, focus, error)
```

#### User Profile Design
```
Design a user profile management interface in Figma for healthcare providers:
- User avatar component with upload functionality and placeholder states
- Editable profile form fields (name, email, role, department)
- Security settings section with password change and 2FA toggle components
- Notification preferences panel with toggle switches
- Theme selection component (light/dark mode variants)
- Professional medical styling with consistent spacing and typography
- Form validation states and save confirmation modal components
- Component library with all form elements and their states
```

### Patient Management Components

#### Patient Search & List Design
```
Design a comprehensive patient search and list interface in Figma:
- Advanced search bar component with filter dropdowns (name, DOB, MRN, phone)
- Patient list table with pagination controls and sorting indicators
- Quick filter chips (Recent, Favorites, Assigned to Me)
- Patient status badge components (Active, Discharged, Critical) with color coding
- Patient preview card components with hover and selected states
- Responsive grid/list view toggle switch
- Table components with sorting arrows and filtering options
- Healthcare professional color palette with accessible contrast ratios
- Typography system for medical data display
```

#### Patient Profile Card Design
```
Design a detailed patient information card in Figma:
- Patient photo placeholder component with upload state variants
- Key demographics section with typography hierarchy (name, age, DOB, gender, MRN)
- Emergency contact information display with proper spacing
- Medical alerts and allergies badge components with color coding
- Insurance information section with collapsible design
- Recent visit history timeline component with date/time styling
- Quick action button components (Edit, Add Note, View Charts)
- Professional medical card layout with consistent margins and padding
- Expandable sections with accordion-style interaction states
- Component variants for different data states (complete, incomplete, loading)
```

#### Patient Registration Form
```
Create a comprehensive patient registration form:
- Multi-step wizard with progress indicator
- Personal information (name, DOB, gender, contact info)
- Emergency contacts section
- Medical history and allergies
- Insurance information
- Photo upload component
- Form validation with real-time feedback
- Save draft functionality
- Material-UI form components with medical styling
- Responsive design for tablet use
```

### Screening Module Components

#### Screening Questionnaire Builder
```
Design a dynamic questionnaire builder interface:
- Drag-and-drop question ordering
- Question type selector (Yes/No, Text, Multiple Choice, Scale)
- Conditional logic builder (show/hide based on answers)
- Question preview panel
- Template library sidebar
- Scoring configuration interface
- Material-UI with modern, intuitive design
- Medical questionnaire styling
- Real-time preview functionality
```

#### Screening Assessment Interface
```
Create a patient screening assessment form:
- Question display with various input types
- Progress bar showing completion status
- Previous/Next navigation with validation
- Auto-save functionality indicator
- Question numbering and categorization
- Score calculation display
- Submit for review button
- Clean, distraction-free design for patient use
- Large touch targets for tablet interaction
```

#### Screening Results Dashboard
```
Design a screening results review interface:
- Assessment summary cards with scores
- Risk indicator badges (Low, Medium, High)
- Detailed answer review with expandable sections
- Provider notes and comments section
- Approval workflow buttons
- Print/export functionality
- Data visualization for scores and trends
- Professional medical dashboard styling
```

### Vitals Recording Components

#### Vitals Entry Form Design
```
Design a comprehensive vitals recording interface in Figma:
- Grid layout system for vital sign input fields (BP, HR, Temp, RR, O2 Sat)
- Normal range indicator components with color-coded backgrounds
- Timestamp and provider attribution text components
- Device integration placeholder components with connection states
- Quick entry template buttons for common scenarios
- Trend comparison chart components with previous readings
- Alert notification components for abnormal values
- Medical device aesthetic with large, touch-friendly input fields
- Validation states and error message components
- Component library with all input field variants and states
```

#### Vitals Monitoring Dashboard
```
Design a patient vitals monitoring dashboard:
- Real-time vitals display with large, clear numbers
- Trend charts for each vital sign over time
- Alert status indicators with color coding
- Normal range overlays on charts
- Time range selector (1hr, 6hr, 24hr, week)
- Print and export functionality
- Multiple patient view for nurses
- Professional medical monitoring interface
- Responsive layout for different screen sizes
```

#### Vitals History Timeline
```
Create a chronological vitals history component:
- Timeline view with date/time stamps
- Expandable entries showing all vitals
- Provider attribution for each entry
- Search and filter by date range
- Trend indicators (improving, stable, declining)
- Export to PDF functionality
- Comparison mode for multiple dates
- Clean, medical record styling
- Efficient data visualization
```

### Chart Notes & Documentation Components

#### Rich Text Medical Editor
```
Design a specialized medical note editor:
- Rich text formatting toolbar
- Medical template insertion
- Auto-complete for medical terms
- Voice-to-text integration placeholder
- Real-time character count
- Auto-save with visual indicator
- Spell check for medical terminology
- Insert vital signs and assessment data
- Professional medical documentation styling
- Distraction-free writing interface
```

#### Note Review and Approval Interface
```
Create a medical note review system:
- Side-by-side note comparison (original vs edited)
- Comment and annotation system
- Approval/rejection workflow
- Review history timeline
- Co-signature requirements display
- Print preview functionality
- Version control indicators
- Professional review interface styling
- Efficient navigation between notes
```

#### Chart Notes Dashboard
```
Design a comprehensive chart notes overview:
- Filterable note list by category and date
- Quick preview cards with note excerpts
- Search functionality across all notes
- Status indicators (Draft, Pending Review, Approved)
- Provider attribution and timestamps
- Export and print batch functionality
- Categories sidebar (Assessment, Progress, Discharge)
- Professional medical documentation interface
- Responsive grid layout
```

### Dashboard & Analytics Components

#### Medical Dashboard Overview
```
Create a comprehensive medical dashboard:
- Key performance metrics cards
- Patient census overview
- Pending tasks and alerts
- Quick action buttons for common workflows
- Recent activity feed
- Vital statistics summary
- Schedule and appointment preview
- Weather-style layout with medical metrics
- Role-based customization
- Modern healthcare dashboard aesthetic
```

#### Patient Analytics Component
```
Design a patient analytics and trends interface:
- Interactive charts for patient outcomes
- Filterable data by date range and demographics
- Key performance indicators
- Population health metrics
- Quality measure tracking
- Export functionality for reports
- Drill-down capabilities
- Professional healthcare analytics styling
- Responsive chart layouts
```

### Navigation & Layout Components

#### Medical App Sidebar Navigation
```
Create a professional medical application sidebar:
- Hierarchical navigation menu
- Role-based menu items
- Active state indicators
- Collapsible subsections
- User profile section at bottom
- Notification badges for pending items
- Search functionality within navigation
- Professional medical application styling
- Smooth animations and transitions
- Responsive behavior
```

#### Medical App Header
```
Design a comprehensive medical application header:
- Application logo and branding
- Global search functionality
- Notification bell with badge count
- User profile dropdown menu
- Quick action buttons
- Breadcrumb navigation
- Emergency alert area
- Professional medical styling
- Responsive design for all devices
- Sticky header behavior
```

### Form Components

#### Medical Form Components Library
```
Create a set of reusable medical form components:
- Validated input fields with medical formatting
- Date/time pickers for medical use
- Dropdown selectors for medical codes
- Multi-select for medications and allergies
- File upload for medical documents
- Signature capture component
- Medical checkbox and radio groups
- Progress indicators for multi-step forms
- Consistent medical styling across all components
- Accessibility compliance
```

### Data Visualization Components

#### Medical Chart Visualization
```
Design medical data visualization components:
- Vital signs trend charts
- Pain scale visual indicators
- Medication timeline displays
- Assessment score gauges
- Progress tracking charts
- Interactive tooltip displays
- Export to PDF/image functionality
- Colorblind-friendly color schemes
- Professional medical chart styling
- Responsive and touch-friendly
```

### Automation Workflow Components

#### Workflow Status Dashboard Design
```
Design an automation workflow monitoring dashboard in Figma:
- Real-time workflow execution status cards with live indicators
- Success/failure rate visualization components (charts, meters)
- Processing time metric displays with trend indicators
- Error log display components with filtering dropdowns
- Workflow trigger history timeline components
- EHR integration status indicator badges with color coding
- Slack notification queue status components
- n8n workflow performance chart components (line charts, bar charts)
- Manual override control buttons with confirmation states
- System health monitoring widgets with alert states
- Professional operations dashboard layout with proper information hierarchy
- Dark mode variant for 24/7 monitoring environments
```

#### EHR Integration Panel
```
Design an EHR integration management interface:
- Connection status indicators for each EHR system
- API endpoint configuration panel
- Data mapping visualization
- Sync status and last update timestamps
- Error handling and retry mechanisms
- Test connection functionality
- Data format validation tools
- Integration logs with search and filtering
- Manual sync trigger controls
- Professional system integration styling
```

#### Automation Settings Interface
```
Create an automation configuration interface:
- Workflow enable/disable toggles
- Confidence threshold sliders for AI processing
- Notification preferences configuration
- Webhook endpoint management
- API key and credential management
- Retry policy configuration
- Error escalation rules
- Audit trail settings
- Performance optimization controls
- Professional settings interface styling
```

#### Notification Management Console
```
Design a notification management system:
- Real-time notification feed
- Notification categorization and filtering
- Slack channel configuration
- Alert severity level settings
- Notification templates editor
- Delivery status tracking
- Escalation rule configuration
- Notification history and analytics
- Manual notification triggers
- Professional communication interface styling
```

### Usage Instructions

1. **Create design system in Figma**: Use each prompt to design comprehensive component libraries
2. **Establish design tokens**: Define colors, typography, spacing, and component variants
3. **Create component variants**: Design all states (default, hover, focus, disabled, error)
4. **Build responsive layouts**: Create desktop, tablet, and mobile variants
5. **Document components**: Add descriptions, usage guidelines, and specifications
6. **Export for development**: Use Figma's Dev Mode to generate CSS and component specs

### Design System Guidelines

- Create a master component library with all reusable elements
- Use consistent naming conventions for components and variants
- Apply healthcare-appropriate color palettes with accessibility compliance
- Maintain consistent spacing and typography scales
- Design for touch interfaces and accessibility requirements
- Create prototypes for complex user flows and interactions
- Test designs with medical professionals for workflow validation
```

---

## 2. Automation Services & Integration

```
Create automation service integration for the medical charting application:

1. Create automation.ts service with:
   - Workflow status monitoring
   - EHR integration management
   - Notification system controls
   - Error handling and recovery
   - Performance metrics tracking

2. Create ehr-integration.ts service with:
   - RESTful API connections to EHR systems
   - Data synchronization functions
   - Webhook endpoint management
   - Data format validation
   - Authentication and security

3. Create TypeScript types for:
   - Workflow execution status
   - EHR integration configurations
   - Notification preferences
   - Automation settings
   - Performance metrics

4. Create automationStore.ts with Zustand:
   - Workflow state management
   - EHR connection status
   - Notification queue management
   - Error tracking and logging
   - Performance monitoring data

5. Include proper error handling and TypeScript interfaces for all automation operations.
```

---

## 3. Firebase Configuration & Types

```
Set up Firebase configuration for a medical charting application with the following features:

1. Create firebase.ts with:
   - Firebase app initialization
   - Auth, Firestore, and Functions exports
   - Environment variable configuration

2. Create TypeScript types for:
   - Patient screening data (PMH, medications, allergies, social/family history)
   - Vitals data with normal ranges
   - Generated notes with confidence scores
   - User roles (nurse, doctor, admin)
   - Visit workflow states

3. Create Firestore security rules for:
   - Role-based access (nurses can read/write their assigned patients)
   - Doctors can read all, write notes
   - Audit logging for all changes
   - PHI protection rules

4. Set up Firebase Auth with:
   - Email/password authentication
   - Role-based claims
   - Session management
   - Protected route wrapper component

Include proper error handling and TypeScript interfaces for all Firebase operations.
```

---

## 4. Patient Screening Interface

```
Create a comprehensive patient screening interface with the following requirements:

1. Multi-step form with progress indicator:
   - Step 1: Basic demographics (name, DOB, MRN)
   - Step 2: Past Medical History (searchable conditions)
   - Step 3: Current medications (drug name, dosage, frequency)
   - Step 4: Allergies (drug/food/environmental with severity)
   - Step 5: Social history (smoking, alcohol, occupation)
   - Step 6: Family history (conditions with relationships)
   - Step 7: Review and submit

2. Features needed:
   - Auto-save to localStorage on each step
   - Form validation with medical-specific rules
   - Searchable medication database integration
   - Allergy severity indicators with color coding
   - Progress bar showing completion percentage
   - Back/Next navigation with validation
   - Mobile-responsive design for tablet kiosks

3. Components to create:
   - ScreeningWizard (main container)
   - StepIndicator (progress visualization)
   - MedicationSearch (with autocomplete)
   - AllergyEntry (with severity selection)
   - ConditionSearch (ICD-10 integration ready)
   - ReviewSummary (final review before submit)

4. State management:
   - Form data persistence
   - Validation state tracking
   - Step navigation logic
   - Auto-save functionality

Use React Hook Form for form handling, Material-UI for components, and ensure accessibility compliance.
```

---

## 5. Vitals Capture Interface

```
Create a vitals capture interface for nurses with the following specifications:

1. Vitals input form with:
   - Blood pressure (systolic/diastolic with validation)
   - Heart rate (with rhythm notes)
   - Temperature (Celsius/Fahrenheit toggle)
   - Respiratory rate
   - Oxygen saturation
   - Weight and height (metric/imperial toggle)
   - Pain scale (0-10 with visual indicators)
   - BMI auto-calculation

2. Real-time validation features:
   - Color-coded ranges (green=normal, yellow=borderline, red=critical)
   - Heat map visualization for out-of-range values
   - Automatic BMI calculation and categorization
   - Age-appropriate normal ranges
   - Input validation with medical constraints

3. Components needed:
   - VitalsForm (main container)
   - VitalInput (reusable input with range validation)
   - RangeIndicator (visual range display)
   - VitalsHeatMap (overview of all vitals with colors)
   - VitalsTrends (if historical data available)

4. Features:
   - Quick-entry keyboard shortcuts
   - Voice input integration (Web Speech API)
   - Barcode scanner for patient ID
   - Print vitals summary
   - Integration with screening data context

5. State management:
   - Real-time validation
   - Range calculations
   - Historical data comparison
   - Auto-save functionality

Use Material-UI components, implement proper error handling, and ensure the interface works well on tablets.
```

---

## 6. AI Draft Verification Interface

```
Create a sophisticated note verification interface with the following requirements:

1. Split-view layout:
   - Left panel: Generated HPI/ROS draft
   - Right panel: Source data (screening + vitals) with highlights
   - Bottom panel: Confidence scores and AI reasoning

2. Diff viewer functionality:
   - Side-by-side comparison when nurse makes edits
   - Line-by-line highlighting of changes
   - Accept/reject individual changes
   - Undo/redo functionality
   - Change tracking with timestamps

3. Source tracing:
   - Click any sentence in draft → highlights source data
   - Hover over generated text → shows confidence score
   - Color-coded confidence levels (high=green, medium=yellow, low=red)
   - Expandable reasoning tooltips

4. Components needed:
   - VerificationLayout (main split view)
   - DraftEditor (rich text editor with medical formatting)
   - SourcePanel (highlighted source data)
   - ConfidenceIndicator (visual confidence display)
   - ChangeTracker (diff visualization)
   - ReasoningTooltip (AI explanation popup)

5. Editing features:
   - Rich text formatting (bold, italic, lists)
   - Medical templates and shortcuts
   - Spell check with medical dictionary
   - Auto-save with conflict resolution
   - Version history

6. Keyboard shortcuts:
   - Ctrl+M: Generate Mermaid workflow diagram
   - Ctrl+S: Save draft
   - Ctrl+Z/Y: Undo/redo
   - Ctrl+F: Find in text
   - Tab: Accept AI suggestion

Use react-diff-viewer, Draft.js or similar rich text editor, and implement proper change tracking.
```

---

## 7. Autonomy Control & Settings

```
Create an autonomy control interface with the following features:

1. Autonomy slider with three modes:
   - OFF: AI generates draft, nurse must review everything
   - ASSIST: AI generates draft, auto-approves high-confidence sections
   - AUTO: AI generates and submits notes above confidence threshold

2. Settings panel:
   - Confidence threshold slider (0-100%)
   - Auto-approval rules configuration
   - Notification preferences
   - Review timeout settings
   - Template customization

3. Components needed:
   - AutonomySlider (main mode selector)
   - ConfidenceThreshold (threshold configuration)
   - AutoApprovalRules (rule builder interface)
   - NotificationSettings (alert preferences)
   - TemplateEditor (note template customization)

4. Safety features:
   - Always require human review for critical values
   - Audit trail for all autonomy decisions
   - Emergency override capabilities
   - Compliance mode enforcement

5. Visual indicators:
   - Current autonomy level display
   - Pending review queue counter
   - Auto-approved items log
   - System confidence dashboard

Implement with proper safeguards and clear visual feedback about what the AI is doing automatically.
```

---

## 8. Layout & Navigation

```
Create a comprehensive layout and navigation system with:

1. Main application shell:
   - Top navigation bar with user info and logout
   - Side navigation with role-based menu items
   - Breadcrumb navigation for multi-step processes
   - Status indicators (pending reviews, alerts)

2. Navigation structure:
   - Dashboard (overview of pending items)
   - Screening (patient intake)
   - Vitals (nurse workflow)
   - Verification (note review)
   - Settings (autonomy controls)
   - Audit (compliance tracking)

3. Components needed:
   - AppShell (main layout container)
   - TopNavigation (header with user controls)
   - SideNavigation (menu with role-based items)
   - Breadcrumbs (navigation trail)
   - StatusIndicators (alerts and counters)
   - UserMenu (profile and logout)

4. Responsive design:
   - Mobile-first approach
   - Tablet optimization for kiosk mode
   - Desktop layout for nurse stations
   - Print-friendly views

5. Accessibility features:
   - Screen reader support
   - Keyboard navigation
   - High contrast mode
   - Font size controls

6. Role-based features:
   - Nurse view: screening, vitals, verification
   - Doctor view: review, approval, settings
   - Admin view: all features plus audit logs

Use Material-UI's layout components and implement proper role-based access control.
```

---

## 9. State Management & API Integration

```
Set up comprehensive state management and API integration:

1. Zustand stores for:
   - Authentication state (user, role, permissions)
   - Patient data (screening, vitals, notes)
   - UI state (current step, loading states)
   - Settings (autonomy level, preferences)
   - Notifications (alerts, pending items)
   - Automation workflows (n8n status, EHR integration, processing metrics)

2. API service layer:
   - Firebase Firestore operations
   - Real-time subscriptions
   - Optimistic updates
   - Error handling and retries
   - Offline support

3. Custom hooks:
   - useAuth (authentication state)
   - usePatientData (patient CRUD operations)
   - useVitals (vitals management)
   - useAIDraft (note generation)
   - useSettings (configuration)
   - useAutomation (workflow status and control)
   - useEHRIntegration (EHR system connectivity)
   - useNotifications (automated alert management)

4. Components needed:
   - AuthProvider (authentication context)
   - DataProvider (patient data context)
   - NotificationProvider (alerts and messages)
   - OfflineIndicator (connection status)
   - LoadingSpinner (loading states)

5. Features:
   - Real-time updates across components
   - Optimistic UI updates
   - Conflict resolution
   - Offline queue management
   - Error boundary handling

6. Integration points:
   - Firebase Auth for user management
   - Firestore for data persistence
   - Cloud Functions for AI processing
   - Pub/Sub for real-time notifications
   - n8n webhook endpoints for workflow automation
   - EHR system APIs for bidirectional data sync
   - Slack API for nursing team notifications
   - OpenAI API for transcript summarization

Include proper TypeScript types, error handling, and loading states for all operations.
```

---

## 10. Testing Setup

```
Create a comprehensive testing setup for the medical charting application:

1. Testing framework setup:
   - Jest for unit testing
   - React Testing Library for component testing
   - Cypress for E2E testing
   - MSW (Mock Service Worker) for API mocking

2. Test utilities:
   - Firebase emulator setup for testing
   - Mock data generators for patients/vitals
   - Custom render function with providers
   - Accessibility testing utilities

3. Test coverage for:
   - Authentication flows
   - Form validation and submission
   - Real-time data updates
   - AI draft generation and verification
   - Role-based access control
   - Error handling scenarios

4. E2E test scenarios:
   - Complete patient screening workflow
   - Nurse vitals capture and review
   - Doctor note approval process
   - Autonomy mode switching
   - Offline functionality

5. Testing components:
   - Mock Firebase services
   - Patient data fixtures
   - User role simulation
   - Network condition simulation

6. CI/CD integration:
   - GitHub Actions workflow
   - Automated testing on PR
   - Code coverage reporting
   - Visual regression testing

Include proper setup for Firebase emulators and mock all external dependencies.
```

---

## 11. Deployment & DevOps

```
Set up deployment and development operations:

1. Development environment:
   - Docker Compose for local development
   - Firebase emulator suite
   - Hot reloading and fast refresh
   - Environment variable management

2. Build and deployment:
   - Vite build optimization
   - Firebase Hosting deployment
   - Environment-specific configurations
   - Asset optimization and compression

3. CI/CD pipeline:
   - GitHub Actions workflow
   - Automated testing and linting
   - Build and deployment automation
   - Security scanning

4. Monitoring and logging:
   - Error tracking with Sentry
   - Performance monitoring
   - User analytics with PostHog
   - Firebase Analytics integration

5. Configuration files needed:
   - docker-compose.yml (local development)
   - .github/workflows/deploy.yml (CI/CD)
   - firebase.json (Firebase configuration)
   - .env.example (environment variables)

6. Scripts and utilities:
   - Development startup script
   - Database seeding script
   - Deployment script
   - Backup and restore utilities

Include proper environment separation and security best practices.
```

---

Copy each prompt above into your AI assistant to generate the complete frontend codebase. Start with prompt #1 (Project Structure) and work through them sequentially for best results.
