import * as signalR from '@microsoft/signalr'
import { config } from '@/infrastructure/config/env'
import { storage } from '@/infrastructure/storage/localStorage'

/**
 * Singleton SignalR connection manager
 * Reuses connections for the same hubName to avoid multiple WebSocket connections
 */
class SignalRManager {
  private connections = new Map<string, signalR.HubConnection>()
  private refCounts = new Map<string, number>()
  private connectionStateListeners = new Map<string, Set<(connected: boolean) => void>>()

  getConnection(hubName: string): signalR.HubConnection | null {
    return this.connections.get(hubName) || null
  }

  async getOrCreateConnection(hubName: string): Promise<signalR.HubConnection> {
    let connection = this.connections.get(hubName)

    if (!connection || connection.state === signalR.HubConnectionState.Disconnected) {
      connection = new signalR.HubConnectionBuilder()
        .withUrl(`${config.signalRUrl}/${hubName}`, {
          withCredentials: false,
          accessTokenFactory: () => {
            const token = storage.get<string>('token')
            return token ?? ''
          }
        })
        .withAutomaticReconnect()
        .configureLogging(
          import.meta.env.DEV
            ? signalR.LogLevel.Warning
            : signalR.LogLevel.Information
        )
        .build()

      // Set up connection state listeners
      connection.onclose(() => this.notifyStateListeners(hubName, false))
      connection.onreconnecting(() => this.notifyStateListeners(hubName, false))
      connection.onreconnected(() => this.notifyStateListeners(hubName, true))

      this.connections.set(hubName, connection)

      // Start connection
      try {
        await connection.start()
        this.notifyStateListeners(hubName, true)
      } catch (err) {
        if (
          err instanceof Error &&
          err.name !== 'AbortError' &&
          !err.message?.includes('stopped during negotiation')
        ) {
          console.error(`Error connecting to ${hubName}:`, err)
        }
        this.notifyStateListeners(hubName, false)
      }
    }

    // Increment ref count
    const currentCount = this.refCounts.get(hubName) || 0
    this.refCounts.set(hubName, currentCount + 1)

    return connection
  }

  releaseConnection(hubName: string): void {
    const currentCount = this.refCounts.get(hubName) || 0
    const newCount = Math.max(0, currentCount - 1)
    this.refCounts.set(hubName, newCount)

    // If no more references, stop and remove connection
    if (newCount === 0) {
      const connection = this.connections.get(hubName)
      if (connection) {
        if (connection.state !== signalR.HubConnectionState.Disconnected) {
          connection.stop().catch(() => {})
        }
        this.connections.delete(hubName)
        this.connectionStateListeners.delete(hubName)
      }
    }
  }

  addStateListener(hubName: string, listener: (connected: boolean) => void): () => void {
    if (!this.connectionStateListeners.has(hubName)) {
      this.connectionStateListeners.set(hubName, new Set())
    }
    this.connectionStateListeners.get(hubName)!.add(listener)

    // Return unsubscribe function
    return () => {
      const listeners = this.connectionStateListeners.get(hubName)
      if (listeners) {
        listeners.delete(listener)
      }
    }
  }

  private notifyStateListeners(hubName: string, connected: boolean): void {
    const listeners = this.connectionStateListeners.get(hubName)
    if (listeners) {
      listeners.forEach(listener => listener(connected))
    }
  }

  isConnected(hubName: string): boolean {
    const connection = this.connections.get(hubName)
    return connection?.state === signalR.HubConnectionState.Connected || false
  }
}

export const signalRManager = new SignalRManager()
