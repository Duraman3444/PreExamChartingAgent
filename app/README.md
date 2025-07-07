# Medical Charting App

A modern React TypeScript application for medical charting and patient management.

## Features

- **Patient Management**: Create, view, and manage patient records
- **Screening Forms**: Customizable screening questionnaires
- **Vitals Recording**: Track and monitor patient vital signs
- **Chart Notes**: Create and manage medical chart notes
- **User Authentication**: Role-based access control (Doctor, Nurse, Admin)
- **Responsive Design**: Mobile-friendly interface built with Material-UI

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: Material-UI v5
- **State Management**: Zustand
- **Routing**: React Router v6
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Styling**: Tailwind CSS, Material-UI
- **Forms**: React Hook Form
- **Date Handling**: date-fns
- **Diff Viewer**: react-diff-viewer
- **Keyboard Shortcuts**: react-hotkeys-hook

## Project Structure

```
app/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   ├── screening/       # Screening-related components
│   │   ├── vitals/          # Vitals recording components
│   │   ├── verification/    # Verification components
│   │   └── layout/          # Layout components (Header, Sidebar, Layout)
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services and Firebase config
│   ├── stores/             # Zustand stores
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── constants/          # Application constants
├── public/                 # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project (for authentication and database)

### Installation

1. **Clone the repository and navigate to the app directory:**
   ```bash
   cd app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm run test
```

## Firebase Setup

1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Authentication and choose your sign-in methods
3. Create a Firestore database
4. Get your Firebase configuration and update the `.env` file

## User Roles

- **Doctor**: Full access to all features
- **Nurse**: Access to patient records, vitals, and basic charting
- **Admin**: System administration and user management

## Key Features

### Authentication
- Email/password authentication with Firebase
- Role-based access control
- Persistent login state

### Patient Management
- Create and manage patient profiles
- Search and filter patients
- View patient history and records

### Screening
- Customizable screening questionnaires
- Support for various question types (yes/no, text, multiple choice, scale)
- Progress tracking and completion status

### Vitals Recording
- Record vital signs (temperature, blood pressure, heart rate, etc.)
- Visual indicators for abnormal readings
- Historical tracking and trends

### Chart Notes
- Create and edit medical chart notes
- Categorize notes (assessment, plan, progress, discharge)
- Version control and change tracking

## Development

### Code Style
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

### State Management
- Zustand for global state management
- Separate stores for different domains (auth, app, etc.)

### Routing
- React Router v6 for navigation
- Protected routes for authenticated users
- Role-based route access

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 