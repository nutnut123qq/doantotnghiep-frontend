import { useCallback, useEffect, useRef, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { signalRManager } from './signalRManager'

/** Unsubscribe function returned by `on()`. Call to remove the handler. */
export type SignalRUnsubscribe = () => void

export const useSignalR = (hubName: string, onConnected?: () => void) => {
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const onConnectedRef = useRef(onConnected)
  const [isConnected, setIsConnected] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    onConnectedRef.current = onConnected
  }, [onConnected])

  useEffect(() => {
    isMountedRef.current = true

    // Get or create connection using singleton manager
    signalRManager
      .getOrCreateConnection(hubName)
      .then((connection) => {
        if (!isMountedRef.current) {
          signalRManager.releaseConnection(hubName)
          return
        }

        connectionRef.current = connection
        setIsConnected(connection.state === signalR.HubConnectionState.Connected)
        onConnectedRef.current?.()
      })
      .catch(() => {
        if (isMountedRef.current) {
          setIsConnected(false)
        }
      })

    // Listen to connection state changes
    const unsubscribe = signalRManager.addStateListener(hubName, (connected) => {
      if (isMountedRef.current) {
        setIsConnected(connected)
        if (connected) {
          onConnectedRef.current?.()
        }
      }
    })

    return () => {
      isMountedRef.current = false
      setIsConnected(false)
      unsubscribe()
      signalRManager.releaseConnection(hubName)
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

