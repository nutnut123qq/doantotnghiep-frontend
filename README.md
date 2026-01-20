# Stock Investment Frontend

Frontend application for Multi-Agent AI Stock Investment System built with ReactJS and TypeScript using Clean Architecture.

## Architecture

This project follows Clean Architecture principles with the following structure:

- **features/** - Feature-based modules (auth, trading-board, watchlist, etc.)
- **shared/** - Shared components, hooks, services, and utilities
- **infrastructure/** - API clients, storage, configuration
- **domain/** - Domain models and value objects
- **app/** - App configuration (store, router)

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_SIGNALR_URL=http://localhost:5000/hubs
   ```
   
   **Note:** Backend routes are prefixed with `/api`. Ensure `VITE_API_URL` includes `/api` suffix.

3. Run development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Features

- Authentication (Login/Register)
- Trading Board with real-time updates
- Watchlist management
- Chart integration
- News feed with AI summarization
- Alert management
- Customizable layouts
