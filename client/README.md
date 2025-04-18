# AutoJobber Client

Frontend application for AutoJobber - an AI-powered job application management platform.

## Features

- View and manage job applications
- Track application statuses
- Upload and manage resume
- Set job preferences
- View application statistics

## Technologies Used

- React
- TypeScript
- React Router
- Formik (for forms)
- Tailwind CSS (for styling)
- Axios (for API requests)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the client directory:
   ```
   cd AutoJobber/client
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Running the Development Server

```
npm start
```
or
```
yarn start
```

The application will be available at http://localhost:3000.

## Project Structure

- `src/components/` - React components
- `src/index.tsx` - Application entry point
- `src/App.tsx` - Main application component
- `src/index.css` - Global styles

## Component Overview

- `JobApplicationsList.tsx` - Displays a list of job applications with sorting and filtering
- `ProfileSummary.tsx` - Shows user profile and application statistics
- `JobPreferencesForm.tsx` - Form for setting job search preferences
- `ResumeUpload.tsx` - Component for uploading and managing resume
- `Navigation.tsx` - Application navigation bar

## Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## License

MIT 