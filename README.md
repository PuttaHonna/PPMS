# Get Set Grow! (PPM Dashboard)

A React+TypeScript application designed to boost productivity with an interactive 3D gaming-inspired interface. The dashboard allows users to manage tasks effectively using various tailored views like an Eisenhower Matrix, a Graph network view, interactive notes, and gamified task tracking features.

## ✨ Features

- **Gamified Task Management**: Earn XP while completing tasks.
- **Multiple Interactive Views**:
  - **List View**: Traditional, ordered task list with search functionality.
  - **Eisenhower Matrix**: Organize tasks by urgency and importance.
  - **Calendar**: Keep track of task deadlines.
  - **Graph View**: Visual map of connected tasks and ideas.
  - **Notes**: Built-in simple note-taking system.
- **3D Interactive Backgrounds**: Enjoy a soothing and futuristic 3D background using React Three Fiber.
- **XP Shop**: Gain XP from daily activities and redeem them.
- **Secure Authentication**: Backend login system managed with Firebase.

## 🛠️ Tech Stack

- **Frontend Framework**: React 19, TypeScript, Vite
- **State Management**: Zustand
- **3D Graphics & Animations**: Three.js, React Three Fiber, React Three Drei, Framer Motion
- **Styling**: Tailwind CSS
- **Backend & Auth**: Firebase
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd ppm-dashboard
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

Create a `.env` or `.env.local` file in the root directory and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running the App Locally

To start the Vite development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## 📦 Building for Production

To create a production-ready build:
```bash
npm run build
```
You can preview the built app using:
```bash
npm run preview
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is licensed under the MIT License.
