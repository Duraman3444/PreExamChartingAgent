# Medical Charting App - Frontend Application

A modern React TypeScript application for medical charting, AI-powered analysis, and comprehensive patient management with professional dark/light theme support.

## ✨ Current Features

### 🤖 **AI Agent Module**
- **Comprehensive Patient Analysis**: Advanced AI-powered analysis workflow
- **Patient Selection**: Support for both existing and new patient analysis
- **Intelligent Symptom Extraction**: AI identifies symptoms with confidence scoring
- **Differential Diagnosis**: Evidence-based diagnosis suggestions with ICD-10 codes
- **Treatment Recommendations**: Clinical decision support with priority levels
- **Risk Assessment**: Red flag detection and clinical alerts
- **Multi-tab Analysis Interface**: Structured presentation of AI findings

### 🎨 **Advanced Theme System**
- **Dynamic Dark/Light Theme**: Professional medical interface with instant switching
- **Persistent Theme State**: User preference saved and restored across sessions
- **Material-UI Integration**: Custom medical-appropriate color schemes
- **Brand Colors**: Orange/purple professional healthcare color palette
- **Responsive Design**: Theme-aware components across all devices

### 📋 **Patient & Visit Management**
- **12 Patient Profiles**: Comprehensive patient records across multiple specialties
- **Full Visit Lifecycle**: Track visits from scheduled to completed
- **Advanced Search**: Search by name, demographics, chief complaint
- **Medical History**: Medications, allergies, and condition tracking
- **Department Integration**: Multi-specialty patient management

### 🎤 **Transcript Processing**
- **Multi-format Upload**: MP3, WAV, M4A, MP4, TXT, DOCX, PDF support
- **In-app Viewer**: Full-screen modal with professional display
- **Real-time Editing**: Live editing with change tracking
- **Export Options**: PDF export with professional formatting
- **Cross-reference**: Link transcript sections to AI analysis

### 🔐 **Security & Authentication**
- **Role-based Access**: Doctor, Nurse, Admin user roles
- **Firebase Authentication**: Secure login with session management
- **Data Encryption**: End-to-end encryption for patient data
- **Audit Trail**: Complete action logging for compliance

## 🛠️ Tech Stack

### **Frontend Core**
- **React 18**: Modern component architecture with hooks
- **TypeScript**: Type-safe development with strict checking
- **Material-UI v5**: Professional healthcare UI components
- **Vite**: Lightning-fast build tool and development server
- **Zustand**: Lightweight state management for global state
- **React Router v6**: Client-side routing with protected routes

### **Styling & Design**
- **Material-UI Theming**: Custom dark/light theme implementation
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Specialized medical UI components
- **Responsive Design**: Mobile-first approach with breakpoints

### **Backend & Services**
- **Firebase Auth**: User authentication and role management
- **Firestore**: NoSQL document database for patient data
- **Firebase Storage**: Secure file storage for transcripts
- **OpenAI Integration**: Ready for GPT-4 medical analysis

### **Development Tools**
- **React Hook Form**: Form handling with validation
- **Date-fns**: Date manipulation and formatting
- **React Diff Viewer**: Transcript comparison and editing
- **React Hotkeys Hook**: Keyboard shortcuts for productivity

## 📁 Project Structure

```
app/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components (MedicalCard, theme-aware)
│   │   ├── layout/          # Layout components (Header, Sidebar, Layout)
│   │   ├── screening/       # Medical screening components
│   │   ├── vitals/          # Vitals recording components
│   │   └── verification/    # Data verification components
│   ├── pages/              # Main application pages
│   │   ├── AIAgent.tsx      # AI Agent analysis workflow
│   │   ├── AIAnalysis.tsx   # AI analysis results and management
│   │   ├── Dashboard.tsx    # Main dashboard with analytics
│   │   ├── Settings.tsx     # User settings and theme management
│   │   ├── PatientManagement.tsx # Patient records and management
│   │   ├── VisitManagement.tsx   # Visit tracking and lifecycle
│   │   ├── Transcripts.tsx       # Transcript management
│   │   └── [others]         # Additional pages
│   ├── stores/             # Zustand state management
│   │   ├── authStore.ts     # Authentication state
│   │   └── appStore.ts      # App state with theme management
│   ├── theme/              # Theme configuration
│   │   └── theme.ts         # Material-UI theme with dark/light support
│   ├── services/           # API services
│   │   ├── auth.ts          # Authentication service
│   │   ├── firebase.ts      # Firebase configuration
│   │   └── openai.ts        # OpenAI service (ready for integration)
│   ├── data/               # Shared data sources
│   │   └── mockData.ts      # Comprehensive patient and visit data
│   ├── types/              # TypeScript type definitions
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── constants/          # Application constants and routes
├── public/                 # Static assets
├── dist/                   # Production build output
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (for authentication and database)

### Installation

1. **Navigate to the app directory:**
   ```bash
   cd app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the app directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_OPENAI_API_KEY=your_openai_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   Navigate to `http://localhost:3000` (or the port shown in terminal)

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm run test
```

## 🌟 Key Features

### AI Agent Analysis
- **Patient Selection**: Choose existing patients or create new patient profiles
- **Comprehensive Analysis**: Extract symptoms, generate diagnoses, recommend treatments
- **Confidence Scoring**: AI reliability assessment with detailed reasoning
- **Clinical Decision Support**: Evidence-based recommendations with priority levels
- **Multi-tab Interface**: Organized presentation of analysis results

### Theme System
- **Dynamic Switching**: Instant dark/light theme toggle
- **Persistent State**: Theme preference saved across sessions
- **Material-UI Integration**: Professional medical color schemes
- **Responsive Design**: Theme-aware components across all devices

### Patient Management
- **12 Patient Profiles**: Complete medical histories across specialties
- **Visit Tracking**: Full visit lifecycle management
- **Advanced Search**: Search by multiple criteria
- **Medical History**: Comprehensive medication and allergy tracking
- **Department Integration**: Multi-specialty support

### Transcript Management
- **Multi-format Support**: Upload various file types with drag & drop
- **In-app Viewer**: Professional medical conversation display
- **Real-time Editing**: Live editing with change tracking
- **Export Options**: PDF export with professional formatting
- **Cross-reference**: Link to AI analysis findings

## 👥 User Roles

### **Doctor**
- Full access to all features
- Can review and approve AI recommendations
- Access to all patient records and analyses

### **Nurse**
- Access to patient records and visit management
- Can upload transcripts and view AI analysis
- Limited administrative functions

### **Admin**
- System administration and user management
- Access to analytics and reporting
- Can manage user roles and permissions

## 🔧 Development

### Code Style
- **ESLint**: Code linting with healthcare-specific rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking for safety
- **Husky**: Pre-commit hooks for code quality

### State Management
- **Zustand**: Global state for authentication and app settings
- **Local State**: Component-level state for UI interactions
- **Context API**: Theme and authentication context

### Routing
- **React Router v6**: Client-side navigation
- **Protected Routes**: Authentication-required pages
- **Role-based Access**: Different routes for different user roles

### API Integration
- **Firebase SDK**: Authentication and database operations
- **OpenAI API**: AI analysis service (ready for integration)
- **Error Handling**: Comprehensive error handling and user feedback

## 📊 Performance Features

### Optimization
- **Code Splitting**: Lazy loading for optimal performance
- **Bundle Analysis**: Webpack bundle analyzer for optimization
- **Image Optimization**: Compressed images and lazy loading
- **Caching**: Intelligent caching strategies

### Monitoring
- **Error Tracking**: Real-time error monitoring
- **Performance Metrics**: Core web vitals tracking
- **User Analytics**: Usage patterns and feature adoption

## 🔒 Security

### Authentication
- **Firebase Auth**: Secure user authentication
- **Role-based Access**: Granular permissions
- **Session Management**: Secure session handling
- **Password Policies**: Strong password requirements

### Data Protection
- **Encryption**: End-to-end data encryption
- **Secure Storage**: Encrypted local storage
- **HTTPS**: All communications over HTTPS
- **HIPAA Compliance**: Healthcare data protection standards

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: Page-level functionality testing
- **E2E Tests**: Complete user workflow testing
- **Accessibility Tests**: WCAG compliance testing

### Testing Tools
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities
- **Cypress**: End-to-end testing framework
- **Lighthouse**: Performance and accessibility auditing

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Firebase Hosting
```bash
firebase deploy
```

### Environment Configuration
- **Development**: Local development with hot reloading
- **Staging**: Pre-production testing environment
- **Production**: Live deployment with monitoring

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper testing
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Ensure accessibility compliance
- Follow Material-UI design principles
- Maintain medical accuracy in all content

## 📚 Documentation

### Available Documentation
- **API Documentation**: Service and utility function docs
- **Component Library**: Storybook documentation
- **User Guide**: End-user documentation
- **Development Guide**: Developer onboarding

### Medical Accuracy
- All clinical content reviewed by medical professionals
- Regular updates based on medical best practices
- Compliance with healthcare documentation standards

## 🎯 Roadmap

### Next Features
- **Real AI Integration**: OpenAI GPT-4 API integration
- **Speech-to-Text**: Audio transcription processing
- **Advanced Analytics**: Comprehensive reporting dashboard
- **Mobile App**: Native mobile application

### Long-term Goals
- **EHR Integration**: Connect with major EHR systems
- **Multi-language Support**: Internationalization
- **Offline Capability**: Offline-first functionality
- **Advanced Search**: Full-text search across all data

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏥 Medical Disclaimer

This application is for educational and demonstration purposes only. It is not intended for actual clinical use without proper medical validation and regulatory approval. Always consult with qualified medical professionals for clinical decision-making.

---

**Live Demo**: [https://medicalchartingapp.web.app](https://medicalchartingapp.web.app)

*Transforming healthcare documentation through intelligent AI analysis and modern web technologies.*

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Firebase account and project
- **OpenAI API account and API key**

### 1. Clone and Install

```bash
git clone [repository-url]
cd PreExamChartingAgent
npm install
cd app
npm install
```

### 2. Configure OpenAI API (Required for AI Features)

1. **Get your OpenAI API key**:
   - Sign up at [https://platform.openai.com](https://platform.openai.com)
   - Navigate to API Keys section
   - Create a new secret key
   - Copy the key (starts with `sk-`)

2. **Add to environment variables**:
   ```bash
   # In app/.env file
   VITE_OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

3. **Verify your OpenAI account has access to**:
   - GPT-4 (for medical analysis)
   - Whisper (for speech-to-text)

### 3. Configure Firebase (Already set up)

The Firebase configuration is already included in the `.env` file.

### 4. Run the Application

```bash
# From the app directory
npm run dev
```

### 5. Test AI Integration

1. **Test AI Agent**:
   - Navigate to AI Agent tab
   - Select an existing patient or create new patient
   - Fill in symptoms/complaints
   - Click "Run AI Analysis"
   - Should see real GPT-4 analysis results

2. **Test Speech-to-Text**:
   - Go to Transcripts → Upload
   - Upload an audio file (.mp3, .wav, .m4a)
   - Should see real Whisper transcription

3. **Test Transcript Analysis**:
   - Go to AI Analysis
   - Upload or paste a medical transcript
   - Should see comprehensive GPT-4 analysis

## 🔍 AI Integration Features

### Real OpenAI Integration

- **GPT-4 Medical Analysis**: 
  - Symptom extraction with confidence scores
  - Differential diagnosis with ICD-10 codes
  - Treatment recommendations with evidence levels
  - Clinical concerns and red flags

- **Whisper Speech-to-Text**:
  - High-accuracy medical transcription
  - Speaker identification
  - Timestamp segmentation
  - Medical terminology tagging

### Fallback Behavior

- If OpenAI API key is not configured, the system shows helpful error messages
- If API calls fail, graceful fallback to mock data with clear error indicators
- Clear instructions for configuration in the UI

## 🚨 Important Notes

### Security Considerations

⚠️ **Current Implementation**: The OpenAI API is called directly from the browser with `dangerouslyAllowBrowser: true`. This is for demonstration purposes only.

**For Production**: 
- Move OpenAI API calls to a secure backend service
- Never expose API keys in client-side code
- Implement proper rate limiting and usage monitoring

### API Usage & Costs

- GPT-4 API calls cost approximately $0.01-0.06 per analysis
- Whisper API calls cost $0.006 per minute of audio
- Monitor your OpenAI usage dashboard regularly
- Consider implementing usage limits for cost control

### Medical Disclaimer

This application is for educational/demonstration purposes only. AI-generated medical analysis should always be reviewed by qualified healthcare professionals. Not intended for actual medical diagnosis or treatment.

## 📊 Testing the Integration

### Expected Behavior

1. **With API Key Configured**:
   - Real AI analysis with medical insights
   - Accurate audio transcription
   - Confidence scores from actual AI models

2. **Without API Key**:
   - Clear error messages prompting configuration
   - Fallback to mock data with configuration instructions
   - System remains functional for testing UI

### Common Issues

1. **"OpenAI API key not configured"**: Add your API key to `.env` file
2. **API errors**: Check your OpenAI account has sufficient credits
3. **Rate limiting**: OpenAI has rate limits - wait a moment and retry
4. **Audio format errors**: Ensure audio files are in supported formats

## 🛠 Development

### File Structure

```
app/src/services/
├── openai.ts          # Real OpenAI integration
├── fileUpload.ts      # File processing with Whisper
└── auth.ts           # Authentication service

app/src/pages/
├── AIAgent.tsx       # Real AI analysis interface
├── AIAnalysis.tsx    # Transcript analysis
└── TranscriptUpload.tsx  # Audio transcription
```

### Key Implementation Details

- **Real vs Mock**: System automatically detects API configuration
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Type Safety**: Full TypeScript support for OpenAI responses
- **Performance**: Efficient API usage with progress indicators

## 🎯 Next Steps

1. **Configure your OpenAI API key** (most important)
2. **Test all AI features** to ensure integration works
3. **Monitor API usage** to control costs
4. **Consider backend implementation** for production use
5. **Customize analysis prompts** for specific medical specialties

---

**Ready to use real medical AI!** 🎉

Configure your OpenAI API key and experience the power of GPT-4 medical analysis and Whisper speech-to-text integration. 