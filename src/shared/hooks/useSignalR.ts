import { useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import { config } from '@/infrastructure/config/env'

export const useSignalR = (hubName: string, onConnected?: () => void) => {
  const connectionRef = useRef<signalR.HubConnection | null>(null)

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${config.signalRUrl}/${hubName}`, {
        withCredentials: false
      })
      .withAutomaticReconnect()
      .build()

    connectionRef.current = connection

    connection
      .start()
      .then(() => {
        console.log(`Connected to ${hubName} hub`)
        onConnected?.()
      })
      .catch((err) => console.error(`Error connecting to ${hubName}:`, err))

    return () => {
      connection.stop()
    }
  }, [hubName, onConnected])

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
    isConnected: connectionRef.current?.state === signalR.HubConnectionState.Connected,
  }
}

