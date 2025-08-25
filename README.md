# Coffee Brewing Assistant & Bean Logbook

A responsive mobile-first web app that helps you improve coffee brewing consistency by logging brew parameters and getting AI-powered suggestions for your next cup.

## Features

- **AI-Powered Suggestions (method-aware)**: Personalized grind size, ratio, time, and temperature tuned per brew method (espresso, pour-over, French press, moka pot)
- **Bean Management**: Store and manage profiles for different coffee beans
- **Brew Logging**: Track your brewing parameters and multi-select taste feedback
- **Method-Specific Forms & Validation**: Dynamic fields and ranges per method, with auto ratio calculation (e.g., Yield/Dose or Water/Dose)
- **Onboarding Flow**: Friendly first-run guide; auto-redirects new users to onboarding
- **Mobile-First Design**: Optimized for one-hand mobile input
- **Local Storage**: All data persists locally in your browser (with migration helpers)

## Core Screens

- **Home**: View AI suggestions for your next brew
- **Onboarding**: Quick setup flow for first-time users
- **Bean List**: Manage your coffee bean collection
- **Bean Profile**: View individual bean details and brew history
- **Brew Form**: Log new brews with detailed parameters (fields adapt to selected method)

## Setup Instructions

1. **Install Dependencies & Run**
   ```bash
   cd coffee-brewing-assistant
   npm install
   npm run dev
   ```

2. **Optional: Configure OpenAI API**
   - Create a `.env` file in the root directory
   - Add your OpenAI API key:
     ```
     REACT_APP_OPENAI_API_KEY=your_api_key_here
     ```
   - If no API key is provided, the app will use intelligent fallback rules

3. **Build & Preview for Production**
   ```bash
   npm run build
   npm run preview
   ```

4. **Deploy on Vercel**
   - Push to GitHub and connect to Vercel
   - No extra configuration needed - works out of the box

## AI Suggestion Engine

The app uses a hybrid approach for brewing suggestions and is method-aware:

### With OpenAI API
- Analyzes your last 3-5 brews
- Considers brew method, bean name, and taste feedback (supports array or single value for backward compatibility)
- Provides brief explanations for adjustments

### Fallback Rules (No API Key Required)
- Method-specific heuristics adjust grind, time, temperature, and ratio
- **Too Bitter**: Coarser grind, shorter time, cooler water (where applicable)
- **Too Sour**: Finer grind, longer time, hotter water (where applicable)
- **Balanced**: Minor optimizations to maintain quality

## Data Storage

- Uses browser localStorage for data persistence
- No external database required
- Data includes bean profiles, complete brew history, and AI suggestions
- Per-method suggestions stored per bean (with a legacy single-suggestion fallback)
- Migration helpers convert legacy coffee types and fields to the new method-based model

## Technology Stack

- **Frontend**: React 18 with React Router
- **Styling**: Tailwind CSS with custom coffee theme
- **AI Integration**: OpenAI GPT-3.5-turbo (optional)
- **Storage**: Browser localStorage

## Brew Methods Supported

- Espresso
- Pour-Over
- French Press
- Moka Pot

## Progressive Web App (PWA)

This app is installable and works offline:

### How to Verify PWA Features
- **Install**: Chrome shows "Install app" icon in address bar → click to install
- **Lighthouse PWA Audits**: Run Lighthouse to verify "Installable" and "Offline" pass
- **Offline Test**: Visit a few pages, then go offline; unknown routes fall back to `/offline.html`
- **iOS Safari**: Can "Add to Home Screen" and launches standalone

### Service Worker Updates
To force service worker refresh on new releases:
- Close the app completely
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Or clear site data in browser settings

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

## Changelog (recent)

- Added method-aware brewing model and dynamic forms/validation per method
- Added multi-select taste feedback and ratio auto-calculation display
- Added onboarding flow with automatic first-run redirect
- Added per-bean, per-method AI suggestions with legacy fallback storage
- Added local data migration helpers for legacy coffee types and brew fields

## Contributing

Feel free to submit issues and enhancement requests!
