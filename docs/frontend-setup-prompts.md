# Frontend Setup Prompts for AI-Powered Visit Transcript Analysis 🎯

*Comprehensive collection of prompts for building the Visit Transcript Analysis & Diagnosis Assistance platform frontend using React, TypeScript, and modern development practices.*

---

## Project Overview Prompts

### 1. Initial Project Setup

```
Create a React TypeScript application for an AI-powered visit transcript analysis platform that helps healthcare providers analyze patient visit recordings, extract symptoms, generate differential diagnoses, and provide treatment recommendations. The system should:

- Process audio/text files of patient visits
- Use AI to extract symptoms and medical history
- Generate differential diagnoses with confidence scores
- Provide evidence-based treatment recommendations
- Flag potential risks and red flags
- Generate visit documentation
- Maintain HIPAA compliance

Tech Stack:
- React 18 with TypeScript
- Vite for build tooling
- Material-UI (MUI) for components
- React Query for state management
- React Hook Form for form handling
- Firebase for backend (Auth, Firestore, Storage)
- OpenAI API for AI analysis
- Tailwind CSS for styling

Set up the project structure with proper TypeScript configuration, ESLint, Prettier, and include necessary dependencies.
```

### 2. Core Architecture Setup

```
Set up the core architecture for the AI-powered visit transcript analysis platform:

1. Configure React Router for these main routes:
   - /login - Authentication
   - /dashboard - Main dashboard with analytics
   - /visits - Visit management
   - /visit/:id - Individual visit details
   - /transcript-upload - Upload audio/text files
   - /ai-analysis/:id - AI analysis results
   - /visit-notes/:id - Generated documentation

2. Create a proper folder structure:
   - components/ (ui components)
   - pages/ (route components)
   - hooks/ (custom hooks)
   - services/ (API services)
   - stores/ (state management)
   - types/ (TypeScript types)
   - utils/ (utility functions)

3. Set up Firebase configuration with proper environment variables
4. Configure authentication with Firebase Auth
5. Set up Firestore collections for patients, visits, ai-analysis, visit-notes
6. Configure error boundaries and loading states
```

---

## Authentication & Security Prompts

### 3. Authentication System

```
Create a secure authentication system for healthcare providers:

1. Login page with email/password authentication
2. Role-based access control (doctor, nurse, admin)
3. Session management with automatic logout
4. Password reset functionality
5. Multi-factor authentication support
6. HIPAA-compliant security measures

Components needed:
- LoginForm with validation
- ProtectedRoute wrapper
- AuthProvider context
- UserProfile component
- PasswordReset component

Include proper error handling, loading states, and accessibility features.
```

### 4. Security Implementation

```
Implement comprehensive security measures for the healthcare application:

1. Input validation and sanitization
2. XSS protection
3. CSRF protection
4. Secure API communication
5. PHI data encryption
6. Audit logging for all user actions
7. IP allowlisting for sensitive operations
8. Session timeout management

Create security utilities, validation schemas, and audit logging hooks.
```

---

## File Upload & Processing Prompts

### 5. File Upload Interface

```
Create a sophisticated file upload interface for visit transcripts:

1. Drag-and-drop file upload with progress tracking
2. Support for multiple file types:
   - Audio: MP3, WAV, M4A, MP4, AAC
   - Text: TXT, DOCX, PDF
3. File validation (size, type, format)
4. Preview functionality for uploaded files
5. Batch upload capability
6. Upload queue management
7. Error handling and retry logic

Components:
- FileUploadZone (drag-and-drop)
- FilePreview (file details)
- UploadProgress (progress tracking)
- FileValidator (validation logic)
- UploadQueue (batch management)

Include proper TypeScript types, error states, and accessibility features.
```

### 6. Audio Player Component

```
Build a medical-grade audio player for transcript analysis:

1. Custom audio player with medical-specific features:
   - Playback speed control (0.5x to 2x)
   - Skip forward/backward by 10-30 seconds
   - Waveform visualization
   - Timestamp markers
   - Speaker identification highlights
   - Confidence score indicators

2. Integration with transcript text:
   - Synchronized highlighting
   - Click-to-seek functionality
   - Bookmark important sections
   - Add notes/annotations

3. Keyboard shortcuts for efficiency:
   - Spacebar: play/pause
   - Arrow keys: seek
   - Number keys: speed control

Create AudioPlayer, WaveformDisplay, and TranscriptSync components.
```

---

## AI Analysis Interface Prompts

### 7. AI Analysis Dashboard

```
Create a comprehensive AI analysis dashboard that displays:

1. Analysis Status Panel:
   - Processing stages (transcription, symptom extraction, diagnosis)
   - Progress indicators with estimated completion times
   - Real-time updates using WebSocket or polling
   - Error states and retry options

2. Symptom Extraction Results:
   - Structured symptom list with confidence scores
   - Severity indicators (mild, moderate, severe)
   - Duration and frequency information
   - Source text highlighting

3. Differential Diagnosis Display:
   - Ranked list of potential diagnoses
   - Probability scores with visual indicators
   - ICD-10 codes
   - Supporting/contradicting evidence
   - Expandable details for each diagnosis

4. Treatment Recommendations:
   - Evidence-based treatment options
   - Priority levels (urgent, high, medium, low)
   - Contraindications and warnings
   - Alternative treatments
   - Monitoring requirements

Components: AnalysisStatus, SymptomExtraction, DiagnosisList, TreatmentRecommendations
```

### 8. Interactive Diagnosis Interface

```
Build an interactive interface for reviewing and refining AI diagnoses:

1. Diagnosis Cards:
   - Expandable cards for each potential diagnosis
   - Confidence meters with color coding
   - Supporting evidence bullets
   - Clickable medical terms with definitions
   - Ability to accept/reject/modify diagnoses

2. Comparison View:
   - Side-by-side comparison of top diagnoses
   - Differential diagnosis table
   - Symptom matrix view
   - Evidence strength indicators

3. Provider Input Panel:
   - Add clinical notes
   - Adjust confidence scores
   - Add additional diagnoses
   - Flag for second opinion
   - Save draft vs final analysis

4. Reference Integration:
   - Links to medical literature
   - Guidelines and protocols
   - Drug interaction checker
   - Allergy cross-reference

Create DiagnosisCard, ComparisonView, ProviderInput, and ReferencePanel components.
```

---

## Data Visualization Prompts

### 9. Analytics Dashboard

```
Create a comprehensive analytics dashboard for the AI analysis platform:

1. Key Performance Indicators:
   - Total analyses completed
   - Average processing time
   - AI accuracy metrics
   - Provider satisfaction scores
   - Cost savings from AI assistance

2. Trend Analysis:
   - Analysis volume over time
   - Diagnostic accuracy trends
   - Processing time improvements
   - Common symptoms/diagnoses
   - Provider usage patterns

3. Quality Metrics:
   - Confidence score distributions
   - Provider override rates
   - Second opinion requests
   - Diagnosis change frequency
   - Follow-up outcome tracking

4. Interactive Charts:
   - Line charts for trends
   - Bar charts for comparisons
   - Pie charts for distributions
   - Heatmaps for patterns
   - Scatter plots for correlations

Use Chart.js or D3.js for visualizations. Include filtering, date range selection, and export functionality.
```

### 10. Patient History Visualization

```
Build a patient history visualization component:

1. Timeline View:
   - Chronological visit history
   - Symptom progression over time
   - Treatment effectiveness tracking
   - Key events and milestones
   - Medication changes

2. Symptom Tracker:
   - Symptom severity over time
   - Frequency patterns
   - Trigger identification
   - Correlation analysis
   - Visual symptom mapping

3. Treatment Response:
   - Treatment timeline
   - Outcome measurements
   - Side effect tracking
   - Adherence monitoring
   - Cost effectiveness

Components: PatientTimeline, SymptomTracker, TreatmentResponse, HistoryFilter
```

---

## Advanced Features Prompts

### 11. Real-time Collaboration

```
Implement real-time collaboration features for healthcare teams:

1. Live Analysis Sharing:
   - Share analysis results in real-time
   - Multi-provider review sessions
   - Synchronized cursor/highlighting
   - Live comments and annotations
   - Voice/video integration

2. Consultation Features:
   - Request second opinions
   - Specialist referral integration
   - Case discussion threads
   - File sharing and attachments
   - Meeting scheduler integration

3. Notification System:
   - Real-time alerts for urgent cases
   - Assignment notifications
   - Deadline reminders
   - Analysis completion alerts
   - System status updates

Use WebSocket or Firebase real-time features. Create CollaborationPanel, NotificationCenter, and ConsultationView components.
```

### 12. Mobile-Responsive Design

```
Create a mobile-responsive version of the AI analysis platform:

1. Responsive Layout:
   - Adaptive navigation (hamburger menu)
   - Touch-friendly interfaces
   - Optimized for tablet/phone screens
   - Swipe gestures for navigation
   - Collapsible sections

2. Mobile-Specific Features:
   - Voice recording capability
   - Camera integration for document capture
   - Offline mode for viewing analyses
   - Push notifications
   - Biometric authentication

3. Performance Optimization:
   - Lazy loading for mobile
   - Image compression
   - Efficient data loading
   - Caching strategies
   - Progressive web app features

Use CSS Grid, Flexbox, and media queries. Implement touch events and mobile-specific UX patterns.
```

---

## Integration Prompts

### 13. EHR Integration Interface

```
Build an interface for EHR system integration:

1. EHR Connection Panel:
   - Configure EHR system endpoints
   - Authentication setup
   - Data mapping configuration
   - Sync status monitoring
   - Error handling and retry logic

2. Data Import/Export:
   - Import patient data from EHR
   - Export analysis results to EHR
   - Bi-directional sync configuration
   - Conflict resolution interface
   - Data validation and cleansing

3. Integration Dashboard:
   - Connection status indicators
   - Sync statistics
   - Error logs and alerts
   - Performance metrics
   - Configuration management

Components: EHRConnector, DataSync, IntegrationStatus, ConfigurationPanel
```

### 14. API Integration Components

```
Create reusable components for API integrations:

1. OpenAI Integration:
   - API key management
   - Usage monitoring
   - Rate limit handling
   - Error recovery
   - Response streaming

2. Speech-to-Text Integration:
   - Multiple provider support (Google, Azure, AWS)
   - Real-time transcription
   - Speaker identification
   - Confidence scoring
   - Language detection

3. Firebase Integration:
   - Authentication management
   - Firestore operations
   - File storage handling
   - Real-time updates
   - Offline capabilities

Create service classes, hooks, and utility functions for each integration.
```

---

## Testing & Quality Prompts

### 15. Testing Strategy

```
Implement comprehensive testing for the AI analysis platform:

1. Unit Tests:
   - Component testing with React Testing Library
   - Hook testing
   - Utility function testing
   - API service testing
   - State management testing

2. Integration Tests:
   - API integration testing
   - Firebase integration testing
   - Authentication flow testing
   - File upload testing
   - Real-time features testing

3. E2E Tests:
   - Critical user journeys
   - Cross-browser testing
   - Mobile testing
   - Performance testing
   - Accessibility testing

4. AI-Specific Tests:
   - Mock AI responses
   - Error handling scenarios
   - Confidence score validation
   - Edge case handling
   - Performance benchmarks

Set up Jest, React Testing Library, Cypress, and testing utilities.
```

### 16. Performance Optimization

```
Optimize the AI analysis platform for performance:

1. Code Splitting:
   - Route-based code splitting
   - Component lazy loading
   - Dynamic imports
   - Bundle analysis
   - Tree shaking optimization

2. Data Optimization:
   - Efficient data fetching
   - Caching strategies
   - Pagination implementation
   - Virtual scrolling
   - Memoization techniques

3. AI Processing Optimization:
   - Streaming responses
   - Progressive loading
   - Background processing
   - Parallel processing
   - Queue management

4. User Experience:
   - Loading states
   - Skeleton screens
   - Error boundaries
   - Retry mechanisms
   - Offline support

Implement performance monitoring, bundle analysis, and optimization techniques.
```

---

## Deployment & DevOps Prompts

### 17. CI/CD Pipeline

```
Set up a comprehensive CI/CD pipeline for the AI analysis platform:

1. GitHub Actions Workflow:
   - Automated testing on pull requests
   - Code quality checks (ESLint, Prettier)
   - Type checking with TypeScript
   - Build optimization
   - Security scanning

2. Environment Management:
   - Development environment setup
   - Staging environment configuration
   - Production deployment process
   - Environment variable management
   - Feature flag implementation

3. Deployment Strategy:
   - Blue-green deployment
   - Rolling updates
   - Rollback procedures
   - Health checks
   - Monitoring and alerting

4. Docker Configuration:
   - Multi-stage builds
   - Production optimization
   - Security hardening
   - Health check endpoints
   - Resource management

Create GitHub Actions workflows, Docker files, and deployment scripts.
```

### 18. Production Monitoring

```
Implement comprehensive monitoring for the production AI analysis platform:

1. Application Monitoring:
   - Error tracking (Sentry or similar)
   - Performance monitoring
   - User analytics
   - Feature usage tracking
   - Conversion funnel analysis

2. Infrastructure Monitoring:
   - Server metrics
   - Database performance
   - API response times
   - CDN performance
   - Third-party service health

3. AI-Specific Monitoring:
   - AI processing times
   - Confidence score distributions
   - Error rates by analysis type
   - Provider feedback metrics
   - Cost monitoring

4. Alerting System:
   - Real-time alerts for critical issues
   - Escalation procedures
   - On-call rotation management
   - Incident response playbooks
   - Post-incident analysis

Set up monitoring dashboards, alerting rules, and incident response procedures.
```

---

## Documentation & Training Prompts

### 19. User Documentation

```
Create comprehensive user documentation for the AI analysis platform:

1. User Guides:
   - Getting started guide
   - Feature walkthroughs
   - Best practices guide
   - Troubleshooting guide
   - FAQ section

2. Video Tutorials:
   - Platform overview
   - File upload process
   - AI analysis review
   - Collaboration features
   - Advanced features

3. API Documentation:
   - Integration guides
   - Code examples
   - SDK documentation
   - Webhook documentation
   - Authentication guides

4. Training Materials:
   - Onboarding checklist
   - Feature training modules
   - Certification program
   - Webinar series
   - Knowledge base

Create interactive documentation with search, filtering, and feedback mechanisms.
```

### 20. Developer Documentation

```
Create technical documentation for developers:

1. Architecture Documentation:
   - System architecture overview
   - Component hierarchy
   - Data flow diagrams
   - API architecture
   - Security architecture

2. Code Documentation:
   - TypeScript interfaces
   - Component API documentation
   - Hook usage examples
   - Utility function docs
   - Testing guidelines

3. Development Guides:
   - Setup instructions
   - Coding standards
   - Git workflow
   - Testing strategies
   - Deployment procedures

4. Contribution Guidelines:
   - Code review process
   - Pull request templates
   - Issue templates
   - Feature request process
   - Bug reporting guidelines

Use tools like Storybook, TypeDoc, and documentation generators.
```

---

## Accessibility & Compliance Prompts

### 21. Accessibility Implementation

```
Implement comprehensive accessibility features:

1. WCAG 2.1 AA Compliance:
   - Keyboard navigation
   - Screen reader support
   - Color contrast compliance
   - Focus management
   - Alternative text for images

2. Healthcare-Specific Accessibility:
   - Large font options
   - High contrast mode
   - Voice control support
   - Gesture navigation
   - Assistive technology integration

3. Accessibility Testing:
   - Automated accessibility testing
   - Manual testing procedures
   - Screen reader testing
   - Keyboard testing
   - User testing with disabilities

4. Accessibility Components:
   - Accessible form controls
   - ARIA labels and roles
   - Focus indicators
   - Skip navigation links
   - Error announcements

Create accessibility utilities, testing tools, and compliance documentation.
```

### 22. HIPAA Compliance

```
Ensure HIPAA compliance throughout the application:

1. Data Protection:
   - PHI encryption at rest and in transit
   - Access controls and authentication
   - Audit logging for all PHI access
   - Data retention policies
   - Secure data disposal

2. User Interface Compliance:
   - Privacy notices
   - Consent management
   - Data access controls
   - Session management
   - Screen protection

3. Technical Safeguards:
   - Unique user identification
   - Automatic logoff
   - Encryption standards
   - Access monitoring
   - Integrity controls

4. Administrative Safeguards:
   - Security officer designation
   - Workforce training
   - Incident response procedures
   - Risk assessment
   - Business associate agreements

Implement HIPAA compliance checks, privacy controls, and audit mechanisms.
```

---

## Maintenance & Updates Prompts

### 23. Version Management

```
Implement a robust version management system:

1. Feature Flags:
   - Gradual feature rollout
   - A/B testing capabilities
   - User segment targeting
   - Kill switches for problematic features
   - Performance impact monitoring

2. Update Management:
   - Automatic update notifications
   - Version compatibility checks
   - Migration scripts
   - Rollback procedures
   - Update scheduling

3. Configuration Management:
   - Environment-specific configurations
   - Feature toggles
   - API endpoint management
   - Third-party service configuration
   - Security policy updates

4. Change Management:
   - Change approval workflows
   - Impact assessment
   - User communication
   - Training updates
   - Documentation updates

Create version control utilities, feature flag management, and update procedures.
```

### 24. Long-term Maintenance

```
Plan for long-term maintenance and evolution:

1. Code Maintenance:
   - Regular dependency updates
   - Security vulnerability patches
   - Performance optimizations
   - Code refactoring
   - Technical debt management

2. Feature Evolution:
   - User feedback integration
   - Market trend analysis
   - Competitive feature analysis
   - Innovation roadmap
   - Deprecation planning

3. Scalability Planning:
   - Load testing
   - Performance benchmarking
   - Infrastructure scaling
   - Database optimization
   - CDN optimization

4. Support Systems:
   - Help desk integration
   - Bug reporting system
   - Feature request tracking
   - User feedback collection
   - Community forums

Establish maintenance schedules, monitoring systems, and evolution planning processes.
```

---

## Usage Guidelines

### How to Use These Prompts

1. **Sequential Development**: Use prompts in order for systematic development
2. **Customization**: Adapt prompts to your specific requirements
3. **Integration**: Combine multiple prompts for complex features
4. **Iteration**: Refine implementations based on feedback
5. **Documentation**: Keep track of implemented features

### Best Practices

1. **Start with Core Features**: Begin with authentication and basic functionality
2. **Iterate Quickly**: Build MVPs and gather feedback
3. **Test Thoroughly**: Implement testing at each stage
4. **Monitor Performance**: Track metrics and optimize continuously
5. **Stay Compliant**: Ensure HIPAA compliance throughout development

### Prompt Customization

- Replace placeholder values with your specific requirements
- Adjust technical specifications based on your stack
- Modify UI/UX requirements for your brand
- Update compliance requirements for your jurisdiction
- Scale complexity based on your timeline and resources

---

This comprehensive collection of prompts provides a structured approach to building a sophisticated AI-powered visit transcript analysis platform while maintaining high standards for security, accessibility, and healthcare compliance.
