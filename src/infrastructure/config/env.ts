export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  signalRUrl: import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5000/hubs',
}

