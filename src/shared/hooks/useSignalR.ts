import { useCallback, useEffect, useRef, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { config } from '@/infrastructure/config/env'
import { storage } from '@/infrastructure/storage/localStorage'

/** Unsubscribe function returned by `on()`. Call to remove the handler. */
export type SignalRUnsubscribe = () => void

export const useSignalR = (hubName: string, onConnected?: () => void) => {
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const onConnectedRef = useRef(onConnected)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    onConnectedRef.current = onConnected
  }, [onConnected])

  useEffect(() => {
    if (connectionRef.current) {
      const state = connectionRef.current.state
      if (
        state === signalR.HubConnectionState.Connected ||
        state === signalR.HubConnectionState.Connecting
      ) {
        return
      }
      if (state === signalR.HubConnectionState.Disconnected) {
        connectionRef.current = null
      }
    }

    const connection = new signalR.HubConnectionBuilder()
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

    connectionRef.current = connection
    let isMounted = true

    const updateConnectionState = () => {
      if (isMounted) {
        setIsConnected(connection.state === signalR.HubConnectionState.Connected)
      }
    }

    connection.onclose(updateConnectionState)
    connection.onreconnecting(updateConnectionState)
    connection.onreconnected(updateConnectionState)

    void connection
      .start()
      .then(() => {
        if (isMounted) {
          setIsConnected(true)
          onConnectedRef.current?.()
        } else {
          connection.stop().catch(() => {})
        }
      })
      .catch((err) => {
        if (
          isMounted &&
          err.name !== 'AbortError' &&
          err.message !== 'The connection was stopped during negotiation.' &&
          !err.message?.includes('stopped during negotiation')
        ) {
          console.error(`Error connecting to ${hubName}:`, err)
        }
        if (isMounted) setIsConnected(false)
      })

    return () => {
      isMounted = false
      setIsConnected(false)
      if (connection.state === signalR.HubConnectionState.Connecting) {
        connection.stop().catch(() => {})
      } else if (connection.state !== signalR.HubConnectionState.Disconnected) {
        connection.stop().catch(() => {})
      }
      connectionRef.current = null
    }
  }, [hubName])

  const invoke = useCallback(async (methodName: string, ...args: unknown[]) => {
    const conn = connectionRef.current
    if (conn?.state === signalR.HubConnectionState.Connected) {
      return conn.invoke(methodName, ...args)
    }
  }, [])

  /** Register a handler. Returns unsubscribe; call it in useEffect cleanup to avoid duplicate handlers / leaks. */
  const on = useCallback((methodName: string, callback: (...args: unknown[]) => void): SignalRUnsubscribe => {
    const conn = connectionRef.current
    if (!conn) return () => {}
    conn.on(methodName, callback)
    return () => {
      connectionRef.current?.off(methodName, callback)
    }
  }, [])

  const off = useCallback((methodName: string, callback?: (...args: unknown[]) => void) => {
    const conn = connectionRef.current
    if (!conn) return
    if (callback) conn.off(methodName, callback)
    else conn.off(methodName)
  }, [])

  return {
    connection: connectionRef.current,
    invoke,
    on,
    off,
    isConnected,
  }
}

