# My Expo App

## About the Project

This project is a mobile application developed using modern React Native technologies. It is built on the Expo platform and offers video processing and editing features.

## Technology Stack

### Core Technologies

- **React Native**: Mobile application development framework
- **Expo**: Development platform for React Native applications
- **TypeScript**: JavaScript superset providing type safety
- **Expo Router**: In-app navigation management

### User Interface

- **NativeWind/TailwindCSS**: CSS framework used for style management
- **Lucide React Native**: Modern and customizable icons
- **React Native Reanimated**: Library for advanced animations
- **React Native Gesture Handler**: Library for managing touch gestures

### State Management

- **Zustand**: Simple and effective state management library
- **React Query (TanStack Query)**: Server state management and data fetching library

### Form Management

- **React Hook Form**: High-performance form management solution

### Media Processing

- **Expo AV**: Audio and video processing
- **Expo Image Picker**: Media selection from gallery
- **Expo Media Library**: Media library access
- **FFmpeg Kit**: Video editing and processing

### Localization

- **i18next**: Multi-language support
- **Expo Localization**: Access to device language settings

### Storage

- **Async Storage**: Local data storage solution

## Project Structure

```
my-expo-app/
├── app/                  # Expo Router page files
├── assets/               # Images, fonts, and other static files
├── components/           # Reusable UI components
├── core/                 # Core functionality
├── hooks/                # Custom React hooks
├── models/               # Data models and types
├── store/                # Zustand state management
├── translation/          # Multi-language support files
└── utils/                # Helper functions
```

## Features

- Video recording and editing
- Video cropping and trimming
- Multi-language support (Turkish, English, French)
- Modern and user-friendly interface
- Responsive design

## Installation and Running

### Requirements

- Node.js (v16 or higher)
- Yarn package manager
- XCode for iOS (macOS)
- Android Studio for Android

### Installation Steps

1. Clone the project:

   ```bash
   git clone [repo-url]
   cd my-expo-app
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Start the application:

   4. Run prebuild to generate native projects:

   ```bash
   yarn prebuild
   ```

   This step is required before running on iOS or Android for the first time, or after adding native dependencies.

   ```bash
   # To run on iOS simulator
   yarn run ios

   # To run on Android emulator
   yarn run android

   # To start the development server
   yarn start
   ```

## Development

### Code Standards

- Code formatting and quality control with ESLint and Prettier
- Type safety with TypeScript
- Use of functional components and React Hooks

### Building and Distribution

Building and distribution can be done using Expo EAS (Expo Application Services):

## License

This project is licensed under [license name].
