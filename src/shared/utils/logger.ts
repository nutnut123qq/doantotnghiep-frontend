type LogContext = Record<string, unknown> | undefined

const shouldLog = () => import.meta.env.DEV

const formatArgs = (message: string, context?: LogContext): unknown[] => {
  if (!context || Object.keys(context).length === 0) {
    return [message]
  }
  return [message, context]
}

export const logger = {
  info(message: string, context?: LogContext) {
    if (!shouldLog()) return
    console.info(...formatArgs(message, context))
  },

  warn(message: string, context?: LogContext) {
    if (!shouldLog()) return
    console.warn(...formatArgs(message, context))
  },

  error(message: string, context?: LogContext) {
    if (!shouldLog()) return
    console.error(...formatArgs(message, context))
  },
}
