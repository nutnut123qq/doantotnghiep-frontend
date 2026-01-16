import { useEffect, useRef, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { config } from '@/infrastructure/config/env'

export const useSignalR = (hubName: string, onConnected?: () => void) => {
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const onConnectedRef = useRef(onConnected)
  const [isConnected, setIsConnected] = useState(false)

  // Update the callback ref without causing re-renders
  useEffect(() => {
    onConnectedRef.current = onConnected
  }, [onConnected])

  useEffect(() => {
    // Don't create a new connection if one already exists and is connected or connecting
    if (connectionRef.current) {
      const state = connectionRef.current.state
      if (
        state === signalR.HubConnectionState.Connected ||
        state === signalR.HubConnectionState.Connecting
      ) {
        return
      }
      // If disconnected, clean up the old connection
      if (state === signalR.HubConnectionState.Disconnected) {
        connectionRef.current = null
      }
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${config.signalRUrl}/${hubName}`, {
        withCredentials: false
      })
      .withAutomaticReconnect()
      .configureLogging(
        // Reduce logging in development to avoid "stopped during negotiation" noise
        // This error is expected in React Strict Mode and doesn't affect functionality
        import.meta.env.DEV
          ? signalR.LogLevel.Warning 
          : signalR.LogLevel.Information
      )
      .build()

    connectionRef.current = connection

    let isMounted = true
    let startPromise: Promise<void> | null = null

    // Track connection state changes
    const updateConnectionState = () => {
      if (isMounted) {
        setIsConnected(connection.state === signalR.HubConnectionState.Connected)
      }
    }

    connection.onclose(() => {
      updateConnectionState()
    })

    connection.onreconnecting(() => {
      updateConnectionState()
    })

    connection.onreconnected(() => {
      updateConnectionState()
    })

    startPromise = connection
      .start()
      .then(() => {
        if (isMounted) {
          console.log(`Connected to ${hubName} hub`)
          setIsConnected(true)
          onConnectedRef.current?.()
        } else {
          // Component unmounted during connection, stop immediately
          connection.stop().catch(() => {
            // Ignore errors
          })
        }
      })
      .catch((err) => {
        // Only log errors if component is still mounted and it's not an abort/negotiation error
        if (
          isMounted &&
          err.name !== 'AbortError' &&
          err.message !== 'The connection was stopped during negotiation.' &&
          !err.message?.includes('stopped during negotiation')
        ) {
          console.error(`Error connecting to ${hubName}:`, err)
        }
        if (isMounted) {
          setIsConnected(false)
        }
      })

    return () => {
      isMounted = false
      setIsConnected(false)
      
      // Stop connection gracefully without waiting
      // In React Strict Mode, cleanup runs immediately, so we just mark as unmounted
      // and let the connection stop naturally or via automatic reconnect handling
      if (connection.state === signalR.HubConnectionState.Connecting) {
        // If still connecting, stop it (this will cause the "stopped during negotiation" error,
        // but it's expected in React Strict Mode cleanup)
        connection.stop().catch(() => {
          // Ignore all errors during cleanup
        })
      } else if (connection.state !== signalR.HubConnectionState.Disconnected) {
        connection.stop().catch(() => {
          // Ignore all errors during cleanup
        })
      }
      
      connectionRef.current = null
    }
  }, [hubName]) // Removed onConnected from dependencies

  const invoke = async (methodName: string, ...args: any[]) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      return connectionRef.current.invoke(methodName, ...args)
    }
  }

  const on = (methodName: string, callback: (...args: any[]) => void) => {
    if (connectionRef.current) {
      connectionRef.current.on(methodName, callback)
    }
  }

  const off = (methodName: string, callback?: (...args: any[]) => void) => {
    if (connectionRef.current) {
      if (callback) {
        connectionRef.current.off(methodName, callback)
      } else {
        connectionRef.current.off(methodName)
      }
    }
  }

  return {
    connection: connectionRef.current,
    invoke,
    on,
    off,
    isConnected,
  }
}

