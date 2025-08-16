# Coffee Brewing Assistant & Bean Logbook

A responsive mobile-first web app that helps you improve coffee brewing consistency by logging brew parameters and getting AI-powered suggestions for your next cup.

## Features

- **AI-Powered Suggestions**: Get personalized grind size, water ratio, and brew time recommendations
- **Bean Management**: Store and manage profiles for different coffee beans
- **Brew Logging**: Track your brewing parameters and taste feedback
- **Mobile-First Design**: Optimized for one-hand mobile input
- **Local Storage**: All data persists locally in your browser

## Core Screens

- **Home**: View AI suggestions for your next brew
- **Bean List**: Manage your coffee bean collection
- **Bean Profile**: View individual bean details and brew history
- **Brew Form**: Log new brews with detailed parameters

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd coffee-brewing-assistant
   npm install
   ```

2. **Optional: Configure OpenAI API**
   - Create a `.env` file in the root directory
   - Add your OpenAI API key:
     ```
     REACT_APP_OPENAI_API_KEY=your_api_key_here
     ```
   - If no API key is provided, the app will use intelligent fallback rules

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## AI Suggestion Engine

The app uses a hybrid approach for brewing suggestions:

### With OpenAI API
- Analyzes your last 3-5 brews
- Considers coffee type and taste feedback
- Provides detailed explanations for adjustments

### Fallback Rules (No API Key Required)
- **Too Bitter**: Coarser grind, shorter time
- **Too Sour**: Finer grind, longer time
- **Balanced**: Minor optimizations to maintain quality

## Data Storage

- Uses browser localStorage for data persistence
- No external database required
- Data includes bean profiles and complete brew history

## Technology Stack

- **Frontend**: React 18 with React Router
- **Styling**: Tailwind CSS with custom coffee theme
- **AI Integration**: OpenAI GPT-3.5-turbo (optional)
- **Storage**: Browser localStorage

## Coffee Types Supported

- Espresso
- Americano
- Latte
- Cappuccino
- Pour Over
- French Press
- AeroPress

## Browser Compatibility

- Modern browsers with localStorage support
- Responsive design for mobile and desktop
- Progressive Web App features

## Development

The app follows React best practices with:
- Component-based architecture
- Custom hooks for data management
- Mobile-first responsive design
- Accessible UI components

## Contributing

Feel free to submit issues and enhancement requests!
